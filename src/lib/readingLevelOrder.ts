import type { ReadingLevelType } from "@/src/lib/api/adminReadingVersions";

export const DISPLAY_LEVEL_MIN = 1;
export const DISPLAY_LEVEL_MAX = 21;
export const TOTAL_DISPLAY_LEVELS = 21;

/**
 * Student/instructor-facing level number (1–21).
 * Works whether DB `order` is 0-based (0–20) or 1-based (1–21) — same rule as zone indexing.
 * Database `order` and content codes (L0C1, etc.) stay unchanged.
 */
export function displayLevelNumberFromOrder(order: number): number {
  if (!Number.isFinite(order)) return DISPLAY_LEVEL_MIN;
  const display = readingLevelIndexFromOrder(order) + 1;
  return Math.max(DISPLAY_LEVEL_MIN, Math.min(DISPLAY_LEVEL_MAX, display));
}

export function formatDisplayLevelLabel(order: number): string {
  return `Level ${displayLevelNumberFromOrder(order)}`;
}

/** Database content code prefix (L0, L1, …) — instructor authoring only. */
export function readingLevelContentCode(order: number): string {
  return `L${readingLevelIndexFromOrder(order)}`;
}

/** Instructor list/detail: student label + DB identifiers. */
export function formatInstructorLevelSummary(order: number): string {
  return `${formatDisplayLevelLabel(order)} · DB order ${order} · ${readingLevelContentCode(order)}`;
}

/** Shown on instructor screens — DB codes differ from student-facing 1–21 labels. */
export const INSTRUCTOR_DB_LEVEL_CODE_HINT =
  "Students see Levels 1–21. Database order and content codes (e.g. order 0, L0C1) are unchanged — use those when authoring.";

/**
 * 0-based curriculum index (0 = foundation). Internal progression only — not student labels.
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

/** Level 5 — Vocabulary / Paraphrase Engine (progressive context MCQ). */
export function isReadingVocabularyL5(level: {
  levelType?: string | null;
  order?: number | null;
}): boolean {
  return readingLevelIndexFromOrder(level.order ?? -1) === 5;
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
