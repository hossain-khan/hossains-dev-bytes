# Changelog

Below is a summary of all changes and visual improvements implemented in the blog

### Recent Modifications

- **Apr 24, 2026** - `0df71d8`: chore: replace default OG image with custom hossain-dev-bytes branding
  > *Swapped out the generic fallback OG image with a custom-branded hossain-dev-bytes image so social previews for posts without a dedicated image use the site's own identity.*

- **Apr 13, 2026** - `80b0480`: feat: add TL;DR AI Summary button in post header
  > *Added a "TL;DR" chip button beside the author/date row in each post header. Clicking it triggers the AI summarization flow directly, giving readers a quick shortcut to get the post's key points without scrolling to the AI assistant panel.*

- **Apr 12, 2026** - `b7b987e`: feat: add GooglePlayEmbed component for Google Play app cards
  > *New `GooglePlayEmbed` component that fetches live app metadata (icon, rating, install count) from Google Play at build time and renders a styled card. The app icon is inlined as base64 to avoid hotlinking. Includes a dark-mode-aware design and a fallback link if the fetch fails.*

- **Apr 12, 2026** - `753361b`: chore: remove Google Analytics tag
  > *Removed the Google Analytics (`gtag.js`) script from the site layout entirely. No replacement added at this time.*

- **Apr 12, 2026** - `37f0630`: feat: add post tags to OG image sticky note area
  > *Post tags are now rendered inside the sticky note area of the OG image with dynamic font sizing so they fit without overflow. Tags are sorted and truncated when there are too many.*

- **Apr 12, 2026** - `bcb6705`: feat: custom OG image with pixel-art background and Jersey 10 font
  > *Replaced the default OG image with a dynamically generated image per post. Uses a pixel-art style background pattern, the Jersey 10 display font for the post title, and a sticky-note area for author and tags. Generated at build time via Astro's `@astrojs/og` integration.*

- **Apr 24, 2026** - `a713651`: chore: replace Sriracha with Lora (Google Font) for blockquotes
  > *Swapped the blockquote font from Sriracha (Thai handwriting) to Lora (Google Fonts serif). Lora is a warm editorial serif that pairs well with a tech blog. Registered via `fontProviders.google()` in `astro.config.ts`, self-hosted by Astro at build time.*

- **Apr 24, 2026** - `09ca7c0`: feat: rotating loading messages with shimmer effect while AI responds
  > *Replaced the static "Thinking…" label with 10 fun rotating messages (e.g. "Consulting the AI oracle…", "Summoning knowledge…") that cycle every 2.5 seconds. Added a CSS shimmer (opacity pulse) animation on the loading text.*

- **Apr 24, 2026** - `6fa34ce`: fix: keep loading indicator until first content token arrives in SSE stream
  > *With Gemma 4's OpenAI-compatible streaming, the first SSE chunks carry only metadata (role, finish_reason) with no content. The old code hid the loading indicator on reader creation, causing a blank gap. Now the indicator stays visible until the first real content token arrives.*

- **Apr 24, 2026** - `cca8bd0`: docs: explain SSE streaming architecture and model-specific response formats
  > *Added inline code comments documenting the full SSE flow (client → Worker → Workers AI), the OpenAI-compatible delta format used by Gemma 4, the older Workers AI native format used by LLaMA 3, and links to official Cloudflare and OpenAI reference docs.*

- **Apr 24, 2026** - `bca1d25`: fix: support OpenAI streaming delta format for Gemma 4 SSE chunks
  > *Gemma 4 uses the OpenAI-compatible streaming schema: `choices[0].delta.content`. The SSE parser now checks all three known shapes in priority order: OpenAI delta → Workers AI `response` → `text` fallback, making the component model-agnostic.*

- **Apr 24, 2026**: chore: switch AI model to `@cf/google/gemma-4-26b-a4b-it` and increase context window
  > *Replaced LLaMA 3.1 8B with Google Gemma 4 26B (256K token context window). Increased `MAX_CONTENT_LENGTH` from 8,000 to 20,000 chars to send full post content without truncation. Model is still configurable via `AI_MODEL` in `wrangler.jsonc`.*

- **Apr 11, 2026** - `2a65811`: feat: route AI calls through AI Gateway for rate limiting and observability
  > *Added Cloudflare AI Gateway as an intermediary for all Workers AI requests. The gateway (`hossains-dev-bytes`) provides native rate limiting (configurable in the Cloudflare dashboard), response caching, and a usage analytics dashboard — with no custom quota tracking code needed. The `AI_GATEWAY_ID` var in `wrangler.jsonc` controls which gateway is used. The API endpoint detects 429 responses from the gateway and returns a user-friendly "Daily AI usage limit reached" message.*

