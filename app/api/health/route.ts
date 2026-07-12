import { NextResponse } from "next/server";
import { getJwtSecret } from "@/src/lib/jwt-verify";
import { getAppOrigin, getServerApiBaseUrl } from "@/src/lib/api-base-url";

/**
 * GET /api/health — deploy readiness (no secrets leaked).
 */
export async function GET() {
  const jwtConfigured = Boolean(getJwtSecret());
  const apiConfigured = Boolean(
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
      process.env.API_UPSTREAM_URL?.trim(),
  );
  const appUrlConfigured = Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());
  const apiBase = getServerApiBaseUrl();
  const appUrl = getAppOrigin();

  const body = {
    ok: true,
    service: "gamlish-frontend",
    status: jwtConfigured ? "secure" : "working_with_api_auth",
    checks: {
      apiReachableConfig: Boolean(apiBase),
      apiFromEnv: apiConfigured,
      appUrlFromEnv: appUrlConfigured,
      jwtSecretOnThisHost: jwtConfigured,
    },
    authMode: jwtConfigured ? "local-jwt-verify" : "api-validated-cookie",
    appUrl,
    note: jwtConfigured
      ? "JWT_SECRET is configured. Cookie auth uses local signature verification."
      : "Site is working. To turn jwtSecretOnThisHost=true: Vercel → Project → Settings → Environment Variables → add JWT_SECRET for Production (same value as Railway backend) → Redeploy Production.",
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
