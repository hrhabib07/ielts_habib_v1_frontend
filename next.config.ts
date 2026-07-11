import type { NextConfig } from "next";

const PRODUCTION_API =
  "https://ieltshabibv1backend-production.up.railway.app/api";

function resolveUpstreamApiBase(): string {
  const raw =
    process.env.API_UPSTREAM_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5050/api";
  }
  return PRODUCTION_API;
}

const apiBase = resolveUpstreamApiBase();
const apiOrigin = apiBase.replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  /**
   * Same-origin proxy for browser API calls in all environments.
   * Avoids cross-origin CORS breakage between Vercel and Railway after login.
   */
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/api/backend/health", destination: `${apiOrigin}/health` },
        { source: "/api/backend/:path*", destination: `${apiBase}/:path*` },
      ],
    };
  },
  async redirects() {
    return [
      {
        source: "/score-guarantee",
        destination: "/",
        permanent: true,
      },
      {
        source: "/profile/score-guarantee",
        destination: "/profile",
        permanent: true,
      },
      {
        source: "/how-it-works",
        destination: "/#how-gamlish-works",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
