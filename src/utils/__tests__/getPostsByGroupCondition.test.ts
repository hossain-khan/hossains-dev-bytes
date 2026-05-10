import { describe, it, expect } from "vitest";
import getPostsByGroupCondition from "../getPostsByGroupCondition";
import type { ContentEntry } from "../contentEntry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEntry(
  id: string,
  year: number,
  tags: string[] = []
): ContentEntry {
  return {
    id,
    collection: "blog",
    filePath: `src/data/blog/${id}.md`,
    data: {
      title: id,
      pubDatetime: new Date(`${year}-06-01T00:00:00Z`),
      description: "Test",
      tags,
      draft: false,
      author: "Author",
    },
  } as unknown as ContentEntry;
}

const posts = [
  makeEntry("post-a", 2023),
  makeEntry("post-b", 2024),
  makeEntry("post-c", 2023),
  makeEntry("post-d", 2024),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getPostsByGroupCondition", () => {
  it("returns an empty object for an empty post array", () => {
    const result = getPostsByGroupCondition([], () => "key");
    expect(result).toEqual({});
  });

  it("groups posts by year extracted from pubDatetime", () => {
    const result = getPostsByGroupCondition(posts, post =>
      post.data.pubDatetime.getFullYear()
    );

    expect(Object.keys(result).sort()).toEqual(["2023", "2024"]);
    expect(result[2023]).toHaveLength(2);
    expect(result[2024]).toHaveLength(2);
    expect(result[2023].map(p => p.id)).toEqual(["post-a", "post-c"]);
    expect(result[2024].map(p => p.id)).toEqual(["post-b", "post-d"]);
  });

  it("places all posts under the same key when the function always returns the same value", () => {
    const result = getPostsByGroupCondition(posts, () => "all");
    expect(Object.keys(result)).toEqual(["all"]);
    expect(result["all"]).toHaveLength(4);
  });

  it("puts every post in its own group when keys are all unique", () => {
    const result = getPostsByGroupCondition(posts, post => post.id);
    expect(Object.keys(result)).toHaveLength(4);
    for (const post of posts) {
      expect(result[post.id]).toHaveLength(1);
    }
  });

  it("passes the array index as the second argument to the group function", () => {
    const indices: number[] = [];
    getPostsByGroupCondition(posts, (_item, idx) => {
      if (idx !== undefined) indices.push(idx);
      return "group";
    });
    expect(indices).toEqual([0, 1, 2, 3]);
  });

  it("preserves insertion order within each group", () => {
    const result = getPostsByGroupCondition(posts, post =>
      post.data.pubDatetime.getFullYear()
    );
    expect(result[2023][0].id).toBe("post-a");
    expect(result[2023][1].id).toBe("post-c");
  });
});
