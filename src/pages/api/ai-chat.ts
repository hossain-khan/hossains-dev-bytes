import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";

export const prerender = false;

// Maximum characters of post content to send to stay within the model's 32K token context window.
// llama-3.1-8b-instruct-fp8 has a 32,000 token context window (~128K chars).
// 8,000 chars (~2,000 tokens) covers most blog posts while keeping costs low.
// Raise this if posts are truncated, or lower it to reduce per-request token cost.
const MAX_CONTENT_LENGTH = 8_000;

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

About the author:
Hossain Khan is a Senior Software Engineer based in Toronto, Canada with 15+ years of experience in Android development, mobile technologies, and AI-assisted coding. He currently works at Slack on the Android platform (BlockKit, Workflows, Slack Apps). He writes about Android, Kotlin, AI, and software engineering at hossain.dev. More at hossainkhan.com.

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
    // Model is configurable via the AI_MODEL var in wrangler.jsonc (no code change needed to swap models).
    // Default: @cf/meta/llama-3.1-8b-instruct-fp8
    //   - Context window: 32,000 tokens
    //   - Pricing (as of Apr 2026): $0.152 per M input tokens, $0.287 per M output tokens
    // See available models: https://developers.cloudflare.com/workers-ai/models/
    // See pricing: https://developers.cloudflare.com/workers-ai/platform/pricing/
    const model = (env.AI_MODEL ?? "@cf/meta/llama-3.1-8b-instruct-fp8") as Parameters<typeof env.AI.run>[0];

    // Route through AI Gateway for rate limiting, caching, and observability.
    // Configure rate limits at: Cloudflare Dashboard > AI > AI Gateway > Settings > Rate Limiting
    // See: https://developers.cloudflare.com/ai-gateway/providers/workersai/#workers-binding
    const gatewayId = env.AI_GATEWAY_ID ?? "";
    const gatewayOptions = gatewayId ? { gateway: { id: gatewayId } } : {};

    const stream = await env.AI.run(
      model,
      {
        messages: allMessages,
        stream: true,
        max_tokens: 1024,
      },
      gatewayOptions,
    );

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

    // AI Gateway returns 429 when the rate limit is exceeded.
    const errMsg = e instanceof Error ? e.message : String(e);
    if (errMsg.includes("429") || errMsg.toLowerCase().includes("rate limit")) {
      return new Response(
        JSON.stringify({
          error:
            "Daily AI usage limit reached. Please try again tomorrow.",
        }),
        { status: 429, headers: { "content-type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "AI inference failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
