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
  4. Copy pagefind artifacts to `public/`
- **Deployed to**: Cloudflare Workers

## Deployment

Deployment happens automatically via GitHub Actions when pushing to `main`:
- Runs on Node 22.x and 24.x
- Checks ESLint rules, Prettier formatting, builds successfully
- All checks must pass

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

## CI/CD Pipeline

**Workflow file**: `.github/workflows/ci.yml`

**On push/PR to main**:
- Install dependencies with `pnpm install --frozen-lockfile`
- Run `pnpm run lint` - ESLint checks
- Run `pnpm run format:check` - Prettier validation
- Run `pnpm run build` - Full build (Astro + pagefind)
- **All must pass** before merging

**Node versions tested**: 22.x, 24.x (matrix strategy)

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

**Last updated**: March 29, 2026
**Maintainer**: Hossain Khan (@hossain-khan)
