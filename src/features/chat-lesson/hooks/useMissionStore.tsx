"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { saveStepResult, useLabProgress, type StepResult } from "@/src/features/chat-lesson/hooks/useLabProgress";

/**
 * Where Mission 1 progress lives. The lab keeps it in the browser; the logged-in route keeps it
 * on the server and adds the payment gate.
 */
export type MissionStore = {
  results: Record<string, StepResult>;
  unlockAll: boolean;
  saveResult: (stepId: string, score: number, max: number) => void;
  /** True for steps that need payment the learner has not made. */
  isPaywalled: (stepId: string) => boolean;
  checkoutHref: string | null;
  /** A payment was sent and is waiting for admin approval. */
  paymentPending: boolean;
  /** The lab's unlock-all and reset buttons. */
  testingTools: boolean;
};

const MissionStoreContext = createContext<MissionStore | null>(null);

export function MissionStoreProvider({ store, children }: { store: MissionStore; children: ReactNode }) {
  return <MissionStoreContext.Provider value={store}>{children}</MissionStoreContext.Provider>;
}

const neverPaywalled = () => false;

export function useMissionStore(): MissionStore {
  const store = useContext(MissionStoreContext);
  const lab = useLabProgress();
  const labStore = useMemo<MissionStore>(
    () => ({
      results: lab.results,
      unlockAll: lab.unlockAll,
      saveResult: saveStepResult,
      isPaywalled: neverPaywalled,
      checkoutHref: null,
      paymentPending: false,
      testingTools: true,
    }),
    [lab],
  );
  return store ?? labStore;
}
