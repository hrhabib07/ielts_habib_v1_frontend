/**
 * Product pivot: English Foundations (/player) is primary; IELTS Reading is parked.
 * Set NEXT_PUBLIC_ENABLE_READING=true to re-expose Reading in nav and marketing.
 */
export const ENABLE_READING =
  process.env.NEXT_PUBLIC_ENABLE_READING === "true";

export const PRIMARY_STUDENT_HREF = ENABLE_READING ? "/profile/reading" : "/player";

export const PRIMARY_STUDENT_LABEL = ENABLE_READING ? "Reading" : "খেলা";

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
 * Pause players after Mission 15 / Camp 03 until Camp 04 content is ready.
 * Keep in sync with backend `CONTENT_PAUSE_AFTER_MISSION_ORDER`.
 * Set false when Camp 04 is live.
 */
export const PAUSE_AFTER_MISSION_15 = true;

/** @deprecated Use PAUSE_AFTER_MISSION_15 */
export const PAUSE_AFTER_MISSION_10 = PAUSE_AFTER_MISSION_15;

export const CONTENT_PAUSE_AFTER_MISSION_ORDER = 15;
