import type { NextResponse } from "next/server";

/**
 * Shared auth cookie options for Next.js route handlers and middleware.
 * Attributes must match on set and clear or browsers keep stale cookies.
 */
export const AUTH_TOKEN_COOKIE = "ielts_habib_token";

export function authCookieBaseOptions(
  isProd: boolean = process.env.NODE_ENV === "production",
) {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    // Share session across apex + www so payment submit never loses auth.
    ...(isProd ? { domain: ".gamlish.com" as const } : {}),
  };
}

type ClearCookieOpts = {
  path: string;
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  domain?: string;
};

/**
 * Expire every historical cookie shape.
 * Older clients / proxied API clears left host-only www cookies that
 * Domain=.gamlish.com clears do not remove — that made logout bounce back.
 */
export function applyClearedAuthCookies(res: NextResponse): void {
  const variants: ClearCookieOpts[] = [
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      domain: ".gamlish.com",
    },
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      domain: "gamlish.com",
    },
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      domain: "www.gamlish.com",
    },
    { path: "/", httpOnly: true, sameSite: "lax", secure: true },
    { path: "/", httpOnly: true, sameSite: "lax", secure: false },
    {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      domain: ".gamlish.com",
    },
  ];

  for (const opts of variants) {
    res.cookies.set(AUTH_TOKEN_COOKIE, "", {
      ...opts,
      maxAge: 0,
      expires: new Date(0),
    });
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
