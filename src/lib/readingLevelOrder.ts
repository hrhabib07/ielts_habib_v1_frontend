import type { ReadingLevelType } from "@/src/lib/api/adminReadingVersions";

/**
 * 0-based curriculum index (0 = IELTS Reading Basics / Level 0).
 * Stored `order` may be 0 (0-based) or 1+ (1-based) depending on how the level was created.
 */
export function readingLevelIndexFromOrder(order: number): number {
  if (!Number.isFinite(order)) return -1;
  return order >= 1 ? order - 1 : order;
}

export function isReadingFoundationL0(level: {
  levelType?: ReadingLevelType | string | null;
  order?: number | null;
}): boolean {
  return (
    level.levelType === "FOUNDATION" &&
    readingLevelIndexFromOrder(level.order ?? -1) === 0
  );
}

/** First SKILL curriculum level (Level 1 / free trial cap). */
export function isReadingFirstSkillL1(
  level: { levelType?: ReadingLevelType | string | null; order?: number | null },
  firstSkillOrder: number | null,
): boolean {
  return (
    level.levelType === "SKILL" &&
    firstSkillOrder != null &&
    level.order === firstSkillOrder
  );
}

export function findFirstSkillOrder(
  levels: ReadonlyArray<{ levelType?: string; order?: number }>,
): number | null {
  const skill = levels
    .filter((l) => l.levelType === "SKILL")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
  return skill?.order ?? null;
}
