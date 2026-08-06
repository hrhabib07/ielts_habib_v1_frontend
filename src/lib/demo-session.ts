export type DemoProgressNs =
  | "gamlish-demo"
  | "gamlish-demo-tps"
  | "gamlish-demo-tps-a";

const DEFAULT_NS: DemoProgressNs = "gamlish-demo";

function key(ns: DemoProgressNs, suffix: string): string {
  return `${ns}-${suffix}`;
}

/** Guest demo progress expires so returning visitors can play again. */
export const MISSION_ZERO_TTL_MS = 1000 * 60 * 60 * 48; // 48 hours

export type MissionZeroStep = 1 | 2 | 3 | 4;

function touchSavedAt(ns: DemoProgressNs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(ns, "saved-at"), String(Date.now()));
  } catch {
    /* ignore */
  }
}

/** Clears stale guest demo progress after TTL. Returns true if state was wiped. */
export function expireMissionZeroIfStale(
  ns: DemoProgressNs = DEFAULT_NS,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(key(ns, "saved-at"));
    if (!raw) {
      // Legacy saves without timestamp: treat as expired so users can replay.
      const hasProgress =
        window.localStorage.getItem(key(ns, "step")) ||
        window.localStorage.getItem(key(ns, "completed"));
      if (hasProgress) {
        clearMissionZeroLocalState(ns);
        return true;
      }
      return false;
    }
    const savedAt = Number(raw);
    if (!Number.isFinite(savedAt) || Date.now() - savedAt > MISSION_ZERO_TTL_MS) {
      clearMissionZeroLocalState(ns);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function readDemoSessionId(
  ns: DemoProgressNs = DEFAULT_NS,
): string | null {
  if (typeof window === "undefined") return null;
  try {
    expireMissionZeroIfStale(ns);
    return window.localStorage.getItem(key(ns, "session-id"));
  } catch {
    return null;
  }
}

export function writeDemoSessionId(
  sessionId: string,
  ns: DemoProgressNs = DEFAULT_NS,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(ns, "session-id"), sessionId);
    touchSavedAt(ns);
  } catch {
    /* ignore */
  }
}

export function clearDemoSessionId(ns: DemoProgressNs = DEFAULT_NS): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(ns, "session-id"));
  } catch {
    /* ignore */
  }
}

export function writeDemoContinuePath(
  path: string,
  ns: DemoProgressNs = DEFAULT_NS,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(ns, "continue-path"), path);
  } catch {
    /* ignore */
  }
}

export function consumeDemoContinuePath(
  ns: DemoProgressNs = DEFAULT_NS,
): string | null {
  if (typeof window === "undefined") return null;
  try {
    const path = window.localStorage.getItem(key(ns, "continue-path"));
    window.localStorage.removeItem(key(ns, "continue-path"));
    return path;
  } catch {
    return null;
  }
}

export function readMissionZeroStep(
  ns: DemoProgressNs = DEFAULT_NS,
): MissionZeroStep {
  if (typeof window === "undefined") return 1;
  try {
    expireMissionZeroIfStale(ns);
    const raw = Number(window.localStorage.getItem(key(ns, "step")) ?? "1");
    if (raw === 2 || raw === 3 || raw === 4) return raw;
    return 1;
  } catch {
    return 1;
  }
}

export function writeMissionZeroStep(
  step: MissionZeroStep,
  ns: DemoProgressNs = DEFAULT_NS,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(ns, "step"), String(step));
    touchSavedAt(ns);
  } catch {
    /* ignore */
  }
}

export function readMissionZeroEarnedXp(
  ns: DemoProgressNs = DEFAULT_NS,
): number {
  if (typeof window === "undefined") return 0;
  try {
    expireMissionZeroIfStale(ns);
    return Math.max(0, Number(window.localStorage.getItem(key(ns, "earned-xp")) ?? "0"));
  } catch {
    return 0;
  }
}

export function writeMissionZeroEarnedXp(
  xp: number,
  ns: DemoProgressNs = DEFAULT_NS,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(ns, "earned-xp"), String(xp));
    touchSavedAt(ns);
  } catch {
    /* ignore */
  }
}

export function readMissionZeroWelcomeBonus(
  ns: DemoProgressNs = DEFAULT_NS,
): number {
  if (typeof window === "undefined") return 0;
  try {
    expireMissionZeroIfStale(ns);
    return Math.max(
      0,
      Number(window.localStorage.getItem(key(ns, "welcome-bonus")) ?? "0"),
    );
  } catch {
    return 0;
  }
}

export function writeMissionZeroWelcomeBonus(
  xp: number,
  ns: DemoProgressNs = DEFAULT_NS,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(ns, "welcome-bonus"), String(xp));
    touchSavedAt(ns);
  } catch {
    /* ignore */
  }
}

export function readMissionZeroCompleted(
  ns: DemoProgressNs = DEFAULT_NS,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    expireMissionZeroIfStale(ns);
    return window.localStorage.getItem(key(ns, "completed")) === "true";
  } catch {
    return false;
  }
}

export function writeMissionZeroCompleted(
  done: boolean,
  ns: DemoProgressNs = DEFAULT_NS,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(ns, "completed"), done ? "true" : "false");
    touchSavedAt(ns);
  } catch {
    /* ignore */
  }
}

export function readMissionZeroQ1Correct(
  ns: DemoProgressNs = DEFAULT_NS,
): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    expireMissionZeroIfStale(ns);
    const v = window.localStorage.getItem(key(ns, "q1-correct"));
    if (v === "true") return true;
    if (v === "false") return false;
    return null;
  } catch {
    return null;
  }
}

export function writeMissionZeroQ1Correct(
  correct: boolean,
  ns: DemoProgressNs = DEFAULT_NS,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(ns, "q1-correct"), correct ? "true" : "false");
    touchSavedAt(ns);
  } catch {
    /* ignore */
  }
}

export function clearMissionZeroLocalState(
  ns: DemoProgressNs = DEFAULT_NS,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(ns, "step"));
    window.localStorage.removeItem(key(ns, "earned-xp"));
    window.localStorage.removeItem(key(ns, "welcome-bonus"));
    window.localStorage.removeItem(key(ns, "completed"));
    window.localStorage.removeItem(key(ns, "q1-correct"));
    window.localStorage.removeItem(key(ns, "session-id"));
    window.localStorage.removeItem(key(ns, "continue-path"));
    window.localStorage.removeItem(key(ns, "saved-at"));
  } catch {
    /* ignore */
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
