import { readFileSync } from "node:fs";
import path from "node:path";
import { AUTHOR_IMAGE, SITE } from "@config";
import { POST_DESCRIPTIONS } from "../data/post-descriptions";
import type { Post } from "./schema";

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

export function tableOfContentsFromHtml(html: string): Post["features"] {
  const items: Post["features"]["tableOfContents"]["items"] = [];
  const re = /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const id = match[2].match(/\sid="([^"]+)"/)?.[1];
    if (!id) continue;
    const slug = id.startsWith("heading-") ? id.slice("heading-".length) : id;
    const title = decodeEntities(match[3].replace(/<[^>]+>/g, ""))
      .replace(/\s+/g, " ")
      .trim();
    if (!title) continue;
    items.push({ id: slug, level: Number(match[1]), title, slug });
  }
  return { tableOfContents: { items } };
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

type RawPost = {
  author?: { name?: string | null; profilePicture?: string | null } | null;
  canonicalUrl?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  title?: string | null;
  subtitle?: string | null;
  brief?: string | null;
  slug?: string | null;
  readTimeInMinutes?: number | null;
  content?: { html?: string | null } | null;
  tags?: Post["tags"] | null;
  series?: Post["series"] | null;
  coverImage?: { url?: string | null } | null;
  seo?: { description?: string | null } | null;
  features?: Post["features"] | null;
  draft?: boolean | null;
};

/** Hashnode minted a second slug for the same tag. Keep the canonical one. */
const TAG_ALIASES: Record<string, { slug: string; name: string }> = {
  "github-actions-1": { slug: "github-actions", name: "GitHub Actions" },
};

function canonicalTags(tags: Post["tags"] | null | undefined): Post["tags"] {
  const seen = new Set<string>();
  const result: Post["tags"] = [];
  for (const tag of tags ?? []) {
    const alias = TAG_ALIASES[tag.slug];
    const slug = alias?.slug ?? tag.slug;
    const name = alias?.name ?? tag.name;
    if (seen.has(slug)) continue;
    seen.add(slug);
    result.push({ name, slug });
  }
  return result;
}

export function normalizePost(raw: RawPost): Post {
  const slug = raw.slug || "";
  const html = raw.content?.html || "";
  const description = resolveDescription(slug, raw.seo?.description, raw.brief);
  const features = raw.features?.tableOfContents
    ? raw.features
    : tableOfContentsFromHtml(html);

  return {
    author: {
      name: SITE.author,
      profilePicture: AUTHOR_IMAGE,
    },
    canonicalUrl: raw.canonicalUrl || `${SITE.website}${slug}/`,
    publishedAt: raw.publishedAt || "",
    updatedAt: raw.updatedAt || raw.publishedAt || "",
    title: raw.title || "",
    subtitle: raw.subtitle || "",
    brief: (raw.brief || "").trim() || description,
    slug,
    readTimeInMinutes: raw.readTimeInMinutes || 1,
    content: { html },
    tags: canonicalTags(raw.tags),
    series: raw.series ?? null,
    coverImage: { url: raw.coverImage?.url || "" },
    seo: { description },
    features,
    draft: raw.draft ?? false,
  };
}

let snapshot: RawPost[] | undefined;

export function loadHashnodeSnapshot(): RawPost[] {
  if (!snapshot) {
    const file = path.join(process.cwd(), "src/data/hashnode-posts.json");
    snapshot = JSON.parse(readFileSync(file, "utf8")) as RawPost[];
  }
  return snapshot;
}
