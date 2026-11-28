export type DiffPart = { ch: string; mark: "ok" | "bad" | "good" };

/** Highlight from first mismatch: answer in red, correct in green. */
export function buildDiffParts(
  answer: string,
  correct: string,
  firstMismatch: number,
): { answerParts: DiffPart[]; correctParts: DiffPart[] } {
  const idx = firstMismatch < 0 ? Math.min(answer.length, correct.length) : firstMismatch;
  const answerParts: DiffPart[] = [...answer].map((ch, i) => ({
    ch,
    mark: i < idx ? "ok" : "bad",
  }));
  const correctParts: DiffPart[] = [...correct].map((ch, i) => ({
    ch,
    mark: i < idx ? "ok" : "good",
  }));
  return { answerParts, correctParts };
}
