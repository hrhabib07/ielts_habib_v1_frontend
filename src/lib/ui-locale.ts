export type UiLocale = "en" | "bn";

export const UI_LOCALE_STORAGE_KEY = "gamlish-ui-locale";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

/** First visit: Bengali browser → bn; otherwise en. SSR fallback: bn (product default). */
export function detectBrowserUiLocale(): UiLocale {
  if (typeof navigator === "undefined") return "bn";
  const langs =
    navigator.languages?.length > 0 ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    const code = lang.toLowerCase().split("-")[0];
    if (code === "bn") return "bn";
  }
  return "en";
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
  } catch {
    /* ignore */
  }
}

export function resolveInitialUiLocale(): UiLocale {
  return readStoredUiLocale() ?? detectBrowserUiLocale();
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
