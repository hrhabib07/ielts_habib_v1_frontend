/**
 * Landing color roles (must match logo: cool blue, navy base).
 * Gold is reserved for reward moments only (XP, streak, badges).
 * Hero Mission CTA adds `.test-landing-cta-invite` for the richer animated fill.
 */
export const LANDING_CTA_CLASS =
  "bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 text-white shadow-[0_8px_18px_-10px_rgba(15,23,42,0.35)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:shadow-[0_10px_20px_-10px_rgba(15,23,42,0.4)] active:translate-y-px active:scale-[0.985] active:shadow-[0_2px_8px_-4px_rgba(15,23,42,0.35)]";

export const LANDING_EYEBROW_CLASS =
  "inline-flex items-center rounded-full border border-sky-500/35 bg-sky-500/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-sky-900 dark:border-sky-400/40 dark:bg-sky-400/15 dark:text-sky-100";

export const LANDING_HIGHLIGHT_CLASS =
  "font-extrabold text-sky-700 dark:text-sky-300";

/** Hero accent word: static brand blue (game / English). */
export const LANDING_ACCENT_WORD_CLASS =
  "font-extrabold text-sky-600 dark:text-sky-300";

export const LANDING_LINK_CLASS =
  "font-semibold text-sky-800 transition-colors hover:bg-sky-500/10 dark:text-sky-200";

/** Reward-only gold  -  XP, streak, trophy pops. */
export const LANDING_REWARD_PILL_CLASS =
  "inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-black text-amber-950 shadow-lg shadow-amber-500/30";
