import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://akoskm.com/",
  author: "Ákos Kőműves",
  profile: "https://akoskm.com/",
  desc: "Ákos Kőműves writes about React, TypeScript, testing, and shipping AI-powered software. Developer, author, and writer of the Bitsy newsletter.",
  title: "Ákos Kőműves",
  ogImage: "og_image.png",
  lightAndDarkMode: true,
  postPerIndex: 3,
  postPerPage: 6,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

/** Profiles linked from Person structured data. */
export const SAME_AS = [
  "https://x.com/akoskm",
  "https://github.com/akoskm",
  "https://www.linkedin.com/in/akoskm/",
  "https://www.youtube.com/@akoskm",
  "https://akoskm.substack.com",
];

/**
 * Tag pages with fewer posts than this are noindexed and left out of the sitemap.
 * 2 keeps every tag that has at least two posts. Single-post tags are the thin ones.
 */
export const MIN_TAG_POSTS_TO_INDEX = 2;

/** Written during the build and read by the sitemap filter. */
export const THIN_TAGS_FILE = ".cache/thin-tags.json";

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Twitter",
    href: "https://x.com/intent/follow?screen_name=akoskm",
    linkTitle: `${SITE.title} on X`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:hello@akoskm.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
  {
    name: "Github",
    href: "https://github.com/akoskm",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/akoskm/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@akoskm",
    linkTitle: `${SITE.title} on YouTube`,
    active: true,
  },
];
