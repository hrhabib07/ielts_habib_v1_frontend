/**
 * Meta ads click IDs for CAPI match quality.
 * Persist fbclid on first landing so signup still has fbc after cookie loss.
 */

const FBCLID_KEY = "gamlish_fbclid";
const FBCLID_TS_KEY = "gamlish_fbclid_ts";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return match.slice(name.length + 1);
  }
}

function buildFbcFromFbclid(fbclid: string, tsMs: number): string {
  return `fb.1.${Math.floor(tsMs / 1000)}.${fbclid}`;
}

/** Capture ?fbclid= into localStorage (first touch). Safe to call on every page. */
export function captureMetaClickId(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get("fbclid")?.trim();
    if (!fbclid) return;
    if (localStorage.getItem(FBCLID_KEY)) return;
    localStorage.setItem(FBCLID_KEY, fbclid);
    localStorage.setItem(FBCLID_TS_KEY, String(Date.now()));
  } catch {
    /* private mode / blocked storage */
  }
}

export function readMetaFbp(): string | null {
  const fbp = readCookie("_fbp")?.trim();
  return fbp || null;
}

/**
 * Prefer Meta `_fbc` cookie; else rebuild from stored fbclid.
 */
export function readMetaFbc(): string | null {
  const cookie = readCookie("_fbc")?.trim();
  if (cookie) return cookie;
  if (typeof window === "undefined") return null;
  try {
    const fbclid = localStorage.getItem(FBCLID_KEY)?.trim();
    if (!fbclid) return null;
    const rawTs = localStorage.getItem(FBCLID_TS_KEY);
    const ts = rawTs ? Number(rawTs) : Date.now();
    return buildFbcFromFbclid(fbclid, Number.isFinite(ts) ? ts : Date.now());
  } catch {
    return null;
  }
}

export type MetaClickPayload = {
  fbp?: string;
  fbc?: string;
};

export function metaClickPayloadForAuth(): MetaClickPayload {
  captureMetaClickId();
  const fbp = readMetaFbp();
  const fbc = readMetaFbc();
  return {
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };
}
