"use client";

import { useCallback, useMemo } from "react";
import { useMissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { personalizeDeep } from "@/src/features/learner/lib/personalize";
import { PLAYGROUNDS } from "@/src/features/playground/content";
import { PlaygroundPlayer } from "@/src/features/playground/components/PlaygroundPlayer";

/** Plays one playground for the current learner and saves a passing score to the mission store. */
export function LabPlaygroundPlayer({ playgroundId, levelHref }: { playgroundId: string; levelHref: string }) {
  const entry = PLAYGROUNDS[playgroundId];
  const { saveResult } = useMissionStore();
  const learner = useLearner();
  const playground = useMemo(
    () => (entry ? personalizeDeep(entry.playground, learner) : null),
    [entry, learner],
  );
  const handleComplete = useCallback(
    (score: number, max: number) => saveResult(playgroundId, score, max),
    [saveResult, playgroundId],
  );
  if (!entry || !playground) return null;
  return (
    <PlaygroundPlayer
      playground={playground}
      audio={entry.audio}
      backHref={levelHref}
      onComplete={handleComplete}
    />
  );
}
