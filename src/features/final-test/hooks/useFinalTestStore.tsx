"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  recordPracticeAttempt,
  saveOfficialAnswers,
  startOfficialAttempt,
  submitOfficialAttempt,
  useFinalTestRecord,
  type FinalTestRecord,
} from "@/src/features/final-test/hooks/useFinalTestRecord";
import type { FinalTestAttempt, FinalTestResult } from "@/src/features/final-test/types";

/**
 * Where the Final Test attempts live. The lab keeps them in the browser; the logged-in route keeps
 * them on the server, which locks the first (official) attempt.
 */
export type FinalTestStore = {
  record: FinalTestRecord;
  startOfficial: (attempt: FinalTestAttempt) => Promise<FinalTestAttempt>;
  saveOfficialAnswers: (answers: Record<string, string>) => void;
  submitOfficial: (result: FinalTestResult) => Promise<FinalTestResult>;
  recordPractice: (result: FinalTestResult) => void;
};

const FinalTestStoreContext = createContext<FinalTestStore | null>(null);

export function FinalTestStoreProvider({ store, children }: { store: FinalTestStore; children: ReactNode }) {
  return <FinalTestStoreContext.Provider value={store}>{children}</FinalTestStoreContext.Provider>;
}

export function useFinalTestStore(testId: string): FinalTestStore {
  const store = useContext(FinalTestStoreContext);
  const record = useFinalTestRecord();
  const labStore = useMemo<FinalTestStore>(
    () => ({
      record,
      startOfficial: async (attempt) => startOfficialAttempt(attempt),
      saveOfficialAnswers,
      submitOfficial: async (result) => submitOfficialAttempt(testId, result),
      recordPractice: (result) => recordPracticeAttempt(result.score),
    }),
    [record, testId],
  );
  return store ?? labStore;
}
