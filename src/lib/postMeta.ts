import { POST_DESCRIPTIONS } from "../data/post-descriptions";

export function toIso(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code))
    );
}

export function excerpt(text?: string | null, max = 160): string {
  const clean = decodeEntities((text || "").replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  const base = space > 80 ? cut.slice(0, space) : cut;
  return `${base.trimEnd()}…`;
}

/** Prefer a real SEO description, then a hand-written one, then the excerpt. */
export function resolveDescription(
  slug: string,
  seoDescription?: string | null,
  brief?: string | null
): string {
  const fromSeo = (seoDescription || "").trim();
  if (fromSeo) return fromSeo;
  return POST_DESCRIPTIONS[slug] || excerpt(brief);
}

export function plainTextFromHtml(html: string): string {
  const withBreaks = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(
      /<h([1-6])[^>]*>/gi,
      (_, level: string) => `\n\n${"#".repeat(Number(level))} `
    )
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|h[1-6]|ul|ol|pre|blockquote|div)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return decodeEntities(withBreaks)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
