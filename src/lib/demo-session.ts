const DEMO_SESSION_KEY = "gamlish-demo-session-id";
const DEMO_CONTINUE_KEY = "gamlish-demo-continue-path";
const DEMO_STEP_KEY = "gamlish-demo-step";
const DEMO_EARNED_XP_KEY = "gamlish-demo-earned-xp";
const DEMO_WELCOME_BONUS_KEY = "gamlish-demo-welcome-bonus";
const DEMO_COMPLETED_KEY = "gamlish-demo-completed";
const DEMO_Q1_KEY = "gamlish-demo-q1-correct";
const DEMO_SAVED_AT_KEY = "gamlish-demo-saved-at";

/** Guest demo progress expires so returning visitors can play again. */
export const MISSION_ZERO_TTL_MS = 1000 * 60 * 60 * 48; // 48 hours

export type MissionZeroStep = 1 | 2 | 3 | 4;

function touchSavedAt(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_SAVED_AT_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/** Clears stale guest demo progress after TTL. Returns true if state was wiped. */
export function expireMissionZeroIfStale(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(DEMO_SAVED_AT_KEY);
    if (!raw) {
      // Legacy saves without timestamp: treat as expired so users can replay.
      const hasProgress =
        window.localStorage.getItem(DEMO_STEP_KEY) ||
        window.localStorage.getItem(DEMO_COMPLETED_KEY);
      if (hasProgress) {
        clearMissionZeroLocalState();
        return true;
      }
      return false;
    }
    const savedAt = Number(raw);
    if (!Number.isFinite(savedAt) || Date.now() - savedAt > MISSION_ZERO_TTL_MS) {
      clearMissionZeroLocalState();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function readDemoSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    expireMissionZeroIfStale();
    return window.localStorage.getItem(DEMO_SESSION_KEY);
  } catch {
    return null;
  }
}

export function writeDemoSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_SESSION_KEY, sessionId);
    touchSavedAt();
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

export function readMissionZeroStep(): MissionZeroStep {
  if (typeof window === "undefined") return 1;
  try {
    expireMissionZeroIfStale();
    const raw = Number(window.localStorage.getItem(DEMO_STEP_KEY) ?? "1");
    if (raw === 2 || raw === 3 || raw === 4) return raw;
    return 1;
  } catch {
    return 1;
  }
}

export function writeMissionZeroStep(step: MissionZeroStep): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_STEP_KEY, String(step));
    touchSavedAt();
  } catch {
    /* ignore */
  }
}

export function readMissionZeroEarnedXp(): number {
  if (typeof window === "undefined") return 0;
  try {
    expireMissionZeroIfStale();
    return Math.max(0, Number(window.localStorage.getItem(DEMO_EARNED_XP_KEY) ?? "0"));
  } catch {
    return 0;
  }
}

export function writeMissionZeroEarnedXp(xp: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_EARNED_XP_KEY, String(xp));
    touchSavedAt();
  } catch {
    /* ignore */
  }
}

export function readMissionZeroWelcomeBonus(): number {
  if (typeof window === "undefined") return 0;
  try {
    expireMissionZeroIfStale();
    return Math.max(
      0,
      Number(window.localStorage.getItem(DEMO_WELCOME_BONUS_KEY) ?? "0"),
    );
  } catch {
    return 0;
  }
}

export function writeMissionZeroWelcomeBonus(xp: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_WELCOME_BONUS_KEY, String(xp));
    touchSavedAt();
  } catch {
    /* ignore */
  }
}

export function readMissionZeroCompleted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    expireMissionZeroIfStale();
    return window.localStorage.getItem(DEMO_COMPLETED_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeMissionZeroCompleted(done: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_COMPLETED_KEY, done ? "true" : "false");
    touchSavedAt();
  } catch {
    /* ignore */
  }
}

export function readMissionZeroQ1Correct(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    expireMissionZeroIfStale();
    const v = window.localStorage.getItem(DEMO_Q1_KEY);
    if (v === "true") return true;
    if (v === "false") return false;
    return null;
  } catch {
    return null;
  }
}

export function writeMissionZeroQ1Correct(correct: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_Q1_KEY, correct ? "true" : "false");
    touchSavedAt();
  } catch {
    /* ignore */
  }
}

export function clearMissionZeroLocalState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DEMO_STEP_KEY);
    window.localStorage.removeItem(DEMO_EARNED_XP_KEY);
    window.localStorage.removeItem(DEMO_WELCOME_BONUS_KEY);
    window.localStorage.removeItem(DEMO_COMPLETED_KEY);
    window.localStorage.removeItem(DEMO_Q1_KEY);
    window.localStorage.removeItem(DEMO_SESSION_KEY);
    window.localStorage.removeItem(DEMO_CONTINUE_KEY);
    window.localStorage.removeItem(DEMO_SAVED_AT_KEY);
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
