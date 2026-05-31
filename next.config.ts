import type { NextConfig } from "next";

/** Browser uses same-origin `/api`; Next.js proxies to the Spring Boot backend. */
const apiProxyTarget =
  process.env.API_PROXY_TARGET ?? "http://localhost:8080/api";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
