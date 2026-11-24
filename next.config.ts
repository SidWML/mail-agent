import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // cacheComponents: true, // off: the app uses no "use cache", and in dev it makes Next render every page twice
  cacheComponents: false,
  // partialPrefetching needs cacheComponents
  experimental: {
    // The "Attach files" dialog uploads files with the form; the default limit is 1 MB.
    serverActions: { bodySizeLimit: "30mb" },
  },
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
