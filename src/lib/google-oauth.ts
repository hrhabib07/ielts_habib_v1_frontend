/**
 * Builds the backend URL that starts the Google OAuth redirect flow.
 * Prefer NEXT_PUBLIC_API_BASE_URL so the browser hits the API host directly
 * (Google callback is registered on the API, not the Next proxy).
 */
export function getGoogleOAuthStartUrl(options?: {
  demoSessionId?: string | null;
  returnTo?: string | null;
}): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "");
  const apiBase =
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
