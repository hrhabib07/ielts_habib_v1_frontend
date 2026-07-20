export type UiLocale = "en" | "bn";

export const UI_LOCALE_STORAGE_KEY = "gamlish-ui-locale";

const BN_DIGIT_CHARS = "০১২৩৪৫৬৭৮৯";
const LATIN_DIGIT_CHARS = "0123456789";

/** Product default is always Bengali. Browser language is ignored. */
export function detectBrowserUiLocale(): UiLocale {
  return "bn";
}

export function readStoredUiLocale(): UiLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    if (raw === "bn" || raw === "en") return raw;
    const legacyGuest = window.localStorage.getItem("gamlish-guest-landing-locale");
    if (legacyGuest === "bn" || legacyGuest === "en") return legacyGuest;
    const legacyFaq = window.localStorage.getItem("gamlish-pricing-faq-locale");
    if (legacyFaq === "bn" || legacyFaq === "en") return legacyFaq;
    return null;
  } catch {
    return null;
  }
}

export function writeStoredUiLocale(locale: UiLocale): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(UI_LOCALE_STORAGE_KEY, locale);
    // Keep legacy keys in sync so older toggles stay consistent.
    window.localStorage.setItem("gamlish-guest-landing-locale", locale);
    window.localStorage.setItem("gamlish-pricing-faq-locale", locale);
  } catch {
    /* ignore */
  }
}

/** Explicit choice wins; otherwise Bengali. */
export function resolveInitialUiLocale(): UiLocale {
  return readStoredUiLocale() ?? "bn";
}

/**
 * Force Western (Latin) digits — Hind Siliguri’s Bengali ১ is a hairline
 * stroke that nearly disappears on muted/dark UI.
 */
export function toLatinDigits(value: string | number): string {
  const text = String(value);
  let out = "";
  for (const ch of text) {
    const idx = BN_DIGIT_CHARS.indexOf(ch);
    out += idx >= 0 ? LATIN_DIGIT_CHARS[idx]! : ch;
  }
  return out;
}

/**
 * Format numbers for UI. Bangla locale keeps Latin digits for legibility
 * (same practice as most BD SaaS / fintech apps).
 */
export function localizeDigits(value: string | number, _locale: UiLocale): string {
  return toLatinDigits(value);
}

export function formatMissionProgress(
  completed: number,
  total: number,
  locale: UiLocale,
): string {
  const safeTotal = total > 0 ? total : 21;
  return `${localizeDigits(completed, locale)} / ${localizeDigits(safeTotal, locale)}`;
}

export function formatUnlockedCamps(count: number, locale: UiLocale): string {
  if (locale === "bn") return `${localizeDigits(count, locale)}টি`;
  return String(count);
}

/** e.g. "Mission 02" from API title or order. */
export function formatMissionLabel(
  order: number | undefined,
  fallback = "Mission 01",
): string {
  if (!order || order < 1) return fallback;
  return `Mission ${String(order).padStart(2, "0")}`;
}
