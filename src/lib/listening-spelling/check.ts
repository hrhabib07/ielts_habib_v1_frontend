import {
  lemmaHasSpaceOrHyphen,
  normalizeComparable,
  normalizeSpellAloudAnswer,
  normalizeSpelling,
} from "@/src/lib/listening-spelling/normalize";
import type { AnswerResult, SessionItem } from "@/src/lib/listening-spelling/types";

function firstMismatchIndex(a: string, b: string): number {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    if (a[i] !== b[i]) return i;
  }
  return -1;
}

export function checkAnswer(item: SessionItem, rawAnswer: string): AnswerResult {
  if (item.kind === "spellaloud") {
    const normalizedAnswer = normalizeSpellAloudAnswer(rawAnswer);
    const targets = [
      normalizeSpellAloudAnswer(item.lemma),
      ...item.accept.map((a) => normalizeSpellAloudAnswer(a)),
    ];
    const correct = targets.includes(normalizedAnswer);
    const normalizedTarget = normalizeSpellAloudAnswer(item.lemma);
    return {
      correct,
      firstMismatch: correct ? -1 : firstMismatchIndex(normalizedAnswer, normalizedTarget),
      normalizedAnswer,
      normalizedTarget,
      displayTarget: item.lemma,
    };
  }

  const spaced = lemmaHasSpaceOrHyphen(item.lemma);
  const normalizedAnswer = normalizeComparable(rawAnswer, spaced);
  const targets = [
    normalizeComparable(item.lemma, spaced),
    ...item.accept.map((a) => normalizeComparable(a, spaced)),
  ];
  const correct = targets.includes(normalizedAnswer);
  const normalizedTarget = normalizeComparable(item.lemma, spaced);
  return {
    correct,
    firstMismatch: correct
      ? -1
      : firstMismatchIndex(normalizeSpelling(rawAnswer), normalizeSpelling(item.lemma)),
    normalizedAnswer,
    normalizedTarget,
    displayTarget: item.lemma,
  };
}
