export type LessonLocale = "en" | "bn";

export interface LocalizedText {
  en: string;
  bn: string;
}

export type LocalizedTextInput = string | LocalizedText | null | undefined;

export const LESSON_LOCALE_STORAGE_KEY = "gamlish-lesson-locale";

export const emptyLocalizedText = (): LocalizedText => ({ en: "", bn: "" });

export function normalizeLocalizedText(value: LocalizedTextInput): LocalizedText {
  if (value == null) return emptyLocalizedText();
  if (typeof value === "string") return { en: value, bn: "" };
  return {
    en: typeof value.en === "string" ? value.en : "",
    bn: typeof value.bn === "string" ? value.bn : "",
  };
}

export function pickLocalizedText(value: LocalizedTextInput, locale: LessonLocale): string {
  const normalized = normalizeLocalizedText(value);
  const primary = locale === "bn" ? normalized.bn : normalized.en;
  if (primary.trim()) return primary;
  return locale === "bn" ? normalized.en : normalized.bn;
}

export function hasLocalizedText(value: LocalizedTextInput): boolean {
  const n = normalizeLocalizedText(value);
  return Boolean(n.en.trim() || n.bn.trim());
}

export function normalizeLocalizedTextArray(
  values: Array<LocalizedTextInput | string> | undefined,
): LocalizedText[] {
  if (!values?.length) return [];
  return values.map((v) =>
    typeof v === "string" ? normalizeLocalizedText({ en: v, bn: v }) : normalizeLocalizedText(v),
  );
}

export function getStoredLessonLocale(): LessonLocale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LESSON_LOCALE_STORAGE_KEY);
  return stored === "bn" ? "bn" : "en";
}

export function setStoredLessonLocale(locale: LessonLocale): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LESSON_LOCALE_STORAGE_KEY, locale);
}

const MCQ_LETTERS = ["A", "B", "C", "D"] as const;

export function mcqOptionLabel(index: number): string {
  return MCQ_LETTERS[index] ?? String(index + 1);
}

/** MCQ correct answer: letter A–D or legacy exact option text. */
export function isMcqAnswerCorrect(
  correctAnswer: string,
  selected: string | undefined,
  options: string[],
): boolean {
  if (selected == null) return false;
  const norm = (v: string) => String(v).trim().toLowerCase();
  const correct = String(correctAnswer).trim();
  const selectedNorm = norm(selected);

  const letter = correct.toUpperCase();
  if (/^[A-D]$/.test(letter)) {
    const idx = letter.charCodeAt(0) - 65;
    const optionAt = options[idx];
    if (optionAt && norm(optionAt) === selectedNorm) return true;
    if (norm(letter) === selectedNorm) return true;
    return false;
  }

  return norm(correct) === selectedNorm;
}
