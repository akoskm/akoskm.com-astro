import { visit } from "unist-util-visit";

type TextNode = {
  type: string;
  value: string;
  position?: { start?: { offset?: number }; end?: { offset?: number } };
};

function decodeSource(raw: string): string {
  return raw
    .replace(/\n[ \t]*>[ \t]?/g, "\n")
    .replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code))
    )
    .replace(/&amp;/g, "&");
}

type MarkdownFile = {
  data?: { astro?: { frontmatter?: { brief?: unknown } } };
  toString(): string;
};

/**
 * Migrated posts set `brief`. Restore each text node from the original
 * source so remark-smartypants cannot change quotes, ellipses, or dashes.
 * Local overrides omit `brief` and keep smartypants.
 */
export function remarkLiteralText() {
  return (tree: unknown, file: MarkdownFile) => {
    const brief = file.data?.astro?.frontmatter?.brief;
    if (typeof brief !== "string" || !brief) return;
    const source = String(file);
    visit(tree, "text", (node: TextNode) => {
      const start = node.position?.start?.offset;
      const end = node.position?.end?.offset;
      if (start == null || end == null) return;
      node.value = decodeSource(source.slice(start, end));
    });
  };
}
