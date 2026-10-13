import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy all /api calls to the backend Express server on port 5000
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
