// npx tsx --tsconfig tsconfig.json scripts/render-site-og.ts [out.png]
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { generateOgImageForSite } from "../src/utils/generateOgImages";

const out = process.argv[2] ?? "/tmp/og.png";

generateOgImageForSite().then(pngBytes => {
  const png = Buffer.from(pngBytes);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, png);
  console.log(`wrote ${out} (${png.length} bytes)`);
});
