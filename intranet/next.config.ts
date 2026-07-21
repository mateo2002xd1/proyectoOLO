import type { NextConfig } from "next";
import path from "path";

const API_URL = process.env.API_BACKEND_URL || "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@olo/blocks-renderer"],
  turbopack: {
    root: path.resolve(process.cwd(), "..")
  },
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
