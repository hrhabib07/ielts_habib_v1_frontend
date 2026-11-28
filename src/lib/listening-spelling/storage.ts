import {
  STORAGE_KEY,
  STORAGE_VERSION,
} from "@/src/content/listening-spelling/config";
import type { ProgressStore, WordProgress } from "@/src/lib/listening-spelling/types";

function emptyStore(): ProgressStore {
  return { version: STORAGE_VERSION, words: {} };
}

export function loadProgress(): ProgressStore {
  try {
    if (typeof window === "undefined") return emptyStore();
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ProgressStore;
    if (!parsed || typeof parsed !== "object" || parsed.version !== STORAGE_VERSION) {
      return emptyStore();
    }
    return {
      version: STORAGE_VERSION,
      words: parsed.words ?? {},
    };
  } catch {
    return emptyStore();
  }
}

export function saveProgress(store: ProgressStore): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage blocked · continue without persistence.
  }
}

export function getWordProgress(
  store: ProgressStore,
  id: string,
): WordProgress | undefined {
  return store.words[id];
}

export function upsertWordProgress(
  store: ProgressStore,
  id: string,
  next: WordProgress,
): ProgressStore {
  return {
    ...store,
    words: {
      ...store.words,
      [id]: next,
    },
  };
}

export function countPractised(store: ProgressStore): number {
  return Object.keys(store.words).length;
}

export function countDueToday(store: ProgressStore, now = Date.now()): number {
  return Object.values(store.words).filter((w) => w.nextDue <= now).length;
}

/** Weak = low box or any recorded errors. */
export function countWeakWords(store: ProgressStore): number {
  return Object.values(store.words).filter((w) => {
    const errors = Object.values(w.errorCounts).reduce((a, b) => a + (b ?? 0), 0);
    return w.box <= 1 || errors > 0;
  }).length;
}
