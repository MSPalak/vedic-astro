/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone build for container/Docker deploys (Render/Railway/Fly).
  output: "standalone",

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
