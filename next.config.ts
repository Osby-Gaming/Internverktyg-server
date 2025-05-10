import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [new URL('https://cloud.appwrite.io/v1/storage/buckets/67a77fc10015ea7d771c/files/**')],
  },
};

export default nextConfig;
