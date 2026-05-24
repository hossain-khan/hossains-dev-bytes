import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Code-focused AI Chat Endpoint
 *
 * Purpose: Developer learning companion for programming concepts, languages, and coding techniques.
 * - Strictly constrained to programming topics
 * - Rejects off-topic queries
 * - Designed for "Code with AI" Android app
 *
 * Request:
 *   POST /api/ai-code-chat
 *   { "prompt": "Explain async/await", "language": "typescript", "sessionId": "optional" }
 *
 * Response:
 *   SSE stream with tokens
 *   data: {"choices":[{"delta":{"content":"token"}}]}
 */

const MAX_PROMPT_LENGTH = 2000;
const SYSTEM_PROMPT = `You are an expert programming tutor specialized in teaching coding languages, concepts, and best practices.

**STRICT CONSTRAINTS:**
- Only answer questions about programming languages, algorithms, design patterns, coding techniques, frameworks, libraries, and developer tools
- If a question is not programming-related, politely decline and redirect: "I can only help with programming topics. Please ask about code, languages, or development concepts."
- Do not discuss non-technical topics (history, politics, general knowledge, etc.)
- Do not help with non-programming tasks

**RESPONSE STYLE:**
- Provide clear, concise explanations with code examples when relevant
- Use markdown for code blocks with language tags
- Break complex topics into digestible parts
- Include practical examples and use cases
- Suggest best practices and common pitfalls to avoid
- For beginner questions, explain concepts simply; for advanced, go deeper

**SUPPORTED TOPICS:**
✓ Programming languages (JavaScript, Python, Kotlin, Java, C++, Go, Rust, etc.)
✓ Web development (React, Vue, Angular, Node.js, Express, etc.)
✓ Mobile development (Android, iOS, Flutter, React Native, etc.)
✓ Backend systems (databases, APIs, microservices, etc.)
✓ DevOps & deployment (Docker, Kubernetes, CI/CD, etc.)
✓ Data structures & algorithms
✓ Design patterns & architecture
✓ Testing, debugging, performance optimization
✓ Developer tools & command line

Focus on practical knowledge that developers actually use.`;

interface CodeChatRequest {
  prompt?: unknown;
  language?: unknown;
  sessionId?: unknown;
  conversationHistory?: unknown;
}

export const POST: APIRoute = async ({ request }) => {
  // Validate content type
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return new Response(
      JSON.stringify({ error: "Expected application/json" }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    );
  }

  // Parse body
  let body: CodeChatRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const { prompt, language, conversationHistory } = body;

  // Validate prompt
  if (typeof prompt !== "string" || !prompt.trim()) {
    return new Response(
      JSON.stringify({ error: "Missing required field: prompt" }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    );
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return new Response(
      JSON.stringify({
        error: `Prompt exceeds ${MAX_PROMPT_LENGTH} character limit`,
      }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    );
  }

  // Validate conversation history format if provided
  if (conversationHistory !== undefined) {
    if (
      !Array.isArray(conversationHistory) ||
      !conversationHistory.every(
        (msg) =>
          typeof msg === "object" &&
          msg !== null &&
          typeof msg.role === "string" &&
          typeof msg.content === "string"
      )
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid conversationHistory format" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      );
    }
  }

  try {
    const model = (env.AI_MODEL ??
      "@cf/google/gemma-4-26b-a4b-it") as Parameters<typeof env.AI.run>[0];

    // Build system prompt with optional language context
    let customSystemPrompt = SYSTEM_PROMPT;
    if (typeof language === "string" && language.trim()) {
      customSystemPrompt += `\n\nUser's primary language: ${language}. Use relevant examples in this language when applicable.`;
    }

    // Build messages array
    const messages: { role: string; content: string }[] = [
      {
        role: "system",
        content: customSystemPrompt,
      },
    ];

    // Add conversation history if provided
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      messages.push(
        ...(conversationHistory as { role: string; content: string }[])
      );
    }

    // Add current user prompt
    messages.push({
      role: "user",
      content: prompt,
    });

    // Route through AI Gateway for rate limiting
    const gatewayId = env.AI_GATEWAY_ID ?? "";
    const gatewayOptions = gatewayId ? { gateway: { id: gatewayId } } : {};

    const stream = await env.AI.run(
      model,
      {
        messages,
        stream: true,
        max_tokens: 2048, // Allow longer responses for code explanations
      },
      gatewayOptions
    );

    // Return SSE stream
    return new Response(stream as unknown as ReadableStream<Uint8Array>, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
        // CORS headers for Android app
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "Content-Type",
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[ai-code-chat] Error:", e);

    const errMsg = e instanceof Error ? e.message : String(e);

    // Handle rate limit
    if (errMsg.includes("429") || errMsg.toLowerCase().includes("rate limit")) {
      return new Response(
        JSON.stringify({
          error: "Daily learning limit reached. Please try again tomorrow.",
        }),
        {
          status: 429,
          headers: { "content-type": "application/json" },
        }
      );
    }

    // Generic error
    return new Response(JSON.stringify({ error: "AI inference failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};

// Handle CORS preflight
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type",
    },
  });
};
