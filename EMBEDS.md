# Creating and Using Embeds in Your Astro Blog

This guide explains how to create custom embed components and use them in your MDX blog posts.

## What are Embeds?

Embeds are reusable Astro components that display rich content inline within blog posts. Examples include:
- GitHub repository cards
- YouTube video embeds
- Tweet/social media previews
- API data displays
- Custom content cards

## Quick Start

### 1. Create a New Embed Component

Create a new `.astro` file in `src/components/` with your component name:

```bash
touch src/components/MyEmbed.astro
```

**Basic structure** (`src/components/MyEmbed.astro`):

```astro
---
/**
 * MyEmbed — Brief description of what this embed does
 * 
 * Usage in .mdx files:
 *   import MyEmbed from '../components/MyEmbed.astro';
 *   <MyEmbed prop1="value" prop2="value" />
 */

type Props = {
  prop1: string;
  prop2?: string;  // Optional prop
};

const { prop1, prop2 } = Astro.props;

// Your component logic here (data fetching, processing, etc.)
const result = "Your computed value";
---

<div class="my-embed">
  {/* Your HTML output */}
  <p>{result}</p>
</div>

<style>
  .my-embed {
    /* Your styles */
  }
</style>
```

### 2. Use the Embed in an MDX File

In your `.mdx` blog post, import and use the component:

```mdx
---
title: "My Blog Post"
pubDatetime: 2026-04-05T12:00:00Z
description: "Post description"
tags: ["example"]
featured: false
draft: false
---

import MyEmbed from "@/components/MyEmbed.astro";

Here's my blog content.

<MyEmbed prop1="value1" prop2="value2" />

More content below the embed.
```

## Real Example: GitHubEmbed

Here's the complete `GitHubEmbed` component as a reference:

```astro
---
/**
 * GitHubEmbed — Display a GitHub repository card inline in MDX posts.
 * 
 * Usage in .mdx files:
 *   import GitHubEmbed from '@/components/GitHubEmbed.astro';
 *   <GitHubEmbed repo="username/repo-name" />
 */

type Props = {
  repo: string;
};

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

const { repo } = Astro.props;

// Validate repo format
if (!repo || !repo.includes("/")) {
  throw new Error(`GitHubEmbed: Invalid repo format. Use "username/repo-name"`);
}

// Fetch repository data from GitHub API at build time
let repoData: GitHubRepo | null = null;
let error: string | null = null;

try {
  const response = await fetch(`https://api.github.com/repos/${repo}`);
  
  if (!response.ok) {
    error = `Repository not found (${response.status})`;
  } else {
    repoData = await response.json();
  }
} catch (e) {
  error = `Failed to fetch repository: ${String(e)}`;
}

// Helper: Format star count (1000+ → "1K")
const formatStars = (count: number): string => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

// Helper: Get language color
const getLanguageColor = (language: string | null): string => {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572a5",
    Rust: "#dea584",
  };
  return colors[language || ""] || "#888888";
};
---

{error ? (
  <div class="not-prose my-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
    <strong>GitHubEmbed Error:</strong> {error}
  </div>
) : repoData ? (
  <a
    href={repoData.html_url}
    target="_blank"
    rel="noopener noreferrer"
    class:list={[
      "github-embed not-prose block my-4 rounded-lg p-4",
      "border border-slate-300/50 bg-slate-100/40",
      "transition-all duration-300 ease-out",
      "hover:border-blue-500/50 hover:bg-slate-200/60",
      "dark:border-slate-700/50 dark:bg-slate-900/40",
    ]}
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-5 h-5 flex-shrink-0 text-slate-600 dark:text-slate-400" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2 2.5A2.5 2.5 0 015 5v3h6V5a2.5 2.5 0 013-2.5h3.5a.5.5 0 01.5.5v9a.5.5 0 01-.5.5H9.5a.5.5 0 01-.5-.5V8H5v6.5a.5.5 0 01-.5.5H1.5a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5H2z" />
          </svg>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {repoData.name}
          </h3>
        </div>

        {repoData.description && (
          <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
            {repoData.description}
          </p>
        )}

        <div class="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          {repoData.language && (
            <div class="flex items-center gap-1.5">
              <div
                class="w-2 h-2 rounded-full"
                style={`background-color: ${getLanguageColor(repoData.language)}`}
              />
              <span>{repoData.language}</span>
            </div>
          )}

          <div class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 .5a.5.5 0 01.577.416l.385 1.99h2.097a.5.5 0 01.09.992l-1.95.182.6 1.933a.5.5 0 11-.96.268l-.444-1.427-1.4 1.4a.5.5 0 11-.707-.707l1.4-1.4-.427.427A.5.5 0 015.5 4a.5.5 0 01-.474-.658l.6-1.933-1.95-.182a.5.5 0 01.09-.992h2.097l.385-1.99A.5.5 0 018 .5z" />
            </svg>
            <span>{formatStars(repoData.stargazers_count)}</span>
          </div>
        </div>
      </div>

      <svg class="w-4 h-4 flex-shrink-0 mt-1 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </div>
  </a>
) : (
  <div class="not-prose my-4 rounded-lg border border-slate-300/50 bg-slate-100/40 p-4 text-sm text-slate-600">
    Loading repository data...
  </div>
)}

