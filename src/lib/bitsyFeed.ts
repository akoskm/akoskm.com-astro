import fs from "node:fs";
import path from "node:path";
import { BITSY_REFERRAL } from "@data/promos";

export interface BitsyIssue {
  title: string;
  url: string;
  publishedAt: string;
  summary: string;
}

interface BitsySnapshot {
  fetchedAt: string;
  items: BitsyIssue[];
}

const FEED_URL = "https://akoskm.substack.com/feed";
const SNAPSHOT = path.join(process.cwd(), "src/data/bitsy-feed.json");

let loading: Promise<BitsyIssue[]> | null = null;

export function bitsyIssueUrl(url: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set("r", BITSY_REFERRAL);
  return parsed.toString();
}

export interface StreamEntry {
  kind: "newsletter" | "article";
  title: string;
  href: string;
  publishedAt: string;
  summary: string;
}

export function newsletterEntries(issues: BitsyIssue[]): StreamEntry[] {
  return issues.map(issue => ({
    kind: "newsletter" as const,
    title: issue.title,
    href: bitsyIssueUrl(issue.url),
    publishedAt: issue.publishedAt,
    summary: issue.summary,
  }));
}

export function loadBitsyFeed(): Promise<BitsyIssue[]> {
  if (!loading) loading = readFeed();
  return loading;
}

async function readFeed(): Promise<BitsyIssue[]> {
  try {
    const response = await fetch(FEED_URL, {
      headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(String(response.status));
    const items = parseRss(await response.text());
    if (items.length === 0) throw new Error("empty feed");
    writeSnapshot(items);
    return items;
  } catch {
    return readSnapshot();
  }
}

function readSnapshot(): BitsyIssue[] {
  try {
    const raw = fs.readFileSync(SNAPSHOT, "utf8");
    const data = JSON.parse(raw) as BitsySnapshot;
    return Array.isArray(data.items) ? data.items.filter(isIssue) : [];
  } catch {
    return [];
  }
}

function writeSnapshot(items: BitsyIssue[]): void {
  try {
    const current = readSnapshot();
    const same =
      current.length === items.length &&
      current.every(
        (item, index) =>
          item.title === items[index].title &&
          item.url === items[index].url &&
          item.publishedAt === items[index].publishedAt
      );
    if (same) return;
    const snapshot: BitsySnapshot = {
      fetchedAt: new Date().toISOString(),
      items,
    };
    fs.writeFileSync(SNAPSHOT, `${JSON.stringify(snapshot, null, 2)}\n`);
  } catch {
    // The live list is already in memory. A read-only build can continue.
  }
}

function isIssue(value: BitsyIssue): boolean {
  return (
    Boolean(value) &&
    typeof value.title === "string" &&
    isBitsyUrl(value.url) &&
    typeof value.publishedAt === "string" &&
    !Number.isNaN(Date.parse(value.publishedAt))
  );
}

function isBitsyUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" && parsed.hostname === "akoskm.substack.com"
    );
  } catch {
    return false;
  }
}

function parseRss(xml: string): BitsyIssue[] {
  const items: BitsyIssue[] = [];
  for (const block of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const title = textOf(block[1], "title");
    const url = textOf(block[1], "link");
    const publishedAt = toIso(textOf(block[1], "pubDate"));
    const summary = plain(textOf(block[1], "description")).slice(0, 180);
    const issue = { title, url, publishedAt, summary };
    if (isIssue(issue)) items.push(issue);
  }
  return items;
}

function textOf(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? decodeXml(match[1]) : "";
}

function decodeXml(value: string): string {
  const cdata = value.match(/^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/);
  const raw = cdata ? cdata[1] : value;
  return raw
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .trim();
}

function plain(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toIso(value: string): string {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return "";
  return new Date(time).toISOString();
}
