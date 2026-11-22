"use client";

const KEY = "gamlish-mission1-interleave-v1";
const SCORE_KEY = "gamlish-mission1-interleave-score-v1";

type Store = Record<string, { rounds: string[] }>;
type ScoreStore = Record<string, { score: number; max: number }>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* ignore quota */
  }
}

export function getInterleaveRoundsDone(playgroundId: string): string[] {
  return readStore()[playgroundId]?.rounds ?? [];
}

export function markInterleaveRoundDone(playgroundId: string, roundId: string): void {
  const store = readStore();
  const prev = store[playgroundId]?.rounds ?? [];
  if (prev.includes(roundId)) return;
  store[playgroundId] = { rounds: [...prev, roundId] };
  writeStore(store);
}

export function isInterleaveRoundDone(playgroundId: string, roundId: string): boolean {
  return getInterleaveRoundsDone(playgroundId).includes(roundId);
}

export function saveInterleaveLessonScore(
  lessonStepId: string,
  score: number,
  max: number,
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(SCORE_KEY);
    const store = (raw ? (JSON.parse(raw) as ScoreStore) : {}) ?? {};
    store[lessonStepId] = { score, max };
    window.sessionStorage.setItem(SCORE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function takeInterleaveLessonScore(
  lessonStepId: string,
): { score: number; max: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SCORE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as ScoreStore;
    const hit = store[lessonStepId] ?? null;
    if (hit) {
      delete store[lessonStepId];
      window.sessionStorage.setItem(SCORE_KEY, JSON.stringify(store));
    }
    return hit;
  } catch {
    return null;
  }
}
