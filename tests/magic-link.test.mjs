import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createRequire } from "node:module";
import ts from "typescript";
import { safeReturnPath } from "../lib/auth/validation.ts";

const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
const source = readFileSync(new URL("../app/auth/callback/route.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

function callback(client) {
  const deleted = [];
  const exports = {};
  const dependencies = {
    "next/headers": { cookies: async () => ({ delete: (name) => deleted.push(name) }) },
    "@/lib/auth/server": { createAuthClient: async () => client },
    "@/lib/auth/cookies": { RETRY_COOKIE_NAME: "apm-sign-in-retry-at" },
    "@/lib/auth/validation": { safeReturnPath },
  };
  new Function("require", "exports", compiled)((name) => dependencies[name] ?? require(name), exports);
  return { get: (query) => exports.GET(new NextRequest(`https://study.example/auth/callback${query}`)), deleted };
}

test("magic-link callback exchanges the code and verifies identity before returning to a lesson", async () => {
  let exchanged;
  const handler = callback({ auth: {
    exchangeCodeForSession: async (code) => { exchanged = code; return { data: { session: {} }, error: null }; },
    getUser: async () => ({ data: { user: { email_confirmed_at: "confirmed", is_anonymous: false } }, error: null }),
  } });
  const response = await handler.get("?code=fixture&next=%2Fmodules%2Fproject-roles");
  assert.match(response.headers.get("cache-control"), /private, no-store/);
  assert.equal(exchanged, "fixture");
  assert.equal(response.headers.get("location"), "/modules/project-roles");
  assert.deepEqual(handler.deleted, ["apm-sign-in-retry-at"]);
  assert.equal((await handler.get("?code=fixture&next=%2Fa%2F..%2F%2Fevil.example")).headers.get("location"), "/");
  assert.equal((await handler.get("?code=fixture&next=https://evil.example")).headers.get("location"), "/");
});

test("missing, expired, reused, wrong-browser and unverified links fail closed", async () => {
  const failure = "/sign-in?error=link";
  assert.equal((await callback(null).get("")).headers.get("location"), failure);
  for (const auth of [
    { exchangeCodeForSession: async () => ({ error: { message: "expired" }, data: {} }) },
    { exchangeCodeForSession: async () => { throw new Error("wrong browser"); } },
    { exchangeCodeForSession: async () => ({ data: { session: {} } }), getUser: async () => ({ data: { user: null }, error: {} }) },
    { exchangeCodeForSession: async () => ({ data: { session: {} } }), getUser: async () => ({ data: { user: { is_anonymous: true } } }) },
  ]) {
    const handler = callback({ auth });
    assert.equal((await handler.get("?code=fixture&next=%2Faccount")).headers.get("location"), failure);
    assert.deepEqual(handler.deleted, []);
  }
});
