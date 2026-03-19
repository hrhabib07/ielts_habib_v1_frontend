"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TestState, TestResult } from "./types";
import { STAGE_CONFIGS } from "./data";
import {
  calculateScore,
  predictBand,
  buildCorrectMap,
} from "./scoring";

const INITIAL_STATE: TestState = {
  stageIndex: 0,
  timeLeft: 0,
  answers: {},
  status: "idle",
  submittedAt: null,
};

export function useTestEngine() {
  const [state, setState] = useState<TestState>(INITIAL_STATE);
  const [result, setResult] = useState<TestResult | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalDurationRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const advanceStage = useCallback(() => {
    setState((prev) => {
      const next = prev.stageIndex + 1;
      if (next >= STAGE_CONFIGS.length) {
        clearTimer();
        const correctMap = buildCorrectMap(STAGE_CONFIGS);
        const score = calculateScore(prev.answers, correctMap);
        const total = STAGE_CONFIGS.reduce(
          (acc, s) => acc + s.questions.length,
          0
        );
        setResult(predictBand(score, total));
        return {
          ...prev,
          status: "finished",
          submittedAt: Date.now(),
        };
      }
      const config = STAGE_CONFIGS[next];
      totalDurationRef.current = config.duration;
      return {
        ...prev,
        stageIndex: next,
        timeLeft: config.duration,
        status: "running",
      };
    });
  }, [clearTimer]);

  useEffect(() => {
    if (state.status !== "running" || state.timeLeft <= 0) return;
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.timeLeft <= 1) {
          clearTimer();
          advanceStage();
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return clearTimer;
  }, [state.status, state.timeLeft, advanceStage, clearTimer]);

  const startTest = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      status: "countdown",
    });
  }, []);

  const handleCountdownComplete = useCallback(() => {
    const config = STAGE_CONFIGS[0];
    totalDurationRef.current = config.duration;
    setState({
      stageIndex: 0,
      timeLeft: config.duration,
      answers: {},
      status: "running",
      submittedAt: null,
    });
  }, []);

  const handleAnswer = useCallback((questionId: string, value: string) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }));
  }, []);

  const nextStage = useCallback(() => {
    clearTimer();
    advanceStage();
  }, [clearTimer, advanceStage]);

  const finishTest = useCallback(() => {
    clearTimer();
    setState((prev) => {
      const correctMap = buildCorrectMap(STAGE_CONFIGS);
      const score = calculateScore(prev.answers, correctMap);
      const total = STAGE_CONFIGS.reduce(
        (acc, s) => acc + s.questions.length,
        0
      );
      setResult(predictBand(score, total));
      return {
        ...prev,
        status: "finished",
        submittedAt: Date.now(),
      };
    });
  }, [clearTimer]);

  const currentConfig = state.status === "running" || state.status === "stage_complete"
    ? STAGE_CONFIGS[state.stageIndex]
    : null;
  const totalDuration = currentConfig?.duration ?? 0;
  const progress =
    totalDuration > 0 ? (totalDuration - state.timeLeft) / totalDuration : 0;

  return {
    state,
    result,
    currentConfig,
    stageIndex: state.stageIndex,
    timeLeft: state.timeLeft,
    progress,
    totalStages: STAGE_CONFIGS.length,
    startTest,
    handleCountdownComplete,
    handleAnswer,
    nextStage,
    finishTest,
  };
}
