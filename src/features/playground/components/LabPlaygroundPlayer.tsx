"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { personalizeDeep } from "@/src/features/learner/lib/personalize";
import { GameLoading } from "@/src/features/playground/components/GameLoading";
import { PlaygroundPlayer } from "@/src/features/playground/components/PlaygroundPlayer";
import { usePlaygroundEntry } from "@/src/features/playground/hooks/usePlaygroundEntry";
import { flushAnswers, trackAnswer } from "@/src/features/playground/lib/answerTracker";
import { resumePoint, type ResumePoint } from "@/src/features/playground/lib/session";

/** Play only the first rounds and save the score under its own id (the free taste of a paid game). */
export type PlaygroundTaste = {
  rounds: number;
  resultId: string;
  onContinue: (passed: boolean) => void;
};

/**
 * Plays one playground for the current learner and saves a passing score to the mission store.
 * `trackAnswers` sends every checked answer to the learner's weakness tracker (signed-in route only).
 */
export function LabPlaygroundPlayer({
  playgroundId,
  levelHref,
  trackAnswers = false,
  taste,
}: {
  playgroundId: string;
  levelHref: string;
  trackAnswers?: boolean;
  taste?: PlaygroundTaste;
}) {
  const loaded = usePlaygroundEntry(playgroundId);
  const entry = loaded?.entry ?? null;
  const { saveResult, partials } = useMissionStore();
  const learner = useLearner();
  const tasteRounds = taste?.rounds ?? null;
  const playground = useMemo(() => {
    if (!entry) return null;
    const game = tasteRounds ? { ...entry.playground, rounds: entry.playground.rounds.slice(0, tasteRounds) } : entry.playground;
    return personalizeDeep(game, learner);
  }, [entry, learner, tasteRounds]);
  const partial = taste ? undefined : partials[playgroundId];
  // Decided when the game opens: a passing finish clears the partial, which must not restart the session.
  const [resumeOnOpen, setResumeOnOpen] = useState<{ id: string; point: ResumePoint | null } | null>(null);
  if (playground && resumeOnOpen?.id !== playgroundId) {
    setResumeOnOpen({ id: playgroundId, point: partial ? resumePoint(playground.rounds, partial) : null });
  }
  const resume = resumeOnOpen?.id === playgroundId ? resumeOnOpen.point : null;
  const resultId = taste?.resultId ?? playgroundId;
  const handleComplete = useCallback(
    (score: number, max: number) => {
      saveResult(resultId, score, max);
      if (trackAnswers) void flushAnswers();
    },
    [saveResult, resultId, trackAnswers],
  );

  useEffect(() => {
    if (!trackAnswers) return;
    return () => {
      void flushAnswers();
    };
  }, [trackAnswers]);

  if (!loaded) return <GameLoading />;
  if (!entry || !playground) return null;
  return (
    <PlaygroundPlayer
      playground={playground}
      audio={entry.audio}
      backHref={levelHref}
      onComplete={handleComplete}
      onAnswerEvent={trackAnswers ? trackAnswer : undefined}
      onContinue={taste?.onContinue}
      resume={resume}
    />
  );
}