<style>
  .github-embed {
    --color-text: #e2e8f0;
    --color-border: #475569;
  }
</style>
```

## Component Design Patterns

### Pattern 1: Fetch Data at Build Time

Use `fetch()` in the component frontmatter to fetch data when Astro builds your site:

```astro
---
type Props = { id: string };

const { id } = Astro.props;

let data = null;

try {
  const response = await fetch(`https://api.example.com/data/${id}`);
  data = await response.json();
} catch (e) {
  console.error('Failed to fetch:', e);
}
---

{data ? <div>{data.title}</div> : <div>Error loading data</div>}
```

**Pros**: Fast rendering, data included at build time  
**Cons**: Only updates when site rebuilds

### Pattern 2: Simple Props-Based

Use props to render static content:

```astro
---
type Props = {
  title: string;
  url: string;
  description?: string;
};

const { title, url, description } = Astro.props;
---

<a href={url} class="embed-card">
  <h3>{title}</h3>
  {description && <p>{description}</p>}
</a>
```

**Pros**: Simple, fast, no external requests  
**Cons**: Requires manual data entry

### Pattern 3: With Type Safety

Define clear types for your embed:

```astro
---
interface ItemData {
  id: number;
  name: string;
  emoji: string;
  links?: string[];
}

type Props = {
  item: ItemData;
  layout?: 'card' | 'list';
};

const { item, layout = 'card' } = Astro.props;
---

<!-- Use item data with full type safety -->
{item.emoji} {item.name}
```

## Using Embeds in MDX

### Basic Usage

```mdx
import GitHubEmbed from "@/components/GitHubEmbed.astro";

Check out my project:

<GitHubEmbed repo="hossain-khan/hossains-dev-bytes" />
```

### Multiple Embeds

```mdx
import GitHubEmbed from "@/components/GitHubEmbed.astro";
import VideoEmbed from "@/components/VideoEmbed.astro";

Here's the GitHub repo:

<GitHubEmbed repo="user/repo" />

And here's a video:

<VideoEmbed youtubeId="dQw4w9WgXcQ" />
```

### Embeds with Text Wrapping

Embeds respect your prose and can be surrounded by text:

```mdx
Some intro text here.

<GitHubEmbed repo="user/repo" />

More text flowing around the embed.
```

## Styling Embeds

Use Tailwind CSS classes for consistent styling:

```astro
---
type Props = { title: string };
const { title } = Astro.props;
---

<div class="not-prose my-4 rounded-lg border border-slate-300/50 bg-slate-100/40 p-4 transition-all duration-300 hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-900/40">
  <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
