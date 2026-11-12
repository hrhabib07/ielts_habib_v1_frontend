/**
 * Product pivot: English Foundations (/player) is primary; IELTS Reading is parked.
 * Set NEXT_PUBLIC_ENABLE_READING=true to re-expose Reading in nav and marketing.
 */
export const ENABLE_READING =
  process.env.NEXT_PUBLIC_ENABLE_READING === "true";

/**
 * XP totals, ranks and leaderboards from the old missions are hidden until old and new XP are merged.
 * Set NEXT_PUBLIC_SHOW_XP_LEADERBOARD=true to show them again. In-game XP for the current play is unaffected.
 */
export const SHOW_XP_LEADERBOARD =
  process.env.NEXT_PUBLIC_SHOW_XP_LEADERBOARD === "true";

export const PRIMARY_STUDENT_HREF = ENABLE_READING ? "/profile/reading" : "/player";

export const PRIMARY_STUDENT_LABEL = ENABLE_READING ? "Reading" : "খেলা";

/** The free guest playground (Subject games). Signed-in learners are sent on to Mission 1 from there. */
export const FREE_PLAY_HREF = "/play";

export const ENGLISH_COURSE_SLUG = "english-foundations";

/**
 * Guest landing social proof under the primary CTA
 * ("X+ players already on their first mission").
 * Hidden while counts are low. Flip to true to show again.
 */
export const SHOW_GUEST_DEMO_SOCIAL_PROOF = false;

/**
 * Right-side hero visual:
 * true  = Magic Translate cinema (Bangla thought → English reveal)
 * false = legacy mission progress card (instant rollback)
 */
export const USE_HERO_TRANSLATE_CINEMA = true;

/**
 * Pause players after a camp while the next camp is still being built.
 * Keep in sync with backend `IS_CONTENT_PAUSE_ACTIVE`.
 * Camp 04 (Missions 16-21) is live, so this stays off.
 */
export const PAUSE_AFTER_MISSION_15 = false;

/** @deprecated Use PAUSE_AFTER_MISSION_15 */
export const PAUSE_AFTER_MISSION_10 = PAUSE_AFTER_MISSION_15;

export const CONTENT_PAUSE_AFTER_MISSION_ORDER = 15;
