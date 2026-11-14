import assert from "node:assert/strict";
import test from "node:test";
import { hasRecentSignIn, safeReturnPath, validEmail } from "../lib/auth/validation.ts";
import { authCookieOptions, isOwnedAuthCookie, isSessionCookie } from "../lib/auth/cookies.ts";

test("return destinations stay on this site and cannot loop through sign-in", () => {
  for (const path of ["/", "/modules/project-roles", "/questions/42?review=1#answer", "/#stop-11"]) assert.equal(safeReturnPath(path), path);
  for (const path of [undefined, null, "https://evil.example", "//evil.example", "/a/..//evil.example", "/a/%2e%2e//evil.example", "/\\evil.example", "/sign-in?next=/sign-in", "/auth/callback?code=example", "/\n/evil.example"]) assert.equal(safeReturnPath(path), "/");
});

test("email boundaries reject malformed input", () => {
  assert.equal(validEmail("learner@example.test"), true);
  for (const email of [null, "", "a@b", "x\ny@example.test", "a".repeat(255) + "@example.test"]) assert.equal(validEmail(email), false);
});

test("email changes require recent email authentication in this verified token", () => {
  const now = 1_800_000_000_000;
  assert.equal(hasRecentSignIn([{ method: "otp", timestamp: now / 1000 - 60 }], now), true);
  assert.equal(hasRecentSignIn([{ method: "email/signup", timestamp: now / 1000 - 60 }], now), true);
  for (const methods of [null, [], ["otp"], [{ method: "token_refresh", timestamp: now / 1000 }], [{ method: "otp", timestamp: now / 1000 - 901 }], [{ method: "otp", timestamp: now / 1000 + 60 }]]) assert.equal(hasRecentSignIn(methods, now), false);
});

test("session cookies are HttpOnly, scoped, and expire or delete as intended", () => {
  const options = authCookieOptions("apm-auth.0", "session");
  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, "lax");
  assert.equal(options.path, "/");
  assert.equal(options.maxAge, 604800);
  assert.equal(options.secure, process.env.NODE_ENV === "production");
  assert.equal(authCookieOptions("apm-auth-code-verifier", "verifier").maxAge, 600);
  assert.equal(authCookieOptions("apm-auth.0", "").maxAge, 0);
  assert.equal(isSessionCookie("apm-auth.0"), true);
  assert.equal(isSessionCookie("unrelated-app-cookie"), false);
  assert.equal(isSessionCookie("apm-auth-code-verifier"), false);
  for (const name of ["apm-auth", "apm-auth.0", "apm-auth-code-verifier", "apm-auth-flows-code-verifier", "apm-auth-flow-example-code-verifier", "apm-sign-in-retry-at"]) assert.equal(isOwnedAuthCookie(name), true);
  assert.equal(isOwnedAuthCookie("another-app-auth"), false);
});
