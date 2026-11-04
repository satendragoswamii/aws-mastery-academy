import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // npm scripts always run from the project root; pin it so a stray
  // ~/package-lock.json is not mistaken for the workspace root.
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
