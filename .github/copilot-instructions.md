# Copilot Instructions - Hossain's Dev Bytes

**Project**: Astro v6 blog with TypeScript, Tailwind CSS, and Cloudflare deployment
**Package Manager**: pnpm (required)
**Node Version**: 22.x or 24.x (from CI/CD)

## Quick Command Reference

| Task | Command |
|------|---------|
| **Start dev server** | `pnpm run dev` (localhost:4321) |
| **Build for production** | `pnpm run build` |
| **Check formatting** | `pnpm run format:check` |
| **Auto-format code** | `pnpm run format` |
| **Lint code** | `pnpm run lint` |
| **Type check** | `astro check` (automatic on build) |
| **Preview build locally** | `pnpm run preview` |

## Content Creation Patterns

### Blog Posts
**Location**: `src/data/blog/`
**Filename**: kebab-case (e.g., `my-post-title.md` or `.mdx` for rich components)

**Frontmatter template**:
```yaml
---
title: "Post Title"
pubDatetime: 2026-03-29T12:00:00Z
description: "Short description for SEO & social"
tags: ["tag1", "tag2"]
featured: false
draft: false
---
```

**Guidelines**:
- `pubDatetime` format: ISO 8601 (required for sorting)
- `description`: 155–160 chars (SEO/social preview)
- `tags`: Use lowercase kebab-case; existing tags found in all post frontmatter
- `featured: true` pins post to homepage
- `draft: true` hides post from production builds
- Content can be Markdown or MDX (Astro components supported)

### Blog Post Images
**Location**: `src/assets/images/`

Place images here and reference them in posts with a relative path:
```markdown
![Alt text](../../assets/images/my-image.png)
```
The `../../` navigates from `src/data/blog/` up to `src/assets/images/`. Astro automatically optimizes, converts to WebP, and hashes filenames at build time. Currently 493 files deployed — well under the 20,000 Cloudflare limit.

### Image Galleries
**Location**: `src/data/galleries/`
**Structure**:
```
src/data/galleries/{gallery-name}/
├── index.md          # Gallery metadata + description
├── 01-photo.jpg      # Images auto-discovered
├── 02-photo.jpg
└── ...
```

**Gallery index.md**:
```yaml
---
title: "Gallery Title"
description: "Short description"
gallery: gallery-name
---
Content (optional description/story)
```

## Project Structure

```
src/
├── assets/
│   ├── fonts/        # Custom fonts
│   ├── icons/        # SVG icons
│   ├── images/       # Static images
│   ├── logo/         # Logo (hkdevbytes.svg)
│   └── favicon/      # Favicon variants
├── components/       # Reusable Astro components
├── data/
│   ├── blog/         # All blog posts (Markdown/MDX)
│   └── galleries/    # Image galleries
├── layouts/          # Page layouts (Layout.astro, PostDetails.astro)
├── pages/            # Route files (index.astro, [slug].astro)
├── scripts/          # Utility scripts (theme.ts, cursorGlow.ts)
├── styles/           # Global CSS (global.css, typography.css)
└── utils/            # Helpers (slugify, getSortedPosts, etc.)
```

## Key Configuration Files

| File | Purpose |
|------|---------|
| `src/config.ts` | Site metadata, author, RSS/SEO config |
| `astro.config.ts` | Astro integrations, Markdown plugins, build config |
| `.prettierrc.mjs` | Prettier formatting rules (80 print width, 2-space tabs) |
| `eslint.config.js` | ESLint rules |
| `tsconfig.json` | TypeScript configuration |
| `.github/workflows/ci.yml` | CI/CD: build, lint, format check on Node 22.x & 24.x |

## Development Workflow

### Adding a Blog Post
1. Create `src/data/blog/{post-name}.md` with frontmatter (see pattern above)
2. Write content in Markdown (or use MDX for components)
3. Run `pnpm run format` to auto-format
4. Run `pnpm run lint` to check
5. Commit with: `git add -A && git commit -m "feat: add post about {topic}"`

### Modifying Components
- **Global layout**: See `src/layouts/Layout.astro`
- **Post layout**: See `src/layouts/PostDetails.astro`
- **Page components**: See `src/components/` (Header, Footer, Search, etc.)
- After changes: Run `pnpm run lint` and `pnpm run format:check`

### Updating Site Config
Edit `src/config.ts` for:
- Site URL, author name, description
- Social links (Bluesky, GitHub, etc.)
- RSS feed settings
- Gallery visibility toggle
- Archive visibility toggle

### Updating CHANGELOG
Update `CHANGELOG.md` when making **feature or fix changes** to the site itself — not for blog post additions or edits.

Record entries for:
- New components or UI features (e.g. new embed component, new AI capability)
- Visual/design changes (e.g. font swaps, layout redesigns)
- Bug fixes to site functionality
- Infrastructure changes (e.g. AI model swap, Analytics changes, Gateway config)

