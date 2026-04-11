import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";

export const prerender = false;

// Maximum characters of post content to send (keeps us well within the 7968 token context window)
const MAX_CONTENT_LENGTH = 6000;

export const POST: APIRoute = async ({ request }) => {
  // Only accept JSON
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return new Response(JSON.stringify({ error: "Expected application/json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  let body: { content?: unknown; messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const { content, messages } = body;

  if (typeof content !== "string" || !content.trim()) {
    return new Response(JSON.stringify({ error: "Missing required field: content" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Missing required field: messages" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Validate message shape
  for (const msg of messages) {
    if (
      typeof msg !== "object" ||
      msg === null ||
      typeof (msg as Record<string, unknown>).role !== "string" ||
      typeof (msg as Record<string, unknown>).content !== "string"
    ) {
      return new Response(JSON.stringify({ error: "Invalid message format" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
  }

  // Trim content to token budget
  const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH);

  const systemMessage = {
    role: "system",
    content: `You are a helpful assistant for a tech blog. Your job is to help readers understand a blog post. 
Answer questions concisely and accurately based only on the content of the blog post provided.
If asked for a summary, provide a structured 3-5 sentence summary covering the key points.
Do not invent information not present in the post. Keep responses focused and readable.

Blog post content:
---
${trimmedContent}
---`,
  };

  const allMessages = [
    systemMessage,
    ...(messages as { role: string; content: string }[]),
  ];

  try {
    // Model: @cf/meta/llama-3.1-8b-instruct-fp8
    // Pricing (as of Apr 2026): $0.152 per M input tokens, $0.287 per M output tokens
    //   = 13,778 neurons/M input tokens, 26,128 neurons/M output tokens
    // Free tier: 10,000 neurons/day (~725 input tokens or ~383 output tokens at this model's rate)
    // Paid tier: $0.011 per 1,000 neurons above the free daily allocation
    // See: https://developers.cloudflare.com/workers-ai/platform/pricing/
    const stream = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8", {
      messages: allMessages,
      stream: true,
      max_tokens: 512,
    });

    return new Response(stream as ReadableStream, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[ai-chat] Workers AI error:", e);
    return new Response(JSON.stringify({ error: "AI inference failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
