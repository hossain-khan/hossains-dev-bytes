import { describe, it, expect, vi } from "vitest";

// Mock @/content.config so getPath can be imported without Astro's virtual modules
vi.mock("@/content.config", () => ({
  BLOG_PATH: "src/data/blog",
  GALLERY_PATH: "src/data/galleries",
}));

import { getPath } from "../getPath";

describe("getPath", () => {
  describe("when filePath is undefined", () => {
    it("returns /posts/<id> with includeBase=true (default)", () => {
      expect(getPath("my-post", undefined)).toBe("/posts/my-post");
    });

    it("returns /<id> with includeBase=false", () => {
      expect(getPath("my-post", undefined, false)).toBe("/my-post");
    });

    it("uses only the last segment of id when id contains a slash", () => {
      expect(getPath("subdir/my-post", undefined)).toBe("/posts/my-post");
    });
  });

  describe("when filePath is a root-level blog path (no subdirectory)", () => {
    it("returns /posts/<id> - no intermediate path segments", () => {
      expect(getPath("my-post", "src/data/blog/my-post.md")).toBe(
        "/posts/my-post"
      );
    });

    it("works for MDX files too", () => {
      expect(getPath("my-post", "src/data/blog/my-post.mdx")).toBe(
        "/posts/my-post"
      );
    });
  });

  describe("when filePath contains a subdirectory", () => {
    it("includes the subdirectory segment in the returned path", () => {
      expect(getPath("my-post", "src/data/blog/2024/my-post.md")).toBe(
        "/posts/2024/my-post"
      );
    });

    it("slugifies subdirectory names that contain spaces", () => {
      expect(getPath("my-post", "src/data/blog/My Sub Dir/my-post.md")).toBe(
        "/posts/my-sub-dir/my-post"
      );
    });

    it("omits /posts when includeBase=false", () => {
      expect(getPath("my-post", "src/data/blog/2024/my-post.md", false)).toBe(
        "/2024/my-post"
      );
    });
  });

  describe("underscore directory exclusion", () => {
    it("excludes a directory whose name starts with an underscore", () => {
      expect(getPath("my-post", "src/data/blog/_drafts/my-post.md")).toBe(
        "/posts/my-post"
      );
    });

    it("excludes multiple underscore directories", () => {
      expect(getPath("my-post", "src/data/blog/_drafts/_sub/my-post.md")).toBe(
        "/posts/my-post"
      );
    });

    it("still includes non-underscore sibling segments", () => {
      expect(getPath("my-post", "src/data/blog/2024/_private/my-post.md")).toBe(
        "/posts/2024/my-post"
      );
    });
  });
});
