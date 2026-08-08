/** Minimum social-proof floor for demo save (never show below this). */
export const DEMO_JOINED_STUDENT_FLOOR = 150;

/**
 * Round down to a clean "150+" / "160+" style count.
 * Always at least DEMO_JOINED_STUDENT_FLOOR.
 */
export function floorJoinedStudentCount(
  raw: number,
  floor = DEMO_JOINED_STUDENT_FLOOR,
): number {
  const n = Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
  const boosted = Math.max(n, floor);
  return Math.floor(boosted / 10) * 10;
}
