import type { LearnerFeedbackPublicItem } from "@/src/lib/learner-feedback";
import { TEST_LANDING_GRADUATES } from "@/src/lib/test-landing-graduates";

export const TEST_LANDING_PLAYING_NOW_LIMIT = 6;

const FEATURED_GRADUATE_HANDLES = new Set(
  TEST_LANDING_GRADUATES.map((graduate) => graduate.username.trim().toLowerCase()),
);

const FEATURED_GRADUATE_NAMES = new Set(
  TEST_LANDING_GRADUATES.map((graduate) => normalizeName(graduate.fullName)),
);

/** Curated order from live feedback · graduates already on the cards stay out. */
export const TEST_LANDING_PLAYING_NOW_HANDLES = [
  "mamun_raj_bd",
  "aymanashiq",
  "nayeem",
  "muhitchoudhury",
  "sajid_islam_o",
  "taspia_zafrin",
  "sulaiman_aziz",
] as const;

function normalizeHandle(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function normalizeName(value?: string | null): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function itemHandle(item: LearnerFeedbackPublicItem): string {
  return normalizeHandle(item.username || item.profileHandle);
}

export function isFeaturedGraduateFeedback(item: LearnerFeedbackPublicItem): boolean {
  const handle = itemHandle(item);
  if (handle && FEATURED_GRADUATE_HANDLES.has(handle)) return true;
  return FEATURED_GRADUATE_NAMES.has(normalizeName(item.displayName));
}

function qualityScore(item: LearnerFeedbackPublicItem): number {
  const body = item.body.trim().length;
  let score = 0;
  if (item.rating >= 5) score += 40;
  else score += item.rating * 6;
  if (body >= 60 && body <= 280) score += 24;
  else if (body >= 40) score += 12;
  if (item.avatarUrl?.startsWith("http")) score += 16;
  const missions = item.missionsCompleted ?? item.highestCompletedMissionOrder ?? 0;
  if (missions >= 3 && missions < 21) score += 10;
  else if (missions >= 21) score += 6;
  return score;
}

export function selectPlayingNowStories(
  rows: readonly LearnerFeedbackPublicItem[],
  limit = TEST_LANDING_PLAYING_NOW_LIMIT,
): LearnerFeedbackPublicItem[] {
  const eligible = rows.filter(
    (item) => item.body.trim().length >= 24 && !isFeaturedGraduateFeedback(item),
  );
  const byHandle = new Map(
    eligible.map((item) => [itemHandle(item), item] as const),
  );

  const selected: LearnerFeedbackPublicItem[] = [];
  const seen = new Set<string>();

  const push = (item: LearnerFeedbackPublicItem | undefined) => {
    if (!item || selected.length >= limit) return;
    const key = item.id || itemHandle(item) || item.displayName;
    if (seen.has(key)) return;
    seen.add(key);
    selected.push(item);
  };

  for (const handle of TEST_LANDING_PLAYING_NOW_HANDLES) {
    push(byHandle.get(handle));
  }

  const rest = eligible
    .filter((item) => !seen.has(item.id || itemHandle(item) || item.displayName))
    .sort((a, b) => qualityScore(b) - qualityScore(a));

  for (const item of rest) push(item);

  return selected.slice(0, limit);
}
