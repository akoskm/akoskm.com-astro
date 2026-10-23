import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  allowRequest,
  clearRateLimit,
  fallbackUrl,
  forwardToSubstack,
  handleSubscribe,
  isValidEmail,
  substackPayload,
  successPath,
  type FunctionEvent,
} from "./functions/subscribe.ts";

function event(body: string, headers: Record<string, string> = {}): FunctionEvent {
  return {
    httpMethod: "POST",
    headers: { "x-nf-client-connection-ip": "203.0.113.5", ...headers },
    body,
  };
}

function jsonEvent(data: unknown, ip = "203.0.113.5"): FunctionEvent {
  return event(JSON.stringify(data), {
    "content-type": "application/json",
    accept: "application/json",
    "x-nf-client-connection-ip": ip,
  });
}

beforeEach(() => {
  clearRateLimit();
});

describe("subscribe helpers", () => {
  it("accepts a normal address and rejects blanks", () => {
    assert.equal(isValidEmail("reader@example.com"), true);
    assert.equal(isValidEmail("not-an-email"), false);
    assert.equal(isValidEmail(""), false);
  });

  it("builds a same-site success path and a subscribe fallback", () => {
    assert.equal(
      successPath("how-to-test-props-in-react-with-jest"),
      "/how-to-test-props-in-react-with-jest/?subscribed=1#bitsy-subscribed"
    );
    assert.equal(successPath("../etc"), "/?subscribed=1#bitsy-subscribed");
    const fallback = new URL(fallbackUrl("reader@example.com"));
    assert.equal(fallback.origin + fallback.pathname, "https://akoskm.substack.com/subscribe");
    assert.equal(fallback.searchParams.get("email"), "reader@example.com");
    assert.equal(fallback.searchParams.get("r"), "twgob");
  });

  it("sends the embed fields and the referral code", () => {
    const payload = substackPayload("reader@example.com", "https://akoskm.com/post/", 10);
    assert.equal(payload.email, "reader@example.com");
    assert.equal(payload.referral_code, "twgob");
    assert.equal(payload.source, "embed");
    assert.equal(payload.current_url, "https://akoskm.com/post/");
    assert.equal(payload.first_url, "https://akoskm.com/post/");
    assert.equal(payload.landingPublicationId, 1061766);
    assert.equal(payload.sessionStarted, 10);
  });
});

describe("handleSubscribe", () => {
  it("returns ok without calling Substack when the honeypot is filled", async () => {
    let calls = 0;
    const result = await handleSubscribe(
      jsonEvent({ email: "reader@example.com", post: "post", company: "spam" }),
      () => {
        calls += 1;
        return Promise.reject(new Error("should not fetch"));
      }
    );
    assert.equal(calls, 0);
    assert.equal(result.statusCode, 200);
    assert.deepEqual(JSON.parse(result.body || ""), { ok: true });
  });

  it("rejects an invalid address before calling Substack", async () => {
    let calls = 0;
    const result = await handleSubscribe(
      jsonEvent({ email: "not-an-email", post: "post" }),
      () => {
        calls += 1;
        return Promise.reject(new Error("should not fetch"));
      }
    );
    assert.equal(calls, 0);
    assert.equal(result.statusCode, 400);
  });

  it("returns ok when Substack accepts the address", async () => {
    const seen: { url?: string; body?: string; headers?: Record<string, string> } = {};
    const result = await handleSubscribe(
      jsonEvent({
        email: "reader@example.com",
        post: "mocha-to-jest-migration",
        page: "https://deploy-preview-3--akoskm.netlify.app/mocha-to-jest-migration/",
      }),
      (url, init) => {
        seen.url = String(url);
        seen.body = String(init?.body);
        seen.headers = init?.headers as Record<string, string>;
        return Promise.resolve(new Response("{}", { status: 200 }));
      }
    );
    assert.equal(result.statusCode, 200);
    assert.equal(seen.url, "https://akoskm.substack.com/api/v1/free");
    const payload = JSON.parse(seen.body || "");
    assert.equal(payload.referral_code, "twgob");
    assert.equal(payload.source, "embed");
    assert.equal(
      payload.current_url,
      "https://deploy-preview-3--akoskm.netlify.app/mocha-to-jest-migration/"
    );
    assert.equal(seen.headers?.Origin, "https://akoskm.substack.com");
    assert.equal(seen.headers?.Referer, "https://akoskm.substack.com/embed?r=twgob");
  });

  it("redirects a form post back to the post", async () => {
    const result = await handleSubscribe(
      event("email=reader%40example.com&post=mocha-to-jest-migration&company=", {
        "content-type": "application/x-www-form-urlencoded",
      }),
      () => Promise.resolve(new Response("{}", { status: 200 }))
    );
    assert.equal(result.statusCode, 303);
    assert.equal(
      result.headers?.Location,
      "/mocha-to-jest-migration/?subscribed=1#bitsy-subscribed"
    );
  });

  it("sends a failed form post to the subscribe page", async () => {
    const result = await handleSubscribe(
      event("email=reader%40example.com&post=mocha-to-jest-migration", {
        "content-type": "application/x-www-form-urlencoded",
      }),
      () => Promise.resolve(new Response("captcha", { status: 403 }))
    );
    assert.equal(result.statusCode, 303);
    const location = new URL(result.headers?.Location || "");
    assert.equal(location.searchParams.get("email"), "reader@example.com");
    assert.equal(location.searchParams.get("r"), "twgob");
  });

  it("rate limits an address source", () => {
    const ip = "198.51.100.8";
    for (let i = 0; i < 5; i += 1) assert.equal(allowRequest(ip, 1_000), true);
    assert.equal(allowRequest(ip, 1_000), false);
  });

  it("treats a captcha body as failure", async () => {
    const ok = await forwardToSubstack(
      "reader@example.com",
      "https://akoskm.com/",
      () => Promise.resolve(new Response("please complete the captcha", { status: 200 }))
    );
    assert.equal(ok, false);
  });
});
