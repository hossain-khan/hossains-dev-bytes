import { describe, it, expect, vi } from "vitest";

vi.mock("@/content.config", () => ({
  BLOG_PATH: "src/data/blog",
  GALLERY_PATH: "src/data/galleries",
}));

import getUniqueTags from "../getUniqueTags";
import type { ContentEntry } from "../contentEntry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PAST = new Date("2022-01-01T00:00:00Z");
const FUTURE = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

function makePost(
  id: string,
  tags: string[],
  opts: Partial<{ draft: boolean; pubDatetime: Date }> = {}
): ContentEntry {
  return {
    id,
    collection: "blog",
    filePath: `src/data/blog/${id}.md`,
    data: {
      title: id,
      pubDatetime: opts.pubDatetime ?? PAST,
      description: "Test",
      tags,
      draft: opts.draft ?? false,
      author: "Author",
    },
  } as unknown as ContentEntry;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getUniqueTags", () => {
  it("returns an empty array for an empty post list", () => {
    expect(getUniqueTags([])).toEqual([]);
  });

  it("returns tags sorted alphabetically by their slugified form", () => {
    const posts = [makePost("p1", ["Zebra", "Apple", "Mango"])];
    const result = getUniqueTags(posts);
    const tags = result.map(t => t.tag);
    expect(tags).toEqual([...tags].sort());
  });

  it("deduplicates the same tag across multiple posts", () => {
    const posts = [
      makePost("p1", ["android"]),
      makePost("p2", ["android", "kotlin"]),
      makePost("p3", ["android"]),
    ];
    const result = getUniqueTags(posts);
    const tags = result.map(t => t.tag);
    expect(tags.filter(t => t === "android")).toHaveLength(1);
  });

  it("excludes tags from draft posts", () => {
    const posts = [
      makePost("draft", ["draft-only-tag"], { draft: true }),
      makePost("published", ["real-tag"]),
    ];
    const result = getUniqueTags(posts);
    const tags = result.map(t => t.tag);
    expect(tags).not.toContain("draft-only-tag");
    expect(tags).toContain("real-tag");
  });

  it("includes tags from future-scheduled posts in test/dev mode (DEV=true bypasses date check)", () => {
    // In production (DEV=false), postFilter would exclude the future post.
    // In Vitest (DEV=true), all non-draft posts pass the filter.
    const posts = [
      makePost("future", ["future-tag"], { pubDatetime: FUTURE }),
      makePost("published", ["present-tag"]),
    ];
    const result = getUniqueTags(posts);
    const tags = result.map(t => t.tag);
    expect(tags).toContain("future-tag");
    expect(tags).toContain("present-tag");
  });

  it("preserves the original (un-slugified) tagName in the result", () => {
    const posts = [makePost("p1", ["TypeScript"])];
    const result = getUniqueTags(posts);
    expect(result).toHaveLength(1);
    expect(result[0].tag).toBe("typescript");
    expect(result[0].tagName).toBe("TypeScript");
  });

  it("slugifies tags before deduplication so case variants are treated as the same tag", () => {
    const posts = [
      makePost("p1", ["TypeScript"]),
      makePost("p2", ["typescript"]),
    ];
    const result = getUniqueTags(posts);
    const tags = result.map(t => t.tag);
    expect(tags.filter(t => t === "typescript")).toHaveLength(1);
  });
});
