import { matchesTyped, normalizeTyped } from "@/src/features/chat-lesson/lib/typedAnswer";
import type {
  FinalTest,
  FinalTestAttempt,
  FinalTestQuestion,
  FinalTestResult,
  FinalTestSectionKey,
  SectionScore,
} from "@/src/features/final-test/types";

/** Arranged tiles are stored joined by this separator so the board can be rebuilt when the learner comes back. */
export const ARRANGE_JOIN = " | ";

export const arrangedText = (answer: string): string => answer.split(ARRANGE_JOIN).join(" ");

export function isAnswerCorrect(question: FinalTestQuestion, answer: string | undefined): boolean {
  if (!answer) return false;
  switch (question.kind) {
    case "choice":
      return answer === question.answer;
    case "arrange":
      return normalizeTyped(arrangedText(answer)) === normalizeTyped(question.answer);
    case "type":
      return matchesTyped(answer, [question.answer, ...(question.accepted ?? [])]);
  }
}

export function scoreAttempt(
  test: FinalTest,
  answers: Record<string, string>,
  submittedAt: number,
  timedOut: boolean,
): FinalTestResult {
  const sections: Partial<Record<FinalTestSectionKey, SectionScore>> = {};
  let score = 0;
  for (const question of test.questions) {
    const correct = isAnswerCorrect(question, answers[question.id]);
    const section = sections[question.section] ?? { score: 0, max: 0 };
    sections[question.section] = { score: section.score + (correct ? 1 : 0), max: section.max + 1 };
    if (correct) score += 1;
  }
  return { score, max: test.questions.length, sections, answers: { ...answers }, submittedAt, timedOut };
}

export type Grade = "excellent" | "veryGood" | "passed" | "notYet";

export function gradeFor(score: number, max: number, passMark: number): Grade {
  const ratio = max > 0 ? score / max : 0;
  if (ratio >= 0.9) return "excellent";
  if (ratio >= 0.8) return "veryGood";
  if (ratio >= passMark) return "passed";
  return "notYet";
}

function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a === undefined || b === undefined) continue;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

/** Sections keep their order; questions inside a section and every option list are shuffled. */
export function newAttempt(test: FinalTest, now: number): FinalTestAttempt {
  const order = test.sections.flatMap((section) =>
    shuffled(test.questions.filter((q) => q.section === section.key).map((q) => q.id)),
  );
  const optionOrder: Record<string, string[]> = {};
  for (const question of test.questions) {
    if (question.kind !== "type") optionOrder[question.id] = shuffled(question.options);
  }
  return { startedAt: now, deadline: now + test.minutes * 60_000, order, optionOrder, answers: {} };
}
