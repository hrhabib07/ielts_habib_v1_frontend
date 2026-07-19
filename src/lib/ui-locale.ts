export type UiLocale = "en" | "bn";

export const UI_LOCALE_STORAGE_KEY = "gamlish-ui-locale";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

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

export function localizeDigits(value: string | number, locale: UiLocale): string {
  const text = String(value);
  if (locale === "en") return text;
  return text.replace(/\d/g, (digit) => BN_DIGITS[Number(digit)] ?? digit);
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
