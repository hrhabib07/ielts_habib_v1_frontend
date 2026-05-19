import type { IntegratedLessonMicroQuizQuestion } from "@/src/lib/api/adminReadingVersions";
import {
  isMcqAnswerCorrect,
  normalizeLocalizedTextArray,
  pickLocalizedText,
  type LessonLocale,
} from "@/src/lib/localizedText";

function norm(value: string): string {
  return String(value).trim().toLowerCase();
}

export function isIntegratedQuestionCorrect(
  question: IntegratedLessonMicroQuizQuestion,
  selected: string | string[] | undefined,
  locale: LessonLocale = "en",
): boolean {
  if (selected == null) return false;
  const correct = question.correctAnswer;
  const selectedStr = Array.isArray(selected) ? selected[0] ?? "" : selected;

  if (Array.isArray(correct)) {
    return (
      Array.isArray(selected) &&
      selected.length === correct.length &&
      correct.every((c, i) => norm(c) === norm(selected[i] ?? ""))
    );
  }

  const correctStr = String(correct).trim();

  if (question.type === "MCQ" || question.type === "MATCHING") {
    const optionsEn = normalizeLocalizedTextArray(question.options).map((o) =>
      pickLocalizedText(o, "en"),
    );
    if (isMcqAnswerCorrect(correctStr, selectedStr, optionsEn)) return true;
    const optionsBn = normalizeLocalizedTextArray(question.options).map((o) =>
      pickLocalizedText(o, "bn"),
    );
    return isMcqAnswerCorrect(correctStr, selectedStr, optionsBn);
  }

  return norm(correctStr) === norm(selectedStr);
}

export function formatCorrectAnswerLabel(
  question: IntegratedLessonMicroQuizQuestion,
  locale: LessonLocale,
): string {
  const correct = question.correctAnswer;
  if (Array.isArray(correct)) return correct.join(", ");
  const letter = String(correct).trim().toUpperCase();
  if (/^[A-D]$/.test(letter)) {
    const options = normalizeLocalizedTextArray(question.options).map((o) =>
      pickLocalizedText(o, locale),
    );
    const idx = letter.charCodeAt(0) - 65;
    const text = options[idx];
    return text ? `${letter} — ${text}` : letter;
  }
  return String(correct);
}
