/**
 * Public Railway API (no secrets). Override with NEXT_PUBLIC_API_BASE_URL in Vercel / .env.local.
 */
const PRODUCTION_API_FALLBACK =
  "https://ieltshabibv1backend-production.up.railway.app/api";

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5050/api";
  }
  return PRODUCTION_API_FALLBACK;
}

/** Canonical site origin for metadata (favicon, OG). */
export function getAppOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
