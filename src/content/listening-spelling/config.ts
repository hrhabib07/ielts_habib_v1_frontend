/** Tunable defaults for IELTS Listening Spelling Trainer. */

export const STORAGE_KEY = "gamlish.ls.v1";
export const STORAGE_VERSION = 1;

export const GAMLISH_URL = "https://gamlish.com";

export const PRACTICE_HOLD_SECONDS = 0;
export const EXAM_HOLD_SECONDS = 3;
export const PLAYS_PRACTICE = Number.POSITIVE_INFINITY;
export const PLAYS_EXAM = 1;

export const SESSION_SIZE = 10;
export const MAX_DUE_REVIEWS = 4;
export const MAX_RETRY_ROUND = 3;
export const REQUEUE_OFFSET = 3;

/** Unreviewed stub words stay out of sessions unless flipped for content QA. */
export const INCLUDE_UNREVIEWED = false;

export const BOX_INTERVALS_MS = [
  0,
  1 * 24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
] as const;

export const PACK_META = {
  days: { en: "Days & Dates", bn: "দিন ও তারিখ" },
  home: { en: "Accommodation", bn: "আবাসন" },
  money: { en: "Money", bn: "টাকা ও ফি" },
  uni: { en: "University", bn: "বিশ্ববিদ্যালয়" },
  jobs: { en: "Jobs", bn: "চাকরি" },
  health: { en: "Health", bn: "স্বাস্থ্য" },
  spellaloud: { en: "Names & Numbers", bn: "নাম ও সংখ্যা" },
} as const;

export type PackId = keyof typeof PACK_META;
