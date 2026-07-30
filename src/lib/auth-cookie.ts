import type { NextResponse } from "next/server";

/**
 * Shared auth cookie options for Next.js route handlers and middleware.
 * Attributes must match on set and clear or browsers keep stale cookies.
 */
export const AUTH_TOKEN_COOKIE = "ielts_habib_token";

/** Short-lived flag so middleware/RSC ignore leftover JWT after logout. */
export const FORCE_LOGOUT_COOKIE = "gamlish_force_logout";

export function authCookieBaseOptions(
  isProd: boolean = process.env.NODE_ENV === "production",
) {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    ...(isProd ? { domain: ".gamlish.com" as const } : {}),
  };
}

function buildExpireSetCookie(
  name: string,
  opts: {
    secure: boolean;
    domain?: string;
  },
): string {
  const parts = [
    `${name}=`,
    "Path=/",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (opts.secure) parts.push("Secure");
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  return parts.join("; ");
}

/**
 * Expire every historical cookie shape via headers.append.
 * NextResponse.cookies.set() keeps only one cookie per name.
 */
export function applyClearedAuthCookies(res: NextResponse): void {
  const expires: Array<{ secure: boolean; domain?: string }> = [
    { secure: true, domain: ".gamlish.com" },
    { secure: true, domain: "gamlish.com" },
    { secure: true, domain: "www.gamlish.com" },
    { secure: true },
    { secure: false },
    { secure: false, domain: ".gamlish.com" },
  ];

  for (const opts of expires) {
    res.headers.append(
      "Set-Cookie",
      buildExpireSetCookie(AUTH_TOKEN_COOKIE, opts),
    );
  }
}

/** Ignore leftover JWT briefly after logout (loop breaker). Do not refresh on every request. */
export function applyForceLogoutCookie(res: NextResponse): void {
  const maxAge = 90;
  const isProd = process.env.NODE_ENV === "production";
  const base = `Path=/; Max-Age=${String(maxAge)}; HttpOnly; SameSite=Lax`;
  const common = isProd ? `${base}; Secure` : base;
  if (isProd) {
    res.headers.append(
      "Set-Cookie",
      `${FORCE_LOGOUT_COOKIE}=1; ${common}; Domain=.gamlish.com`,
    );
  }
  res.headers.append("Set-Cookie", `${FORCE_LOGOUT_COOKIE}=1; ${common}`);
}

export function applyClearedForceLogoutCookie(res: NextResponse): void {
  for (const domain of [".gamlish.com", undefined] as const) {
    res.headers.append(
      "Set-Cookie",
      buildExpireSetCookie(FORCE_LOGOUT_COOKIE, {
        secure: true,
        domain,
      }),
    );
  }
  // Also clear non-secure variants (local / mixed).
  for (const domain of [".gamlish.com", undefined] as const) {
    res.headers.append(
      "Set-Cookie",
      buildExpireSetCookie(FORCE_LOGOUT_COOKIE, {
        secure: false,
        domain,
      }),
    );
  }
}

/** Remaining JWT lifetime in seconds (min 60). Falls back to 7 days. Edge-safe. */
export function cookieMaxAgeFromJwt(token: string): number {
  const fallback = 60 * 60 * 24 * 7;
  try {
    const part = token.split(".")[1];
    if (!part) return fallback;
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const json = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof json.exp !== "number") return fallback;
    return Math.max(60, json.exp - Math.floor(Date.now() / 1000));
  } catch {
    return fallback;
  }
}
