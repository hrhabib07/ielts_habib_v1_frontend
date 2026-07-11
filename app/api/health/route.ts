import { NextResponse } from "next/server";

/**
 * GET /api/health — deploy readiness for Vercel.
 * Does not call Mongo; checks critical env for auth + API proxy.
 */
export async function GET() {
  const jwtSecret = Boolean(process.env.JWT_SECRET?.trim());
  const apiBase = Boolean(
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
      process.env.API_UPSTREAM_URL?.trim(),
  );
  const appUrl = Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());

  const ok = jwtSecret && apiBase;
  const body = {
    ok,
    service: "gamlish-frontend",
    checks: {
      JWT_SECRET: jwtSecret,
      API_BASE: apiBase,
      NEXT_PUBLIC_APP_URL: appUrl,
    },
    hint: ok
      ? undefined
      : "Set JWT_SECRET (must match Railway) and NEXT_PUBLIC_API_BASE_URL (.../api) on Vercel Production, then redeploy.",
  };

  return NextResponse.json(body, { status: ok ? 200 : 503 });
}
