import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants.js";
import nextConfig from "../next.config.ts";

test("dev chunks stay separate while build and start share production output", () => {
  const dev = nextConfig(PHASE_DEVELOPMENT_SERVER);
  const build = nextConfig(PHASE_PRODUCTION_BUILD);
  const start = nextConfig(PHASE_PRODUCTION_SERVER);
  assert.equal(dev.distDir, ".next-dev");
  assert.equal(build.distDir, ".next");
  assert.equal(start.distDir, build.distDir);
  assert.notEqual(dev.distDir, build.distDir);
});

test("every route receives the browser security headers", async () => {
  const config = nextConfig(PHASE_PRODUCTION_SERVER);
  assert.equal(config.poweredByHeader, false);
  const rules = await config.headers();
  assert.equal(rules[0].source, "/:path*");
  const headers = Object.fromEntries(rules[0].headers.map(({ key, value }) => [key, value]));
  assert.equal(headers["Strict-Transport-Security"], "max-age=31536000");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["Referrer-Policy"], "no-referrer");
  assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.match(headers["Content-Security-Policy"], /form-action 'self'/);
  assert.match(headers["Permissions-Policy"], /camera=\(\)/);
});

test("Netlify scan exclusions contain only the three intentionally public variables", () => {
  const config = readFileSync(new URL("../netlify.toml", import.meta.url), "utf8");
  const keys = config.match(/SECRETS_SCAN_OMIT_KEYS\s*=\s*"([^"]*)"/)?.[1].split(",").sort();
  assert.deepEqual(keys, ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_TURNSTILE_SITE_KEY"]);
  assert.doesNotMatch(config, /SECRETS_SCAN_ENABLED|SECRETS_SCAN_OMIT_PATHS/);
});
