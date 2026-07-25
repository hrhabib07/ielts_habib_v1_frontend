const VISITOR_KEY = "gamlish_vid";

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

/** Stable anonymous visitor id (localStorage). */
export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing && existing.length >= 8) return existing;
    const id = uuid();
    window.localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return uuid();
  }
}

export function detectClientMeta(): {
  deviceType: string;
  browser: string;
} {
  if (typeof navigator === "undefined") {
    return { deviceType: "unknown", browser: "unknown" };
  }
  const ua = navigator.userAgent;
  const deviceType = /Mobi|Android|iPhone|iPad/i.test(ua)
    ? "mobile"
    : /Tablet|iPad/i.test(ua)
      ? "tablet"
      : "desktop";
  let browser = "other";
  if (/Edg\//.test(ua)) browser = "edge";
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = "chrome";
  else if (/Firefox\//.test(ua)) browser = "firefox";
  else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) browser = "safari";
  return { deviceType, browser };
}
