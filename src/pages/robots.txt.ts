import type { APIRoute } from "astro";
import { SITE } from "@config";

const sitemap = new URL("sitemap-index.xml", SITE.website).href;
const llms = new URL("llms.txt", SITE.website).href;
const llmsFull = new URL("llms-full.txt", SITE.website).href;

const allow = `
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: meta-externalagent
Allow: /

Sitemap: ${sitemap}
# llms.txt: ${llms}
# llms-full.txt: ${llmsFull}
`.trim();

export const GET: APIRoute = () =>
  new Response(allow, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
