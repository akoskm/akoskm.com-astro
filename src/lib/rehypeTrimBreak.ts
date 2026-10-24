import { visit } from "unist-util-visit";

type TextNode = { type: string; value?: string };
type ElementNode = { tagName?: string; type?: string };
type ParentNode = { children: Array<TextNode | ElementNode> };
type MarkdownFile = {
  data?: { astro?: { frontmatter?: { brief?: unknown } } };
};

/** Drop the newline remark emits after a hard break so text matches Hashnode. */
export function rehypeTrimBreak() {
  return (tree: unknown, file: MarkdownFile) => {
    const brief = file.data?.astro?.frontmatter?.brief;
    if (typeof brief !== "string" || !brief) return;
    visit(
      tree,
      "element",
      (node: ElementNode, index: number, parent: ParentNode) => {
        if (node.tagName !== "br" || !parent || index == null) return;
        const next = parent.children[index + 1];
        if (next?.type === "text" && typeof next.value === "string") {
          next.value = next.value.replace(/^\n/, "");
        }
      }
    );
  };
}
