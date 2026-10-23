import { chromium } from "playwright";

const base = process.env.BASE_URL || "http://127.0.0.1:4321";

const freshRoutes = [
  "/",
  "/posts/",
  "/newsletter/",
  "/apps/",
  "/apps/nummy/",
  "/apps/subsub/",
  "/books/",
  "/about/",
  "/tags/typescript/",
  "/search/",
  "/404/",
  "/wrong-type-imports-are-breaking-your-full-stack-react-app/",
  "/how-to-build-your-first-mcp-workflow/",
  "/common-useeffect-mistakes/",
];

const nav = [
  ["Home", /^\/$/],
  ["Posts", /\/posts\/?$/],
  ["Newsletter", /\/newsletter\/?$/],
  ["Apps", /\/apps\/?$/],
  ["Books", /\/books\/?$/],
  ["About", /\/about\/?$/],
  ["Search", /\/search\/?$/],
];

function fail(message) {
  throw new Error(message);
}

async function assertHamburger(page) {
  try {
    await page.waitForFunction(() => {
      const button = document.querySelector("[data-menu-button]");
      if (!button) return false;
      const box = button.getBoundingClientRect();
      return (
        getComputedStyle(button).display !== "none" &&
        box.width >= 24 &&
        box.height >= 24
      );
    });
  } catch {
    const detail = await page.evaluate(() => {
      const button = document.querySelector("[data-menu-button]");
      return {
        url: location.href,
        html: document.documentElement.className,
        count: document.querySelectorAll("[data-menu-button]").length,
        display: button ? getComputedStyle(button).display : null,
        box: button ? button.getBoundingClientRect() : null,
      };
    });
    fail(`hamburger missing ${JSON.stringify(detail)}`);
  }
  return page.locator("[data-menu-button]");
}

async function assertDrawerClosed(page) {
  const button = await assertHamburger(page);
  const expanded = await button.getAttribute("aria-expanded");
  if (expanded !== "false") {
    fail(`aria-expanded=${expanded} on ${page.url()}`);
  }
  const drawer = page.locator("[data-site-drawer]");
  await page.waitForFunction(() => {
    const el = document.querySelector("[data-site-drawer]");
    if (!el || el.classList.contains("is-open")) return false;
    const box = el.getBoundingClientRect();
    return box.x + box.width <= 1;
  });
  const cls = (await drawer.getAttribute("class")) || "";
  if (cls.split(/\s+/).includes("is-open")) {
    fail(`drawer has is-open on ${page.url()}`);
  }
}

async function openDrawer(page) {
  const button = await assertHamburger(page);
  if ((await button.getAttribute("aria-expanded")) !== "true") {
    await button.click();
  }
  await page.waitForFunction(() => {
    const button = document.querySelector("[data-menu-button]");
    if (!button) return false;
    if (button.getAttribute("aria-expanded") !== "true") return false;
    if (button.getAttribute("aria-label") !== "Close menu") return false;
    const menu = button.querySelector(".icon-menu");
    const close = button.querySelector(".icon-close");
    if (!menu || !close) return false;
    const menuBox = menu.getBoundingClientRect();
    const closeBox = close.getBoundingClientRect();
    if (menuBox.width > 0 || closeBox.width < 12) return false;
    const box = button.getBoundingClientRect();
    const topbar = document.querySelector(".site-topbar");
    const topbarBox = topbar ? topbar.getBoundingClientRect() : null;
    return (
      box.x >= 0 &&
      box.width >= 44 &&
      box.height >= 44 &&
      topbarBox &&
      box.top >= topbarBox.top - 1 &&
      box.bottom <= topbarBox.bottom + 1
    );
  });
  const box = await button.boundingBox();
  const vp = page.viewportSize();
  if (!box || box.width < 44 || box.height < 44) {
    fail(`close button too small on ${page.url()} ${JSON.stringify(box)}`);
  }
  if (
    !vp ||
    box.x < -1 ||
    box.y < -1 ||
    box.x + box.width > vp.width + 1 ||
    box.y + box.height > vp.height + 1
  ) {
    fail(`close button outside viewport on ${page.url()} ${JSON.stringify(box)}`);
  }
  const chrome = await page.evaluate(() => {
    const visible = el => {
      if (!el) return false;
      const box = el.getBoundingClientRect();
      return box.width > 0 && box.height > 0;
    };
    return {
      closeRow: visible(document.querySelector(".drawer-head")),
      closeButton: visible(document.querySelector("[data-drawer-close]")),
      avatars: [...document.querySelectorAll(".topbar-brand, .rail-avatar")].filter(
        visible
      ).length,
      headers: [...document.querySelectorAll(".site-topbar")].filter(visible)
        .length,
    };
  });
  if (chrome.closeRow || chrome.closeButton) {
    fail(`separate close row still visible on ${page.url()}`);
  }
  if (chrome.avatars !== 1 || chrome.headers !== 1) {
    fail(`duplicated header chrome on ${page.url()} ${JSON.stringify(chrome)}`);
  }
  return button;
}

