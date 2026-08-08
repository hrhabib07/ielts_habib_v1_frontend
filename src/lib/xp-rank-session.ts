/** Session helpers for XP rank climb celebrations (post-mission only). */

const BASELINE_KEY = "gamlish_xp_rank_baseline";

export function rememberXpRankBaseline(rank: number): void {
  if (!Number.isFinite(rank) || rank < 1) return;
  try {
    sessionStorage.setItem(BASELINE_KEY, String(Math.floor(rank)));
  } catch {
    /* ignore */
  }
}

export function readXpRankBaseline(): number | null {
  try {
    const raw = sessionStorage.getItem(BASELINE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : null;
  } catch {
    return null;
  }
}

/**
 * After XP is awarded, compare to baseline.
 * Returns a climb only when rank number went down (better).
 * Always refreshes the baseline to the new rank.
 */
export function consumeXpRankClimb(newRank: number): {
  from: number;
  to: number;
} | null {
  if (!Number.isFinite(newRank) || newRank < 1) return null;
  const to = Math.floor(newRank);
  const from = readXpRankBaseline();
  rememberXpRankBaseline(to);
  if (from == null || to >= from) return null;
  return { from, to };
}
