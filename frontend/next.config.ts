import type { NextConfig } from "next";

const backendUrl = (process.env.BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Proxy all /api calls to the backend Express server
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

