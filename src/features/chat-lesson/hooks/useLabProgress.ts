"use client";

import { useMemo, useSyncExternalStore } from "react";

export type StepResult = { score: number; max: number; completedAt: number };

export type LabProgress = {
  results: Record<string, StepResult>;
  unlockAll: boolean;
};

const STORAGE_KEY = "gamlish-lab-chat-lesson-progress-v1";
const CHANGE_EVENT = "gamlish-lab-progress-change";
const EMPTY: LabProgress = { results: {}, unlockAll: false };

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): LabProgress {
  if (!raw) return EMPTY;
  try {
    const value = JSON.parse(raw) as Partial<LabProgress>;
    return { results: value.results ?? {}, unlockAll: value.unlockAll === true };
  } catch {
    return EMPTY;
  }
}

function write(next: LabProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Keeps the best score per step. */
export function saveStepResult(stepId: string, score: number, max: number): void {
  const current = parse(readRaw());
  const previous = current.results[stepId];
  if (previous && previous.score >= score) return;
  write({ ...current, results: { ...current.results, [stepId]: { score, max, completedAt: Date.now() } } });
}

export function setUnlockAll(unlockAll: boolean): void {
  write({ ...parse(readRaw()), unlockAll });
}

export function resetLabProgress(): void {
  write(EMPTY);
}

/** Demo-only progress kept in this browser (no login). */
export function useLabProgress(): LabProgress {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => parse(raw), [raw]);
}
