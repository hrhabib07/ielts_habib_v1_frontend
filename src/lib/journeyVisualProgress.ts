/**
 * Journey progress visuals — bars, water fill, and plane position use the true
 * passed-level percentage (no perceptual inflation).
 */

export function journeyPointsToPercent(
  earned: number,
  max: number,
): number {
  if (max <= 0 || earned <= 0) return 0;
  return Math.min(100, Math.max(0, (earned / max) * 100));
}

export function formatJourneyProgressLabel(actualPct: number): string {
  const p = Math.min(100, Math.max(0, actualPct));
  if (p <= 0) return "0%";
  if (p < 10) {
    const rounded = Math.round(p * 10) / 10;
    return Number.isInteger(rounded) ? `${rounded}%` : `${rounded.toFixed(1)}%`;
  }
  return `${Math.round(p)}%`;
}

/** True journey % (0–100) for progress bars and plane position. */
export function journeyToVisualProgressPercent(actualPct: number): number {
  const p = Math.min(100, Math.max(0, actualPct));
  if (p <= 0) return 0;
  return Math.round(p * 10) / 10;
}

/**
 * Band-score water fill — slightly eased so low % (e.g. 10%) reads clearly on tall
 * glyphs without inflating bars/plane. 10% actual ≈ 20% water; 100% stays 100%.
 */
export function journeyToWaterFillPercent(actualPct: number): number {
  const p = Math.min(100, Math.max(0, actualPct));
  if (p <= 0) return 0;
  if (p >= 100) return 100;
  const curved = Math.pow(p / 100, 0.68) * 100;
  return Math.round(curved * 10) / 10;
}

export interface JourneyProgressSource {
  journeyEarnedPoints?: number | null;
  journeyMaxPoints?: number | null;
  overallProgressPct?: number | null;
  masteredLevelCount?: number | null;
  passedLevelCount?: number | null;
  totalLevels?: number | null;
}

export interface ResolvedJourneyProgress {
  /** Passed-level % (0–100). */
  actualPct: number;
  /** Same as actualPct — kept for callers that expect a separate visual field. */
  visualPct: number;
  label: string;
  earnedPoints: number | null;
  maxPoints: number | null;
  masteredLevelCount: number;
}

export function resolveJourneyProgress(
  source: JourneyProgressSource,
): ResolvedJourneyProgress {
  const totalLevels = source.totalLevels ?? 21;
  const passed = source.passedLevelCount;
  const mastered = source.masteredLevelCount;

  let actualPct: number;
  if (passed != null && totalLevels > 0) {
    actualPct = Math.round((passed / totalLevels) * 100);
  } else if (mastered != null && totalLevels > 0) {
    actualPct = Math.round((mastered / totalLevels) * 100);
  } else {
    actualPct = Math.min(100, Math.max(0, source.overallProgressPct ?? 0));
  }

  const earned = source.journeyEarnedPoints;
  const max = source.journeyMaxPoints;
  const visualPct = journeyToVisualProgressPercent(actualPct);

  return {
    actualPct,
    visualPct,
    label: formatJourneyProgressLabel(actualPct),
    earnedPoints: earned ?? null,
    maxPoints: max ?? null,
    masteredLevelCount: passed ?? mastered ?? 0,
  };
}

export function journeyProgressBarStyle(actualPct: number): {
  width: string;
} {
  const p = journeyToVisualProgressPercent(actualPct);
  if (p <= 0) return { width: "0%" };
  return { width: `${p}%` };
}

/** @deprecated Use journeyToWaterFillPercent */
export function journeyToVisualWaterPercent(journeyPct: number): number {
  return journeyToWaterFillPercent(journeyPct);
}
