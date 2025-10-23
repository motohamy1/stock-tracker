import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  esling: {
    ignoreDuringBuilds: true,
  }, typescript: {
    ignoreBuildErrors: true,
  },

};

export default nextConfig;