</div>
```

### Key Classes for Embeds

- `not-prose` - Disables prose styling (use for embeds inside blog posts)
- `my-4` - Vertical margin
- `rounded-lg` - Border radius
- `border border-slate-300/50` - Light borders
- `dark:border-slate-700/50` - Dark mode borders
- `bg-slate-100/40` - Light background with transparency
- `dark:bg-slate-900/40` - Dark background
- `transition-all duration-300` - Smooth animations
- `hover:shadow-lg` - Hover effect

## Best Practices

### ✅ DO

1. **Import directly in MDX files** - This is the correct Astro MDX pattern
   ```mdx
   import MyEmbed from "@/components/MyEmbed.astro";
   <MyEmbed />
   ```

2. **Use TypeScript for props** - Provides type safety
   ```astro
   ---
   type Props = {
     title: string;
     url: string;
     count?: number;
   };
   ---
   ```

3. **Add JSDoc comments** - Helps developers understand usage
   ```astro
   /**
    * MyEmbed — Display a custom card
    * 
    * Usage:
    *   import MyEmbed from '@/components/MyEmbed.astro';
    *   <MyEmbed title="Example" url="https://..." />
    */
   ```

4. **Handle errors gracefully** - Show fallback content
   ```astro
   {error ? (
     <div>Error loading data</div>
   ) : (
     <div>Display content</div>
   )}
   ```

5. **Use `not-prose` class** - Prevents blog prose styling from affecting embeds
   ```astro
   <div class="not-prose my-4">Embed content</div>
   ```

6. **Support dark mode** - Use `dark:` Tailwind prefixes
   ```astro
   <div class="bg-slate-100/40 dark:bg-slate-900/40">
     Embed content
   </div>
   ```

### ❌ DON'T

1. **Don't register embeds in PostDetails.astro** - Astro MDX doesn't work that way
   ```astro
   // This doesn't work for custom components
   <Content components={{ MyEmbed }} />
   ```

2. **Don't use React components for embeds** - Not installed in this project
   ```tsx
   // Won't work - no React
   export default function MyEmbed() { ... }
   ```

3. **Don't hardcode styling** - Use Tailwind instead
   ```astro
   <!-- Bad -->
   <div style="color: red; font-size: 16px">Bad</div>
   
   <!-- Good -->
   <div class="text-red-500 text-lg">Good</div>
   ```

4. **Don't fetch data from client side** - Use build-time fetching
   ```astro
   // Bad - won't work in static build
   const data = await fetch(...); // runs at build time
   
   // If you need runtime fetching, use an API endpoint instead
   ```

## Troubleshooting

### Embed not appearing in MDX file

**Problem**: Component import doesn't work or render appears as empty tag

**Solution**:
- Ensure the import uses the `.astro` extension
- Check the path is correct relative to your MDX file
- Make sure the component is exported properly
- Check browser console for errors

```mdx
// ✓ Correct
import MyEmbed from "@/components/MyEmbed.astro";
<MyEmbed />

// ✗ Wrong
import MyEmbed from "@/components/MyEmbed";  // Missing .astro
<MyEmbed />
```

### Data not fetching

**Problem**: Embed shows loading state or error

**Solution**:
- Check network requests in build logs
- Verify API endpoint is accessible
- Add error logging in the component
- Test API manually with curl

```astro
---
try {
  const response = await fetch(`https://api.example.com/data`);
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  const data = await response.json();
} catch (e) {
  console.error('Embed fetch error:', e);
}
---
```

### Styling issues

**Problem**: Embed looks wrong or doesn't respond to dark mode

**Solution**:
- Use `not-prose` class to avoid conflicts
- Add `dark:` variants for dark mode support
- Check Tailwind configuration includes your colors
- Inspect with browser dev tools

```astro
<div class="not-prose my-4 bg-slate-100/40 dark:bg-slate-900/40">
  <!-- Embed content -->
</div>
```

## File Organization

Your embed components belong in `src/components/`:

```
src/components/
├── GitHubEmbed.astro      # GitHub repo card
├── VideoEmbed.astro       # YouTube/video embed
├── QuoteEmbed.astro       # Pull quotes
├── CodepenEmbed.astro     # Codepen projects
├── TwitterEmbed.astro     # Tweet previews
└── ...
```

Blog posts with embeds go in `src/data/blog/`:

```
src/data/blog/
├── my-first-post.mdx      # Uses embeds
├── project-showcase.mdx   # Uses multiple embeds
└── ...
```

## Next Steps

1. **Create a new embed** - Follow the patterns in this guide
2. **Test it locally** - Run `pnpm run dev` and view the page
3. **Build for production** - Run `pnpm run build` to ensure it works
4. **Commit your changes** - Use conventional commits:
   ```bash
   git add -A
   git commit -m "feat: add YouTubeEmbed component for video embeds"
   ```

## Resources

- [Astro MDX Documentation](https://docs.astro.build/en/guides/integrations-guide/mdx/)
- [Astro Component Syntax](https://docs.astro.build/en/basics/astro-components/)
- [Tailwind CSS](https://tailwindcss.com)
- [GitHub API](https://docs.github.com/en/rest)

---

**Last Updated**: April 5, 2026  
**Author**: Development Team
