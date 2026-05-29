import {
  getStepContent,
  type PracticeTestStepContent,
  type StepContent,
} from "@/src/lib/api/readingStrictProgression";

const TTL_MS = 10 * 60 * 1000;

type CacheEntry = { data: StepContent; fetchedAt: number };

const stepContentCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<StepContent>>();

export function stepContentCacheKey(levelId: string, stepId: string): string {
  return `${levelId}:${stepId}`;
}

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < TTL_MS;
}

export function peekStepContentCached(
  levelId: string,
  stepId: string,
): StepContent | null {
  const entry = stepContentCache.get(stepContentCacheKey(levelId, stepId));
  if (entry && isFresh(entry)) return entry.data;
  return null;
}

export function invalidateStepContentCache(levelId: string, stepId?: string): void {
  if (stepId) {
    stepContentCache.delete(stepContentCacheKey(levelId, stepId));
    return;
  }
  for (const key of stepContentCache.keys()) {
    if (key.startsWith(`${levelId}:`)) stepContentCache.delete(key);
  }
}

export async function getStepContentCached(
  levelId: string,
  stepId: string,
  options?: { force?: boolean },
): Promise<StepContent> {
  const key = stepContentCacheKey(levelId, stepId);
  const cached = stepContentCache.get(key);
  if (!options?.force && cached && isFresh(cached)) {
    return cached.data;
  }

  const pending = inflight.get(key);
  if (pending) return pending;

  const request = getStepContent(levelId, stepId)
    .then((data) => {
      stepContentCache.set(key, { data, fetchedAt: Date.now() });
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
}

/** Fire-and-forget warm cache for smoother step / test transitions. */
export function prefetchStepContent(levelId: string, stepId: string): void {
  if (peekStepContentCached(levelId, stepId)) return;
  void getStepContentCached(levelId, stepId).catch(() => {});
}

export function peekPracticeTestContentCached(
  levelId: string,
  stepId: string,
): PracticeTestStepContent | null {
  const step = peekStepContentCached(levelId, stepId);
  if (step?.type === "PRACTICE_TEST" && step.content) {
    return step.content as PracticeTestStepContent;
  }
  return null;
}

/** Preload heavy exam UI chunks while step content is warming. */
export function preloadPracticeTestViews(): void {
  if (typeof window === "undefined") return;
  void import("@/src/components/reading/SentenceLocatorPracticeView");
  void import("@/src/components/reading/PracticeTestReadingView");
}
