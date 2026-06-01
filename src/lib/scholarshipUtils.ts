/** Mirrors backend tier boundaries for client-side trial countdown. */
const TIER_BOUNDARIES_HOURS = [72, 120, 168, 336] as const;
const TIER_DISCOUNTS = [60, 50, 40, 20, 0] as const;

function calculateTierPercent(elapsedHours: number): number {
  if (elapsedHours <= TIER_BOUNDARIES_HOURS[0]) return TIER_DISCOUNTS[0];
  if (elapsedHours <= TIER_BOUNDARIES_HOURS[1]) return TIER_DISCOUNTS[1];
  if (elapsedHours <= TIER_BOUNDARIES_HOURS[2]) return TIER_DISCOUNTS[2];
  if (elapsedHours <= TIER_BOUNDARIES_HOURS[3]) return TIER_DISCOUNTS[3];
  return TIER_DISCOUNTS[4];
}

export function getTierTimerFromCreatedAt(
  createdAt: string,
  nowMs: number,
): {
  currentTierPercent: number;
  nextTierPercent: number;
  remainingMs: number;
} {
  const createdMs = new Date(createdAt).getTime();
  const elapsedMs = nowMs - createdMs;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const currentTierPercent = calculateTierPercent(elapsedHours);

  if (elapsedHours > TIER_BOUNDARIES_HOURS[3]) {
    return { currentTierPercent: 0, nextTierPercent: 0, remainingMs: 0 };
  }

  let boundaryHours: number;
  let nextTierPercent: number;

  if (elapsedHours <= TIER_BOUNDARIES_HOURS[0]) {
    boundaryHours = TIER_BOUNDARIES_HOURS[0];
    nextTierPercent = TIER_DISCOUNTS[1];
  } else if (elapsedHours <= TIER_BOUNDARIES_HOURS[1]) {
    boundaryHours = TIER_BOUNDARIES_HOURS[1];
    nextTierPercent = TIER_DISCOUNTS[2];
  } else if (elapsedHours <= TIER_BOUNDARIES_HOURS[2]) {
    boundaryHours = TIER_BOUNDARIES_HOURS[2];
    nextTierPercent = TIER_DISCOUNTS[3];
  } else {
    boundaryHours = TIER_BOUNDARIES_HOURS[3];
    nextTierPercent = TIER_DISCOUNTS[4];
  }

  const boundaryMs = boundaryHours * 60 * 60 * 1000;
  return {
    currentTierPercent,
    nextTierPercent,
    remainingMs: Math.max(0, boundaryMs - elapsedMs),
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
