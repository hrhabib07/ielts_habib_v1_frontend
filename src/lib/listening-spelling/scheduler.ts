import { BOX_INTERVALS_MS } from "@/src/content/listening-spelling/config";
import type { ErrorTag, WordProgress } from "@/src/lib/listening-spelling/types";

export function defaultProgress(now = Date.now()): WordProgress {
  return {
    box: 0,
    nextDue: now,
    attempts: 0,
    correctCount: 0,
    errorCounts: {},
    lastSeen: now,
  };
}

export function applyCorrect(
  prev: WordProgress | undefined,
  now = Date.now(),
): WordProgress {
  const base = prev ?? defaultProgress(now);
  const nextBox = Math.min(3, (base.box + 1) as 0 | 1 | 2 | 3) as 0 | 1 | 2 | 3;
  const interval = BOX_INTERVALS_MS[nextBox] ?? BOX_INTERVALS_MS[1];
  return {
    ...base,
    box: nextBox,
    nextDue: now + interval,
    attempts: base.attempts + 1,
    correctCount: base.correctCount + 1,
    lastSeen: now,
  };
}

export function applyWrong(
  prev: WordProgress | undefined,
  tag: ErrorTag,
  now = Date.now(),
): WordProgress {
  const base = prev ?? defaultProgress(now);
  const errorCounts = { ...base.errorCounts };
  errorCounts[tag] = (errorCounts[tag] ?? 0) + 1;
  return {
    ...base,
    box: 0,
    nextDue: now,
    attempts: base.attempts + 1,
    lastErrorTag: tag,
    errorCounts,
    lastSeen: now,
  };
}

export function totalErrors(p: WordProgress): number {
  return Object.values(p.errorCounts).reduce((a, b) => a + (b ?? 0), 0);
}
