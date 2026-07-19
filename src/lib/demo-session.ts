const DEMO_SESSION_KEY = "gamlish-demo-session-id";
const DEMO_CONTINUE_KEY = "gamlish-demo-continue-path";

export function readDemoSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(DEMO_SESSION_KEY);
  } catch {
    return null;
  }
}

export function writeDemoSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_SESSION_KEY, sessionId);
  } catch {
    /* ignore */
  }
}

export function clearDemoSessionId(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function writeDemoContinuePath(path: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_CONTINUE_KEY, path);
  } catch {
    /* ignore */
  }
}

export function consumeDemoContinuePath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const path = window.localStorage.getItem(DEMO_CONTINUE_KEY);
    window.localStorage.removeItem(DEMO_CONTINUE_KEY);
    return path;
  } catch {
    return null;
  }
}

export function detectDemoClientMeta(): {
  deviceType: string;
  browser: string;
} {
  if (typeof navigator === "undefined") {
    return { deviceType: "unknown", browser: "unknown" };
  }
  const ua = navigator.userAgent;
  const deviceType = /Mobi|Android/i.test(ua)
    ? "mobile"
    : /Tablet|iPad/i.test(ua)
      ? "tablet"
      : "desktop";
  let browser = "other";
  if (ua.includes("Edg/")) browser = "edge";
  else if (ua.includes("Chrome/")) browser = "chrome";
  else if (ua.includes("Firefox/")) browser = "firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "safari";
  return { deviceType, browser };
}
