import { TEST_LANDING_PLAYING_NOW_FALLBACK } from "@/src/lib/test-landing-playing-now";
import type { LearnerFeedbackPublicItem } from "@/src/lib/learner-feedback";

export interface SocialProofPhoto {
  readonly src: string;
  readonly alt: string;
}

function photoFromLearner(item: {
  avatarUrl?: string | null;
  displayName?: string | null;
  username?: string | null;
}): SocialProofPhoto | null {
  const src = item.avatarUrl?.trim() ?? "";
  if (!src.startsWith("http")) return null;
  return {
    src,
    alt: item.displayName?.trim() || item.username?.trim() || "Learner",
  };
}

/** Three real learner profile photos for the proof chip (curated fallback). */
export const LEARNER_PROOF_PHOTOS: readonly SocialProofPhoto[] =
  TEST_LANDING_PLAYING_NOW_FALLBACK.map(photoFromLearner).filter(
    (photo): photo is SocialProofPhoto => photo != null,
  ).slice(0, 3);

/** @deprecated Use LEARNER_PROOF_PHOTOS. Kept for older imports. */
export const GRADUATE_PROOF_PHOTOS = LEARNER_PROOF_PHOTOS;

/** Prefer live public feedback avatars when available. */
export function pickLearnerProofPhotos(
  rows: readonly LearnerFeedbackPublicItem[],
  limit = 3,
): SocialProofPhoto[] {
  const picked: SocialProofPhoto[] = [];
  const seen = new Set<string>();

  for (const item of rows) {
    const photo = photoFromLearner(item);
    if (!photo || seen.has(photo.src)) continue;
    seen.add(photo.src);
    picked.push(photo);
    if (picked.length >= limit) break;
  }

  if (picked.length >= limit) return picked;

  for (const photo of LEARNER_PROOF_PHOTOS) {
    if (seen.has(photo.src)) continue;
    picked.push(photo);
    if (picked.length >= limit) break;
  }

  return picked.slice(0, limit);
}
