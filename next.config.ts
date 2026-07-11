import type { NextConfig } from "next";

const PRODUCTION_API =
  "https://ieltshabibv1backend-production.up.railway.app/api";
const PRODUCTION_APP_URL = "https://gamlish.com";

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
   * Production public URL fallbacks when Vercel env was only set on Preview.
   * JWT_SECRET remains optional (sync can validate via Railway API).
   */
  env:
    process.env.NODE_ENV === "production"
      ? {
          NEXT_PUBLIC_API_BASE_URL:
            process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || PRODUCTION_API,
          NEXT_PUBLIC_APP_URL:
            process.env.NEXT_PUBLIC_APP_URL?.trim() || PRODUCTION_APP_URL,
        }
      : {},
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
