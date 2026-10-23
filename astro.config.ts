import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
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
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
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
  redirects: {
    "/all-series": "/series",
  },
});
