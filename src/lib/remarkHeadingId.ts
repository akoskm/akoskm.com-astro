import { visit } from "unist-util-visit";

type TextNode = { type: string; value: string };

type HeadingNode = {
  children: TextNode[];
  data?: { hProperties?: Record<string, string> };
};

/** Keep Hashnode heading ids written as a trailing `{#id}`. */
export function remarkHeadingId() {
  return (tree: unknown) => {
    visit(tree, "heading", (node: HeadingNode) => {
      const last = node.children[node.children.length - 1];
      if (!last || last.type !== "text") return;
      const match = last.value.match(/\s*\{#([\w-]+)\}\s*$/);
      if (!match || match.index == null) return;
      last.value = last.value.slice(0, match.index).replace(/\s+$/, "");
      if (!last.value) node.children.pop();
      node.data ??= {};
      node.data.hProperties = {
        ...node.data.hProperties,
        id: match[1],
      };
    });
  };
}
