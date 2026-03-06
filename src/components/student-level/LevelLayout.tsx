"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Menu } from "lucide-react";
import { LevelSidebar } from "./LevelSidebar";
import { LevelContent, LevelContentSkeleton } from "./LevelContent";
import { LevelFeedbackForm } from "./LevelFeedbackForm";
import type {
  LevelDetailForStudent,
  SubmitStepQuizResponse,
} from "@/src/lib/api/readingStrictProgression";

export interface NextLevelInfo {
  levelId: string;
  title: string;
  firstStepId: string;
}

interface LevelLayoutProps {
  detail: LevelDetailForStudent;
  loading?: boolean;
  completingStepId: string | null;
  onComplete: (stepId: string) => void;
  onLevelPassed: () => void;
  onProgressUpdate: (progress: SubmitStepQuizResponse["progress"]) => void;
  /** When set, step is driven by URL; no in-page sidebar (global sidebar used). */
  activeStepId?: string;
  onNavigate?: (stepId: string) => void;
  /** Hide the in-page sidebar (use global ReadingSidebar only). */
  hideSidebar?: boolean;
  /** When level is passed, show "Continue to Level X" or "You completed all levels!" */
  nextLevelInfo?: NextLevelInfo | null;
  /** Instructor preview mode: show read-only content, no real API calls for group tests */
  isPreview?: boolean;
  /** In preview, number of group tests (for final evaluation step message) */
  previewGroupTestsCount?: number;
  /** When level passed: true = show Continue, false = show feedback form, null/undefined = loading (show neither) */
  hasFeedbackSubmitted?: boolean | null;
  /** Called after feedback is submitted so parent can show Continue button */
  onFeedbackSuccess?: () => void;
}

export function LevelLayout({
  detail,
  loading = false,
  completingStepId,
  onComplete,
  onLevelPassed,
  onProgressUpdate,
  activeStepId: controlledStepId,
  onNavigate,
  hideSidebar = false,
  nextLevelInfo = null,
  isPreview = false,
  previewGroupTestsCount,
  hasFeedbackSubmitted,
  onFeedbackSuccess,
}: LevelLayoutProps) {
  const showContinue = hasFeedbackSubmitted === true;
  const showFeedbackForm = hasFeedbackSubmitted === false;
  const router = useRouter();
  const { progress, steps } = detail;
  const currentIndex = progress.currentStepIndex ?? 0;
  const completedSet = new Set((progress.completedStepIds ?? []).map(String));
  const isLevelPassed = progress.passStatus === "PASSED";

  const firstUnlockedStep = steps[currentIndex] ?? steps[0];
  const [internalStepId, setInternalStepId] = useState<string>(
    firstUnlockedStep?._id ?? steps[0]?._id ?? "",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeStepId =
    controlledStepId ??
    internalStepId ??
    firstUnlockedStep?._id ??
    steps[0]?._id ??
    "";

  const handleStepClick = useCallback(
    (stepId: string) => {
      setDrawerOpen(false);
      if (onNavigate) onNavigate(stepId);
      else setInternalStepId(stepId);
    },
    [onNavigate],
  );

  const handleNavigate = useCallback(
    (stepId: string) => {
      if (onNavigate) {
        onNavigate(stepId);
      } else {
        setInternalStepId(stepId);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [onNavigate],
  );

  const activeStepIndex = steps.findIndex((s) => s._id === activeStepId);
  const activeStep = steps[activeStepIndex] ?? null;

  const isCompleted = activeStep ? completedSet.has(activeStep._id) : false;
  const isLocked = isLevelPassed
    ? false
    : activeStep
      ? !completedSet.has(activeStep._id) && activeStepIndex > currentIndex
      : false;
  const isCurrent = activeStep
    ? !isCompleted && activeStepIndex === currentIndex
    : false;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      {!hideSidebar && (
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm"
          >
            <Menu className="h-4 w-4" />
            Steps
            {completedSet.size > 0 && (
              <span className="ml-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-1.5 py-0 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                {completedSet.size}/{steps.length}
              </span>
            )}
          </button>
          {activeStep && (
            <p className="max-w-[60%] truncate text-sm font-medium text-gray-700 dark:text-gray-300">
              {activeStep.title}
            </p>
          )}
        </div>
      )}
      {/* Main layout */}
      <div className="mx-auto flex max-w-300 gap-6 px-4 py-6 lg:px-6 lg:py-8">
        {!hideSidebar && (
          <LevelSidebar
            detail={detail}
            activeStepId={activeStepId}
            completedSet={completedSet}
            onStepClick={handleStepClick}
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />
        )}

        {/* Content area */}
        <main className="min-w-0 flex-1">
          {isLevelPassed && (
            <div
              data-level-completed-banner
              className="mb-6 flex flex-col gap-4 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-5 py-4 shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                      Level completed!
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">
                      {showFeedbackForm
                        ? "Share quick feedback to continue to the next level."
                        : showContinue
                          ? nextLevelInfo
                            ? "Next level is unlocked. Use the button below to continue."
                            : "Great work. You've passed all steps in this level."
                          : "Checking…"}
                    </p>
                  </div>
                </div>
                {showContinue && (
                  nextLevelInfo ? (
                    <button
                      type="button"
                      onClick={() => {
                        const stepParam = nextLevelInfo.firstStepId
                          ? `?step=${encodeURIComponent(nextLevelInfo.firstStepId)}`
                          : "";
                        router.push(
                          `/profile/reading/strict-levels/${nextLevelInfo.levelId}${stepParam}`,
                        );
                      }}
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                    >
                      Continue to {nextLevelInfo.title}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      🎉 You completed all levels!
                    </p>
                  )
                )}
              </div>
              {isLevelPassed && showFeedbackForm && onFeedbackSuccess && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 p-4">
                  <LevelFeedbackForm
                    levelId={detail.level._id}
                    onSuccess={onFeedbackSuccess}
                    showVideoQuestion
                  />
                </div>
              )}
            </div>
          )}

          <div className="min-h-100 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-7 shadow-sm lg:px-8 lg:py-9">
            <div className="mx-auto max-w-200">
              {loading ? (
                <LevelContentSkeleton />
              ) : (
                <LevelContent
                  step={activeStep}
                  stepIndex={activeStepIndex + 1}
                  totalSteps={steps.length}
                  isCompleted={isCompleted}
                  isLocked={isLocked}
                  isCurrent={isCurrent}
                  levelId={detail.level._id}
                  completingStepId={completingStepId}
                  onComplete={onComplete}
                  onLevelPassed={onLevelPassed}
                  onProgressUpdate={onProgressUpdate}
                  onNavigate={handleNavigate}
                  allSteps={steps}
                  isPreview={isPreview}
                  versionId={isPreview ? detail.progress.versionId : undefined}
                  previewGroupTestsCount={previewGroupTestsCount}
                  isLevelPassed={isLevelPassed}
                  nextLevelInfo={nextLevelInfo}
                  onNavigateToNextLevel={
                    nextLevelInfo
                      ? () => {
                          const stepParam = nextLevelInfo.firstStepId
                            ? `?step=${encodeURIComponent(nextLevelInfo.firstStepId)}`
                            : "";
                          router.push(
                            `/profile/reading/strict-levels/${nextLevelInfo.levelId}${stepParam}`,
                          );
                        }
                      : undefined
                  }
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
