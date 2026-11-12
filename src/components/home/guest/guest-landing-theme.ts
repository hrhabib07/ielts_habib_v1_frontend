/**
 * Landing color roles (must match logo and the game): navy for every button and action, sky blue
 * for highlights only (eyebrows, accent words, chips). Gold is reserved for reward moments
 * (XP, streak, badges). Hero Mission CTA adds `.test-landing-cta-invite` for the press effect.
 */
export const LANDING_CTA_CLASS =
  "border-b-4 border-primary bg-accent text-white shadow-[0_10px_22px_-12px_rgba(30,58,138,0.6)] transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-px hover:bg-accent/90 active:translate-y-0.5 active:border-b-2 active:shadow-[0_2px_8px_-4px_rgba(15,23,42,0.35)]";

/** Nav CTA on conversion landings: visible but quieter than the hero CTA. */
export const LANDING_NAV_SECONDARY_CTA_CLASS =
  "border border-sky-500/40 bg-sky-50 text-sky-700 transition-colors duration-200 hover:border-sky-500/60 hover:bg-sky-100 hover:text-sky-800 active:scale-[0.985] dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-100 dark:hover:bg-sky-400/20";

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