- **Apr 11, 2026** - `f48cd39`: fix: call marked.parseInline() in all inline renderers so bold/italic/code actually render
  > *Root cause: in marked v18, all renderer callbacks receive raw markdown as `text` — not pre-rendered HTML. `**bold**` inside paragraphs, headings, and `strong` wrappers was never processed. Fixed by calling `marked.parseInline(text)` in `strong`, `em`, `paragraph`, and `heading` renderers.*

- **Apr 11, 2026** - `60bef2a`: fix: render inline markdown (bold, code) inside list items using marked.parseInline
  > *List item `text` is raw markdown source. Replaced `item.text` with `marked.parseInline(item.text)` in the custom `list` renderer so bold, italic, and inline code inside list items are properly rendered.*

- **Apr 11, 2026** - `7570c5f`: feat: use marked + DOMPurify for full markdown rendering in AI response
  > *Replaced the hand-rolled regex markdown parser in the AI assistant with [marked](https://marked.js.org/) v18 + [DOMPurify](https://github.com/cure53/DOMPurify) v3. All markdown tokens (bold, italic, lists, headings, code blocks, inline code) are rendered with Tailwind-styled custom renderers. DOMPurify sanitizes all AI-generated HTML before it is inserted into the DOM.*

- **Apr 6, 2026** - `42a90a2`: feat: inline code rendering in AI responses (`backtick` → `<code>`)
  > *Extended the AI response renderer to handle single-backtick inline code spans, wrapping them in styled `<code>` elements.*

- **Apr 6, 2026**: feat: code block rendering in AI responses (triple backtick → `<pre><code>`)
  > *AI responses containing fenced code blocks are now rendered as properly styled `<pre><code>` blocks with an optional language badge.*

- **Apr 6, 2026**: feat: switch AI model to `@cf/meta/llama-3.1-8b-instruct-fp8`
  > *Replaced the default Gemma model with LLaMA 3.1 8B (fp8 quantized) after encountering inference failures with the previous model. Model is now configurable via `AI_MODEL` env var in `wrangler.jsonc` — no code change required to swap models.*

- **Apr 5, 2026**: feat: AI Post Assistant — per-post summarization and Q&A chat
  > *Added `AiPostAssistant.astro` component, rendered on every blog post page via `PostDetails.astro`. Provides a "Summarize" button and a follow-up Q&A chat panel powered by Cloudflare Workers AI. Responses stream via Server-Sent Events. The full post content (up to 8,000 chars) is sent as a system prompt so answers are grounded in the article.*

- **Feb 25, 2026** - `0dd2760`: style: Remove macOS window header from code blocks and simplify their styling
  > *Simplified the appearance of code blocks, removing macOS-style buttons and temporary borders that presented visual glitches.*
- **Feb 25, 2026** - `cd76708`: feat(ui): premium tech redesign for post layouts and secondary navigation
  > *Immersive redesign of individual article layouts (Hero card, transitions, and separators), along with a complete overhaul of the Breadcrumb component and Back Button (terminal pill style).*
- **Feb 24, 2026** - `6b81421`: refactor(ui): extract pagefind premium styles to global.css and unify SearchModal and search page designs
  > *Unified search aesthetics across the site, centralizing global styles and integrating blur effects into the Search Modal.*
- **Feb 24, 2026** - `429c382`: feat(ui): premium redesign of posts page with integrated pagefind search, 3-column grid layout, glassmorphism pagination buttons, and empty state component
  > *Deep transformation of the `/posts` page: 3-column grid for articles, integrated modern search, "Apple-style" pagination, and a polished empty state (404) component.*
- **Feb 24, 2026** - `5bc0f29`: UI/UX: Overhaul Footer component
  > *Modernized the Footer incorporating Glassmorphism and interactive physics on social buttons.*
- **Feb 24, 2026** - `4abb910`: UI/UX: Overhaul mobile menu & refine hover interactions
  > *Refined mobile navigation menu with fluid animations and polished hover states.*
- **Feb 24, 2026** - `eef3d5b`: UI/UX: Implement Scroll Physics & Premium Desktop Nav (Phase 1 & 2)
  > *Redesigned the desktop Header with dynamic behaviors based on continuous scroll, giving the site native-app-like physics.*
- **Feb 24, 2026** - `7c2a34a`: UI/UX: Design and semantic improvements on the Homepage
  > *Improved Homepage readability, enhancing stellar call-to-action buttons (Aurora effect) and enabling text selection within clickable cards.*

### Project Initiation
- **Feb 22, 2026** - `7382c85`: init: initial commit
