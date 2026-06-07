/**
 * publishToAtmosphere.ts
 *
 * Syncs blog posts to the ATmosphere (ATproto network) for Standard.site support.
 *
 * When someone shares a blog post link on Bluesky, this enables a "View publication"
 * button with rich metadata (title, date, description) to appear in the post card.
 *
 * How it works:
 * 1. Reads all blog posts from src/data/blog/ via @mastrojs/markdown
 * 2. Filters out draft posts
 * 3. Maps each post to the Standard.site Document format (title, path, publishedAt, description)
 * 4. Downloads the publication icon from SITE.standardSite.iconUrl
 * 5. Logs into Bluesky via CredentialSession using ATPROTO_PASSWORD
 * 6. Calls createOrUpdateStandardSite which:
 *    - On first run: generates public/.well-known/site.standard.publication (requires manual confirmation)
 *    - On subsequent runs: diffs existing records, creates new ones, updates changed ones
 *
 * rkey derivation:
 * Record keys are derived from URL paths (e.g., /posts/my-post → self-postsmy-post).
 * This means no rkeys need to be stored in frontmatter, but URLs cannot change after publishing.
 *
 * Branch gating:
 * Only runs on the main branch. Checks CF_PAGES_BRANCH (Cloudflare) or GITHUB_REF_NAME (GitHub Actions).
 *
 * Usage:
 *   Local:  ATPROTO_PASSWORD=xxxx-xxxx-xxxx-xxxx pnpm run sync:atmosphere
 *   Build:  Included in `pnpm run build` as a post-build step
 *
 * Environment variables:
 *   ATPROTO_PASSWORD  - Bluesky app-specific password (https://bsky.app/settings/app-passwords)
 */

import path from "node:path";
import { readMarkdownFiles } from "@mastrojs/markdown";
import {
  createOrUpdateStandardSite,
  CredentialSession,
  type Publication,
  type Document,
} from "@mastrojs/atproto";
import { SITE } from "../src/config";

/* eslint-disable no-console */

/** Directory where blog posts are stored (relative to project root) */
const BLOG_DIR = "src/data/blog";

/** Base URL path for all blog posts */
const POST_BASE_PATH = "/posts";

// ─── Skip in GitHub Actions CI (sync only runs on Cloudflare Pages) ─────────

if (process.env.GITHUB_ACTIONS === "true" && !process.env.CF_PAGES_BRANCH) {
  console.log("Skipping atmosphere sync (GitHub Actions CI — sync runs on Cloudflare Pages only)");
  process.exit(0);
}

// ─── Validate ATPROTO_PASSWORD ───────────────────────────────────────────────

const password = process.env.ATPROTO_PASSWORD;
if (!password) {
  console.error(
    "ATPROTO_PASSWORD not set.\n" +
      "Get one from https://bsky.app/settings/app-passwords and run locally with:\n" +
      "ATPROTO_PASSWORD=xxxx-xxxx-xxxx-xxxx node scripts/publishToAtmosphere.ts\n" +
      "In CI/CD, add the password to your secret manager.",
  );
  process.exit(1);
}

// ─── Branch gating (only sync on main) ───────────────────────────────────────

const branch = process.env.CF_PAGES_BRANCH || process.env.GITHUB_REF_NAME;
if (branch && branch !== "main") {
  console.log(`Skipping atmosphere sync (branch: ${branch}, only runs on main)`);
  process.exit(0);
}

// ─── Build publication metadata ──────────────────────────────────────────────

const publication: Publication = {
  url: new URL(SITE.website),
  name: SITE.standardSite.publicationName,
  description: SITE.standardSite.publicationDesc,
  icon: {
    blob: await fetchIcon(SITE.standardSite.iconUrl),
    mimeType: "image/webp",
  },
};

// ─── Read and map blog posts to Standard.site Document format ────────────────

const posts = await readMarkdownFiles(`${BLOG_DIR}/**/*.md`);
const docs: Document[] = posts
  .filter((p) => {
    const draft = p.meta.draft;
    return draft !== "true";
  })
  .map((p) => {
    // Convert file path to URL path (e.g., src/data/blog/my-post.md → /posts/my-post)
    const relativePath = path
      .relative(BLOG_DIR, p.path)
      .replace(/\.md$/, "")
      .replace(/\\/g, "/");
    const postPath = `${POST_BASE_PATH}/${relativePath}`;
    return {
      title: p.meta.title!,
      description: p.meta.description || "",
      publishedAt: new Date(p.meta.pubDatetime!),
      path: postPath,
    };
  })
  .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

console.log(`Found ${docs.length} posts to sync`);

// ─── Login and sync to ATmosphere ────────────────────────────────────────────

const session = new CredentialSession(new URL("https://bsky.social"));
await session.login({
  identifier: SITE.standardSite.handle,
  password,
});

await createOrUpdateStandardSite(session, publication, docs, {
  baseFolder: "public",
});

console.log("Atmosphere sync complete");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Downloads the publication icon from a URL and returns it as a Buffer.
 * Used for the Standard.site publication metadata.
 */
async function fetchIcon(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch icon from ${url}: ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
