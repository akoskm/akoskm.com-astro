import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { remarkHeadingId } from "./src/lib/remarkHeadingId";
import { remarkLiteralText } from "./src/lib/remarkLiteralText";
import { remarkNoAutolink } from "./src/lib/remarkNoAutolink";
import { rehypeTrimBreak } from "./src/lib/rehypeTrimBreak";
import fs from "node:fs";
import path from "node:path";
import { SITE, THIN_TAGS_FILE } from "./src/config";

function includeInSitemap(page: string) {
  const file = path.join(process.cwd(), THIN_TAGS_FILE);
  if (!fs.existsSync(file)) return true;

  let thin: string[] = [];
  try {
    thin = JSON.parse(fs.readFileSync(file, "utf8")) as string[];
  } catch {
    return true;
  }

  const parts = new URL(page).pathname.split("/").filter(Boolean);
  if (parts[0] !== "tags" || !parts[1]) return true;
  return !thin.includes(decodeURIComponent(parts[1]));
}

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap({
      filter: includeInSitemap,
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkLiteralText,
      remarkNoAutolink,
      remarkHeadingId,
      [remarkToc, { heading: "table of contents" }],
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
    rehypePlugins: [rehypeTrimBreak],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "github-light", dark: "github-dark-default" },
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
  experimental: {
    contentLayer: true,
  },
});
