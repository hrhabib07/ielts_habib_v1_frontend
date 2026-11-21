import { attributionPayloadForAuth } from "@/src/lib/api/conversionFunnel";

/**
 * Starts Google OAuth on the same site origin.
 * Google returns to /api/backend/auth/google/callback on www.gamlish.com
 * (Vercel rewrite → API). That keeps the branded app host, not Railway.
 * Also attaches first-touch UTM + Meta click ids so new Google signups
 * count under Meta Ad in the conversion funnel (same as email/phone OTP).
 */
export function getGoogleOAuthStartUrl(options?: {
  demoSessionId?: string | null;
  returnTo?: string | null;
}): string {
  const onGamlish =
    typeof window !== "undefined" &&
    (window.location.hostname === "gamlish.com" ||
      window.location.hostname === "www.gamlish.com");

  const apiBase = onGamlish
    ? "https://www.gamlish.com/api/backend"
    : process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/api/backend`
        : "http://localhost:5000/api");

  const params = new URLSearchParams();
  if (options?.demoSessionId) {
    params.set("demoSessionId", options.demoSessionId);
  }
  if (options?.returnTo) {
    params.set("returnTo", options.returnTo);
  }
  if (typeof window !== "undefined") {
    params.set("appOrigin", window.location.origin);
    try {
      const attr = attributionPayloadForAuth();
      for (const [key, value] of Object.entries(attr)) {
        if (typeof value === "string" && value.trim()) {
          params.set(key, value.trim());
        }
      }
    } catch {
      /* attribution must never block Google sign-in */
    }
  }
  const query = params.toString();
  return `${apiBase}/auth/google${query ? `?${query}` : ""}`;
}
