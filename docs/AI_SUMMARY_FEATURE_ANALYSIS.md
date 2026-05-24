# AI Summary (TL;DR) Feature — End-to-End Analysis

## Overview

The AI summary feature provides readers with one-click summarization and Q&A for blog posts. The architecture spans frontend (Astro component with streaming SSE), backend (Cloudflare Workers API), and infrastructure (AI Gateway for rate limiting).

**Key Technologies:**
- Frontend: Astro component + TypeScript + marked + DOMPurify
- Backend: Cloudflare Workers AI binding + OpenAI-compatible streaming
- Infrastructure: AI Gateway (rate limiting, caching, observability)
- Model: `@cf/google/gemma-4-26b-a4b-it` (256k token context window)

---

## 1. Frontend Component: `AiPostAssistant.astro`

### UI Structure

**Location:** [src/components/AiPostAssistant.astro](src/components/AiPostAssistant.astro)

The component renders a collapsible panel with three main sections:

```astro
<!-- Collapsed trigger button -->
<button id="ai-toggle" aria-expanded="false" aria-controls="ai-panel">
  Ask AI about this post
  <chevron-icon id="ai-chevron" />
</button>

<!-- Expanded panel (hidden by default) -->
<div id="ai-panel" hidden role="region" aria-label="AI post assistant">
  <!-- Header + branding -->
  <div class="mb-4">
    AI Assistant
    Powered by Cloudflare Workers AI
  </div>

  <!-- Summarize button -->
  <button id="ai-summarize-btn">Summarize this post</button>

  <!-- Conversation history -->
  <div id="ai-conversation" class="hidden"></div>

  <!-- Loading indicator -->
  <div id="ai-loading" hidden>
    <animated-dots /> Thinking…
  </div>

  <!-- Error display -->
  <div id="ai-error" hidden role="alert"></div>

  <!-- Chat form -->
  <form id="ai-form">
    <input id="ai-input" maxlength="500" placeholder="Ask a question about this post…" />
    <button id="ai-ask-btn" type="submit">Ask</button>
  </form>

  <!-- Disclaimer -->
  <p>AI responses may be inaccurate. Always verify important information.</p>
</div>
```

### State Management

**Visibility & Expansion:**
```typescript
// Toggle expand/collapse
toggle.addEventListener("click", () => {
  const isExpanded = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!isExpanded));  // Update ARIA
  panel.hidden = isExpanded;  // Show/hide panel
  
  // Rotate chevron 180° when expanded
  if (chevron) {
    chevron.style.transform = isExpanded ? "" : "rotate(180deg)";
  }
});
```

