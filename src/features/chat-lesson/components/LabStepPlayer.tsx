"use client";

import { useCallback, useMemo } from "react";
import { ChatLessonPlayer } from "@/src/features/chat-lesson/components/ChatLessonPlayer";
import { useMissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import type { StepAudio } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import type { ChatLessonState } from "@/src/features/chat-lesson/lib/chatLessonReducer";
import { seedLessonAfterChunk } from "@/src/features/chat-lesson/lib/lessonResume";
import type { ChatLessonStep } from "@/src/features/chat-lesson/types";
import { useLearner } from "@/src/features/learner/LearnerContext";
import {
  allInterleaveRoundsDone,
  interleaveAfterChunk,
  interleavePlayHref,
} from "@/src/features/learner/lib/interleave";
import {
  getInterleaveRoundsDone,
  isInterleaveRoundDone,
  saveInterleaveLessonScore,
} from "@/src/features/learner/lib/interleaveProgress";
import { nextAfterContent } from "@/src/features/learner/lib/nextContent";
import { personalizeDeep } from "@/src/features/learner/lib/personalize";
import { missionHref } from "@/src/features/learner/lib/routes";

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
    // If Subject interleave finished every round, skip dumping into the full playground again.
    const playgroundNext = nextAfterContent(step.id);
    if (
      playgroundNext?.kind === "playground" &&
      allInterleaveRoundsDone(step.id, getInterleaveRoundsDone(playgroundNext.stepId))
    ) {
      const afterPlay = nextAfterContent(playgroundNext.stepId);
      return afterPlay ? missionHref(afterPlay.stepId) : levelHref;
    }
    const next = nextAfterContent(step.id);
    return next ? missionHref(next.stepId) : null;
  }, [step.id, levelHref]);

  const handleComplete = useCallback(
    (score: number, max: number) => saveResult(step.id, score, max),
    [saveResult, step.id],
  );

  const playAfterChunk = useCallback(
    (chunkId: string) => {
      const link = interleaveAfterChunk(step.id, chunkId);
      if (!link) return null;
      if (isInterleaveRoundDone(link.playgroundId, link.roundId)) return null;
      return interleavePlayHref(link, step.id);
    },
    [step.id],
  );

  const onLeaveChunkForPlay = useCallback(
    (chunkIndex: number, lessonState: ChatLessonState) => {
      const score = Object.values(lessonState.points).reduce<number>((sum, p) => sum + p, 0);
      const max = personal.chunks.flatMap((c) => c.questions).length;
      saveInterleaveLessonScore(step.id, score, max);
      // Park on the next note. Last note → game finishes the topic without reopening the lesson.
      if (chunkIndex + 1 < personal.chunks.length) {
        seedLessonAfterChunk(personal, chunkIndex, lessonState);
      }
    },
    [personal, step.id],
  );

  return (
    <ChatLessonPlayer
      step={personal}
      audio={audio}
      backHref={levelHref}
      nextPlayHref={nextPlayHref}
      playAfterChunk={playAfterChunk}
      onLeaveChunkForPlay={onLeaveChunkForPlay}
      onComplete={handleComplete}
    />
  );
}
