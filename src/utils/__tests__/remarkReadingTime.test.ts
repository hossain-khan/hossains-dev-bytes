import { describe, it, expect } from "vitest";
import { remarkReadingTime } from "../remark-reading-time";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type AstNode = {
  type: string;
  value?: string;
  children?: AstNode[];
};

type VFile = {
  data: {
    astro?: {
      frontmatter?: Record<string, unknown>;
    };
  };
};

/** Build a minimal mdast paragraph with the given text content */
function textNode(value: string): AstNode {
  return { type: "text", value };
}

function paragraphNode(text: string): AstNode {
  return { type: "paragraph", children: [textNode(text)] };
}

function rootNode(children: AstNode[]): AstNode {
  return { type: "root", children };
}

/** Generate a string of exactly `n` words */
function wordString(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
}

/** Run the plugin and return the resulting readingTime string */
function getReadingTime(tree: AstNode): string {
  const file: VFile = { data: {} };
  remarkReadingTime()(
    tree,
    file as Parameters<ReturnType<typeof remarkReadingTime>>[1]
  );
  return file.data.astro?.frontmatter?.readingTime as string;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("remarkReadingTime", () => {
  it("returns '0 min read' for an empty document (zero words)", () => {
    // Math.ceil(0 / 200) === 0, so the result is '0 min read' for an empty tree
    expect(getReadingTime(rootNode([]))).toBe("0 min read");
  });

  it("returns '1 min read' for a document with fewer than 200 words", () => {
    const tree = rootNode([paragraphNode(wordString(100))]);
    expect(getReadingTime(tree)).toBe("1 min read");
  });

  it("returns '1 min read' for exactly 200 words", () => {
    const tree = rootNode([paragraphNode(wordString(200))]);
    expect(getReadingTime(tree)).toBe("1 min read");
  });

  it("returns '2 min read' for 201 words", () => {
    const tree = rootNode([paragraphNode(wordString(201))]);
    expect(getReadingTime(tree)).toBe("2 min read");
  });

  it("returns '3 min read' for 401 words", () => {
    const tree = rootNode([paragraphNode(wordString(401))]);
    expect(getReadingTime(tree)).toBe("3 min read");
  });

  it("traverses nested children and counts all words", () => {
    // 100 + 100 = 200 words → '1 min read'
    const tree = rootNode([
      paragraphNode(wordString(100)),
      paragraphNode(wordString(100)),
    ]);
    expect(getReadingTime(tree)).toBe("1 min read");
  });

  it("counts inline code values as words", () => {
    const inlineCode: AstNode = { type: "inlineCode", value: wordString(50) };
    const para: AstNode = { type: "paragraph", children: [inlineCode] };
    const tree = rootNode([para, paragraphNode(wordString(151))]);
    // 50 + 151 = 201 words → '2 min read'
    expect(getReadingTime(tree)).toBe("2 min read");
  });

  it("injects readingTime into an existing frontmatter object", () => {
    const tree = rootNode([paragraphNode("one")]);
    const file: VFile = {
      data: { astro: { frontmatter: { title: "Existing" } } },
    };
    remarkReadingTime()(
      tree,
      file as Parameters<ReturnType<typeof remarkReadingTime>>[1]
    );
    expect(file.data.astro?.frontmatter?.readingTime).toBe("1 min read");
    // pre-existing frontmatter keys must survive
    expect(file.data.astro?.frontmatter?.title).toBe("Existing");
  });

  it("initialises file.data.astro when it is absent", () => {
    const tree = rootNode([paragraphNode("hello")]);
    const file: VFile = { data: {} };
    remarkReadingTime()(
      tree,
      file as Parameters<ReturnType<typeof remarkReadingTime>>[1]
    );
    expect(file.data.astro?.frontmatter?.readingTime).toBe("1 min read");
  });
});