async function assertCloseStaysPut(page) {
  await page.locator(".panel-scroll").evaluate(el => {
    el.scrollTop = el.scrollHeight;
  });
  const close = await openDrawer(page);
  const box = await close.boundingBox();
  if (!box || box.y > 16) {
    fail(`close button scrolled away on ${page.url()} ${JSON.stringify(box)}`);
  }
}

async function closeWithButton(page) {
  const button = page.locator("[data-menu-button]");
  if ((await button.getAttribute("aria-expanded")) !== "true") {
    fail(`menu button is not the close control on ${page.url()}`);
  }
  await button.click();
  await page.waitForFunction(() => {
    const button = document.querySelector("[data-menu-button]");
    return (
      button?.getAttribute("aria-expanded") === "false" &&
      button?.getAttribute("aria-label") === "Open menu"
    );
  });
  await assertDrawerClosed(page);
}

const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(15000);

try {
  for (const route of freshRoutes) {
    const response = await page.goto(base + route, { waitUntil: "load" });
    if (!response || response.status() >= 400) {
      fail(`${route} status ${response && response.status()}`);
    }
    await assertDrawerClosed(page);
    await openDrawer(page);
    await assertCloseStaysPut(page);
    await closeWithButton(page);
    console.log("fresh closed", route);
  }

  await page.goto(base + "/", { waitUntil: "load" });
  for (const [label, pattern] of nav) {
    if (pattern.test(new URL(page.url()).pathname)) continue;
    await openDrawer(page);
    await page
      .locator("[data-site-drawer] nav a", { hasText: label })
      .click();
    await page.waitForURL(url => pattern.test(new URL(url).pathname));
    await assertDrawerClosed(page);
    await openDrawer(page);
    await closeWithButton(page);
    console.log("nav", label, page.url());
  }

  await page.goto(base + "/", { waitUntil: "load" });
  await openDrawer(page);
  await page.locator("[data-site-drawer] nav a", { hasText: "Posts" }).click();
  await page.waitForURL(url => /\/posts\/?$/.test(new URL(url).pathname));
  await assertDrawerClosed(page);
  await page.goBack({ waitUntil: "load" });
  await assertDrawerClosed(page);
  await openDrawer(page);
  await closeWithButton(page);
  await page.goForward({ waitUntil: "load" });
  await assertDrawerClosed(page);
  await openDrawer(page);
  await closeWithButton(page);
  console.log("back/forward home <-> writing ok");

  await page.goto(base + "/", { waitUntil: "load" });
  await openDrawer(page);
  await page.locator("[data-menu-backdrop]").click({
    position: { x: 370, y: 420 },
  });
  await assertDrawerClosed(page);
  await openDrawer(page);
  await page.keyboard.press("Escape");
  await assertDrawerClosed(page);
  console.log("backdrop and escape ok");

  await page.screenshot({
    path: "/opt/cursor/artifacts/mobile-drawer-closed-home.png",
  });
  await openDrawer(page);
  await page.screenshot({
    path: "/opt/cursor/artifacts/mobile-drawer-open-home.png",
  });
  console.log("ok");
} finally {
  await browser.close();
}
