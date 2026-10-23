import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AI_CRAWLERS,
  PLAUSIBLE_ENDPOINT,
  PLAUSIBLE_USER_AGENT,
  buildCrawlerEvent,
  config,
  crawlerSiteDomain,
  isTrackablePath,
  matchAiCrawler,
  trackCrawler,
  type EdgeContext,
} from "./edge-functions/ai-crawler.ts";

const EXPECTED_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
  "Bytespider",
  "Google-Extended",
  "GoogleOther",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "FacebookBot",
  "cohere-ai",
  "DuckAssistBot",
  "MistralAI-User",
  "YouBot",
  "Diffbot",
  "Timpibot",
];

describe("matchAiCrawler", () => {
  it("maps each known token to its clean name, ignoring case", () => {
    assert.deepEqual(
      AI_CRAWLERS.map(crawler => crawler.token),
      EXPECTED_BOTS
    );
    assert.deepEqual(
      AI_CRAWLERS.map(crawler => crawler.name),
      EXPECTED_BOTS
    );
    for (const crawler of AI_CRAWLERS) {
      const ua = `Mozilla/5.0 (compatible; ${crawler.token}/1.0; +https://example.com)`;
      assert.equal(matchAiCrawler(ua), crawler.name);
      assert.equal(matchAiCrawler(ua.toLowerCase()), crawler.name);
    }
  });

  it("prefers the longer token when one name contains another", () => {
    assert.equal(
      matchAiCrawler("Claude-SearchBot and ClaudeBot"),
      "Claude-SearchBot"
    );
    assert.equal(
      matchAiCrawler("Applebot-Extended/1.0"),
      "Applebot-Extended"
    );
    assert.equal(matchAiCrawler("ChatGPT-User/1.0"), "ChatGPT-User");
    assert.equal(matchAiCrawler("Perplexity-User/1.0"), "Perplexity-User");
  });

  it("ignores browsers and crawlers that are not on the list", () => {
    assert.equal(matchAiCrawler(null), null);
    assert.equal(matchAiCrawler(""), null);
    assert.equal(matchAiCrawler(PLAUSIBLE_USER_AGENT), null);
    assert.equal(
      matchAiCrawler(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
      ),
      null
    );
    assert.equal(matchAiCrawler("Mozilla/5.0 (compatible; Googlebot/2.1)"), null);
    assert.equal(matchAiCrawler("Mozilla/5.0 (Macintosh) Applebot/0.1"), null);
    assert.equal(matchAiCrawler("curl/8.0.0"), null);
  });
});

describe("isTrackablePath", () => {
  it("keeps pages and the files AI crawlers fetch", () => {
    for (const path of [
      "/",
      "/about/",
      "/posts/hello-world/",
      "/llms.txt",
      "/llms-full.txt",
      "/robots.txt",
      "/rss.xml",
      "/sitemap.xml",
      "/sitemap-index.xml",
      "/sitemap-0.xml",
    ]) {
      assert.equal(isTrackablePath(path), true, path);
    }
  });

  it("skips built assets, images, fonts, css, and js", () => {
    for (const path of [
      "/_astro",
      "/_astro/page.abc123.css",
      "/_astro/font.woff2",
      "/toggle-theme.js",
      "/assets/logo.png",
      "/assets/logo.PNG",
      "/favicon.svg",
      "/og_image.jpeg",
      "/posts/slug/index.png",
      "/styles/site.css",
      "/font.woff",
    ]) {
      assert.equal(isTrackablePath(path), false, path);
    }
  });

  it("uses the same skip rules in the edge config", () => {
    const patterns = config.excludedPattern.map(pattern => new RegExp(pattern, "i"));
    const skipped = (path: string) =>
      path === "/_astro" ||
      path.startsWith("/_astro/") ||
      patterns.some(pattern => pattern.test(path));
    assert.equal(skipped("/llms.txt"), false);
    assert.equal(skipped("/robots.txt"), false);
    assert.equal(skipped("/rss.xml"), false);
    assert.equal(skipped("/sitemap-index.xml"), false);
    assert.equal(skipped("/about/"), false);
    assert.equal(skipped("/_astro/app.js"), true);
    assert.equal(skipped("/assets/logo.webp"), true);
    assert.equal(skipped("/toggle-theme.js"), true);
  });
});

