/** Minimum social-proof floor for registered players (never show below this). */
export const PLAYERS_PLAYING_PROOF_FLOOR = 195;

/** @deprecated Use PLAYERS_PLAYING_PROOF_FLOOR */
export const DEMO_JOINED_STUDENT_FLOOR = PLAYERS_PLAYING_PROOF_FLOOR;

/**
 * Live count when real, otherwise the floor.
 * Always at least PLAYERS_PLAYING_PROOF_FLOOR.
 */
export function resolvePlayersPlayingCount(
  raw: number | null | undefined,
  floor = PLAYERS_PLAYING_PROOF_FLOOR,
): number {
  const n = Number.isFinite(raw) ? Math.max(0, Math.floor(raw as number)) : 0;
  return Math.max(n, floor);
}

/**
 * Round down to a clean "150+" / "190+" style count.
 * Always at least the floor.
 */
export function floorJoinedStudentCount(
  raw: number,
  floor = PLAYERS_PLAYING_PROOF_FLOOR,
): number {
  const boosted = resolvePlayersPlayingCount(raw, floor);
  return Math.floor(boosted / 10) * 10;
}