**Conversation History:**
- Maintains a `messages[]` array throughout the page session
- Each message has `role: "user" | "assistant"` and `content: string`
- Messages persist between turns to enable multi-turn Q&A within a single page load
- Survives View Transitions (Astro's client-side navigation) through the `astro:page-load` event listener

**UI Busy State:**
```typescript
function setUIBusy(busy: boolean) {
  summarizeBtn.disabled = busy;
  input.disabled = busy;
  askBtn.disabled = busy;
  loadingEl.hidden = !busy;
  
  // Rotate loading messages every 2.5 seconds during streaming
  if (busy) startLoadingMessages();
  else stopLoadingMessages();
}
```

Loading messages rotate to add personality:
```
"Thinking…", "Reading the post…", "Consulting the AI oracle…", 
"Brewing a response…", "Connecting the dots…", "Almost there…", …
```

### Request Handling

**Extracting Article Content:**
```typescript
function getArticleText(): string {
  const article = document.getElementById("article");
  if (!article) return "";
  // Extract plain text (innerText removes formatting)
  return (article.innerText ?? "").trim().slice(0, MAX_CONTENT_CHARS);
}
// MAX_CONTENT_CHARS = 25,000 (sent to backend; backend further trims to 30k)
```

**Sending Requests:**
```typescript
const res = await fetch("/api/ai-chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    content: getArticleText(),  // Full post text
    messages: messages,         // Conversation history
  }),
});
```

### Message Flow

**Summarize Button:**
```typescript
summarizeBtn?.addEventListener("click", () => {
  appendUserBubble("Summarize this post");  // Show user input in UI
  streamAIResponse("Please provide a concise summary of this blog post.");
});
```

**Chat Form:**
```typescript
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const question = input.value.trim();
  if (!question) return;
  
  input.value = "";  // Clear input
  appendUserBubble(question);  // Show in UI
  streamAIResponse(question);  // Send to backend
});
```

### Streaming & Markdown Rendering

**SSE Stream Parser:**

The backend returns `text/event-stream`. The parser handles three different streaming formats (model-agnostic):

```typescript
async function streamAIResponse(userMessage: string) {
  const res = await fetch("/api/ai-chat", { /* ... */ });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullResponse = "";
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") break;
      
      try {
        const parsed = JSON.parse(data);
        
        // Priority: OpenAI delta → Workers AI response → text fallback
        const token =
          parsed.choices?.[0]?.delta?.content ??    // Gemma 4 (OpenAI-compatible)
          parsed.response ??                         // LLaMA 3 (Workers AI native)
          parsed.text;                               // Fallback
        
        if (token) {
          fullResponse += token;
          responseEl.innerHTML = renderMarkdown(fullResponse);
          responseEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      } catch {
        // Skip non-JSON SSE data
      }
    }
  }
  
  // Add response to history for next turn
  if (fullResponse) {
    messages.push({ role: "assistant", content: fullResponse });
  }
}
```

**Markdown Rendering with marked + DOMPurify:**

```typescript
const renderer = new Renderer();

// Code blocks with language badge
renderer.code = ({ text, lang }) => {
  const langBadge = lang
    ? `<span class="...badge...">${escapeHtml(lang)}</span><br>`
    : "";
  return (
    `<pre class="...code-block...">` +
    langBadge +
    `<code>${escapeHtml(text)}</code></pre>`
  );
};

// Inline code
renderer.codespan = ({ text }) =>
  `<code class="...inline-code...">${text}</code>`;

// Bold/italic
renderer.strong = ({ text }) =>
  `<strong class="...bold...">${marked.parseInline(text)}</strong>`;
renderer.em = ({ text }) =>
  `<em class="...italic...">${marked.parseInline(text)}</em>`;

// Paragraphs
renderer.paragraph = ({ text }) =>
  `<p class="mb-2 last:mb-0">${marked.parseInline(text)}</p>`;

// Lists (both ordered and unordered)
renderer.list = (token) => {
  const tag = token.ordered ? "ol" : "ul";
  const cls = token.ordered
    ? "my-2 ml-4 list-decimal space-y-1"
    : "my-2 ml-4 list-disc space-y-1";
  const body = token.items
    .map(item => `<li class="...item...">${marked.parseInline(item.text)}</li>`)
    .join("");
  return `<${tag} class="${cls}">${body}</${tag}>`;
};

// Headings
renderer.heading = ({ text, depth }) => {
  const cls = depth === 1 ? "text-base font-bold" :
              depth === 2 ? "text-sm font-semibold" :
              "text-sm font-medium";
  return `<h${depth} class="${cls}">${marked.parseInline(text)}</h${depth}>`;
};

marked.use({ renderer, breaks: true });

function renderMarkdown(text: string): string {
  const raw = marked.parse(text) as string;
  return DOMPurify.sanitize(raw);  // Prevent XSS
}
```

**Rendering Flow:**
1. Each token arrives via SSE
2. Token is appended to `fullResponse`
3. `renderMarkdown()` converts full response to HTML with Tailwind classes
4. DOMPurify sanitizes the HTML
5. `responseEl.innerHTML` updated (triggers re-render of new tokens)
6. Element scrolls into view

**Chat Bubbles:**

```typescript
// User message bubble (right-aligned, accent color)
function appendUserBubble(text: string) {
  const bubble = document.createElement("div");
  bubble.className = "flex justify-end";
  bubble.innerHTML = `
    <div class="max-w-[85%] rounded-xl rounded-tr-sm 
                 border border-accent/20 bg-accent/10 
                 px-3.5 py-2.5 text-sm text-foreground/80 
                 leading-relaxed">
      ${escapeHtml(text)}
    </div>`;
  conversationEl.appendChild(bubble);
  bubble.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Assistant message bubble (left-aligned, muted color)
function appendAssistantBubble(): HTMLElement {
  const bubble = document.createElement("div");
  bubble.className = "flex justify-start";
  bubble.innerHTML = `
    <div class="ai-response-text max-w-[90%] rounded-xl rounded-tl-sm 
                 border border-border/20 bg-muted/10 
                 px-3.5 py-2.5 text-sm text-foreground/80 
                 leading-relaxed"></div>`;
  conversationEl.appendChild(bubble);
  bubble.scrollIntoView({ behavior: "smooth", block: "nearest" });
  return bubble.querySelector(".ai-response-text");
}
```

### Error Handling

```typescript
try {
  const res = await fetch("/api/ai-chat", { /* ... */ });
  
  if (!res.ok || !res.body) {
    const errData = await res.json().catch(() => ({}));
    const errMsg = errData.error ?? `HTTP ${res.status}`;
    
    // Special handling for rate limits (429)
    if (res.status === 429) {
      throw new Error(errMsg);  // User-friendly message from backend
    }
    throw new Error(errMsg);
  }
  
  // ... stream processing
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  showError(msg.startsWith("Daily AI") ? msg : `Error: ${msg}`);
  
  // Clean up on failure
  if (!fullResponse && responseEl.parentElement) {
    responseEl.parentElement.remove();  // Remove empty bubble
  }
  messages.pop();  // Revert user message from history
  setUIBusy(false);
}
```

### View Transitions Integration

**Re-initialization on Navigation:**

The component listens to Astro's view transition events to re-attach DOM listeners when the page content changes:

```typescript
// Main initialization on page load
document.addEventListener("astro:page-load", function () {
  // All setup code here
  const toggle = document.getElementById("ai-toggle");
  // ... rest of initialization
});
```

**Why:** When using Astro's client-side navigation (View Transitions), the HTML content is swapped but the `<script>` block doesn't re-run. Without re-initialization, event listeners point to stale DOM elements.

---

## 2. Backend API: `src/pages/api/ai-chat.ts`

### Request Validation

**Prerender Flag:**
```typescript
export const prerender = false;
```
This tells Astro to not pre-render this endpoint (it's dynamic).

**Content-Type Check:**
```typescript
const contentType = request.headers.get("content-type") ?? "";
if (!contentType.includes("application/json")) {
  return new Response(JSON.stringify({ error: "Expected application/json" }), {
    status: 400,
    headers: { "content-type": "application/json" },
  });
}
```

**Body Validation:**
```typescript
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

