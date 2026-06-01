/**
 * Public Railway API (no secrets). Override with NEXT_PUBLIC_API_BASE_URL in Vercel / .env.local.
 * Browser calls use `/api/backend` (same-origin proxy) so custom domains work without CORS.
 */
const PRODUCTION_API_FALLBACK =
  "https://ieltshabibv1backend-production.up.railway.app/api";

/** Same-origin BFF proxy — see app/api/backend/[...path]/route.ts */
export const BROWSER_API_PROXY_BASE = "/api/backend";

export function getServerApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
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
