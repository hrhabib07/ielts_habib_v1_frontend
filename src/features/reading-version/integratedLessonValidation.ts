import type { IntegratedLessonBlock } from "@/src/lib/api/adminReadingVersions";
import {
  hasLocalizedText,
  normalizeLocalizedText,
  normalizeLocalizedTextArray,
  pickLocalizedText,
  type LessonLocale,
} from "@/src/lib/localizedText";

function pickAnyLocale(
  value: Parameters<typeof normalizeLocalizedText>[0],
): string {
  return pickLocalizedText(value, "en") || pickLocalizedText(value, "bn");
}

/** Returns a user-facing error message, or null if valid. */
export function validateIntegratedLessonBlocks(
  title: string,
  blocks: IntegratedLessonBlock[],
): string | null {
  if (!title.trim()) {
    return "Lesson title is required.";
  }
  if (blocks.length === 0) {
    return "Add at least one note or micro-quiz block.";
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block) continue;
    const label = `Block #${i + 1}`;

    if (block.type === "NOTE") {
      if (!hasLocalizedText(block.body)) {
        return `${label} (note): add content in English or Bangla.`;
      }
      continue;
    }

    if (block.type !== "MICRO_QUIZ") continue;

    const questions = block.questions ?? [];
    if (questions.length === 0) {
      return `${label} (micro-quiz): add at least one question.`;
    }

    for (let qi = 0; qi < questions.length; qi++) {
      const q = questions[qi];
      if (!q) continue;
      const qLabel = `${label}, question ${qi + 1}`;

      if (!hasLocalizedText(q.questionText)) {
        return `${qLabel}: question text is required (EN or BN).`;
      }

      const correct =
        typeof q.correctAnswer === "string"
          ? q.correctAnswer.trim()
          : Array.isArray(q.correctAnswer)
            ? q.correctAnswer.map((s) => String(s).trim()).join("")
            : "";
      if (!correct) {
        return `${qLabel}: select correct answer (A–D for MCQ).`;
      }

      if (q.type === "MCQ" || q.type === "MATCHING") {
        const options = normalizeLocalizedTextArray(q.options);
        const enOptions = options.map((o) => pickLocalizedText(o, "en")).filter(Boolean);
        const bnOptions = options.map((o) => pickLocalizedText(o, "bn")).filter(Boolean);
        if (enOptions.length < 2 && bnOptions.length < 2) {
          return `${qLabel}: add at least two options in English or Bangla.`;
        }
        if (q.type === "MCQ") {
          const letter = correct.toUpperCase();
          if (!/^[A-D]$/.test(letter)) {
            return `${qLabel}: for MCQ, set correct answer to A, B, C, or D.`;
          }
        }
      }

      if (q.type === "TFNG") {
        const allowed = ["true", "false", "not given", "yes", "no"];
        if (!allowed.includes(correct.toLowerCase())) {
          return `${qLabel}: use TRUE, FALSE, or NOT GIVEN as the correct answer.`;
        }
      }
    }
  }

  return null;
}

export function validateNoteLocale(
  body: { en: string; bn: string } | undefined,
  locale: LessonLocale,
): string | null {
  const text = pickLocalizedText(body, locale);
  if (!text.trim()) return `Add ${locale === "en" ? "English" : "Bangla"} content.`;
  return null;
}