// Validate content
if (typeof content !== "string" || !content.trim()) {
  return new Response(JSON.stringify({ error: "Missing required field: content" }), {
    status: 400,
    headers: { "content-type": "application/json" },
  });
}

// Validate messages array
if (!Array.isArray(messages) || messages.length === 0) {
  return new Response(JSON.stringify({ error: "Missing required field: messages" }), {
    status: 400,
    headers: { "content-type": "application/json" },
  });
}

// Validate each message structure
for (const msg of messages) {
  if (
    typeof msg !== "object" ||
    msg === null ||
    typeof msg.role !== "string" ||
    typeof msg.content !== "string"
  ) {
    return new Response(JSON.stringify({ error: "Invalid message format" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
}
```

### System Prompt & Context

**Token Budget:**
```typescript
const MAX_CONTENT_LENGTH = 30_000;  // ~7,500 tokens
const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH);
```

**System Message (Grounds AI in Article):**
```typescript
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
```

**Message Stack:**
```typescript
const allMessages = [
  systemMessage,
  ...(messages as { role: string; content: string }[]),
];
```

This ensures:
1. System prompt is always first
2. Full conversation history is included for context (maintains multi-turn state)

### AI Model Integration

**Model Selection:**
```typescript
const model = (env.AI_MODEL ?? "@cf/google/gemma-4-26b-a4b-it") as Parameters<typeof env.AI.run>[0];
```

Reads from `wrangler.jsonc` `vars.AI_MODEL`. Default: `@cf/google/gemma-4-26b-a4b-it`

**Model Details:**
- **Context Window:** 256,000 tokens (far exceeds any blog post)
- **Max Output:** 1,024 tokens per response
- **Pricing (Apr 2026):** $0.10 per M input tokens, $0.30 per M output tokens

### AI Gateway Routing

**Rate Limiting & Observability:**
```typescript
const gatewayId = env.AI_GATEWAY_ID ?? "";
const gatewayOptions = gatewayId ? { gateway: { id: gatewayId } } : {};

const stream = await env.AI.run(
  model,
  {
    messages: allMessages,
    stream: true,
    max_tokens: 1024,
  },
  gatewayOptions,  // Routes through AI Gateway if ID is set
);
```

**Gateway Configuration:**
- **ID:** `"hossains-dev-bytes"` (set in `wrangler.jsonc`)
- **Purpose:** Rate limiting (recommended: 150 req/day fixed window), caching, observability
- **Config Location:** Cloudflare Dashboard > AI > AI Gateway > Settings > Rate Limiting

### Streaming Response

**SSE Format:**
```typescript
return new Response(stream as unknown as ReadableStream<Uint8Array>, {
  headers: {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  },
});
```

**Stream Format Compatibility:**

The backend returns the raw stream from `env.AI.run()` with `stream: true`. Different models use different formats:

| Model | Format | Token Field |
|-------|--------|-------------|
| **Gemma 4** (OpenAI-compatible) | `{"choices":[{"delta":{"content":"token"}}]}` | `choices[0].delta.content` |
| **LLaMA 3** (Workers AI native) | `{"response":"token"}` | `response` |
| **Fallback** | `{"text":"token"}` | `text` |

Frontend parser checks all three to remain model-agnostic.

### Error Handling

**Rate Limit Detection:**
```typescript
try {
  const stream = await env.AI.run( /* ... */ );
  // ...
} catch (e) {
  console.error("[ai-chat] Workers AI error:", e);
  
  const errMsg = e instanceof Error ? e.message : String(e);
  
  // Detect rate limit (429 from AI Gateway)
  if (errMsg.includes("429") || errMsg.toLowerCase().includes("rate limit")) {
    return new Response(
      JSON.stringify({
        error: "Daily AI usage limit reached. Please try again tomorrow.",
      }),
      { status: 429, headers: { "content-type": "application/json" } },
    );
  }
  
  // Generic error
  return new Response(
    JSON.stringify({ error: "AI inference failed" }),
    { status: 500, headers: { "content-type": "application/json" } },
  );
}
```

The frontend detects the 429 status and surfaces the user-friendly message directly.

---

## 3. Integration Points

### PostDetails.astro

**Component Placement:**
```astro
import AiPostAssistant from "@/components/AiPostAssistant.astro";

<Layout ...>
  <Header />
  <BackButton />
  <main>
    <header>
      <!-- Post title, tags, metadata -->
      
      <!-- TL;DR Button in header -->
      <button id="tldr-button" aria-label="Jump to AI summary and expand">
        <svg>...</svg>
        TL;DR AI Summary
      </button>
    </header>

    <article id="article">
      <Content components={{ GalleryEmbed }} />
    </article>

    <!-- AI Post Assistant rendered at bottom -->
    <AiPostAssistant />
  </main>
</Layout>
```

### TL;DR Button Behavior

**Location:** [src/layouts/PostDetails.astro](src/layouts/PostDetails.astro#L194-L220) (post header metadata row)

**Handler Logic:**
```typescript
function setupTldrButton() {
  const tldrButton = document.getElementById("tldr-button");
  if (tldrButton) {
    tldrButton.addEventListener("click", () => {
      const aiAssistant = document.getElementById("ai-post-assistant");
      const aiToggle = document.getElementById("ai-toggle");
      
      if (!aiAssistant || !aiToggle) return;

      // 1. Scroll to AI Assistant section
      aiAssistant.scrollIntoView({ behavior: "smooth", block: "start" });
      
      // 2. Auto-expand panel if collapsed
      const isExpanded = aiToggle.getAttribute("aria-expanded") === "true";
      if (!isExpanded) {
        // Delay to let scroll animation start first (100ms)
        setTimeout(() => {
          aiToggle.click();
        }, 100);
      }
    });
  }
}

// Initialize on page load
setupTldrButton();

// Re-initialize after View Transitions
document.addEventListener("astro:after-swap", () => {
  window.scrollTo({ left: 0, top: 0, behavior: "instant" });
  setupTldrButton();  // Re-attach handler to new DOM
});
```

**User Experience Flow:**
1. User clicks "TL;DR AI Summary" in post header
2. Page smoothly scrolls to AI Assistant at bottom
3. After 100ms, panel automatically expands
4. User sees "Summarize this post" button ready to click
5. Or user can type a question directly

### Content Extraction

**Article DOM Element:**
```astro
<article
  id="article"
  class="app-prose mt-8 w-full max-w-app"
>
  <Content components={{ GalleryEmbed }} />
</article>
```

**Frontend Extraction:**
```typescript
function getArticleText(): string {
  const article = document.getElementById("article");
  if (!article) return "";
  return (article.innerText ?? "").trim().slice(0, MAX_CONTENT_CHARS);
}
```

Uses `innerText` (plain text, no HTML) up to 25,000 chars. Backend further trims to 30,000.

---

## 4. Configuration

### Model Selection (`wrangler.jsonc`)

```jsonc
{
  "ai": {
    "binding": "AI"  // Cloudflare Workers AI binding
  },
  "vars": {
    // Change this to try a different model (no code change needed)
    "AI_MODEL": "@cf/google/gemma-4-26b-a4b-it",
    
    // AI Gateway ID for rate limiting and observability
    "AI_GATEWAY_ID": "hossains-dev-bytes"
  }
}
```

**To Change Model:**
1. Browse [available models](https://developers.cloudflare.com/workers-ai/models/)
2. Update `AI_MODEL` in `wrangler.jsonc`
3. Deploy (no code changes needed)

**Available Models (Examples):**
- `@cf/meta/llama-3.1-8b-instruct-fp8` (Workers AI native format, smaller)
- `@cf/google/gemma-2-27b-instruct` (larger, better quality)
- `@cf/meta/llama-3-70b-instruct` (largest, best quality)

### AI Binding in Astro

**Cloudflare AST Integration:**
```typescript
import { env } from "cloudflare:workers";

export const POST: APIRoute = async ({ request }) => {
  // env.AI is the Workers AI binding
  const stream = await env.AI.run(model, { /* ... */ });
};
```

The `ai: { binding: "AI" }` in `wrangler.jsonc` makes `env.AI` available.

### AI Gateway Configuration

**Dashboard Location:**
- Cloudflare Dashboard > AI > AI Gateway > hossains-dev-bytes > Settings > Rate Limiting

**Recommended Settings:**
- **Rate Limit:** 150 requests/day (fixed window)
- **Purpose:** Prevent abuse, track usage, cache responses

**Verification:**
Check gateway logs at: Cloudflare Dashboard > AI > AI Gateway > hossains-dev-bytes > Analytics

### Token Budget Constants

**Frontend (`AiPostAssistant.astro`):**
```typescript
const MAX_CONTENT_CHARS = 25_000;  // Chars sent to backend (~6,250 tokens)
```

**Backend (`ai-chat.ts`):**
```typescript
const MAX_CONTENT_LENGTH = 30_000;  // Chars stored in system prompt (~7,500 tokens)
const max_tokens: 1024  // Output token budget per response
```

**Why These Values:**
- Gemma 4 has 256,000 token context window (plenty of room)
- 30,000 chars (~7,500 tokens) covers even long posts
- 1,024 output tokens prevents runaway generations
- Keeps per-request cost reasonable (~$0.003-0.009)

---

## 5. User Experience Flow

### Summarize Button Click

```
User clicks "Summarize this post"
    ↓
appendUserBubble("Summarize this post")  // Show in UI
setUIBusy(true)  // Disable buttons, show loading spinner
    ↓
fetch("/api/ai-chat", {
  content: getArticleText(),  // Full post text
  messages: [{ role: "user", content: "Please provide a concise summary..." }]
})
    ↓
Backend:
  - Validates content & messages
  - Creates system prompt with post content
  - Calls env.AI.run(model, { messages, stream: true })
  - Returns SSE stream
    ↓
Frontend:
  - Starts streaming tokens via SSE
  - Each token: fullResponse += token
  - Renders markdown: responseEl.innerHTML = renderMarkdown(fullResponse)
  - Scrolls token into view for readability
    ↓
First content token arrives
  - setUIBusy(false)  // Hide loading spinner
  - User sees response appearing token-by-token
    ↓
[DONE] message or stream ends
  - Add response to conversation history: messages.push({ role: "assistant", content: fullResponse })
  - setUIBusy(false)
  - User can now ask follow-up questions
```

**Timeline (typical response):**
- 0ms: User clicks "Summarize"
- 100-500ms: Metadata arrives, first content token
- 2-5 seconds: Full 3-5 sentence summary rendered
- Ready for next question

### Question Follow-Up

```
User types "What does X mean?" and clicks "Ask"
    ↓
appendUserBubble("What does X mean?")
streamAIResponse("What does X mean?")
    ↓
Messages sent to backend: [
  { role: "user", content: "Please provide a concise summary..." },
  { role: "assistant", content: "This post is about..." },
  { role: "user", content: "What does X mean?" }  // New question
]
    ↓
Backend:
  - Includes full conversation history in systemMessage context
  - AI can reference previous summary/response for coherence
  - Returns answer grounded in both the post AND conversation
    ↓
Frontend:
  - Response streams in like before
  - Adds to conversation history
  - User can ask another question
```

**Multi-Turn Context:**
- Each turn includes the full `messages[]` array
- AI can reference earlier parts of the conversation
- Conversation persists for the page session (until user navigates away)

### Streaming Visualization

```
Backend response stream (OpenAI format):
data: {"choices":[{"delta":{"content":"This"}}]}
data: {"choices":[{"delta":{"content":" post"}}]}
data: {"choices":[{"delta":{"content":" is"}}]}
data: {"choices":[{"delta":{"content":" about"}}]}
data: {"choices":[{"delta":{"content":" X"}}]}
...
data: [DONE]

Frontend parser:
1. Parse each line starting with "data: "
2. Extract content from choices[0].delta.content
3. Append token to fullResponse
4. Re-render markdown (this adds the parsed HTML)
5. Scroll into view

HTML Output (as it arrives):
<p class="mb-2">This post is about X</p>
  ↓ (token arrives)
<p class="mb-2"><strong>This post is about</strong> X</p>
  ↓ (if token is markdown)
```

### Error Scenarios

**No Article Found:**
```typescript
if (!content) {
  showError("Could not extract post content.");
  setUIBusy(false);
  return;
}
// Display: "Error: Could not extract post content."
```

**Network Failure:**
```
fetch fails or res.ok = false
    ↓
showError(errMsg)  // e.g., "Error: Failed to fetch"
Remove empty AI bubble
Revert user message from history (messages.pop())
setUIBusy(false)
```

**Rate Limit (429):**
```
Backend detects 429 from AI Gateway
    ↓
Returns: { status: 429, error: "Daily AI usage limit reached. Please try again tomorrow." }
    ↓
Frontend catches 429, shows message directly (no "Error: " prefix)
Display: "Daily AI usage limit reached. Please try again tomorrow."
```

**Malformed Response:**
```typescript
// If stream contains non-JSON data:
try {
  const parsed = JSON.parse(data);
  // ...
} catch {
  // Skip this line, continue parsing
}
```

---

## 6. Response Format Examples

### Summarize Response (Gemma 4)

**Raw SSE Stream:**
```
data: {"choices":[{"delta":{"role":"assistant"}}]}
data: {"choices":[{"delta":{"content":"This"}}]}
data: {"choices":[{"delta":{"content":" post"}}]}
data: {"choices":[{"delta":{"content":" explores"}}]}
data: {"choices":[{"delta":{"content":" adding"}}]}
...continues token-by-token...
data: [DONE]
```

**Rendered HTML (after markdown processing):**
```html
<p class="mb-2">
  This post explores adding an AI assistant to a blog using Cloudflare Workers AI. 
  The solution consists of a frontend Astro component for the UI, a backend API route 
  that calls the AI model, and routing through an AI Gateway for rate limiting. 
  Responses stream back via SSE for a token-by-token "typing" effect. The assistant 
  is grounded in post content to prevent hallucinations.
</p>
```

### Q&A Response with Code

**User Question:** "Show me the code example from this post"

**Rendered Response:**
```html
<p class="mb-2">Here's the main code example:</p>

<pre class="my-2 overflow-x-auto rounded-lg border border-border/30 bg-muted/20 px-3.5 py-3 text-xs font-mono leading-relaxed">
  <span class="inline-block mb-1.5 rounded px-1.5 py-0.5 text-[10px] font-mono font-medium bg-accent/15 text-accent/80">typescript</span><br>
  <code>async function streamAI(message) {
  const res = await fetch("/api/ai-chat", {
    method: "POST",
    body: JSON.stringify({ content, messages })
  });
}</code>
</pre>

<p class="mb-2">This function sends the post content and message history to the backend.</p>
```

---

## Key Architectural Decisions

### Why SSE Streaming?
- **Real-time feedback:** Users see tokens appear instantly, not wait for full response
- **Better UX:** Creates a "thinking" illusion, makes app feel responsive
- **Reduce latency perception:** First token arrives in 100-500ms

### Why System Prompt with Full Content?
- **Grounding:** AI answers from post facts, not general knowledge
- **Prevents hallucinations:** Model can't make things up about the article
- **Trade-off:** Every request includes the post content (higher token cost, but acceptable for context window)

### Why Multi-Turn History?
- **Better UX:** Users can ask follow-up questions without repeating context
- **Page Session Scope:** Clears when user navigates away (stateless)
- **Cost-effective:** Only sent when needed (on each question)

### Why AI Gateway?
- **Rate Limiting:** Prevent abuse and unexpected bills
- **Observability:** Track usage, spot patterns, identify heavy users
- **Caching:** Repeated questions may cache at gateway level (potential future optimization)

### Why Frontend Extracts Content?
- **Privacy:** Post content never leaves the browser (only sent when user requests AI)
- **Simplicity:** No server-side parsing needed; Astro just renders content
- **Flexibility:** Can add client-side filtering (e.g., exclude code samples, metadata)

---

## Debugging & Troubleshooting

### Check Gateway Rate Limits
1. Go to Cloudflare Dashboard > AI > AI Gateway > hossains-dev-bytes
2. Look at Analytics to see request volume and hit rate
3. If hitting limit: increase `max_requests` or `window_size` in Settings > Rate Limiting

### Check Model Output
1. Temporarily change model in `wrangler.jsonc`
2. Deploy and test
3. Check response quality and latency
4. Revert if issues

### Debug Streaming Issues
1. Open DevTools Network tab
2. Click "Summarize"
3. Find `/api/ai-chat` request
4. Check Response tab for raw SSE stream format
5. Verify `choices[0].delta.content` format (or fallback fields)

### Validate Content Extraction
1. Open DevTools Console
2. Run: `document.getElementById("article").innerText.length`
3. Should see character count
4. If 0, article DOM element not found (check CSS selector)

---

## Performance Metrics

**Typical Response Latency (US Region):**
| Metric | Time |
|--------|------|
| First token | 100-500ms |
| First 50% of summary | 1-2 seconds |
| Full 3-5 sentence summary | 2-5 seconds |
| Full 500-word answer | 10-15 seconds |

**Token Costs (Approx, Apr 2026 pricing):**
- Input: $0.10 per M tokens → ~$0.001 per 10k tokens
- Output: $0.30 per M tokens → ~$0.003 per 10k tokens
- Per request: ~$0.004-0.012 (depending on response length)
- Daily budget (150 req/day): ~$0.60-1.80/day at full utilization

---

## Summary

The AI summary feature is a tightly integrated end-to-end system:

1. **Frontend** extracts article text and streams responses via marked + DOMPurify
2. **Backend** validates input, builds system prompt with post content, and calls Cloudflare Workers AI
3. **Infrastructure** routes through AI Gateway for rate limiting and observability
4. **Configuration** decouples model selection from code (change in `wrangler.jsonc` only)
5. **UX** provides one-click summarization and multi-turn Q&A with token-by-token streaming

The architecture prioritizes **user experience** (streaming tokens, auto-scroll), **cost efficiency** (bounded token budgets), and **accuracy** (system prompt grounds AI in post content).
