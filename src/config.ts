import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://akoskm.com/", // replace this with your deployed domain
  author: "Akos Komuves",
  profile: "https://satnaing.dev/",
  desc: "Explore web development tips, tutorials, and insights from Akos, a full-stack developer with over a decade of experience. Learn how to build, optimize, and deploy modern web applications, improve your coding skills, and stay up-to-date with the latest in tech.",
  title: "Akos Komuves",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 3,
  postPerPage: 6,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

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
