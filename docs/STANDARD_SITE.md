# Standard.site Support

## Overview

[Standard.site](https://standard.site/) is a standardized way to express metadata about publications and documents (e.g., blogs and their posts) on the [ATproto](https://atproto.com/) network. Bluesky uses this to show a **"View publication"** button when your blog links are shared on the timeline.

This site uses the `@mastrojs/atproto` package to sync blog posts to the ATmosphere without storing rkeys in frontmatter.

## Architecture

### How It Works

```
main push → Cloudflare build → sync:atmosphere → astro build → pagefind → deploy
```

1. **HTML `<link>` tag**: Each post page includes a `<link rel="site.standard.document">` tag pointing to an AT-URI
2. **ATproto records**: A sync script creates/updates `site.standard.document` records on your PDS (Bluesky)
3. **`.well-known` file**: A publication URI file is generated at `/.well-known/site.standard.publication` for discovery

### rkey Derivation (No Frontmatter Changes)

Instead of storing generated rkeys in frontmatter, rkeys are **derived from URL paths** as valid **TIDs** (Timestamp Identifiers) per the AT Protocol `site.standard.document` lexicon:

| Post URL | Derived rkey (TID) |
|----------|-------------------|
| `https://hossain.dev/posts/my-post/` | `3...` (13-char base-32 TID) |

The `rkeyFromUrl()` function from `@mastrojs/atproto` generates deterministic TIDs based on URL paths.

**Tradeoff**: URLs cannot change after publishing to the ATmosphere. This is good practice anyway.

### Components

#### 1. Layout Integration (`src/layouts/PostDetails.astro`)

Each post page renders a `<link>` tag in the `<head>`:

```html
<link rel="site.standard.document"
  href="at://did:plc:sek23f2vucrxxyaaud2emnxe/site.standard.document/3igs2bkublgkf" />
```

The DID is hardcoded in `src/config.ts` under `SITE.standardSite.did`.

#### 2. Sync Script (`scripts/publishToAtmosphere.ts`)

Reads all blog posts from `src/data/blog/` (both `.md` and `.mdx`), maps them to the Standard.site `Document` format, and syncs to the ATmosphere:

- **First run**: Generates `public/.well-known/site.standard.publication` (requires manual confirmation)
- **Subsequent runs**: Diffs existing records, creates new ones, updates changed ones
- **GitHub Actions skip**: Gracefully exits in CI validation (only runs on Cloudflare Pages)
- **Branch gating**: Only runs on `main` branch (checks `CF_PAGES_BRANCH`)

The script runs before `astro build` in the build chain:

```json
"build": "wrangler types && astro check && node --import tsx scripts/publishToAtmosphere.ts && astro build && ..."
```

This ordering ensures sync logs are visible in Cloudflare build output and the `.well-known` file gets included in `dist/client/` naturally.

#### 3. Configuration (`src/config.ts`)

```ts
standardSite: {
  enabled: true,
  handle: "hossain.dev",
  did: "did:plc:sek23f2vucrxxyaaud2emnxe",
  publicationName: "Hossain's Dev Bytes",
  publicationDesc: "Thoughts and dev bytes...",
  iconUrl: "https://hossain.dev/web-app-manifest-512x512.webp",
}
```

### Build Flow

| Step | What Happens |
|------|-------------|
| 1 | Cloudflare clones repo on `main` push |
| 2 | `scripts/publishToAtmosphere.ts` syncs posts to ATmosphere (runs before `astro build` so logs are visible) |
| 3 | `astro build` generates HTML with `<link>` tags and copies `.well-known` to `dist/client/` |
| 4 | `pagefind` generates search index |
| 5 | Cloudflare deploys `dist/client/` to Workers |

## Setup

### Local First Run

1. Create an app password at [bsky.app/settings/app-passwords](https://bsky.app/settings/app-passwords)
2. Run locally:
   ```bash
   ATPROTO_PASSWORD=xxxx-xxxx-xxxx-xxxx pnpm run sync:atmosphere
   ```
3. The script shows all URLs and derived rkeys for confirmation
4. Type `y` to proceed — this generates `public/.well-known/site.standard.publication`
5. Commit the generated file:
   ```bash
   git add public/.well-known/site.standard.publication
   git commit -m "chore: add standard.site publication file"
   ```

### Cloudflare Environment Variable

Add `ATPROTO_PASSWORD` in **Cloudflare Dashboard → Workers & Pages → hossains-dev-bytes → Settings → Environment variables**:

| Key | Value |
|-----|-------|
| `ATPROTO_PASSWORD` | Your Bluesky app password |

### Updating the DID

If you ever need to change your Bluesky account, resolve the new DID:

```bash
curl -s "https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=your.handle"
```

Then update `SITE.standardSite.did` in `src/config.ts`.

## Verification

Use the [Standard.site validator](https://site-validator.fly.dev) to verify your publication and document records.

> **Note**: The validator enforces TID-based record keys, but Bluesky's resolver accepts path-derived rkeys (Record Key Type: `any`). The validator may show "Invalid" for the record key check, but the "View publication" button will still work on Bluesky.

After sharing a post link on Bluesky, you should see a **"View publication"** button appear in the post card.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ATPROTO_PASSWORD not set` | Add the env var locally or in Cloudflare settings |
| `No publication URI found` | Run the script locally first to generate the `.well-known` file, then commit it |
| Bluesky doesn't show "View publication" | Bluesky may not have crawled the page yet. Use the validator to check, or wait a few minutes |
| rkey collision error | Two posts have the same normalized path. Ensure filenames are unique |
| Icon upload fails | SVG may not be supported by all PDS servers. Switch to PNG by updating `iconUrl` and `mimeType` in `src/config.ts` |

## References

- [Standard.site docs](https://standard.site/)
- [ATproto spec](https://atproto.com/)
- [Bluesky + Standard.site announcement](https://atproto.com/blog/standard-site-bluesky-timeline)
- [@mastrojs/atproto package](https://jsr.io/@mastrojs/atproto)
- [How to add Standard.site support (blog post)](https://mastrojs.github.io/blog/2026-06-05-how-to-add-standard-site-support-to-your-website/)
