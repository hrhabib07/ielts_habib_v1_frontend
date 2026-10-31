"use client";

import { useMemo, useSyncExternalStore } from "react";
import { saveStepResult } from "@/src/features/chat-lesson/hooks/useLabProgress";
import type { FinalTestAttempt, FinalTestResult } from "@/src/features/final-test/types";

/**
 * Lab-only record of one learner's Final Test, kept in this browser (the lab has no login).
 * The first attempt is official and never replaced; later attempts are practice.
 */
export type FinalTestRecord = {
  official: FinalTestResult | null;
  /** The official attempt while it runs: survives reloads so closing the tab never resets it. */
  inProgress: FinalTestAttempt | null;
  practiceBest: number | null;
  practiceCount: number;
};

const STORAGE_KEY = "gamlish-lab-final-test-v1";
const CHANGE_EVENT = "gamlish-lab-final-test-change";
const EMPTY: FinalTestRecord = { official: null, inProgress: null, practiceBest: null, practiceCount: 0 };

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): FinalTestRecord {
  if (!raw) return EMPTY;
  try {
    const value = JSON.parse(raw) as Partial<FinalTestRecord>;
    return {
      official: value.official ?? null,
      inProgress: value.inProgress ?? null,
      practiceBest: typeof value.practiceBest === "number" ? value.practiceBest : null,
      practiceCount: typeof value.practiceCount === "number" ? value.practiceCount : 0,
    };
  } catch {
    return EMPTY;
  }
}

function write(next: FinalTestRecord): void {
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

export function readFinalTestRecord(): FinalTestRecord {
  return parse(readRaw());
}

/** Starts the official attempt. Does nothing once an official attempt exists or is running. */
export function startOfficialAttempt(attempt: FinalTestAttempt): FinalTestAttempt {
  const current = readFinalTestRecord();
  if (current.official) throw new Error("The official attempt is already taken");
  if (current.inProgress) return current.inProgress;
  write({ ...current, inProgress: attempt });
  return attempt;
}

export function saveOfficialAnswers(answers: Record<string, string>): void {
  const current = readFinalTestRecord();
  if (!current.inProgress || current.official) return;
  write({ ...current, inProgress: { ...current.inProgress, answers } });
}

/** Locks the official result forever and marks the map node as done. */
export function submitOfficialAttempt(testId: string, result: FinalTestResult): FinalTestResult {
  const current = readFinalTestRecord();
  if (current.official) return current.official;
  write({ ...current, official: result, inProgress: null });
  saveStepResult(testId, result.score, result.max);
  return result;
}

export function recordPracticeAttempt(score: number): void {
  const current = readFinalTestRecord();
  write({
    ...current,
    practiceBest: Math.max(current.practiceBest ?? 0, score),
    practiceCount: current.practiceCount + 1,
  });
}

export function resetFinalTestRecord(): void {
  write(EMPTY);
}

export function useFinalTestRecord(): FinalTestRecord {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => parse(raw), [raw]);
}
