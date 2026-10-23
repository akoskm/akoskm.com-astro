import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { THIN_TAGS_FILE } from "@config";

export function recordThinTags(slugs: string[]) {
  const file = path.join(process.cwd(), THIN_TAGS_FILE);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify([...new Set(slugs)].sort()));
}
