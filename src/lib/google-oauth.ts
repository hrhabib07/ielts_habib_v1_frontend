/**
 * Starts Google OAuth on the same site origin.
 * Google returns to /api/backend/auth/google/callback on www.gamlish.com
 * (Vercel rewrite → API). That keeps the branded app host, not Railway.
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
  const query = params.toString();
  return `${apiBase}/auth/google${query ? `?${query}` : ""}`;
}
