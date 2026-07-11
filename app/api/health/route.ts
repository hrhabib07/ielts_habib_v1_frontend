import { NextResponse } from "next/server";
import { getJwtSecret } from "@/src/lib/jwt-verify";
import {
  getAppOrigin,
  getServerApiBaseUrl,
  PRODUCTION_API_FALLBACK,
} from "@/src/lib/api-base-url";

/**
 * GET /api/health — deploy readiness.
 * API has a built-in Railway fallback; JWT_SECRET is optional when sync can
 * validate tokens via the backend API.
 */
export async function GET() {
  const jwtSecret = Boolean(getJwtSecret());
  const configuredApi = Boolean(
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
      process.env.API_UPSTREAM_URL?.trim(),
  );
  const apiBase = getServerApiBaseUrl();
  const appUrl = getAppOrigin();
  const appUrlConfigured = Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());

  // Site can run with API fallback + API-validated cookie sync.
  const ok = Boolean(apiBase);
  const body = {
    ok,
    service: "gamlish-frontend",
    checks: {
      JWT_SECRET: jwtSecret,
      API_BASE: Boolean(apiBase),
      API_BASE_FROM_ENV: configuredApi,
      NEXT_PUBLIC_APP_URL: appUrlConfigured,
    },
    resolved: {
      apiBase,
      appUrl,
      apiFallback: apiBase === PRODUCTION_API_FALLBACK && !configuredApi,
      authMode: jwtSecret ? "local-jwt-verify" : "api-validated-cookie",
    },
    hint: jwtSecret
      ? undefined
      : "JWT_SECRET is not set on this host. Login still works via Railway API validation. For strongest security, set JWT_SECRET on Vercel Production to match Railway, then Redeploy.",
  };

  return NextResponse.json(body, { status: 200 });
}
