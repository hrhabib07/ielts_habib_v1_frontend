"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  createChatLessonReducer,
  getActiveQuestion,
  getChunk,
  initialChatLessonState,
} from "@/src/features/chat-lesson/lib/chatLessonReducer";
import { readingDelayMs } from "@/src/features/chat-lesson/lib/format";
import { loadLessonPosition, saveLessonPosition } from "@/src/features/chat-lesson/lib/lessonResume";
import { isCorrectAnswer } from "@/src/features/chat-lesson/lib/uiCopy";
import type { ChatLessonStep } from "@/src/features/chat-lesson/types";
import {
  playCelebrateSfx,
  playCorrectEvalSfx,
  playThinkAgainEvalSfx,
  playUiClickSfx,
  playWrongEvalSfx,
  primeEvalSfx,
} from "@/src/lib/player-eval-sfx";

const GUIDE_THINKING_MS = 750;

export function useChatLesson(step: ChatLessonStep) {
  const reducer = useMemo(() => createChatLessonReducer(step), [step]);
  const [state, dispatch] = useReducer(reducer, initialChatLessonState);
  const { phase } = state;
  const chunk = getChunk(step, state);
  const activeQuestion = getActiveQuestion(step, state);

  const started = state.startedAt !== null;

  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    const saved = loadLessonPosition(stepRef.current);
    if (saved) dispatch({ type: "RESUME", state: saved });
  }, [step.id]);

  useEffect(() => {
    saveLessonPosition(stepRef.current, state);
  }, [state]);

  useEffect(() => {
    if (!started || phase.name !== "reading") return;
    const previous = chunk.messages[phase.revealed - 1];
    const timer = window.setTimeout(
      () => dispatch({ type: "REVEAL_NEXT" }),
      readingDelayMs(previous?.en),
    );
    return () => window.clearTimeout(timer);
  }, [started, phase, chunk]);

  useEffect(() => {
    if (phase.name !== "evaluating" || !activeQuestion) return;
    const correct = isCorrectAnswer(activeQuestion, phase.selectedOptionId);
    const timer = window.setTimeout(() => {
      if (correct) void playCorrectEvalSfx();
      else if (phase.draft.attempt === 1) void playThinkAgainEvalSfx();
      else void playWrongEvalSfx();
      dispatch({ type: "RESOLVE" });
    }, GUIDE_THINKING_MS);
    return () => window.clearTimeout(timer);
  }, [phase, activeQuestion]);

  useEffect(() => {
    if (phase.name === "complete") void playCelebrateSfx();
  }, [phase.name]);

  const totals = useMemo(() => {
    const allQuestions = step.chunks.flatMap((c) => c.questions);
    const score = Object.values(state.points).reduce<number>((sum, p) => sum + p, 0);
    return {
      totalQuestions: allQuestions.length,
      answeredCount: Object.keys(state.points).length,
      score,
      maxScore: allQuestions.length,
    };
  }, [step, state.points]);

  const chunkScore = useCallback(
    (chunkIndex: number) => {
      const target = step.chunks[chunkIndex];
      if (!target) return { score: 0, max: 0 };
      return {
        score: target.questions.reduce((sum, q) => sum + (state.points[q.id] ?? 0), 0),
        max: target.questions.length,
      };
    },
    [step, state.points],
  );

  const actions = useMemo(
    () => ({
      begin: () => dispatch({ type: "BEGIN", at: Date.now() }),
      revealAll: () => dispatch({ type: "REVEAL_ALL" }),
      ask: () => {
        void primeEvalSfx();
        dispatch({ type: "ASK" });
      },
      select: (optionId: string | null) => {
        void playUiClickSfx();
        dispatch({ type: "SELECT", optionId });
      },
      check: () => {
        void primeEvalSfx();
        dispatch({ type: "CHECK" });
      },
      reread: () => dispatch({ type: "REREAD" }),
      advance: () => dispatch({ type: "ADVANCE", at: Date.now() }),
      nextPart: () => dispatch({ type: "NEXT_PART", at: Date.now() }),
      restart: () => dispatch({ type: "RESTART", at: Date.now() }),
    }),
    [],
  );

  return { state, chunk, activeQuestion, totals, chunkScore, actions };
}
