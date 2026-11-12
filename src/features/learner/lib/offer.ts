import type { ChatMissionOffer } from "@/src/lib/api/chatMission";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Level 2 opens after 20 November 2026 (Dhaka): the first moment of 21 November. */
export const LEVEL_2_OPENS_AT = Date.parse("2026-11-20T18:00:00.000Z");

/** Mirrors backend `v2Offer.util.ts`: Double Duration closes at the first moment of 21 November 2026 (Dhaka). */
export const DOUBLE_DURATION_ENDS_AT = Date.parse("2026-11-20T18:00:00.000Z");
/** Mirrors backend `v2Offer.util.ts`: the Legacy Learner badge closes at the first moment of 1 January 2027 (Dhaka). */
export const LEGACY_BADGE_ENDS_AT = Date.parse("2026-12-31T18:00:00.000Z");

/** The full Person game; before payment only its first game is played, saved as `PERSON_TASTE_ID`. */
export const PERSON_GAME_ID = "level-1-playground-person";
export const PERSON_TASTE_ID = "level-1-playground-person-taste";

export function isDoubleDuration(offer: ChatMissionOffer, now: number = Date.now()): boolean {
  return offer.kind === "double" && offer.endsAt !== null && now < offer.endsAt;
}

/** A payment sent now still earns the Legacy Learner badge (until 31 December 2026, Dhaka). */
export function earnsLegacyBadge(offer: ChatMissionOffer, now: number = Date.now()): boolean {
  return isDoubleDuration(offer, now) || (offer.legacyBadgeUntil != null && now < offer.legacyBadgeUntil);
}

/** Calendar days left including today, so the last day reads as 1. */
export function offerDaysLeft(offer: ChatMissionOffer, now: number = Date.now()): number {
  if (offer.endsAt === null) return 0;
  return Math.max(0, Math.ceil((offer.endsAt - now) / DAY_MS));
}

export function isBeforeLevel2(now: number = Date.now()): boolean {
  return now < LEVEL_2_OPENS_AT;
}
