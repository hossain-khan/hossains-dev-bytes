// Average adult reading speed (words per minute)
const WORDS_PER_MINUTE = 200;

type AstNode = {
  type: string;
  value?: string;
  children?: AstNode[];
};

type AstroVFile = {
  data: {
    astro?: {
      frontmatter?: Record<string, unknown>;
    };
  };
};

/**
 * Remark plugin that injects a `readingTime` string (e.g. "4 min read")
 * into `file.data.astro.frontmatter` so it can be accessed via
 * `remarkPluginFrontmatter.readingTime` after calling `render(post)`.
 *
 * No external dependencies — counts words by walking the plain text of
 * all Literal nodes (text, inlineCode, code) in the mdast.
 */
export function remarkReadingTime() {
  return function (tree: AstNode, file: AstroVFile) {
    const text = extractText(tree);
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
    const readingTime = `${minutes} min read`;

    // Astro exposes file.data.astro.frontmatter for remark plugin frontmatter injection
    if (!file.data.astro) file.data.astro = {};
    if (!file.data.astro.frontmatter) file.data.astro.frontmatter = {};
    file.data.astro.frontmatter.readingTime = readingTime;
  };
}

/** Walk an mdast tree and collect all plain-text content. */
function extractText(node: AstNode): string {
  if (typeof node.value === "string") {
    return node.value;
  }
  if (Array.isArray(node.children)) {
    return node.children.map(child => extractText(child)).join(" ");
  }
  return "";
}
