import { describe, it, expect, vi } from "vitest";

// Mock @/content.config to avoid loading Astro virtual modules
vi.mock("@/content.config", () => ({
  BLOG_PATH: "src/data/blog",
  GALLERY_PATH: "src/data/galleries",
}));

import {
  getGallerySlug,
  getEntryPath,
  getEntryPublishedMs,
} from "../contentEntry";
import type { ContentEntry } from "../contentEntry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBlogEntry(
  id: string,
  pubDatetime: Date,
  modDatetime?: Date | null,
  filePath?: string
): ContentEntry {
  return {
    id,
    collection: "blog",
    filePath: filePath ?? `src/data/blog/${id}.md`,
    data: {
      title: "Test Post",
      pubDatetime,
      modDatetime,
      description: "A test description",
      tags: ["test"],
      draft: false,
      author: "Test Author",
    },
  } as unknown as ContentEntry;
}

function makeGalleryEntry(id: string, pubDatetime: Date): ContentEntry {
  return {
    id,
    collection: "galleries",
    filePath: `src/data/galleries/${id}/index.md`,
    data: {
      title: "Test Gallery",
      pubDatetime,
      description: "A test gallery",
      tags: [],
    },
  } as unknown as ContentEntry;
}

// ---------------------------------------------------------------------------
// getGallerySlug
// ---------------------------------------------------------------------------

describe("getGallerySlug", () => {
  it("strips /index.md suffix", () => {
    expect(getGallerySlug("my-gallery/index.md")).toBe("my-gallery");
  });

  it("strips /index.mdx suffix", () => {
    expect(getGallerySlug("my-gallery/index.mdx")).toBe("my-gallery");
  });

  it("strips /index suffix (no extension)", () => {
    expect(getGallerySlug("my-gallery/index")).toBe("my-gallery");
  });

  it("leaves an id without an index suffix unchanged", () => {
    expect(getGallerySlug("my-gallery")).toBe("my-gallery");
  });

  it("handles nested path before index", () => {
    expect(getGallerySlug("2024/my-gallery/index.md")).toBe("2024/my-gallery");
  });
});

// ---------------------------------------------------------------------------
// getEntryPublishedMs
// ---------------------------------------------------------------------------

describe("getEntryPublishedMs", () => {
  const pub = new Date("2024-06-01T10:00:00Z");
  const mod = new Date("2024-07-01T10:00:00Z");

  it("returns pubDatetime ms when no modDatetime key is present (gallery)", () => {
    const entry = makeGalleryEntry("gallery-1", pub);
    expect(getEntryPublishedMs(entry)).toBe(pub.getTime());
  });

  it("returns pubDatetime ms when modDatetime is null", () => {
    const entry = makeBlogEntry("post-1", pub, null);
    expect(getEntryPublishedMs(entry)).toBe(pub.getTime());
  });

  it("returns modDatetime ms when modDatetime is a valid Date", () => {
    const entry = makeBlogEntry("post-1", pub, mod);
    expect(getEntryPublishedMs(entry)).toBe(mod.getTime());
  });

  it("returns a number (not NaN) for valid dates", () => {
    const entry = makeBlogEntry("post-1", pub);
    expect(Number.isFinite(getEntryPublishedMs(entry))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getEntryPath
// ---------------------------------------------------------------------------

describe("getEntryPath", () => {
  it("returns /galleries/<slug> for a gallery entry", () => {
    const entry = makeGalleryEntry("my-gallery/index.md", new Date());
    expect(getEntryPath(entry)).toBe("/galleries/my-gallery");
  });

  it("returns /posts/<id> for a root-level blog entry", () => {
    const entry = makeBlogEntry("my-post", new Date());
    expect(getEntryPath(entry)).toBe("/posts/my-post");
  });

  it("returns /posts/<subdir>/<id> for a blog entry in a subdirectory", () => {
    const entry = makeBlogEntry(
      "my-post",
      new Date(),
      undefined,
      "src/data/blog/2024/my-post.md"
    );
    expect(getEntryPath(entry)).toBe("/posts/2024/my-post");
  });
});
