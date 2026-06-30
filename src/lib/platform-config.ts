/**
 * Product pivot: English Foundations (/player) is primary; IELTS Reading is parked.
 * Set NEXT_PUBLIC_ENABLE_READING=true to re-expose Reading in nav and marketing.
 */
export const ENABLE_READING =
  process.env.NEXT_PUBLIC_ENABLE_READING === "true";

export const PRIMARY_STUDENT_HREF = ENABLE_READING ? "/profile/reading" : "/player";

export const PRIMARY_STUDENT_LABEL = ENABLE_READING ? "Reading" : "খেলা";

export const ENGLISH_COURSE_SLUG = "english-foundations";
