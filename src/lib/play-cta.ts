/**
 * Primary “start playing” CTA · Rokomari-style soft invite.
 * Use on acquisition buttons and first-play CTAs. Keep Continue / Save / Login separate.
 */
export const PLAY_A_LITTLE = {
  en: "Play a little",
  bn: "একটু খেলে দেখুন",
} as const;

export type PlayALittleLocale = keyof typeof PLAY_A_LITTLE;
