import { describe, it, expect, vi } from "vitest";

vi.mock("@/content.config", () => ({
  BLOG_PATH: "src/data/blog",
  GALLERY_PATH: "src/data/galleries",
}));

import getPostsByTag from "../getPostsByTag";
import type { ContentEntry } from "../contentEntry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PAST = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
const FUTURE_DATE = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

function makePost(
  id: string,
  tags: string[],
  pubDatetime = PAST(5),
  draft = false
): ContentEntry {
  return {
    id,
    collection: "blog",
    filePath: `src/data/blog/${id}.md`,
    data: {
      title: id,
      pubDatetime,
      description: "Test",
      tags,
      draft,
      author: "Author",
    },
  } as unknown as ContentEntry;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getPostsByTag", () => {
  it("returns an empty array when there are no posts", () => {
    expect(getPostsByTag([], "android")).toEqual([]);
  });

  it("returns an empty array when no post matches the tag", () => {
    const posts = [makePost("p1", ["kotlin"]), makePost("p2", ["swift"])];
    expect(getPostsByTag(posts, "android")).toEqual([]);
  });

  it("returns only posts that contain the matching tag", () => {
    const posts = [
      makePost("p1", ["android", "kotlin"]),
      makePost("p2", ["ios", "swift"]),
      makePost("p3", ["android"]),
    ];
    const result = getPostsByTag(posts, "android");
    expect(result.map(p => p.id)).toEqual(expect.arrayContaining(["p1", "p3"]));
    expect(result).toHaveLength(2);
  });

  it("matches tags case-insensitively via slugification", () => {
    // Post has "TypeScript" (uppercase) but we query the slugified form "typescript"
    const posts = [makePost("ts-post", ["TypeScript"])];
    const result = getPostsByTag(posts, "typescript");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("ts-post");
  });

  it("excludes draft posts", () => {
    const posts = [
      makePost("published", ["android"]),
      makePost("draft", ["android"], PAST(1), true),
    ];
    const result = getPostsByTag(posts, "android");
    expect(result.map(p => p.id)).toEqual(["published"]);
  });

  it("includes future-scheduled posts in test/dev mode (DEV=true bypasses date check)", () => {
    // In production (DEV=false), getSortedPosts/postFilter would exclude the future post.
    // In Vitest (DEV=true), all non-draft posts pass the filter.
    const posts = [
      makePost("past", ["android"]),
      makePost("future", ["android"], FUTURE_DATE),
    ];
    const result = getPostsByTag(posts, "android");
    expect(result).toHaveLength(2);
  });

  it("returns posts sorted by pubDatetime descending (newest first)", () => {
    const posts = [
      makePost("oldest", ["android"], PAST(10)),
      makePost("newest", ["android"], PAST(1)),
      makePost("middle", ["android"], PAST(5)),
    ];
    const result = getPostsByTag(posts, "android");
    expect(result.map(p => p.id)).toEqual(["newest", "middle", "oldest"]);
  });
});
