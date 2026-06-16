"use client";

import Link from "next/link";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { LevelDetailStep } from "@/src/lib/api/readingStrictProgression";
import { prefetchReadingStep } from "@/src/lib/prefetchReadingStep";
import { readingPathPremium } from "@/src/lib/readingPathPremium";
import { cn } from "@/lib/utils";

const QUIZ_STEP_TYPES = ["QUIZ", "VOCABULARY_TEST"] as const;

function stepHref(levelId: string, stepId: string): string {
  return `/profile/reading/strict-levels/${levelId}?step=${encodeURIComponent(stepId)}`;
}

export interface LevelStepBottomNavProps {
  levelId: string;
  step: LevelDetailStep;
  stepIndex: number;
  totalSteps: number;
  allSteps: LevelDetailStep[];
  currentStepIndex: number;
  completedStepIds: string[];
  isLevelPassed: boolean;
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
  currentStepIndex,
  completedStepIds,
  isLevelPassed,
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

  const completedSet = useMemo(
    () => new Set(completedStepIds.map(String)),
    [completedStepIds],
  );

  const hasPrev = stepIndex > 1;
  const hasNext = stepIndex < totalSteps;
  const prevStep = hasPrev ? allSteps[stepIndex - 2] : null;
  const nextStep = hasNext ? allSteps[stepIndex] : null;

  const canVisitStep = useCallback(
    (target: LevelDetailStep | null | undefined, targetIndex: number): boolean => {
      if (!target) return false;
      if (isLevelPassed) return true;
      if (completedSet.has(target._id)) return true;
      return targetIndex <= currentStepIndex;
    },
    [completedSet, currentStepIndex, isLevelPassed],
  );

  const prevIndex = stepIndex - 2;
  const nextIndex = stepIndex;
  const canGoPrev = canVisitStep(prevStep, prevIndex);
  const canGoNext = canVisitStep(nextStep, nextIndex);

  /** Must pass practice/final test before advancing to a future step. */
  const blockNext = isPracticeTest && !isCompleted;

  const warmStep = useCallback(
    (target: LevelDetailStep | null) => {
      if (!target) return;
      prefetchReadingStep(router, levelId, target);
    },
    [levelId, router],
  );

  const stepPct = Math.round((stepIndex / Math.max(totalSteps, 1)) * 100);

  const navBtnClass =
    "flex items-center gap-1 rounded-xl border border-border/50 bg-card px-3 py-2.5 text-sm font-semibold shadow-sm transition-all active:scale-[0.98] sm:gap-2";

  return (
    <div
      className="shrink-0 border-t border-border/50 bg-background/98 shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.08)] backdrop-blur-md dark:shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.35)]"
      role="navigation"
      aria-label="Step navigation"
    >
      <div className="px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-xl flex-nowrap items-center gap-3">
          <div className="shrink-0">
            {prevStep && canGoPrev ? (
              <Link
                href={stepHref(levelId, prevStep._id)}
                prefetch
                onMouseEnter={() => warmStep(prevStep)}
                onFocus={() => warmStep(prevStep)}
                className={cn(
                  navBtnClass,
                  "text-muted-foreground hover:border-accent/25 hover:bg-accent/[0.04] hover:text-accent",
                )}
              >
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Previous</span>
              </Link>
            ) : (
              <span
                className={cn(
                  navBtnClass,
                  "cursor-not-allowed border-border/30 bg-muted/20 text-muted-foreground/40",
                )}
                aria-disabled
              >
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Previous</span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className={cn(readingPathPremium.microLabel, "truncate")}>
                Step {stepIndex} of {totalSteps}
              </p>
              <p className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                {stepPct}%
              </p>
            </div>
            <div className={readingPathPremium.progressTrack}>
              <div
                className={readingPathPremium.progressFill}
                style={{ width: `${Math.min(100, Math.max(0, stepPct))}%` }}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center">
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
                  className="mr-2 hidden items-center gap-1 rounded-xl border border-accent/25 bg-accent/10 px-2.5 py-2 text-xs font-semibold text-accent shadow-sm transition-all hover:bg-accent/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:flex sm:text-sm"
                  title="Mark step complete"
                >
                  {isCompleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  )}
                  <span>Complete</span>
                </button>
              )}

            {blockNext ? (
              <span
                className="flex items-center gap-1.5 rounded-xl border border-border/40 bg-muted/30 px-3 py-2.5 text-xs font-medium text-muted-foreground sm:text-sm"
                title="Pass this test to unlock the next step"
              >
                <Lock className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="hidden sm:inline">Pass to continue</span>
              </span>
            ) : nextStep && canGoNext ? (
              <Link
                href={stepHref(levelId, nextStep._id)}
                prefetch
                onMouseEnter={() => warmStep(nextStep)}
                onFocus={() => warmStep(nextStep)}
                className={cn(
                  navBtnClass,
                  "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-accent dark:text-primary-foreground dark:hover:bg-accent/90",
                )}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </Link>
            ) : nextLevelInfo && onNavigateToNextLevel ? (
              <button
                type="button"
                onClick={onNavigateToNextLevel}
                className={cn(
                  navBtnClass,
                  "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-accent dark:text-primary-foreground",
                )}
              >
                <span className="hidden max-w-[6rem] truncate sm:inline">Next level</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            ) : (
              <span
                className={cn(
                  navBtnClass,
                  "cursor-not-allowed border-border/30 bg-muted/20 text-muted-foreground/40",
                )}
                aria-disabled
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
