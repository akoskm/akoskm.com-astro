export const BITSY_TAGLINE =
  "For engineers who pair with AI as a coworker, keep the thinking, and ship value instead of slop.";
export const BITSY_REFERRAL = "twgob";
export const BITSY_URL = `https://akoskm.substack.com/?r=${BITSY_REFERRAL}`;
export const BITSY_SUBSCRIBE_URL = `https://akoskm.substack.com/subscribe?r=${BITSY_REFERRAL}`;

export type PromoKind = "app" | "book" | "newsletter";

export interface PromoLink {
  href: string;
  label: string;
  destination: string;
}

export interface Promo {
  id: string;
  kind: PromoKind;
  title: string;
  body: string;
  image?: string;
  links: PromoLink[];
}

const subsub: Promo = {
  id: "subsub",
  kind: "app",
  title: "SubSub",
  body: "Subscription tracker for iPhone and Mac. Add each charge yourself. No bank login. It stays on the device. $3.99 once, with a 7-day trial.",
  links: [
    {
      href: "https://apps.apple.com/us/app/subscription-tracker-subsub/id6788995702",
      label: "App Store",
      destination: "app-store",
    },
    {
      href: "https://subsub.app/",
      label: "subsub.app",
      destination: "site",
    },
  ],
};

const nummy: Promo = {
  id: "nummy",
  kind: "app",
  title: "Nummy",
  body: "Nursing tracker. Log a feed on your Watch, then see the week on your iPhone. $3.99 once.",
  links: [
    {
      href: "https://apps.apple.com/us/app/nursing-tracker-nummy/id6807654894",
      label: "App Store",
      destination: "app-store",
    },
    {
      href: "https://nummyapp.com/",
      label: "nummyapp.com",
      destination: "site",
    },
  ],
};

const rtl: Promo = {
  id: "rtl",
  kind: "book",
  title: "React Testing Library Crash Course",
  body: "A short book on testing React components with React Testing Library. Setup, queries, and the cases that usually fail.",
  image: "/assets/covers/rtl-crash-course.jpg",
  links: [
    {
      href: "https://a.co/d/dyQ91Fw",
      label: "Amazon",
      destination: "amazon",
    },
  ],
};

const bitsy: Promo = {
  id: "bitsy",
  kind: "newsletter",
  title: "Bitsy",
  body: BITSY_TAGLINE,
  links: [
    {
      href: BITSY_URL,
      label: "Read it on Substack",
      destination: "read",
    },
  ],
};

export const PROMOS: Record<string, Promo> = {
  subsub,
  nummy,
  rtl,
  bitsy,
};

const SUBSUB_CARD_HREF =
  "https://akoskm.com/apps/subsub/?utm_source=akoskm.com&utm_medium=card";

const subsubOnSite: PromoLink = {
  href: SUBSUB_CARD_HREF,
  label: "See SubSub",
  destination: "site",
};

interface PostPromoEntry {
  id: string;
  body?: string;
  links?: PromoLink[];
}

/** Slug → promo ids, in display order. An entry can override body and links. */
export const POST_PROMOS: Record<string, Array<string | PostPromoEntry>> = {
  "a-full-stack-developers-guide-to-setting-up-a-new-macbook-pro": [
    "subsub",
    "nummy",
  ],
  "try-openai-codex-no-subscription": [
    {
      id: "subsub",
      body: "Track what Codex, Cursor, and the rest of your AI subscriptions cost you.",
      links: [subsubOnSite],
    },
  ],
  "how-to-use-cursor-commands-to-write-jira-ticket-descriptions": [
    {
      id: "subsub",
      body: "Track what Cursor, Jira, and your other subscriptions cost you each month.",
      links: [subsubOnSite],
    },
  ],
  "how-to-use-rerender-in-react-testing-library": ["rtl"],
  "how-to-test-a-classname-with-jest-and-react-testing-library": ["rtl"],
  "how-to-test-props-in-react-testing-library": ["rtl"],
  "how-to-test-props-in-react-with-jest": ["rtl"],
  "how-to-test-react-apps-with-vitest-and-vite": ["rtl"],
  "how-to-solve-variable-is-possibly-undefined-in-typescript-even-when-its-defined":
    ["bitsy"],
};

function promoFromEntry(entry: string | PostPromoEntry): Promo | undefined {
  if (typeof entry === "string") return PROMOS[entry];
  const base = PROMOS[entry.id];
  if (!base) return undefined;
  return {
    ...base,
    body: entry.body ?? base.body,
    links: entry.links ?? base.links,
  };
}

export function promosForSlug(slug: string): Promo[] {
  return (POST_PROMOS[slug] ?? [])
    .map(promoFromEntry)
    .filter((promo): promo is Promo => Boolean(promo));
}

export function hasPostPromos(slug: string): boolean {
  return promosForSlug(slug).length > 0;
}
