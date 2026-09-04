/** @type {import('next').NextConfig} */

// Security headers for every response. CSP notes:
// - 'unsafe-inline' script/style is required by Next's inline runtime and
//   styled-jsx; no third-party scripts are loaded at all.
// - connect-src covers same-origin APIs plus Supabase (auth + storage).
// - Google Fonts is the only external asset host.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig = {
  // Standalone build for container/Docker deploys (Render/Railway/Fly).
  output: "standalone",

  // Don't advertise the framework.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },

  // This dev machine is RAM-starved at times. Serialize static generation
  // and trim webpack memory so the build's peak footprint stays small.
  // Cloud builds are unaffected.
  experimental: {
    cpus: 1,
    webpackMemoryOptimizations: true,
  },

  // swisseph-wasm uses import.meta.url + bundled .wasm/.data files.
  // Keep it external so Node resolves the package at runtime...
  serverExternalPackages: ["swisseph-wasm"],

  // ...and make sure the 12MB .wasm/.data ship with the traced output.
  outputFileTracingIncludes: {
    "/api/**": [
      "./node_modules/swisseph-wasm/wasm/**",
      "./node_modules/swisseph-wasm/src/**",
    ],
  },
};

export default nextConfig;
