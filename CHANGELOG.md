# Changelog

Below is a summary of all changes and visual improvements implemented in the blog

### Recent Modifications

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
