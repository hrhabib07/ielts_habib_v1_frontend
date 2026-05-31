"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { LevelDetailStep } from "@/src/lib/api/readingStrictProgression";
import { prefetchReadingStep } from "@/src/lib/prefetchReadingStep";
import { readingPathPremium } from "@/src/lib/readingPathPremium";
import { cn } from "@/lib/utils";

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
  const isPracticeTest = step.stepType === "PRACTICE_TEST";

  const hasPrev = stepIndex > 1;
  const hasNext = stepIndex < totalSteps;
  const prevStep = hasPrev ? allSteps[stepIndex - 2] : null;
  const nextStep = hasNext ? allSteps[stepIndex] : null;

  /** Must pass practice test before advancing — avoid misleading Next. */
  const blockNext = isPracticeTest && !isCompleted;

  const warmStep = useCallback(
    (target: LevelDetailStep | null) => {
      if (!target) return;
      prefetchReadingStep(router, levelId, target);
    },
    [levelId, router],
  );

  const stepPct = Math.round((stepIndex / Math.max(totalSteps, 1)) * 100);

  return (
    <div
      className="shrink-0 border-t border-border/50 bg-background/95 shadow-[0_-1px_0_rgba(15,23,42,0.04)] backdrop-blur-md dark:shadow-[0_-1px_0_rgba(255,255,255,0.04)]"
      role="navigation"
      aria-label="Step navigation"
    >
      <div className="px-2 py-2 sm:px-3">
        <div className="mx-auto flex w-full max-w-4xl flex-nowrap items-center gap-2 sm:gap-3">
          <div className="shrink-0">
            {prevStep ? (
              <button
                type="button"
                onMouseEnter={() => warmStep(prevStep)}
                onFocus={() => warmStep(prevStep)}
                onClick={() => onNavigate(prevStep._id)}
                className="flex items-center gap-1 rounded-xl border border-border/50 bg-card px-2.5 py-2 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:bg-accent/[0.05] hover:text-accent active:scale-[0.98] sm:gap-2 sm:px-3 sm:text-sm"
              >
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="hidden min-[400px]:inline">Previous</span>
              </button>
            ) : (
              <span className="inline-block w-10 sm:w-[72px]" aria-hidden />
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="hidden min-w-0 shrink-0 sm:block">
              <p className={cn(readingPathPremium.microLabel, "whitespace-nowrap")}>
                Step {stepIndex} of {totalSteps}
              </p>
              <p className="text-[10px] tabular-nums text-muted-foreground">{stepPct}%</p>
            </div>
            <div className={cn(readingPathPremium.progressTrack, "min-w-0 flex-1")}>
              <div
                className={readingPathPremium.progressFill}
                style={{ width: `${Math.min(100, Math.max(0, stepPct))}%` }}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {!isQuizStep &&
              !isPracticeTest &&
              step.stepType !== "FINAL_EVALUATION" &&
              step.stepType !== "INTEGRATED_LESSON" &&
              isCurrent &&
              !isCompleted && (
                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={() => onComplete(step._id)}
                  className="hidden items-center gap-1 rounded-xl border border-accent/25 bg-accent/10 px-2.5 py-2 text-xs font-semibold text-accent shadow-sm transition-all hover:bg-accent/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:flex sm:text-sm"
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

            {blockNext ? (
              <span
                className="animate-soft-pulse flex items-center gap-1.5 rounded-xl border border-accent/20 bg-accent/[0.06] px-2.5 py-2 text-xs font-medium text-accent sm:px-3 sm:text-sm"
                title="Pass this practice test to continue"
              >
                <Lock className="h-3.5 w-3.5 shrink-0 opacity-80" />
                <span className="hidden min-[400px]:inline">Pass to continue</span>
              </span>
            ) : nextStep ? (
              <button
                type="button"
                onMouseEnter={() => warmStep(nextStep)}
                onFocus={() => warmStep(nextStep)}
                onClick={() => onNavigate(nextStep._id)}
                className="flex items-center gap-1 rounded-xl bg-accent px-2.5 py-2 text-xs font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent/90 active:scale-[0.98] sm:gap-2 sm:px-3 sm:text-sm"
              >
                <span className="hidden min-[400px]:inline">Next</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            ) : nextLevelInfo && onNavigateToNextLevel ? (
              <button
                type="button"
                onClick={onNavigateToNextLevel}
                className="flex max-w-[40vw] items-center gap-1 truncate rounded-xl bg-accent px-2 py-2 text-xs font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent/90 sm:max-w-xs sm:px-3 sm:text-sm"
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
