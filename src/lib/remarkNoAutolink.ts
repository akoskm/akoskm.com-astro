import { visit } from "unist-util-visit";

type LinkNode = {
  type: string;
  position?: { start?: { offset?: number }; end?: { offset?: number } };
};

type ParentNode = { children: unknown[] };

type MarkdownFile = {
  data?: { astro?: { frontmatter?: { brief?: unknown } } };
  toString(): string;
};

/**
 * GFM turns bare URLs and emails into links. Hashnode left many of those as
 * text. Keep explicit markdown links and angle-bracket autolinks.
 */
export function remarkNoAutolink() {
  return (tree: unknown, file: MarkdownFile) => {
    const brief = file.data?.astro?.frontmatter?.brief;
    if (typeof brief !== "string" || !brief) return;
    const source = String(file);
    visit(tree, "link", (node: LinkNode, index: number, parent: ParentNode) => {
      const start = node.position?.start?.offset;
      const end = node.position?.end?.offset;
      if (start == null || end == null || !parent || index == null) return;
      const raw = source.slice(start, end);
      if (raw.startsWith("[") || raw.startsWith("<")) return;
      parent.children[index] = { type: "text", value: raw };
    });
  };
}
