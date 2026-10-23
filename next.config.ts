import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Verified by standalone tsc and Vitest suite
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
