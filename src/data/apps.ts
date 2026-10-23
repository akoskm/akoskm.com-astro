export interface AppInfo {
  slug: "nummy" | "subsub";
  name: string;
  price: string;
  summary: string;
  audience: string;
  description: string;
  features: string[];
  icon: string;
  appStore: string;
  site: string;
  siteLabel: string;
  category: string;
  operatingSystem: string;
}

export const APPS: AppInfo[] = [
  {
    slug: "nummy",
    name: "Nummy",
    price: "3.99",
    summary: "Log a feed on your Watch, then see the week on your iPhone.",
    audience: "For parents who want the log on their wrist, not in a notebook.",
    description:
      "Nummy is a nursing tracker. Tap the side you used, and the Watch remembers it for next time. The iPhone app turns the week into a heatmap. $3.99 once, with a 7-day trial.",
    features: [
      "Tap left or right to log a feed",
      "The Watch suggests the side you used last",
      "iPhone heatmap and left/right counts",
      "Change the duration if you logged it late",
      "$3.99 once. A 7-day trial on this device",
      "Sessions stay in your iCloud account",
    ],
    icon: "/assets/apps/nummy.jpg",
    appStore:
      "https://apps.apple.com/us/app/nursing-tracker-nummy/id6807654894",
    site: "https://nummyapp.com/",
    siteLabel: "nummyapp.com",
    category: "HealthApplication",
    operatingSystem: "iOS",
  },
  {
    slug: "subsub",
    name: "SubSub",
    price: "3.99",
    summary:
      "Subscription tracker for iPhone and Mac. No bank login. $3.99 once.",
    audience:
      "For people who want renewals and trial end dates in one place, without connecting a bank.",
    description:
      "SubSub lists what you pay each month and each year, what renews next, and when a free trial turns into a charge. You add each subscription yourself. Data stays on the device unless you turn on iCloud. $3.99 once, with a 7-day trial.",
    features: [
      "Monthly and yearly totals",
      "Renewals sorted by date",
      "Reminders before a bill",
      "Trial end dates, so a trial does not convert quietly",
      "A catalog of common services, plus anything you add",
      "iPhone and a native Mac app",
      "No bank login and no account",
    ],
    icon: "/assets/apps/subsub.jpg",
    appStore:
      "https://apps.apple.com/us/app/subscription-tracker-subsub/id6788995702",
    site: "https://subsub.app/",
    siteLabel: "subsub.app",
    category: "FinanceApplication",
    operatingSystem: "iOS, macOS",
  },
];

export function appBySlug(slug: string): AppInfo | undefined {
  return APPS.find(app => app.slug === slug);
}
