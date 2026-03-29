# Hossain's Dev Bytes

A personal blog built with Astro, featuring a **Terminal/Cyberpunk** aesthetic with image galleries, global search modal, and dynamic content optimization.

**🌐 Live demo:** [hossain.dev](https://hossain.dev)

![Hossain's Dev Bytes](public/devosfera-og.webp)

---

## Table of contents

1. [Features](#-features)
2. [Project structure](#-project-structure)
3. [Installation & local development](#-installation--local-development)
4. [Commands](#-commands)
5. [Creating content](#-creating-content)
   - [Posts](#posts-srcdatablog)
   - [Image galleries](#galleries-srcdatagalleries)
6. [GalleryEmbed component](#%EF%B8%8F-galleryembed-component)
7. [Configuration](#%EF%B8%8F-configuration)
8. [Key components](#-key-components)
9. [Upstream issues resolved](#-upstream-issues-resolved)
10. [License](#-license)

---

## ✨ Features

### Core

- Type-safe Markdown, 100/100 Lighthouse performance, accessible and responsive
- Full SEO (meta tags, Open Graph, sitemap, RSS), light/dark mode
- Dynamically generated OG images with Satori

### Terminal/Cyberpunk design

- Hero with animated prompt `~/ready-to-go $`, shimmer title and `// posts` decorative separators
- Global backdrop: grid + ambient glow + cursor glow + noise texture (all pages)
- Glassmorphism on navbar, TOC, cards and modals

### Custom typography

| Role          | Font                      |
| :------------ | :------------------------ |
| Body          | `Wotfard` (local)         |
| Code / Mono   | `Cascadia Code` (local)   |
| Italics / H3  | `Sriracha` (Google Fonts) |

### Global search (⌘K)

- Modal via `⌘K` / `Ctrl+K` powered by **Pagefind** (static index)
- Animated aurora, reactive cursor glow, full keyboard navigation

### Image galleries (`/galleries`)

- Albums in `src/data/galleries/<slug>/`; images optimized at build-time (srcset, WebP, lazy)
- Native lightbox with `<dialog>`, responsive grid 2→4 cols
- `<GalleryEmbed>` to embed galleries inside MDX posts without importing
- Controlled by `showGalleries` in `src/config.ts` — see [GALLERIES.md](GALLERIES.md)

### Branded audio player

- Intro audio player in the hero with terminal aesthetic (wave bars, progress bar)
- Fully togglable and configurable from `src/config.ts`

### Redesigned pages

| Page        | Highlights                                          |
| :---------- | :-------------------------------------------------- |
| `/` Home    | Terminal hero, featured grid, section counters      |
| `/archives` | Vertical timeline with glow                         |
| `/tags`     | Grid with proportional progress bar                 |
| `/search`   | Reactive aurora, restyled Pagefind                  |
| Posts       | Glassmorphism TOC, prev/next navigation with aurora |

---

## 🚀 Project structure

```
/
├── public/
│   ├── audio/             # Audio files (intro, etc.)
│   └── pagefind/          # Search index (generated at build)
├── src/
│   ├── assets/            # Local fonts, SVG icons and logo
│   ├── components/        # Reusable Astro components
│   ├── data/
│   │   ├── blog/          # Posts .md / .mdx
│   │   └── galleries/     # Galleries (one folder per album)
│   ├── layouts/           # Root layout, PostDetails, etc.
│   ├── pages/             # Astro routes
│   ├── styles/            # global.css, typography.css
│   └── utils/             # Filters, OG with Satori, Shiki transformers
└── astro.config.ts
```

---

## 👨🏻‍💻 Installation & local development

**Requirements:** Node.js 20+ and pnpm.

```bash
# 1. Install dependencies
pnpm install

# 2. Development server
pnpm run dev
# → http://localhost:4321
```

The Pagefind search index is **only available in the production build**. To test it locally:

```bash
pnpm run build && pnpm run preview
```

### Docker

```bash
docker build -t devosfera-blog .
docker run -p 4321:80 devosfera-blog
```

---

## 🧞 Commands

| Command            | Action                                                   |
| :----------------- | :------------------------------------------------------- |
| `pnpm install`     | Install dependencies                                     |
| `pnpm run dev`     | Local dev server at `localhost:4321`                     |
| `pnpm run build`   | Production build (`astro check` + build + Pagefind)      |
| `pnpm run preview` | Preview the production build                             |
| `pnpm run format`  | Format with Prettier                                     |
| `pnpm run lint`    | Lint with ESLint                                         |

> `pnpm run build` internally runs `pagefind --site dist && cp -r dist/pagefind public/`. The search index ends up in `public/pagefind/` ready for preview.

---

## 📝 Creating content

### Posts (`src/data/blog/`)

Create a `.md` or `.mdx` file with the following frontmatter:

```yaml
---
title: "Post title"
pubDatetime: 2026-01-15T10:00:00Z   # required — ISO 8601 with timezone
description: "Short description for SEO and cards"
tags: ["astro", "dev"]
featured: false       # highlight on the home page
draft: false          # hidden in production
timezone: "America/Guatemala"  # overrides SITE.timezone
hideEditPost: false
---
```

**MDX**: JSX components can be used directly. `<GalleryEmbed>` is available without importing it (see next section).

**Table of Contents**: add `## Table of contents` to the post body to auto-generate the TOC with `remark-toc` + `remark-collapse`.

**Annotated code blocks** (via Shiki transformers):

```
// [!code highlight]      → highlight the line
// [!code ++]             → added line (diff)
// [!code --]             → removed line (diff)
// fileName: file.ts      → display the filename above the block
```

---

### Galleries (`src/data/galleries/`)

Create a **folder** with the desired slug. Place an `index.md` and image files inside:

```
src/data/galleries/
└── my-trip-to-tokyo/
    ├── index.md
    ├── 01-shibuya.jpg
    ├── 02-asakusa.jpg
    └── 03-fuji.png
```

The folder name becomes the URL: `/galleries/my-trip-to-tokyo`.

Images are displayed **sorted alphabetically**. Use numeric prefixes (`01-`, `02-`, …) to control the order.

#### Gallery frontmatter

```yaml
---
title: "My Trip to Tokyo"           # required
description: "Travel photos..."     # required
pubDatetime: 2026-01-20T00:00:00Z   # required
draft: false
coverImage: ./01-shibuya.jpg        # optional — explicit cover image
tags:
  - japan
  - travel
---
```

> Galleries have no body text; all visual content comes from the images in the folder.

#### Cover image

- **With `coverImage`**: Astro resolves and optimizes the relative path. If that image is already in the folder it won't be shown twice on the detail page.
- **Without `coverImage`**: the first image (alphabetically) is used as the cover in listing cards.

#### Automatic alt text

The alt text is derived from the filename:

```
01-sunset-kyoto.jpg     →  "Sunset Kyoto"
002_fuji_mountain.png   →  "Fuji Mountain"
IMG_4532.JPG            →  gallery title (fallback)
```

---

## 🖼️ GalleryEmbed component

Embed a gallery inside any `.mdx` post — **no import needed**:

```mdx
{/* First 6 photos, 3 columns (default) */}
<GalleryEmbed slug="my-trip-to-tokyo" />

{/* Only 4 photos in 2 columns, no footer link */}
<GalleryEmbed slug="my-trip-to-tokyo" limit={4} cols={2} showLink={false} />

{/* All photos */}
<GalleryEmbed slug="my-trip-to-tokyo" limit={0} />
```

| Prop       | Type          | Default | Description                                               |
| :--------- | :------------ | :------ | :-------------------------------------------------------- |
| `slug`     | `string`      | —       | **Required.** Folder name in `src/data/galleries/`        |
| `limit`    | `number`      | `6`     | Max images to show. `0` = all                             |
| `showLink` | `boolean`     | `true`  | Show link to the full gallery at the bottom               |
| `cols`     | `2 \| 3 \| 4` | `3`     | Number of grid columns                                    |

Each `<GalleryEmbed>` creates its own lightbox `<dialog id="ge-lb-{slug}">`, allowing **multiple embeds in the same post** without conflicts. Invalid slugs render a warning block instead of breaking the build.

---

## ⚙️ Configuration

All site configuration lives in `src/config.ts` (the `SITE` constant):

```ts
export const SITE = {
  website: "https://hossain.dev/",
  author: "Hossain Khan",
  desc: "Thoughts and dev bytes",
  title: "Hossain's Dev Bytes",
  timezone: "America/Toronto",  // default timezone for posts
  showArchives: true,
  showGalleries: true,   // false → hides /galleries and the nav link
  showBackButton: true,
  dynamicOgImage: true,
  introAudio: {
    enabled: true,               // show/hide the hero audio player
    src: "/audio/intro-web.mp3", // path relative to /public
    label: "INTRO.MP3",
    duration: 30,                // seconds
  },
};
```

Social links and "Share" links are defined in `src/constants.ts`.

> For details on visual effects, typography and the design system see [CUSTOMIZATIONS.md](CUSTOMIZATIONS.md).

---

## 🧩 Key components

| Component               | Description                                                                      |
| :---------------------- | :------------------------------------------------------------------------------- |
| `Header.astro`          | Glassmorphism navbar with animated SVG logo, `⌘K` trigger, fullscreen mobile menu |
| `SearchModal.astro`     | Global Cmd+K modal with Aurora background, reactive cursor glow and Pagefind     |
| `GalleryCard.astro`     | Card for the `/galleries` listing with optimized cover image                     |
| `GalleryEmbed.astro`    | Gallery embed for MDX posts with its own lightbox                                |
| `Card.astro`            | Post card with reactive cursor glow (`.card-glow-effect`)                        |
| `BackToTopButton.astro` | `fixed` button with SVG progress ring, unified mobile/desktop design             |
| `BackButton.astro`      | Glassmorphism pill with inline breadcrumb and chevron animation                  |
| `ShareLinks.astro`      | Square glassmorphism share buttons, open in new tab                              |
| `Footer.astro`          | Brand column + social links + copyright, gradient separators                     |

---

## � License

Built with Astro. Licensed under MIT.
