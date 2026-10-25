import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { SITE } from "@config";
import { BITSY_TAGLINE } from "@data/promos";
import type { FontOptions } from "../loadGoogleFont";

const root = process.cwd();

/** Phrase breaks of BITSY_TAGLINE, kept in sync by the check below. */
const TAGLINE_LINES = [
  "For engineers who pair",
  "with AI as a coworker,",
  "keep the thinking, and",
  "ship value instead of slop.",
];

if (TAGLINE_LINES.join(" ") !== BITSY_TAGLINE) {
  throw new Error("OG tagline lines no longer match BITSY_TAGLINE");
}

function font(file: string): ArrayBuffer {
  const buf = readFileSync(file);
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  ) as ArrayBuffer;
}

/** Default share card. The line is the site tagline. */
export default async () => {
  const fonts: FontOptions[] = [
    {
      name: "Geist Sans",
      data: font(
        join(root, "node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf")
      ),
      weight: 500,
      style: "normal",
    },
    {
      name: "Geist Sans",
      data: font(
        join(
          root,
          "node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf"
        )
      ),
      weight: 600,
      style: "normal",
    },
    {
      name: "Source Serif 4",
      data: font(join(root, "src/assets/fonts/SourceSerif4-Regular.ttf")),
      weight: 400,
      style: "normal",
    },
  ];

  const host = new URL(SITE.website).hostname;

  return satori(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#F5F0E6",
      }}
    >
      <div
        style={{
          width: 18,
          height: "100%",
          background: "#FF4F00",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "52px 60px 46px 52px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontFamily: "Source Serif 4",
              fontSize: 72,
              lineHeight: 1.02,
              color: "#17191E",
            }}
          >
            {TAGLINE_LINES.map(line => (
              <div key={line} style={{ display: "flex" }}>
                {line}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            fontFamily: "Geist Sans",
            fontSize: 36,
          }}
        >
          <div style={{ display: "flex", fontWeight: 600, color: "#17191E" }}>
            {SITE.author}
          </div>
          <div style={{ display: "flex", fontWeight: 500, color: "#C23D00" }}>
            {host}
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
};