Do **not** add entries for:
- Adding or editing blog posts
- Minor copy/grammar fixes in posts
- Updating post tags or metadata

Entry format:
```markdown
- **MMM DD, YYYY** - `<short-hash>`: <type>: <description>
  > *One or two sentence summary of what changed and why.*
```

## Formatting & Linting

**Auto-format on save** (optional):
```bash
pnpm run format
```

**CI/CD enforces**:
- Prettier formatting (80 char width, 2 spaces)
- ESLint rules (Astro-aware)
- TypeScript type checking
- All three must pass for merges

**Fix formatting errors**:
```bash
pnpm run format && pnpm run lint --fix
```

## Build Output

- **Source**: `src/**/*`
- **Output**: `dist/` (production build)
- **Build steps**:
  1. `astro check` - TypeScript validation
  2. `astro build` - Compile Astro + static files
  3. `pagefind --site dist` - Generate search index
  4. Copy pagefind to `dist/client/pagefind/` (Cloudflare assets directory)
- **Deployed to**: Cloudflare Workers

## Deployment

**Build & Deploy**: Handled by Cloudflare Pages
- Automatic deployment triggered on push to `main`
- Cloudflare builds, optimizes, and deploys to Workers
- Site available at: `https://hossain.dev` (custom domain)

**Environment Variables** (Cloudflare):
Set these in **Cloudflare Dashboard → Workers & Pages → hossains-dev-bytes → Settings → Environment variables**:
- `GITHUB_TOKEN` - GitHub Personal Access Token (with `public_repo` scope) - used by GitHubEmbed component
- Any other runtime secrets needed by the app

**Wrangler Variables** (`wrangler.jsonc` `vars` section — committed to source):
- `AI_MODEL` - Workers AI model ID (default: `@cf/google/gemma-4-26b-a4b-it`). Change here to swap models with no code change.
- `AI_GATEWAY_ID` - AI Gateway name (default: `hossains-dev-bytes`). Routes all AI requests through the gateway for rate limiting, caching, and observability. Configure the gateway at: **Cloudflare Dashboard → AI → AI Gateway**.

**GitHub Actions** (Pre-deployment checks):
Runs on Node 22.x and 24.x when pushing to `main`:
- Checks ESLint rules
- Validates Prettier formatting (currently commented out)
- Runs full build to catch errors early
- All checks must pass before merging

## Blog Writing Style

Blog posts should sound like they were written by a real person solving a real problem - not a polished tutorial or technical documentation. The reference posts for tone are:
- `src/data/blog/create-your-own-mock-api-server-with-express-js-and-firebase-for-free.md`
- `src/data/blog/source-code-syntax-highlighting-on-android-taking-full-control.md`

### Tone rules

**Intro - start with personal context**
Open with why you needed this, what situation you were in, or what you were tinkering with. Not "In this post we will explore..." but "Recently I had to..." or "One weekend I thought it'd be fun to...".

**Explain the why, not just the what**
When choosing a tool or approach, say why you chose it. "Since Firebase has a free tier and Express makes things easy to customize" is better than "Firebase and Express are popular choices".

**Use "I" naturally**
Write in first person throughout. "I noticed", "I wanted to avoid", "I just wanted to focus on" - not passive voice or third person.

**Section titles - short and lowercase**
- Good: "What it does", "The API endpoint", "Keeping it free", "Seeing it in the dashboard"
- Avoid: "Understanding the Feature", "Building the API Endpoint", "Real-World Cost Analysis"

**No bold-label-then-dash bullets**
- Avoid: `**Streaming** - this gives us token-by-token output`
- Use plain sentences instead, or just a dash: `- Streaming gives us token-by-token output`

**Inline honest observations and gotchas**
Add parenthetical notes, caveats, and real opinions inline. "Without this, the model happily wanders off into general knowledge territory." Or "(No worries - this is where this article comes in 🤗)".

**Tips as blockquotes**
Use `>` blockquotes for tips and callouts. Optionally with a 💡 prefix.

**Troubleshooting section**
If you personally hit issues, add a Troubleshooting section at the end with the actual errors and what fixed them.

**Friendly sign-off**
End posts with a short, warm close that invites readers to comment if something's broken or unclear. Examples:
- "Happy mocking 😃!"
- "Hope it helps somebody. ✌️"
- "If you find any issue, leave a comment or open a GitHub issue."

**Emoji usage**
Use emoji sparingly and naturally - a few in the body and sign-off is fine. Don't force them into every bullet or heading.

**Updates and caveats**
If something may be outdated or has caveats, note it inline with a `> **UPDATE:**` blockquote rather than hiding it.

## Code Conventions

