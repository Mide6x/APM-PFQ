import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { COOKIE_CHOICE_NAME, parseCookieChoice } from "../lib/cookie-preferences.ts";

const source = readFileSync(new URL("../app/sign-in/actions.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const originalSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function handler(providerError = null, savedRetry, cookieChoice = "v1-allow") {
  const calls = [];
  const stored = [];
  const dependencies = {
    "next/headers": {
      headers: async () => new Headers({ origin: "https://apmprep.netlify.app", host: "apmprep.netlify.app" }),
      cookies: async () => ({ get: (name) => name === COOKIE_CHOICE_NAME ? { value: cookieChoice } : savedRetry ? { value: String(savedRetry) } : undefined, set: (...args) => stored.push(args) }),
    },
    "@/lib/cookie-preferences": { COOKIE_CHOICE_NAME, parseCookieChoice },
    "@/lib/auth/server": { createAuthClient: async () => ({ auth: { signInWithOtp: async (input) => { calls.push(input); return { error: providerError }; } } }) },
    "@/lib/auth/cookies": { RETRY_COOKIE_NAME: "apm-sign-in-retry-at", authCookieOptions: () => ({ httpOnly: true }) },
    "@/lib/auth/validation": { validEmail: () => true, safeReturnPath: () => "/modules/project-roles" },
  };
  const exports = {};
  new Function("require", "exports", compiled)((name) => dependencies[name], exports);
  return { calls, stored, send: (token) => {
    const form = new FormData();
    form.set("email", "learner@example.test");
    if (token !== null) form.set("captchaToken", token);
    return exports.sendMagicLink({}, form);
  } };
}

test("Turnstile gates link requests and delegates each token once to Supabase", async () => {
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "fixture-site-key";
  try {
    for (const token of [null, "", "x".repeat(2049)]) {
      const h = handler();
      assert.equal((await h.send(token)).status, "error");
      assert.equal(h.calls.length, 0);
    }
    const h = handler();
    assert.equal((await h.send("fixture-token")).status, "sent");
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0].options.captchaToken, "fixture-token");
    assert.equal(new URL(h.calls[0].options.emailRedirectTo).origin, "https://apmprep.netlify.app");
    assert.equal(h.stored.length, 1);
    const rejection = handler({ code: "captcha_failed" });
    assert.equal((await rejection.send("used-or-invalid-fixture")).status, "error");
    assert.equal(rejection.stored.length, 0);
    const neutral = handler({ code: "over_email_send_rate_limit" });
    assert.equal((await neutral.send("fresh-fixture")).status, "sent");
    const cooldown = handler(null, Date.now() + 30_000);
    assert.equal((await cooldown.send("fresh-fixture")).status, "sent");
    assert.equal(cooldown.calls.length, 0);
  } finally {
    if (originalSiteKey === undefined) delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    else process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = originalSiteKey;
  }
});

test("sign-in requests without permission never reach Supabase or set cookies", async () => {
  for (const choice of [undefined, "", "v1-block", "unknown"]) {
    const h = handler(null, undefined, choice === undefined ? "" : choice);
    assert.equal((await h.send("fixture-token")).status, "error");
    assert.equal(h.calls.length, 0);
    assert.equal(h.stored.length, 0);
  }
});
