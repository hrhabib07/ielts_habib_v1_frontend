"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ChatMissionProfileInput } from "@/src/lib/api/chatMission";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { NAMELESS_LEARNER, type Learner } from "@/src/features/learner/lib/personalize";

export type LearnerProgress = {
  /** The level the learner is in, and the first map stop they have not finished (null when all are done). */
  level: { number: number; stop: { index: number; total: number; title: Bilingual } | null };
  lessonsDone: number;
  lessonsTotal: number;
  gamesDone: number;
  gamesTotal: number;
  finalTestScore: { score: number; max: number } | null;
  /** Legacy Learner badge (stored as `isV2EarlyAdopter`). */
  earlyAdopter: boolean;
  /** Permanent once all 21 levels are done; pending until `deadline`. */
  legacy: LegacyStatus;
};

export type LegacyStatus = { state: "permanent" | "pending" | "none"; deadline: number | null };

/** Present only for real (logged-in) learners. */
export type LearnerActions = {
  uploadPhoto: (file: File) => Promise<void>;
  saveProfile: (input: ChatMissionProfileInput) => Promise<void>;
};

type LearnerContextValue = {
  learner: Learner;
  actions: LearnerActions | null;
  progress: LearnerProgress | null;
  profileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
};

const LearnerContext = createContext<LearnerContextValue | null>(null);

export function LearnerProvider({
  learner,
  actions = null,
  progress = null,
  children,
}: {
  learner: Learner;
  actions?: LearnerActions | null;
  progress?: LearnerProgress | null;
  children: ReactNode;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const value = useMemo<LearnerContextValue>(
    () => ({
      learner,
      actions,
      progress,
      profileOpen,
      openProfile: () => setProfileOpen(true),
      closeProfile: () => setProfileOpen(false),
    }),
    [learner, actions, progress, profileOpen],
  );
  return <LearnerContext.Provider value={value}>{children}</LearnerContext.Provider>;
}

const LAB_VALUE: LearnerContextValue = {
  learner: NAMELESS_LEARNER,
  actions: null,
  progress: null,
  profileOpen: false,
  openProfile: () => undefined,
  closeProfile: () => undefined,
};

/** Outside a provider (guests, the lab, admin previews) Gamlish talks without a name. */
export function useLearnerContext(): LearnerContextValue {
  return useContext(LearnerContext) ?? LAB_VALUE;
}

export function useLearner(): Learner {
  return useLearnerContext().learner;
}
