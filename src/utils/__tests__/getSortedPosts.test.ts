import { describe, it, expect, vi } from "vitest";

// Mock @/content.config to prevent loading Astro virtual modules
vi.mock("@/content.config", () => ({
  BLOG_PATH: "src/data/blog",
  GALLERY_PATH: "src/data/galleries",
}));

import getSortedPosts from "../getSortedPosts";
import type { ContentEntry } from "../contentEntry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PAST = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
const FUTURE_DATE = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

function makePost(
  id: string,
  pubDatetime: Date,
  opts: Partial<{ draft: boolean; modDatetime: Date | null }> = {}
): ContentEntry {
  return {
    id,
    collection: "blog",
    filePath: `src/data/blog/${id}.md`,
    data: {
      title: id,
      pubDatetime,
      modDatetime: opts.modDatetime,
      description: "Test",
      tags: ["test"],
      draft: opts.draft ?? false,
      author: "Author",
    },
  } as unknown as ContentEntry;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getSortedPosts", () => {
  it("returns an empty array when no posts are provided", () => {
    expect(getSortedPosts([])).toEqual([]);
  });

  it("returns an empty array when all posts are drafts", () => {
    const posts = [
      makePost("d1", PAST(1), { draft: true }),
      makePost("d2", PAST(2), { draft: true }),
    ];
    expect(getSortedPosts(posts)).toEqual([]);
  });

  it("excludes draft posts from the result", () => {
    const posts = [
      makePost("published", PAST(1)),
      makePost("draft", PAST(2), { draft: true }),
    ];
    const result = getSortedPosts(posts);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("published");
  });

  it("includes future-dated posts in test/dev mode (DEV=true bypasses date check)", () => {
    // In production (DEV=false), the future post would be hidden by postFilter.
    // In Vitest (DEV=true), postFilter always returns true for non-draft posts.
    const posts = [makePost("past", PAST(1)), makePost("future", FUTURE_DATE)];
    const result = getSortedPosts(posts);
    expect(result).toHaveLength(2);
  });

  it("sorts posts by pubDatetime descending (newest first)", () => {
    const posts = [
      makePost("old", PAST(10)),
      makePost("new", PAST(1)),
      makePost("mid", PAST(5)),
    ];
    const result = getSortedPosts(posts);
    expect(result.map(p => p.id)).toEqual(["new", "mid", "old"]);
  });

  it("uses modDatetime for sorting when it is set", () => {
    // post-a: published 10 days ago, modified 1 day ago → should sort first
    // post-b: published 2 days ago, no modDatetime → should sort second
    const posts = [
      makePost("post-b", PAST(2)),
      makePost("post-a", PAST(10), { modDatetime: PAST(1) }),
    ];
    const result = getSortedPosts(posts);
    expect(result.map(p => p.id)).toEqual(["post-a", "post-b"]);
  });

  it("treats null modDatetime the same as no modDatetime (falls back to pubDatetime)", () => {
    const posts = [
      makePost("old", PAST(5), { modDatetime: null }),
      makePost("new", PAST(1)),
    ];
    const result = getSortedPosts(posts);
    expect(result.map(p => p.id)).toEqual(["new", "old"]);
  });
});
