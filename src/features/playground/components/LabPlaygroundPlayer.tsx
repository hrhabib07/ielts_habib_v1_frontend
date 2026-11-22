"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import { useLearner } from "@/src/features/learner/LearnerContext";
import {
  allInterleaveRoundsDone,
  interleaveLinksForStep,
} from "@/src/features/learner/lib/interleave";
import {
  getInterleaveRoundsDone,
  markInterleaveRoundDone,
  takeInterleaveLessonScore,
} from "@/src/features/learner/lib/interleaveProgress";
import { nextAfterContent } from "@/src/features/learner/lib/nextContent";
import { personalizeDeep } from "@/src/features/learner/lib/personalize";
import { missionHref } from "@/src/features/learner/lib/routes";
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

/** One note → one round, then return to the lesson (Mission 1 interleave). */
export type PlaygroundInterleave = {
  roundId: string;
  returnStepId: string;
  lessonStepId: string;
};

/**
 * Plays one playground for the current learner and saves a passing score to the mission store.
 * After a pass, Continue opens the next topic instead of dumping to the map.
 * `trackAnswers` sends every checked answer to the learner's weakness tracker (signed-in route only).
 */
export function LabPlaygroundPlayer({
  playgroundId,
  levelHref,
  trackAnswers = false,
  taste,
  interleave,
}: {
  playgroundId: string;
  levelHref: string;
  trackAnswers?: boolean;
  taste?: PlaygroundTaste;
  interleave?: PlaygroundInterleave;
}) {
  const router = useRouter();
  const loaded = usePlaygroundEntry(playgroundId);
  const entry = loaded?.entry ?? null;
  const { saveResult, partials } = useMissionStore();
  const learner = useLearner();
  const tasteRounds = taste?.rounds ?? null;

  const playground = useMemo(() => {
    if (!entry) return null;
    let game = entry.playground;
    if (interleave) {
      const round = game.rounds.find((r) => r.id === interleave.roundId);
      game = round ? { ...game, rounds: [round] } : game;
    } else if (tasteRounds) {
      game = { ...game, rounds: game.rounds.slice(0, tasteRounds) };
    }
    return personalizeDeep(game, learner);
  }, [entry, learner, tasteRounds, interleave]);

  const partial = taste || interleave ? undefined : partials[playgroundId];
  // Decided when the game opens: a passing finish clears the partial, which must not restart the session.
  const [resumeOnOpen, setResumeOnOpen] = useState<{ id: string; point: ResumePoint | null } | null>(null);
  if (playground && resumeOnOpen?.id !== playgroundId) {
    setResumeOnOpen({ id: playgroundId, point: partial ? resumePoint(playground.rounds, partial) : null });
  }
  const resume = resumeOnOpen?.id === playgroundId ? resumeOnOpen.point : null;
  const resultId = taste?.resultId ?? playgroundId;
  const next = useMemo(
    () => (taste || interleave ? null : nextAfterContent(playgroundId)),
    [taste, interleave, playgroundId],
  );

  const handleComplete = useCallback(
    (score: number, max: number) => {
      if (interleave) {
        markInterleaveRoundDone(playgroundId, interleave.roundId);
        return;
      }
      saveResult(resultId, score, max);
      if (trackAnswers) void flushAnswers();
    },
    [saveResult, resultId, trackAnswers, interleave, playgroundId],
  );

  const handleContinue = useCallback(
    (passed: boolean) => {
      if (taste?.onContinue) {
        taste.onContinue(passed);
        return;
      }
      if (interleave) {
        if (!passed) {
          router.push(missionHref(interleave.returnStepId));
          return;
        }
        markInterleaveRoundDone(playgroundId, interleave.roundId);
        const done = getInterleaveRoundsDone(playgroundId);
        const lessonId = interleave.lessonStepId;
        const finishedAll = allInterleaveRoundsDone(lessonId, done);
        if (finishedAll) {
          const snap = takeInterleaveLessonScore(lessonId);
          if (snap) saveResult(lessonId, snap.score, snap.max);
          else saveResult(lessonId, 1, 1);
          const roundCount = interleaveLinksForStep(lessonId).length;
          saveResult(playgroundId, roundCount, roundCount);
          const after = nextAfterContent(playgroundId);
          router.push(after ? missionHref(after.stepId) : `${levelHref}?completed=${encodeURIComponent(playgroundId)}`);
          return;
        }
        router.push(missionHref(interleave.returnStepId));
        return;
      }
      if (passed && next) {
        router.push(missionHref(next.stepId));
        return;
      }
      router.push(
        passed
          ? `${levelHref}?completed=${encodeURIComponent(playgroundId)}`
          : levelHref,
      );
    },
    [taste, interleave, next, router, levelHref, playgroundId, saveResult],
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
      backHref={interleave ? missionHref(interleave.returnStepId) : levelHref}
      onComplete={handleComplete}
      onAnswerEvent={trackAnswers ? trackAnswer : undefined}
      onContinue={handleContinue}
      autoStart={Boolean(interleave)}
      skipFinishScreen={Boolean(interleave)}
      nextBridge={
        next
          ? {
              title: next.title,
              topicsDone: next.topicsDone,
              topicsTotal: next.topicsTotal,
            }
          : null
      }
      resume={resume}
    />
  );
}
