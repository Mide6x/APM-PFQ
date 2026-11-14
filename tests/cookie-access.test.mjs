import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import * as preferences from "../lib/cookie-preferences.ts";
import * as authCookies from "../lib/auth/cookies.ts";

const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
function load(path, dependencies) {
  const compiled = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function("require", "exports", compiled)((name) => name in dependencies ? dependencies[name] : require(name), exports);
  return exports;
}

test("declined cookies stop session refresh and remove only app-owned auth cookies", async () => {
  let called = false;
  const { middleware } = load("../middleware.ts", {
    "@supabase/ssr": { createServerClient: () => { called = true; throw new Error("must not call"); } },
    "@/lib/auth/cookies": authCookies,
    "@/lib/cookie-preferences": preferences,
  });
  const response = await middleware(new NextRequest("https://study.example/account", { headers: {
    cookie: "apm-cookie-choice=v1-block; apm-auth=fixture; apm-auth.0=fixture; apm-auth-flow-fixture-code-verifier=fixture; apm-sign-in-retry-at=fixture; other-app=keep",
  } }));
  assert.equal(called, false);
  assert.deepEqual(response.cookies.getAll().map(({ name }) => name).sort(), ["apm-auth", "apm-auth.0", "apm-auth-flow-fixture-code-verifier", "apm-sign-in-retry-at"].sort());
  assert.ok(response.cookies.getAll().every(({ value, maxAge }) => value === "" && maxAge === 0));
  assert.match(response.headers.get("cache-control"), /private, no-store/);
});

test("blocked preferences deny the server auth client even if a session cookie remains", async () => {
  let called = false;
  const { createAuthClient, getViewer } = load("../lib/auth/server.ts", {
    "server-only": {},
    react: { cache: (fn) => fn },
    "next/headers": { cookies: async () => ({ get: () => ({ value: "v1-block" }), getAll: () => [{ name: "apm-auth", value: "fixture" }] }) },
    "@supabase/ssr": { createServerClient: () => { called = true; } },
    "./cookies": authCookies,
    "@/lib/cookie-preferences": preferences,
  });
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fixture.example";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "fixture-public-key";
  try {
    assert.equal(await createAuthClient(), null);
    assert.equal(await getViewer(), null);
    assert.equal(called, false);
  } finally {
    for (const [name, value] of [["NEXT_PUBLIC_SUPABASE_URL", originalUrl], ["NEXT_PUBLIC_SUPABASE_ANON_KEY", originalKey]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});

test("device sign-out clears app cookies even if the provider fails and retains the choice", async () => {
  const cleared = [];
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fixture.example";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "fixture-public-key";
  const { endDeviceSession } = load("../lib/auth/server.ts", {
    "server-only": {}, react: { cache: (fn) => fn },
    "next/headers": { cookies: async () => ({
      get: () => ({ value: "v1-allow" }),
      getAll: () => ["apm-auth", "apm-auth.0", "apm-auth-flows-code-verifier", "apm-sign-in-retry-at", "apm-cookie-choice", "another-app"].map((name) => ({ name, value: "fixture" })),
      set: (name, value, options) => cleared.push({ name, value, options }),
    }) },
    "@supabase/ssr": { createServerClient: () => ({ auth: { signOut: async () => { throw new Error("offline"); } } }) },
    "./cookies": authCookies, "@/lib/cookie-preferences": preferences,
  });
  try {
    await endDeviceSession();
    assert.deepEqual(cleared.map(({ name }) => name), ["apm-auth", "apm-auth.0", "apm-auth-flows-code-verifier", "apm-sign-in-retry-at"]);
    assert.ok(cleared.every(({ value, options }) => value === "" && options.maxAge === 0));
  } finally {
    for (const [name, value] of [["NEXT_PUBLIC_SUPABASE_URL", originalUrl], ["NEXT_PUBLIC_SUPABASE_ANON_KEY", originalKey]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});
