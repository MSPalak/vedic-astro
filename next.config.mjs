/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone build for container/Docker deploys (Render/Railway/Fly).
  output: "standalone",

  // This dev machine is RAM-starved (C: full → no pagefile headroom).
  // Serialize static generation and trim webpack memory so the build's
  // peak footprint fits in available memory. Cloud builds are unaffected.
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
