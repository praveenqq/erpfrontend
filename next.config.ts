import type { NextConfig } from "next";

/** Browser uses same-origin `/api`; Next.js proxies to the Spring Boot backend. */
/** Use 127.0.0.1 to avoid Node resolving localhost to ::1 while Spring listens on IPv4. */
const apiProxyTarget =
  process.env.API_PROXY_TARGET ?? "http://127.0.0.1:8080/api";

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
