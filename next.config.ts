import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "198.244.233.0",
        pathname: "/api/uploads/**",
      },
    ],
  },
};

export default nextConfig;
