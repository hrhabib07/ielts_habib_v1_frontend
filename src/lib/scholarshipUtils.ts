import { FOUNDING_MEMBER_CUTOFF } from "./foundingMember";

/** Mirrors backend — 60% Founder scholarship for first 24 hours (ends 1 Aug 2026). */
export const SCHOLARSHIP_WINDOW_HOURS = 24;
export const FOUNDER_SCHOLARSHIP_PERCENT = 60;

/** @deprecated Use SCHOLARSHIP_WINDOW_HOURS */
export const SCHOLARSHIP_PHASE_HOURS = SCHOLARSHIP_WINDOW_HOURS;

/** @deprecated Single-tier window only */
export const SCHOLARSHIP_PHASE_DISCOUNTS = [FOUNDER_SCHOLARSHIP_PERCENT] as const;

export function getDecayStateFromStartTime(
  scholarshipStartTime: string,
  nowMs: number,
): {
  currentTierPercent: number;
  nextTierPercent: number;
  remainingMs: number;
  isFullyExpired: boolean;
} {
  const startMs = new Date(scholarshipStartTime).getTime();
  const signupWindowEndMs = startMs + SCHOLARSHIP_WINDOW_HOURS * 60 * 60 * 1000;
  const windowEndMs = Math.min(
    signupWindowEndMs,
    FOUNDING_MEMBER_CUTOFF.getTime(),
  );
  const remainingMs = Math.max(0, windowEndMs - nowMs);
  const isFullyExpired = remainingMs <= 0;

  if (isFullyExpired) {
    return {
      currentTierPercent: 0,
      nextTierPercent: 0,
      remainingMs: 0,
      isFullyExpired: true,
    };
  }

  return {
    currentTierPercent: FOUNDER_SCHOLARSHIP_PERCENT,
    nextTierPercent: 0,
    remainingMs,
    isFullyExpired: false,
  };
}

/** @deprecated Use getDecayStateFromStartTime with scholarshipStartTime. */
export function getTierTimerFromCreatedAt(
  createdAt: string,
  nowMs: number,
): {
  currentTierPercent: number;
  nextTierPercent: number;
  remainingMs: number;
} {
  const decay = getDecayStateFromStartTime(createdAt, nowMs);
  return {
    currentTierPercent: decay.currentTierPercent,
    nextTierPercent: decay.nextTierPercent,
    remainingMs: decay.remainingMs,
  };
}

export function formatCountdownMs(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function estimateBandFromAccuracy(accuracyPercent: number): number {
  const bands = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9] as const;
  const idx = Math.min(
    bands.length - 1,
    Math.max(0, Math.floor(accuracyPercent / 10)),
  );
  return bands[idx] ?? 4;
}
