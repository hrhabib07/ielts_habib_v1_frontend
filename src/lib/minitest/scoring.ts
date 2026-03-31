import type { TestResult } from "./types";
function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isCorrect(userAnswer: string, correctAnswer: string): boolean {
  const u = normalizeAnswer(userAnswer);
  const c = normalizeAnswer(correctAnswer);
  if (c === "true" || c === "false" || c === "not given") {
    return u === c;
  }
  if (/^[a-d]$/i.test(c)) {
    return u === c || u === c.toLowerCase();
  }
  return u === c;
}

export function calculateScore(
  answers: Record<string, string>,
  correctMap: Record<string, string>
): number {
  let correct = 0;
  for (const id of Object.keys(correctMap)) {
    const user = answers[id];
    const expected = correctMap[id];
    if (
      user !== undefined &&
      user !== "" &&
      expected !== undefined &&
      isCorrect(user, expected)
    ) {
      correct += 1;
    }
  }
  return correct;
}

export function predictBand(score: number, total: number): TestResult {
  const bandMap: Array<{ min: number; max: number; band: string; range: string }> = [
    { min: 0, max: 1, band: "4.0–5.0", range: "4.0–5.0" },
    { min: 2, max: 3, band: "5.5–6.5", range: "5.5–6.5" },
    { min: 4, max: 4, band: "7.0–7.5", range: "7.0–7.5" },
    { min: 5, max: total, band: "8.0–9.0", range: "8.0–9.0" },
  ];
  const clamped = Math.min(score, total);
  const entry =
    bandMap.find((e) => clamped >= e.min && clamped <= e.max) ?? bandMap[0] ?? {
      min: 0,
      max: total,
      band: "4.0–5.0",
      range: "4.0–5.0",
    };
  return {
    score,
    total,
    band: entry.band,
    bandRange: entry.range,
  };
}

export function buildCorrectMap(
  stageConfigs: Array<{ questions: Array<{ id: string; correctAnswer: string }> }>
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const stage of stageConfigs) {
    for (const q of stage.questions) {
      map[q.id] = q.correctAnswer;
    }
  }
  return map;
}
