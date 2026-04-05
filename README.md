# Hossain's Dev Bytes

A personal blog about Android development, coding, AI, and software engineering. Built with [Astro](https://astro.build) and deployed on [Cloudflare Workers](https://workers.cloudflare.com).

**📖 Read the blog:** [hossain.dev](https://hossain.dev)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server (localhost:4321)
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## What's Inside

- **24+ blog posts** on Android, Kotlin, Node.js, TypeScript, Docker, and more
- **Global search** powered by Pagefind (⌘K / Ctrl+K)
- **Image galleries** with lightbox and optimization
- **Dynamic OG images** generated at build time
- **Light/dark mode** with persistent preference
- **Responsive design** with terminal/cyberpunk aesthetic
- **Type-safe** Markdown with YAML frontmatter

## Adding Content

### Blog Posts

Create a file in `src/data/blog/`:

```md
---
title: "My Post Title"
pubDatetime: 2026-03-29T12:00:00Z
description: "Short description for SEO"
tags: ["tag1", "tag2"]
featured: false
draft: false
---

Your content here...
```

**Frontmatter Options:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | ✅ | — | Post headline |
| `pubDatetime` | date | ✅ | — | Publication date (ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`) |
| `description` | string | ✅ | — | SEO/social preview text (155–160 chars recommended) |
| `author` | string | ❌ | `SITE.author` | Post author name |
| `tags` | array | ❌ | `["others"]` | Post categories (lowercase kebab-case) |
| `featured` | boolean | ❌ | — | Pin post to homepage |
| `draft` | boolean | ❌ | — | Hide post from production builds |
| `modDatetime` | date | ❌ | — | Last modified date (ISO 8601 format) |
| `ogImage` | image/string | ❌ | — | Custom Open Graph image (file path or URL) |
| `canonicalURL` | string | ❌ | — | Canonical URL for SEO purposes |
| `hideEditPost` | boolean | ❌ | — | Hide "Edit this post" link |
| `timezone` | string | ❌ | — | Timezone override for datetime display |

### Image Galleries

Create a folder in `src/data/galleries/`:

```
src/data/galleries/my-gallery/
├── index.md          # Gallery metadata
├── 01-photo.jpg
├── 02-photo.jpg
└── 03-photo.jpg
```

### Custom Embeds

Use reusable components to embed rich content in blog posts (GitHub repos, videos, etc).

For a comprehensive guide on creating and using embeds, see [**EMBEDS.md**](EMBEDS.md).

**Quick example:**

```mdx
import GitHubEmbed from "@/components/GitHubEmbed.astro";

Check out this project:

<GitHubEmbed repo="username/repo-name" />
```

See [TEMPLATE_README.md](TEMPLATE_README.md) for full feature documentation.

## Configuration

Edit `src/config.ts` to customize:

- Site metadata (author, title, description)
- Timezone and language
- Audio player settings
- Gallery and archive visibility
- Edit links on posts

## Tech Stack

- **Framework:** Astro v6
- **Styling:** Tailwind CSS
- **Search:** Pagefind
- **OG Images:** Satori
- **Deployment:** Cloudflare Workers
- **Package Manager:** pnpm

## License

Built with Astro. Licensed under MIT.

---

> For detailed template documentation, see [TEMPLATE_README.md](TEMPLATE_README.md)
