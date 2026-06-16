const STORAGE_PREFIX = "gamlish-level-intro-done:";

export function isLevelIntroDismissed(levelId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(`${STORAGE_PREFIX}${levelId}`) === "1";
  } catch {
    return false;
  }
}

export function markLevelIntroDismissed(levelId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${levelId}`, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearLevelIntroDismissed(levelId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${levelId}`);
  } catch {
    /* ignore */
  }
}
