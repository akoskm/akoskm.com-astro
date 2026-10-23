export type PromoPlacement =
  | {
      kind: "heading";
      level: 1 | 2;
      /** 1-based index among headings of this level. */
      index: number;
      title: string;
    }
  | {
      kind: "paragraph";
      /** Paragraphs that stay above the card. */
      after: number;
      total: number;
    };

export interface SplitPostHtml {
  before: string;
  after: string;
  placement: PromoPlacement;
}

interface ElementStart {
  name: string;
  index: number;
}

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/**
 * Insert point for in-post promo cards.
 * Before the 2nd or 3rd top-level h2, whichever sits nearer the
 * middle of the heading list. Two headings: before the 2nd. Three:
 * before the 2nd. Four or more: before the 3rd. Posts whose sections
 * are h1s use that same rule. With fewer than two section headings,
 * the card goes after about 45% of the top-level paragraphs, or after
 * the first few paragraphs when the post is short.
 */
export function splitPostHtml(html: string): SplitPostHtml {
  const elements = topLevelElements(html);
  const h2 = elements.filter(element => element.name === "h2");
  const h2Choice = headingChoice(h2);
  if (h2Choice) {
    return splitAt(html, h2Choice.index, {
      kind: "heading",
      level: 2,
      index: h2Choice.ordinal,
      title: elementText(html, h2Choice),
    });
  }

  const h1 = elements.filter(element => element.name === "h1");
  const h1Choice = headingChoice(h1);
  if (h1Choice) {
    return splitAt(html, h1Choice.index, {
      kind: "heading",
      level: 1,
      index: h1Choice.ordinal,
      title: elementText(html, h1Choice),
    });
  }

  const paragraphs = elements.filter(element => element.name === "p");
  const keep = paragraphsToKeep(paragraphs.length);
  if (keep <= 0 || paragraphs.length === 0) {
    const anchor = elements[0];
    if (!anchor) {
      return {
        before: html,
        after: "",
        placement: { kind: "paragraph", after: 0, total: 0 },
      };
    }
    const end = elementEnd(html, anchor.index);
    return {
      before: html.slice(0, end),
      after: html.slice(end),
      placement: { kind: "paragraph", after: 0, total: 0 },
    };
  }

  if (keep >= paragraphs.length) {
    const end = elementEnd(html, paragraphs[paragraphs.length - 1].index);
    return {
      before: html.slice(0, end),
      after: html.slice(end),
      placement: {
        kind: "paragraph",
        after: paragraphs.length,
        total: paragraphs.length,
      },
    };
  }

  return splitAt(html, paragraphs[keep].index, {
    kind: "paragraph",
    after: keep,
    total: paragraphs.length,
  });
}

function headingChoice(headings: ElementStart[]) {
  if (headings.length < 2) return null;
  const middle = Math.floor(headings.length / 2);
  const index = Math.min(2, Math.max(1, middle));
  return { ...headings[index], ordinal: index + 1 };
}

function paragraphsToKeep(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count < 6) return Math.min(3, count - 1);
  return Math.min(count - 1, Math.max(1, Math.round(count * 0.45)));
}

function splitAt(
  html: string,
  index: number,
  placement: PromoPlacement
): SplitPostHtml {
  return {
    before: html.slice(0, index),
    after: html.slice(index),
    placement,
  };
}

function topLevelElements(html: string): ElementStart[] {
  const elements: ElementStart[] = [];
  const stack: string[] = [];
  let i = 0;

  while (i < html.length) {
    const start = html.indexOf("<", i);
    if (start === -1) break;
    if (html.startsWith("<!--", start)) {
      const end = html.indexOf("-->", start + 4);
      i = end === -1 ? html.length : end + 3;
      continue;
    }
    if (html.startsWith("<!", start) || html.startsWith("<?", start)) {
      const end = html.indexOf(">", start + 2);
      i = end === -1 ? html.length : end + 1;
      continue;
    }

    const tag = readTag(html, start);
    if (!tag) {
      i = start + 1;
      continue;
    }
    i = tag.end;

    if (tag.closing) {
      const found = stack.lastIndexOf(tag.name);
      if (found !== -1) stack.splice(found);
      continue;
    }

    if (stack.length === 0) {
      elements.push({ name: tag.name, index: start });
    }
    if (!tag.selfClosing && !VOID_TAGS.has(tag.name)) {
      stack.push(tag.name);
    }
  }

  return elements;
}

function readTag(html: string, start: number) {
  let i = start + 1;
  if (i >= html.length) return null;
  let closing = false;
  if (html[i] === "/") {
    closing = true;
    i += 1;
  }
  const nameStart = i;
  while (i < html.length && /[A-Za-z0-9-]/.test(html[i])) i += 1;
  if (i === nameStart) return null;
  const name = html.slice(nameStart, i).toLowerCase();

  let quote: '"' | "'" | null = null;
  let selfClosing = false;
  for (; i < html.length; i += 1) {
    const ch = html[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "/" && html[i + 1] === ">") {
      selfClosing = true;
      continue;
    }
    if (ch === ">") {
      return { name, closing, selfClosing, end: i + 1 };
    }
  }
  return null;
}

function elementEnd(html: string, start: number): number {
  const tag = readTag(html, start);
  if (!tag || tag.selfClosing || VOID_TAGS.has(tag.name))
    return tag?.end ?? start;
  const stack = [tag.name];
  let i = tag.end;
  while (i < html.length && stack.length > 0) {
    const next = html.indexOf("<", i);
    if (next === -1) return html.length;
    if (html.startsWith("<!--", next)) {
      const end = html.indexOf("-->", next + 4);
      i = end === -1 ? html.length : end + 3;
      continue;
    }
    const inner = readTag(html, next);
    if (!inner) {
      i = next + 1;
      continue;
    }
    i = inner.end;
    if (inner.closing) {
      const found = stack.lastIndexOf(inner.name);
      if (found !== -1) stack.splice(found);
    } else if (!inner.selfClosing && !VOID_TAGS.has(inner.name)) {
      stack.push(inner.name);
    }
  }
  return i;
}

function elementText(html: string, element: ElementStart): string {
  const end = elementEnd(html, element.index);
  return decodeEntities(html.slice(element.index, end).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}