describe("trackCrawler", () => {
  function context(): EdgeContext & { pending: Promise<unknown>[]; calls: number } {
    const pending: Promise<unknown>[] = [];
    return {
      ip: "203.0.113.9",
      pending,
      calls: 0,
      waitUntil(promise) {
        pending.push(promise);
      },
      next() {
        this.calls += 1;
        return Promise.resolve(new Response("page", { status: 200 }));
      },
    };
  }

  it("posts a crawler event without waiting on it", async () => {
    const ctx = context();
    let release: (() => void) | undefined;
    const gate = new Promise<void>(resolve => {
      release = resolve;
    });
    const seen: { url?: string; init?: RequestInit } = {};
    const responsePromise = trackCrawler(
      new Request("https://akoskm.com/posts/hello/?utm=1", {
        headers: { "user-agent": "GPTBot/1.2" },
      }),
      ctx,
      (url, init) => {
        seen.url = url;
        seen.init = init;
        return gate.then(() => new Response("{}", { status: 202 }));
      }
    );
    let timer: ReturnType<typeof setTimeout> | undefined;
    const response = await Promise.race([
      responsePromise,
      new Promise<Response>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error("handler waited for Plausible")),
          50
        );
      }),
    ]);
    clearTimeout(timer);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "page");
    assert.equal(ctx.calls, 1);
    assert.equal(seen.url, PLAUSIBLE_ENDPOINT);
    const headers = seen.init?.headers as Record<string, string>;
    assert.equal(headers["Content-Type"], "application/json");
    assert.equal(headers["User-Agent"], PLAUSIBLE_USER_AGENT);
    assert.equal(headers["X-Forwarded-For"], "203.0.113.9");
    assert.deepEqual(JSON.parse(String(seen.init?.body)), {
      name: "AI Crawler",
      domain: "crawlers.akoskm.com",
      url: "https://akoskm.com/posts/hello/?utm=1",
      props: { bot: "GPTBot", path: "/posts/hello/" },
    });
    release?.();
    await Promise.all(ctx.pending);
  });

  it("builds the event from the full url and the pathname", () => {
    assert.deepEqual(
      buildCrawlerEvent("https://akoskm.com/llms.txt", "ClaudeBot"),
      {
        name: "AI Crawler",
        domain: "crawlers.akoskm.com",
        url: "https://akoskm.com/llms.txt",
        props: { bot: "ClaudeBot", path: "/llms.txt" },
      }
    );
  });

  it("reads the crawler site from PLAUSIBLE_CRAWLER_DOMAIN", async () => {
    assert.equal(crawlerSiteDomain(undefined), "crawlers.akoskm.com");
    assert.equal(crawlerSiteDomain("  "), "crawlers.akoskm.com");
    assert.equal(crawlerSiteDomain("bots.example.com"), "bots.example.com");

    const runtime = globalThis as {
      Netlify?: { env: { get(name: string): string | undefined } };
    };
    runtime.Netlify = {
      env: {
        get(name) {
          return name === "PLAUSIBLE_CRAWLER_DOMAIN"
            ? "bots.example.com"
            : undefined;
        },
      },
    };
    try {
      const ctx = context();
      let body = "";
      await trackCrawler(
        new Request("https://akoskm.com/about/", {
          headers: { "user-agent": "GPTBot/1.0" },
        }),
        ctx,
        (_url, init) => {
          body = String(init.body);
          return Promise.resolve(new Response("{}", { status: 202 }));
        }
      );
      await Promise.all(ctx.pending);
      const event = JSON.parse(body) as { domain: string; props: { bot: string; path: string } };
      assert.equal(event.domain, "bots.example.com");
      assert.deepEqual(event.props, { bot: "GPTBot", path: "/about/" });
    } finally {
      delete runtime.Netlify;
    }
  });

  it("does not log browsers, assets, or other methods", async () => {
    const cases = [
      new Request("https://akoskm.com/about/", {
        headers: { "user-agent": "Mozilla/5.0 Chrome/131.0.0.0" },
      }),
      new Request("https://akoskm.com/assets/logo.png", {
        headers: { "user-agent": "GPTBot/1.0" },
      }),
      new Request("https://akoskm.com/about/", {
        method: "POST",
        headers: { "user-agent": "GPTBot/1.0" },
      }),
    ];
    for (const req of cases) {
      const ctx = context();
      let calls = 0;
      const response = await trackCrawler(req, ctx, () => {
        calls += 1;
        return Promise.reject(new Error("should not fetch"));
      });
      assert.equal(response.status, 200);
      assert.equal(calls, 0);
      assert.equal(ctx.pending.length, 0);
      assert.equal(ctx.calls, 1);
    }
  });

  it("still serves the page when Plausible is down", async () => {
    const ctx = context();
    const response = await trackCrawler(
      new Request("https://akoskm.com/robots.txt", {
        method: "HEAD",
        headers: { "user-agent": "bytespider" },
      }),
      ctx,
      () => Promise.reject(new Error("down"))
    );
    assert.equal(response.status, 200);
    assert.equal(ctx.calls, 1);
    await Promise.all(ctx.pending);
  });
});
