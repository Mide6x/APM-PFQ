import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { COOKIE_CHOICE_NAME, COOKIE_CHOICE_MAX_AGE, parseCookieChoice } from "../lib/cookie-preferences.ts";

const source = readFileSync(new URL("../app/cookies/actions.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

function action() {
  const events = [];
  const dependencies = {
    "next/headers": { cookies: async () => ({ set: (...args) => events.push(["set", ...args]) }) },
    "next/cache": { revalidatePath: (...args) => events.push(["refresh", ...args]) },
    "@/lib/auth/server": { endDeviceSession: async () => events.push(["sign-out"]) },
    "@/lib/cookie-preferences": { COOKIE_CHOICE_NAME, COOKIE_CHOICE_MAX_AGE },
  };
  const exports = {};
  new Function("require", "exports", compiled)((name) => dependencies[name], exports);
  return { events, save: (choice) => {
    const form = new FormData();
    if (choice !== null) form.set("choice", choice);
    return exports.saveCookieChoice({}, form);
  } };
}

test("only known, versioned choices are accepted", () => {
  assert.equal(parseCookieChoice("v1-allow"), "allow");
  assert.equal(parseCookieChoice("v1-block"), "block");
  for (const value of [undefined, null, "allow", "true", "v2-allow", "v1-allow; unexpected"]) assert.equal(parseCookieChoice(value), null);
});

test("declining signs out before saving the durable browser choice; allowing never signs in", async () => {
  const declined = action();
  assert.equal((await declined.save("block")).status, "saved");
  assert.equal(declined.events[0][0], "sign-out");
  const [, name, value, options] = declined.events[1];
  assert.equal(name, COOKIE_CHOICE_NAME);
  assert.equal(value, "v1-block");
  assert.equal(options.maxAge, 90 * 24 * 60 * 60);
  assert.equal(options.path, "/");
  assert.equal(options.sameSite, "lax");
  assert.equal(options.secure, process.env.NODE_ENV === "production");
  assert.equal(options.httpOnly, undefined);
  assert.deepEqual(declined.events[2], ["refresh", "/", "layout"]);
  const allowed = action();
  assert.equal((await allowed.save("allow")).status, "saved");
  assert.equal(allowed.events[0][0], "set");
  assert.equal(allowed.events[0][2], "v1-allow");
  assert.equal(allowed.events.some(([name]) => name === "sign-out"), false);
});

test("invalid preference submissions change no cookies or sessions", async () => {
  for (const choice of [null, "", "yes", "analytics", "v1-allow"]) {
    const h = action();
    assert.equal((await h.save(choice)).status, "error");
    assert.deepEqual(h.events, []);
  }
});
