export type PlayerEvalResumeItem = {
  questionId: string;
  settled: boolean;
  correct: boolean;
  attempts: number;
  answer?: unknown;
};

export function firstUnsettledQuestionIndex(
  questionIds: string[],
  resume: PlayerEvalResumeItem[] | undefined,
  retryMode: boolean,
): number {
  if (retryMode || questionIds.length === 0) return 0;
  const byId = new Map(resume?.map((item) => [item.questionId, item]) ?? []);
  const idx = questionIds.findIndex((id) => !byId.get(id)?.settled);
  if (idx < 0) return Math.max(questionIds.length - 1, 0);
  return idx;
}

export function answersFromResume(
  resume: PlayerEvalResumeItem[] | undefined,
): Record<string, unknown> {
  const answers: Record<string, unknown> = {};
  for (const item of resume ?? []) {
    if (item.answer !== undefined) answers[item.questionId] = item.answer;
  }
  return answers;
}

const CLIENT_PREFIX = "gamlish.evalResume.v1:";

export function clientEvalResumeKey(scope: string, stageOrder: number): string {
  return `${CLIENT_PREFIX}${scope}:${stageOrder}`;
}

export function readClientEvalResume(key: string): PlayerEvalResumeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is PlayerEvalResumeItem => {
      return (
        typeof item === "object" &&
        item != null &&
        typeof (item as PlayerEvalResumeItem).questionId === "string"
      );
    });
  } catch {
    return [];
  }
}

export function writeClientEvalResume(key: string, items: PlayerEvalResumeItem[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}

export function upsertClientEvalResume(
  key: string,
  item: PlayerEvalResumeItem,
): PlayerEvalResumeItem[] {
  const next = readClientEvalResume(key).filter((row) => row.questionId !== item.questionId);
  next.push(item);
  writeClientEvalResume(key, next);
  return next;
}

export function mergeEvalResume(
  server: PlayerEvalResumeItem[] | undefined,
  client: PlayerEvalResumeItem[],
): PlayerEvalResumeItem[] {
  const byId = new Map<string, PlayerEvalResumeItem>();
  for (const item of client) byId.set(item.questionId, item);
  for (const item of server ?? []) byId.set(item.questionId, item);
  return [...byId.values()];
}

export function hydrateEvalCheckState(resume: PlayerEvalResumeItem[] | undefined): {
  checkResults: Record<string, { correct: boolean; xpAwarded: number; attemptNumber: number }>;
  wrongAttemptCounts: Record<string, number>;
} {
  const checkResults: Record<
    string,
    { correct: boolean; xpAwarded: number; attemptNumber: number }
  > = {};
  const wrongAttemptCounts: Record<string, number> = {};
  for (const item of resume ?? []) {
    if (item.settled) {
      checkResults[item.questionId] = {
        correct: item.correct,
        xpAwarded: 0,
        attemptNumber: item.attempts,
      };
    } else if (item.attempts > 0 && !item.correct) {
      wrongAttemptCounts[item.questionId] = item.attempts;
    }
  }
  return { checkResults, wrongAttemptCounts };
}
