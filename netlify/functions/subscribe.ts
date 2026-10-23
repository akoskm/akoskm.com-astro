import { BITSY_REFERRAL } from "../../src/data/promos.ts";

const SUBSTACK_FREE_URL = "https://akoskm.substack.com/api/v1/free";
const SUBSTACK_REFERER = `https://akoskm.substack.com/embed?r=${BITSY_REFERRAL}`;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

export interface SubscribeInput {
  email: string;
  post: string;
  page: string;
  company: string;
}

export interface FunctionEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
  isBase64Encoded?: boolean;
}

export interface FunctionResult {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
}

const hits = new Map<string, number[]>();

export function clearRateLimit(): void {
  hits.clear();
}

export function isValidEmail(email: string): boolean {
  if (email.length > 254 || /[\s<>]/.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function safeSlug(value: string): string {
  const slug = value.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) return "";
  return slug;
}

export function allowsPage(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.username || url.password) return false;
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = url.hostname;
    if (host === "akoskm.com" || host === "www.akoskm.com") return true;
    if (host === "localhost" || host === "127.0.0.1") return true;
    return host.endsWith(".netlify.app");
  } catch {
    return false;
  }
}

export function pageUrlFor(input: Pick<SubscribeInput, "post" | "page">): string {
  if (input.page && allowsPage(input.page)) {
    const url = new URL(input.page);
    url.hash = "";
    return url.toString();
  }
  const slug = safeSlug(input.post);
  return slug ? `https://akoskm.com/${slug}/` : "https://akoskm.com/";
}

export function successPath(post: string): string {
  const slug = safeSlug(post);
  const path = slug ? `/${slug}/` : "/";
  return `${path}?subscribed=1#bitsy-subscribed`;
}

export function fallbackUrl(email: string): string {
  const url = new URL("https://akoskm.substack.com/subscribe");
  if (email && email.length <= 254 && !/[\r\n]/.test(email)) {
    url.searchParams.set("email", email);
  }
  url.searchParams.set("r", BITSY_REFERRAL);
  return url.toString();
}

/** Body shape used by the publication embed, plus the referral code. */
export function substackPayload(email: string, pageUrl: string, now = Date.now()) {
  return {
    sessionStarted: now,
    landingReferrer: "",
    landingUrl: pageUrl,
    landingSurface: "publisher",
    landingPublicationId: 1061766,
    referrer: "",
    first_url: pageUrl,
    first_referrer: "",
    current_url: pageUrl,
    current_referrer: "",
    first_session_url: pageUrl,
    first_session_referrer: "",
    referral_code: BITSY_REFERRAL,
    source: "embed",
    referring_pub_id: "",
    additional_referring_pub_ids: "",
    email,
  };
}

export function allowRequest(ip: string, now = Date.now()): boolean {
  const key = ip || "anonymous";
  const recent = (hits.get(key) || []).filter(time => now - time < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

function header(event: FunctionEvent, name: string): string {
  const value = event.headers[name] ?? event.headers[name.toLowerCase()];
  return value || "";
}

function clientIp(event: FunctionEvent): string {
  return (
    header(event, "x-nf-client-connection-ip") ||
    header(event, "client-ip") ||
    header(event, "x-forwarded-for").split(",")[0].trim()
  );
}

export function parseInput(event: FunctionEvent): SubscribeInput {
  const raw =
    event.isBase64Encoded && event.body
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body || "";
  const contentType = header(event, "content-type");
  if (contentType.includes("application/json")) {
    let data: Record<string, unknown> = {};
    try {
      const parsed: unknown = JSON.parse(raw || "{}");
      if (parsed && typeof parsed === "object") {
        data = parsed as Record<string, unknown>;
      }
    } catch {
      data = {};
    }
    return {
      email: typeof data.email === "string" ? data.email.trim() : "",
      post: typeof data.post === "string" ? data.post : "",
      page: typeof data.page === "string" ? data.page : "",
      company: typeof data.company === "string" ? data.company : "",
    };
  }
  const params = new URLSearchParams(raw);
  return {
    email: (params.get("email") || "").trim(),
    post: params.get("post") || "",
    page: params.get("page") || "",
    company: params.get("company") || "",
  };
}

function wantsJson(event: FunctionEvent): boolean {
  const contentType = header(event, "content-type");
  const accept = header(event, "accept");
  return contentType.includes("application/json") || accept.includes("application/json");
}

function json(statusCode: number, body: { ok: boolean }): FunctionResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function redirect(location: string): FunctionResult {
  return {
    statusCode: 303,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
    },
    body: "",
  };
}

export async function forwardToSubstack(
  email: string,
  pageUrl: string,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  const response = await fetchImpl(SUBSTACK_FREE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: "https://akoskm.substack.com",
      Referer: SUBSTACK_REFERER,
    },
    body: JSON.stringify(substackPayload(email, pageUrl)),
  });
  if (!response.ok) return false;
  const text = await response.text();
  const lowered = text.toLowerCase();
  if (lowered.includes("captcha") || lowered.includes("challenge")) return false;
  return true;
}

export async function handleSubscribe(
  event: FunctionEvent,
  fetchImpl: typeof fetch = fetch,
  now = Date.now()
): Promise<FunctionResult> {
  if (event.httpMethod !== "POST") {
    return wantsJson(event) ? json(405, { ok: false }) : redirect("/");
  }

  const input = parseInput(event);
  const asJson = wantsJson(event);

  if (!allowRequest(clientIp(event), now)) {
    return asJson ? json(429, { ok: false }) : redirect(fallbackUrl(input.email));
  }

  if (input.company.trim()) {
    return asJson ? json(200, { ok: true }) : redirect(successPath(input.post));
  }

  if (!isValidEmail(input.email)) {
    return asJson ? json(400, { ok: false }) : redirect(fallbackUrl(input.email));
  }

  let ok = false;
  try {
    ok = await forwardToSubstack(input.email, pageUrlFor(input), fetchImpl);
  } catch {
    ok = false;
  }

  if (!ok) {
    return asJson ? json(502, { ok: false }) : redirect(fallbackUrl(input.email));
  }

  return asJson ? json(200, { ok: true }) : redirect(successPath(input.post));
}

export const handler = (event: FunctionEvent): Promise<FunctionResult> =>
  handleSubscribe(event);
