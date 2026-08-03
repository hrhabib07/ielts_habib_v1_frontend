/**
 * Player preference: auto-advance after a correct answer.
 * Default ON (matches current product behavior). Wrong answers always wait for Continue.
 */
export const AUTO_ADVANCE_CORRECT_STORAGE_KEY =
  "gamlish.player.autoAdvanceCorrect";

export const AUTO_ADVANCE_CORRECT_CHANGE_EVENT =
  "gamlish-auto-advance-correct-change";

/** Default: true · short auto-advance after correct answers. */
export function readAutoAdvanceCorrect(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(AUTO_ADVANCE_CORRECT_STORAGE_KEY);
    if (raw === null) return true;
    return raw !== "0" && raw !== "false";
  } catch {
    return true;
  }
}

export function writeAutoAdvanceCorrect(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      AUTO_ADVANCE_CORRECT_STORAGE_KEY,
      enabled ? "1" : "0",
    );
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(
    new CustomEvent(AUTO_ADVANCE_CORRECT_CHANGE_EVENT, { detail: enabled }),
  );
}