### Naming
- **Files**: kebab-case (e.g., `post-title.md`, `header.astro`)
- **Components**: PascalCase (e.g., `Header.astro`)
- **Utilities**: camelCase (e.g., `getSortedPosts.ts`)
- **CSS classes**: kebab-case (Tailwind utility chaining)

### Imports
- Use path aliases: `@/components`, `@/layouts`, `@/utils` (defined in `tsconfig.json`)
- Organize: built-ins → packages → aliases

### TypeScript
- Strict mode enabled
- Use `type` keyword for type definitions
- Define component props with `interface Props`

### Markdown

**Do not use em dashes** (`—`); use a regular hyphen-minus (`-`) instead.

**Code blocks** with syntax highlighting:
````markdown
```javascript
// Syntax highlighting enabled via Shiki
const greeting = "hello";
```
````

**Special notations** (Shiki transformers):
- Diffs: `// [!code ++]` or `// [!code --]`
- Highlight: `// [!code highlight]`
- Word highlight: `// [!code word:variable]`

### Components
- Single-file Astro components
- Props defined with `interface`
- Use Tailwind CSS for styling
- Responsive breakpoints: `sm:`, `md:`, `lg:` (Tailwind defaults)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Dev server won't start** | `pnpm install --frozen-lockfile` then `pnpm run dev` |
| **Build fails** | Run `pnpm run format && pnpm run lint --fix` to fix syntax |
| **Search not working** | Ensure `pnpm run build` completes; pagefind index must be generated |
| **Imports fail** | Check alias paths in `tsconfig.json` match `astro.config.ts` |
| **Formatting conflicts** | Delete `.prettierrc.mjs` and rebuild if corrupted |
| **GitHubEmbed shows error (403)** | Token not set in Cloudflare. Go to **Cloudflare Dashboard → Workers & Pages → hossains-dev-bytes → Settings → Environment variables** and add `GITHUB_TOKEN` |
| **GitHubEmbed component fails locally** | Create `.env` file from `.env.example` and add your GitHub Personal Access Token |
| **AI assistant shows "Daily AI usage limit reached"** | Rate limit on AI Gateway triggered. Wait until midnight UTC for daily reset, or raise the limit at **Cloudflare Dashboard → AI → AI Gateway → hossains-dev-bytes → Settings → Rate Limiting** |
| **AI assistant not routing through gateway / no gateway logs** | Ensure the gateway named `hossains-dev-bytes` exists in the Cloudflare Dashboard under AI → AI Gateway. The `AI_GATEWAY_ID` var in `wrangler.jsonc` must match the gateway name exactly |

## CI/CD Pipeline

**GitHub Actions** (Pre-deployment validation only)
**Workflow file**: `.github/workflows/ci.yml`

**On push/PR to main**:
1. Install dependencies with `pnpm install --frozen-lockfile`
2. Run `pnpm run lint` - ESLint code quality checks
3. Run `pnpm run format:check` - Prettier formatting validation (currently disabled)
4. Run `pnpm run build` - Full build test (Astro + pagefind)

All checks must pass before merging to `main`. This acts as a safety gate before code reaches production.

**Cloudflare Pages** (Build & Deploy)
**Triggered**: Automatically when commits reach `main` branch

**Build process**:
1. Git clone on Cloudflare's build servers
2. Install dependencies (`pnpm install --frozen-lockfile`)
3. Run build command: `npm run build`
4. Astro compiles all pages, components, and static assets
5. Pagefind generates search index
6. Deploy to Cloudflare Workers edge network
7. Available at: `https://hossain.dev`

**Environment variables** (Cloudflare build):
- Set in **Cloudflare Dashboard → Workers & Pages → hossains-dev-bytes → Settings → Environment variables**
- Example: `GITHUB_TOKEN` (used by GitHubEmbed component at build time)
- These are passed to the build process and available as `process.env.*` in Astro components

**Node versions tested**: 22.x, 24.x (GitHub Actions matrix)
**Node version deployed**: Detected automatically by Cloudflare (currently 22.x)

## Git Conventions

**Commit messages** follow conventional commits:
- `feat:` - New feature or content
- `fix:` - Bug fix
- `ci:` - CI/CD changes
- `chore:` - Refactoring, deps, config
- `docs:` - Documentation

**Examples**:
```
feat: add post about Rust for JavaScript developers
fix: correct sidebar navigation on mobile
ci: update setup-node to v6
chore: remove cursor glow feature
docs: update README with gallery instructions
```

## Useful Links

- [Astro v6 Docs](https://docs.astro.build)
- [Tailwind CSS](https://tailwindcss.com)
- [Prettier Docs](https://prettier.io)
- [ESLint Docs](https://eslint.org)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

---

**Last updated**: April 24, 2026
**Maintainer**: Hossain Khan (@hossain-khan)
