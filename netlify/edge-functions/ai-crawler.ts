// Records AI crawler hits in Plausible. Crawlers do not run the
// browser script, so the edge sends the event itself.

export const AI_CRAWLERS = [
  { token: "GPTBot", name: "GPTBot" },
  { token: "OAI-SearchBot", name: "OAI-SearchBot" },
  { token: "ChatGPT-User", name: "ChatGPT-User" },
  { token: "ClaudeBot", name: "ClaudeBot" },
  { token: "Claude-User", name: "Claude-User" },
  { token: "Claude-SearchBot", name: "Claude-SearchBot" },
  { token: "anthropic-ai", name: "anthropic-ai" },
  { token: "PerplexityBot", name: "PerplexityBot" },
  { token: "Perplexity-User", name: "Perplexity-User" },
  { token: "CCBot", name: "CCBot" },
  { token: "Bytespider", name: "Bytespider" },
  { token: "Google-Extended", name: "Google-Extended" },
  { token: "GoogleOther", name: "GoogleOther" },
  { token: "Applebot-Extended", name: "Applebot-Extended" },
  { token: "Amazonbot", name: "Amazonbot" },
  { token: "meta-externalagent", name: "meta-externalagent" },
  { token: "FacebookBot", name: "FacebookBot" },
  { token: "cohere-ai", name: "cohere-ai" },
  { token: "DuckAssistBot", name: "DuckAssistBot" },
  { token: "MistralAI-User", name: "MistralAI-User" },
  { token: "YouBot", name: "YouBot" },
  { token: "Diffbot", name: "Diffbot" },
  { token: "Timpibot", name: "Timpibot" },
] as const;

export const PLAUSIBLE_ENDPOINT = "https://plausible.akoskm.com/api/event";
export const SITE_DOMAIN = "akoskm.com";

// Plausible drops any user agent that device-detector classifies as a bot.
// Its "(compatible)" rule only matches when the parenthesis closes right
// after that word, so this string is kept. A desktop Chrome UA would also
// pass, and would be counted as a Chrome visit.
export const PLAUSIBLE_USER_AGENT =
  "Mozilla/5.0 (compatible; akoskm-edge-logger)";

const ASSET_EXT =
  "avif|bmp|css|eot|gif|ico|jpe?g|js|map|mjs|mp4|otf|png|svg|ttf|webm|webp|woff2?";

const ASSET_PATH = new RegExp(`\\.(?:${ASSET_EXT})$`, "i");

export interface EdgeContext {
  ip: string;
  next: () => Promise<Response>;
  waitUntil: (promise: Promise<unknown>) => void;
}

export interface CrawlerEvent {
  name: "AI Crawler";
  domain: typeof SITE_DOMAIN;
  url: string;
  props: { bot: string; path: string };
}

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

export function matchAiCrawler(
  userAgent: string | null | undefined
): string | null {
  if (!userAgent) return null;
  const haystack = userAgent.toLowerCase();
  let found: { token: string; name: string } | undefined;
  for (const crawler of AI_CRAWLERS) {
    const token = crawler.token.toLowerCase();
    if (!token || !haystack.includes(token)) continue;
    if (!found || token.length > found.token.length) {
      found = { token, name: crawler.name };
    }
  }
  return found?.name ?? null;
}

/** Pages and crawler text files. Skips /_astro and static assets. */
export function isTrackablePath(pathname: string): boolean {
  if (pathname === "/_astro" || pathname.startsWith("/_astro/")) return false;
  return !ASSET_PATH.test(pathname);
}

export function buildCrawlerEvent(pageUrl: string, bot: string): CrawlerEvent {
  const url = new URL(pageUrl);
  return {
    name: "AI Crawler",
    domain: SITE_DOMAIN,
    url: url.toString(),
    props: { bot, path: url.pathname },
  };
}

function botFor(req: Request): string | null {
  if (req.method !== "GET" && req.method !== "HEAD") return null;
  let pathname = "/";
  try {
    pathname = new URL(req.url).pathname;
  } catch {
    return null;
  }
  if (!isTrackablePath(pathname)) return null;
  return matchAiCrawler(req.headers.get("user-agent"));
}

async function sendEvent(
  pageUrl: string,
  bot: string,
  ip: string,
  fetchImpl: FetchLike
): Promise<void> {
  try {
    const response = await fetchImpl(PLAUSIBLE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": PLAUSIBLE_USER_AGENT,
        "X-Forwarded-For": ip,
      },
      body: JSON.stringify(buildCrawlerEvent(pageUrl, bot)),
    });
    await response.text();
  } catch (error) {
    void error;
  }
}

export async function trackCrawler(
  req: Request,
  context: EdgeContext,
  fetchImpl: FetchLike = fetch
): Promise<Response> {
  try {
    const bot = botFor(req);
    if (bot) {
      const pending = sendEvent(req.url, bot, context.ip, fetchImpl);
      context.waitUntil(pending);
    }
  } catch (error) {
    void error;
  }
  return context.next();
}

export default trackCrawler;

export const config = {
  path: "/*",
  excludedPath: "/_astro/*",
  excludedPattern: ["^/_astro(?:/|$)", `\\.(?:${ASSET_EXT})$`],
  method: ["GET", "HEAD"],
  onError: "bypass",
} as const;
