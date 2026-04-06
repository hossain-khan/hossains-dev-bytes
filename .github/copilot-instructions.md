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

**GitHub Actions** (Pre-deployment checks):
Runs on Node 22.x and 24.x when pushing to `main`:
- Checks ESLint rules
- Validates Prettier formatting (currently commented out)
- Runs full build to catch errors early
- All checks must pass before merging

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

**Last updated**: April 6, 2026
**Maintainer**: Hossain Khan (@hossain-khan)
