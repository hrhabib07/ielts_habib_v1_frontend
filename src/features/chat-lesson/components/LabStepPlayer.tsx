"use client";

import { useCallback, useMemo } from "react";
import { ChatLessonPlayer } from "@/src/features/chat-lesson/components/ChatLessonPlayer";
import { useMissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import type { StepAudio } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import type { ChatLessonStep } from "@/src/features/chat-lesson/types";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { missionHref } from "@/src/features/learner/lib/routes";
import { personalizeDeep } from "@/src/features/learner/lib/personalize";
import { ALL_PLAYGROUNDS } from "@/src/features/playground/content";

/** Plays one lesson for the current learner and saves the score to the mission store. */
export function LabStepPlayer({
  step,
  audio,
  levelHref,
}: {
  step: ChatLessonStep;
  audio?: StepAudio;
  levelHref: string;
}) {
  const { saveResult } = useMissionStore();
  const learner = useLearner();
  const personal = useMemo(() => personalizeDeep(step, learner), [step, learner]);
  const nextPlayHref = useMemo(() => {
    const game = ALL_PLAYGROUNDS.find((playground) => playground.afterStepId === step.id);
    return game ? missionHref(game.id) : null;
  }, [step.id]);
  const handleComplete = useCallback(
    (score: number, max: number) => saveResult(step.id, score, max),
    [saveResult, step.id],
  );

  return (
    <ChatLessonPlayer
      step={personal}
      audio={audio}
      backHref={levelHref}
      nextPlayHref={nextPlayHref}
      onComplete={handleComplete}
    />
  );
}
