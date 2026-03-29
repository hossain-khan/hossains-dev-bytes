# Hossain's Dev Bytes

A heavily customized blog built with **Astro** featuring a **Terminal/Cyberpunk** aesthetic, image galleries, global search, and dynamic OG image generation.

**🌐 Live demo:** [hossains-dev-bytes.hk-c91.workers.dev](https://hossains-dev-bytes.hk-c91.workers.dev)

---

## ✨ Features

- **100/100 Lighthouse performance** – Type-safe Markdown, SEO-optimized
- **Terminal/Cyberpunk design** – Animated prompt, glassmorphism, cursor glow effects
- **Image galleries** – Albums with native lightbox and responsive optimization
- **Global search** – Pagefind-powered modal with **⌘K / Ctrl+K** shortcut
- **Dark/Light mode** – Seamless theme switching
- **MDX support** – Use React/Astro components in posts
- **Dynamically generated OG images** – Per-post social sharing
- **Cloudflare deployment** – Optimized for Cloudflare Workers

---

## 🚀 Project Structure

```
/
├── public/              # Audio files, generated search index
├── src/
│   ├── assets/          # Fonts, icons, images
│   ├── components/      # Reusable Astro components
│   ├── data/
│   │   ├── blog/        # Blog posts (.md, .mdx)
│   │   └── galleries/   # Image galleries
│   ├── layouts/         # Page layouts
│   ├── pages/           # Astro routes
│   ├── scripts/         # Theme toggle, etc.
│   ├── styles/          # Global CSS, typography
│   └── utils/           # Helpers, filters, transformers
├── docs/theme/          # Theme documentation
├── astro.config.ts      # Astro + Cloudflare adapter config
├── wrangler.jsonc       # Cloudflare Workers config
└── package.json
```

For detailed documentation, see [docs/theme/README.md](docs/theme/README.md).

---

## 👨🏻‍💻 Requirements & Setup

**Requirements:** Node.js 20+ and pnpm

```bash
# 1. Install dependencies
pnpm install

# 2. Development server
pnpm run dev
# → http://localhost:4321
```

---

## 🧞 Commands

| Command            | Action                                              |
| :----------------- | :-------------------------------------------------- |
| `pnpm install`     | Install dependencies                                |
| `pnpm run dev`     | Local dev server at `localhost:4321`                |
| `pnpm run build`   | Production build (`astro check` + build + Pagefind) |
| `pnpm run preview` | Preview production build locally                    |
| `pnpm run format`  | Format code with Prettier                           |
| `pnpm run lint`    | Lint with ESLint                                    |

> **Note:** Pagefind search index is only available in production builds. Test locally with `pnpm run build && pnpm run preview`.

---

## 📝 Creating Content

### Posts (`src/data/blog/`)

Create a `.md` or `.mdx` file with frontmatter:

```yaml
---
title: "Post Title"
pubDatetime: 2026-01-15T10:00:00Z
description: "Short description for SEO"
tags: ["astro", "dev"]
featured: false
draft: false
---
```

### Galleries (`src/data/galleries/`)

Folder structure:

```
src/data/galleries/
└── my-gallery/
    ├── index.md
    ├── 01-image.jpg
    └── 02-image.jpg
```

See [GALLERIES.md](docs/theme/GALLERIES.md) for advanced gallery features.

---

## ⚙️ Configuration

Edit `src/config.ts` to change:

- Site URL, author, description
- Timezone, post counts per page
- Show/hide archives and galleries
- Intro audio settings
- UI effects (cursor glow, grain, etc.)

Social links are in `src/constants.ts`.

---

## 🚀 Deployment (Cloudflare Workers)

This project is configured for Cloudflare Workers via `@astrojs/cloudflare`.

```bash
# Deploy to Cloudflare
wrangler deploy
```

---

## 📖 More Information

- **Theme Documentation**: [docs/theme/README.md](docs/theme/README.md)
- **Customizations**: [docs/theme/CUSTOMIZATIONS.md](docs/theme/CUSTOMIZATIONS.md)
- **Gallery Guide**: [docs/theme/GALLERIES.md](docs/theme/GALLERIES.md)
- **Astro Docs**: [astro.build](https://docs.astro.build)
