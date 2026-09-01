/**
 * Builds the backend URL that starts the Google OAuth redirect flow.
 * On gamlish.com always start at api.gamlish.com so the browser, Google
 * consent screen, and GOOGLE_REDIRECT_URI share one API host.
 */
const PRODUCTION_GOOGLE_API_BASE = "https://api.gamlish.com/api";

function isGamlishHost(host: string): boolean {
  return host === "gamlish.com" || host === "www.gamlish.com";
}

export function getGoogleOAuthStartUrl(options?: {
  demoSessionId?: string | null;
  returnTo?: string | null;
}): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");
  const onGamlish =
    typeof window !== "undefined" && isGamlishHost(window.location.hostname);
  const apiBase =
    (onGamlish ? PRODUCTION_GOOGLE_API_BASE : null) ||
    fromEnv ||
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
