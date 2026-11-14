import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

const nextConfig = (phase: string): NextConfig => ({
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  logging: { incomingRequests: { ignore: [/\/auth\/callback/] } },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        ...(phase !== PHASE_DEVELOPMENT_SERVER ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'" },
      ],
    }];
  },
});

export default nextConfig;
