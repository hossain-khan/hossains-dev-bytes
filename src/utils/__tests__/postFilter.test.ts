import { describe, it, expect } from "vitest";

// postFilter imports @/config (plain TS - no Astro deps) and dayjs - no mock needed.

import postFilter from "../postFilter";
import type { ContentEntry } from "../contentEntry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PAST_DATE = new Date("2020-01-01T00:00:00Z");
// Far enough in the future that it exceeds the 15-minute scheduledPostMargin
const FUTURE_DATE = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

function makeEntry(
  overrides: Partial<{
    draft: boolean;
    pubDatetime: Date;
    timezone: string;
  }> = {}
): ContentEntry {
  const { draft = false, pubDatetime = PAST_DATE, timezone } = overrides;
  return {
    id: "test-post",
    collection: "blog",
    filePath: "src/data/blog/test-post.md",
    data: {
      title: "Test Post",
      pubDatetime,
      description: "A test post",
      tags: ["test"],
      draft,
      author: "Test Author",
      ...(timezone !== undefined ? { timezone } : {}),
    },
  } as unknown as ContentEntry;
}

// ---------------------------------------------------------------------------
// Tests
//
// NOTE: Vitest always runs with import.meta.env.DEV === true (test/dev mode).
// This means postFilter returns `true || isPublishTimePassed`, which is always
// `true` for any non-draft entry. The scheduling/future-post-exclusion logic
// is therefore exercised only in production builds (import.meta.env.DEV=false).
// The tests below cover the behaviours that ARE exercisable in test mode.
// ---------------------------------------------------------------------------

describe("postFilter", () => {
  it("excludes draft posts", () => {
    expect(postFilter(makeEntry({ draft: true }))).toBe(false);
  });

  it("includes a published post whose pubDatetime is in the past", () => {
    expect(postFilter(makeEntry({ pubDatetime: PAST_DATE }))).toBe(true);
  });

  it("includes a future-dated post in test/dev mode (DEV=true short-circuits the check)", () => {
    // In production (DEV=false) this post would be hidden, but in the test
    // environment import.meta.env.DEV is always true so the date is ignored.
    expect(postFilter(makeEntry({ pubDatetime: FUTURE_DATE }))).toBe(true);
  });

  it("excludes a draft post even if pubDatetime is in the past", () => {
    expect(postFilter(makeEntry({ draft: true, pubDatetime: PAST_DATE }))).toBe(
      false
    );
  });

  it("includes a non-draft post with a custom per-post timezone", () => {
    expect(
      postFilter(makeEntry({ pubDatetime: PAST_DATE, timezone: "UTC" }))
    ).toBe(true);
  });

  it("excludes a draft post that has a custom per-post timezone", () => {
    expect(
      postFilter(
        makeEntry({
          draft: true,
          pubDatetime: PAST_DATE,
          timezone: "America/New_York",
        })
      )
    ).toBe(false);
  });
});
