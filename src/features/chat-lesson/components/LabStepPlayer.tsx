"use client";

import { useCallback, useMemo } from "react";
import { ChatLessonPlayer } from "@/src/features/chat-lesson/components/ChatLessonPlayer";
import { useMissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import type { StepAudio } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import type { ChatLessonStep } from "@/src/features/chat-lesson/types";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { personalizeDeep } from "@/src/features/learner/lib/personalize";

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
  const handleComplete = useCallback(
    (score: number, max: number) => saveResult(step.id, score, max),
    [saveResult, step.id],
  );

  return <ChatLessonPlayer step={personal} audio={audio} backHref={levelHref} onComplete={handleComplete} />;
}
