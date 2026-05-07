import { describe, it, expect } from "vitest";
import { slugifyStr, slugifyAll } from "../slugify";

describe("slugifyStr", () => {
  it("returns a simple lowercase string unchanged", () => {
    expect(slugifyStr("hello")).toBe("hello");
  });

  it("converts spaces to hyphens and lowercases", () => {
    expect(slugifyStr("Hello World")).toBe("hello-world");
  });

  it("handles E2E Testing (number–letter boundary)", () => {
    expect(slugifyStr("E2E Testing")).toBe("e2e-testing");
  });

  it("preserves decimal numbers — TypeScript 5.0", () => {
    expect(slugifyStr("TypeScript 5.0")).toBe("typescript-5.0");
  });

  it("handles acronyms", () => {
    expect(slugifyStr("REST API Guide")).toBe("rest-api-guide");
  });

  it("strips leading/trailing whitespace", () => {
    expect(slugifyStr("  hello world  ")).toBe("hello-world");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(slugifyStr("hello  world")).toBe("hello-world");
  });

  it("returns a non-empty string for non-Latin input (uses kebabcase path)", () => {
    // Non-Latin characters trigger the lodash.kebabcase branch
    const result = slugifyStr("မြန်မာဘာသာ");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("uses kebabcase for mixed Latin and non-Latin input", () => {
    const result = slugifyStr("Hello 世界");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("does not alter an already-slugified string", () => {
    expect(slugifyStr("already-slugified")).toBe("already-slugified");
  });
});

describe("slugifyAll", () => {
  it("maps slugifyStr over every element", () => {
    expect(
      slugifyAll(["Hello World", "TypeScript 5.0", "E2E Testing"])
    ).toEqual(["hello-world", "typescript-5.0", "e2e-testing"]);
  });

  it("returns an empty array for empty input", () => {
    expect(slugifyAll([])).toEqual([]);
  });

  it("handles a single-element array", () => {
    expect(slugifyAll(["Android Dev"])).toEqual(["android-dev"]);
  });
});
