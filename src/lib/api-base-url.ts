/**
 * Public Railway API (no secrets). Set NEXT_PUBLIC_API_BASE_URL on Vercel Production.
 * Browsers always use same-origin /api/backend (Next rewrite → Railway) to avoid CORS.
 * Server Components / route handlers call Railway directly.
 */
export const PRODUCTION_API_FALLBACK =
  "https://ieltshabibv1backend-production.up.railway.app/api";

/** Same-origin browser proxy (next.config rewrites). */
export const BROWSER_API_PROXY_BASE = "/api/backend";

export function getServerApiBaseUrl(): string {
  const raw =
    process.env.API_UPSTREAM_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5050/api";
  }
  return PRODUCTION_API_FALLBACK;
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return BROWSER_API_PROXY_BASE;
  }
  return getServerApiBaseUrl();
}

/** Canonical site origin for metadata (favicon, OG). */
export function getAppOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
