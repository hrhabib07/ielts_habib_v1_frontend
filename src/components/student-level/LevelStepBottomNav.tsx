"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { LevelDetailStep } from "@/src/lib/api/readingStrictProgression";
import { prefetchReadingStep } from "@/src/lib/prefetchReadingStep";

const QUIZ_STEP_TYPES = ["QUIZ", "VOCABULARY_TEST"] as const;

export interface LevelStepBottomNavProps {
  levelId: string;
  step: LevelDetailStep;
  stepIndex: number;
  totalSteps: number;
  allSteps: LevelDetailStep[];
  isCurrent: boolean;
  isCompleted: boolean;
  completingStepId: string | null;
  onNavigate: (stepId: string) => void;
  onComplete: (stepId: string) => void;
  nextLevelInfo?: { levelId: string; title: string; firstStepId: string } | null;
  onNavigateToNextLevel?: () => void;
}

export function LevelStepBottomNav({
  levelId,
  step,
  stepIndex,
  totalSteps,
  allSteps,
  isCurrent,
  isCompleted,
  completingStepId,
  onNavigate,
  onComplete,
  nextLevelInfo,
  onNavigateToNextLevel,
}: LevelStepBottomNavProps) {
  const router = useRouter();
  const isQuizStep = QUIZ_STEP_TYPES.includes(
    step.stepType as (typeof QUIZ_STEP_TYPES)[number],
  );
  const isCompleting = completingStepId === step._id;

  const hasPrev = stepIndex > 1;
  const hasNext = stepIndex < totalSteps;
  const prevStep = hasPrev ? allSteps[stepIndex - 2] : null;
  const nextStep = hasNext ? allSteps[stepIndex] : null;

  const warmStep = useCallback(
    (target: LevelDetailStep | null) => {
      if (!target) return;
      prefetchReadingStep(router, levelId, target);
    },
    [levelId, router],
  );

  return (
    <div
      className="shrink-0 border-t border-slate-200/80 bg-white/95 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.35)]"
      role="navigation"
      aria-label="Step navigation"
    >
      <div className="px-2 py-2 sm:px-3">
        <div className="mx-auto flex w-full max-w-6xl flex-nowrap items-center gap-2 sm:gap-3">
          <div className="shrink-0">
            {prevStep ? (
              <button
                type="button"
                onMouseEnter={() => warmStep(prevStep)}
                onFocus={() => warmStep(prevStep)}
                onClick={() => onNavigate(prevStep._id)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-100 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 sm:gap-2 sm:rounded-xl sm:px-3 sm:text-sm"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="hidden min-[400px]:inline">Previous</span>
              </button>
            ) : (
              <span className="inline-block w-10 sm:w-[72px]" aria-hidden />
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <span className="shrink-0 text-[10px] font-semibold tabular-nums text-slate-500 dark:text-slate-400 sm:hidden">
              {stepIndex}/{totalSteps}
            </span>
            <div className="hidden min-w-0 shrink-0 flex-col text-[10px] leading-tight text-slate-500 dark:text-slate-400 sm:flex sm:text-xs">
              <span className="font-semibold whitespace-nowrap">
                Step {stepIndex} of {totalSteps}
              </span>
              <span className="tabular-nums">
                {Math.round((stepIndex / Math.max(totalSteps, 1)) * 100)}% complete
              </span>
            </div>
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, (stepIndex / Math.max(totalSteps, 1)) * 100),
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {!isQuizStep &&
              step.stepType !== "PRACTICE_TEST" &&
              step.stepType !== "FINAL_EVALUATION" &&
              step.stepType !== "INTEGRATED_LESSON" &&
              isCurrent &&
              !isCompleted && (
                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={() => onComplete(step._id)}
                  className="hidden items-center gap-1 rounded-lg border border-[#1e3a8a]/30 bg-[#1e3a8a]/10 px-2 py-2 text-xs font-semibold text-[#1e3a8a] shadow-sm transition-all hover:bg-[#1e3a8a]/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#3b82f6]/50 dark:bg-[#1e3a8a]/25 dark:text-[#93c5fd] dark:hover:bg-[#1e3a8a]/35 sm:flex sm:gap-1.5 sm:rounded-xl sm:px-2.5 sm:text-sm"
                  title="Mark step complete"
                >
                  {isCompleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  )}
                  <span className="max-w-[7rem] truncate sm:max-w-none">Complete</span>
                </button>
              )}
            {nextStep ? (
              <button
                type="button"
                onMouseEnter={() => warmStep(nextStep)}
                onFocus={() => warmStep(nextStep)}
                onClick={() => onNavigate(nextStep._id)}
                className="flex items-center gap-1 rounded-lg bg-[#1e3a8a] px-2.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#0f172a] active:scale-[0.98] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] sm:gap-2 sm:rounded-xl sm:px-3 sm:text-sm"
              >
                <span className="hidden min-[400px]:inline">Next</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            ) : nextLevelInfo && onNavigateToNextLevel ? (
              <button
                type="button"
                onClick={onNavigateToNextLevel}
                className="flex max-w-[40vw] items-center gap-1 truncate rounded-lg bg-[#1e3a8a] px-2 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#0f172a] sm:max-w-xs sm:rounded-xl sm:px-3 sm:text-sm"
              >
                <span className="truncate">Next level</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
