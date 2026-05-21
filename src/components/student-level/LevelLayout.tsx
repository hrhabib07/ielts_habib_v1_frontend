"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Menu, AlertTriangle } from "lucide-react";
import { LevelSidebar } from "./LevelSidebar";
import { LevelContent, LevelContentSkeleton } from "./LevelContent";
import { LevelStepBottomNav } from "./LevelStepBottomNav";
import { LevelFeedbackForm } from "./LevelFeedbackForm";
import type {
  LevelDetailForStudent,
  SubmitStepQuizResponse,
  LevelCompletionScore,
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
  onProgressUpdate: (
    progress: SubmitStepQuizResponse["progress"],
    completionScore?: LevelCompletionScore,
  ) => void;
  /** When set, step is driven by URL; no in-page sidebar (global sidebar used). */
  activeStepId?: string;
  onNavigate?: (stepId: string) => void;
  /** Hide the in-page sidebar (use global ReadingSidebar only). */
  hideSidebar?: boolean;
  /** When level is passed, show "Continue to Level X" or "You completed all levels!" */
  nextLevelInfo?: NextLevelInfo | null;
  /** Score shown in completion banner when level passed via quiz (e.g. 8/10, 80%) */
  completionScore?: LevelCompletionScore | null;
  /** Instructor preview mode: show read-only content, no real API calls for group tests */
  isPreview?: boolean;
  /** In preview, number of group tests (for final evaluation step message) */
  previewGroupTestsCount?: number;
  /** Level 0 sentence locator sequential finals */
  previewIsL0SentenceLocatorFinals?: boolean;
  /** When level passed: true = show Continue, false = show feedback form, null/undefined = loading (show neither) */
  hasFeedbackSubmitted?: boolean | null;
  /** Called after feedback is submitted so parent can show Continue button */
  onFeedbackSuccess?: () => void;
  /** Called when backend signals this level was updated and progress must restart. */
  onContentUpdateRequired?: () => void;
  /** Used when restart is triggered via a step/group-test API error (detail may not include the notice). */
  contentUpdateBannerMessage?: string | null;
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
  completionScore = null,
  isPreview = false,
  previewGroupTestsCount,
  previewIsL0SentenceLocatorFinals,
  hasFeedbackSubmitted,
  onFeedbackSuccess,
  onContentUpdateRequired,
  contentUpdateBannerMessage,
}: LevelLayoutProps) {
  const showContinue = hasFeedbackSubmitted === true;
  const showFeedbackForm = hasFeedbackSubmitted === false;
  const router = useRouter();
  const { progress, steps } = detail;
  const contentUpdateNotice = detail.contentUpdateNotice;
  const contentUpdateMessage = contentUpdateNotice?.message?.replace(
    /^LEVEL_CONTENT_UPDATED:\s*/i,
    "",
  );
  const showContentUpdateBanner = Boolean(
    contentUpdateNotice?.restartRequired || contentUpdateBannerMessage,
  );
  const contentUpdateDisplayMessage =
    contentUpdateMessage ?? contentUpdateBannerMessage ?? "";
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

  const contentScrollRef = useRef<HTMLDivElement>(null);
  const handleNavigate = useCallback(
    (stepId: string) => {
      if (onNavigate) {
        onNavigate(stepId);
      } else {
        setInternalStepId(stepId);
      }
      contentScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
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

  const dockBottomNav = hideSidebar && !isPreview && Boolean(onNavigate) && Boolean(activeStep);

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStepId]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {!hideSidebar && (
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Menu className="h-4 w-4" />
            Steps
            {completedSet.size > 0 && (
              <span className="ml-1 rounded-full bg-[#1e3a8a]/10 dark:bg-[#3b82f6]/20 px-1.5 py-0 text-xs font-semibold text-[#1e3a8a] dark:text-[#60a5fa]">
                {completedSet.size}/{steps.length}
              </span>
            )}
          </button>
          {activeStep && (
            <p className="max-w-[60%] truncate text-sm font-medium text-slate-700 dark:text-slate-300">
              {activeStep.title}
            </p>
          )}
        </div>
      )}
      {/* Main layout: full height, scroll inside content only */}
      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden">
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

        {/* Content area: scrollable lesson body + docked step bar (reading dashboard) */}
        <main
          className={[
            "min-h-0 min-w-0 flex-1 overflow-hidden bg-white dark:bg-slate-900",
            dockBottomNav
              ? "grid h-full grid-rows-[minmax(0,1fr)_auto]"
              : "flex h-full flex-col",
          ].join(" ")}
        >
          <div
            ref={contentScrollRef}
            className={[
              "overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]",
              dockBottomNav ? "min-h-0" : "min-h-0 flex-1",
            ].join(" ")}
          >
            <div className="w-full p-0">
          {showContentUpdateBanner && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-amber-200/70 dark:border-amber-800/70 bg-amber-50/40 dark:bg-amber-950/30 p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Level content updated
                  </p>
                  <p className="mt-1 text-sm text-amber-800/90 dark:text-amber-200">
                    {contentUpdateDisplayMessage ||
                      "Admin updated this level. Restart from the beginning."}
                  </p>
                  {onContentUpdateRequired && (
                    <button
                      type="button"
                      onClick={onContentUpdateRequired}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0f172a] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
                    >
                      Go to first step
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {isLevelPassed && (
            <div
              data-level-completed-banner
              className="mb-8 flex flex-col gap-6 rounded-2xl border border-[#1e3a8a]/20 dark:border-[#3b82f6]/30 bg-gradient-to-br from-[#1e3a8a]/5 to-[#1e3a8a]/10 dark:from-[#1e3a8a]/15 dark:to-[#1e3a8a]/25 px-6 py-6 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1e3a8a] dark:text-[#60a5fa]" />
                  <div>
                    <p className="text-sm font-semibold text-[#0f172a] dark:text-slate-100">
                      Level completed!
                    </p>
                    <p className="text-xs text-[#1e3a8a]/80 dark:text-slate-400">
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
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  {completionScore != null && (
                    <div className="rounded-xl bg-[#1e3a8a]/15 dark:bg-[#3b82f6]/20 px-4 py-2 text-right">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#1e3a8a] dark:text-[#60a5fa]">
                        Score
                      </p>
                      <p className="text-lg font-bold tabular-nums text-[#0f172a] dark:text-slate-100">
                        {completionScore.score}/{completionScore.total}
                        <span className="ml-1.5 text-sm font-semibold">
                          ({Math.round(completionScore.percentage)}%)
                        </span>
                      </p>
                    </div>
                  )}
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
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f172a] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
                    >
                      Continue to {nextLevelInfo.title}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <p className="text-sm font-medium text-[#1e3a8a] dark:text-[#60a5fa]">
                      🎉 You completed all levels!
                    </p>
                  )
                )}
                </div>
              </div>
              {isLevelPassed && showFeedbackForm && onFeedbackSuccess && (
                <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900/95 p-6 shadow-sm backdrop-blur-sm">
                  <LevelFeedbackForm
                    levelId={detail.level._id}
                    onSuccess={onFeedbackSuccess}
                    showVideoQuestion
                  />
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg bg-slate-50/60 dark:bg-slate-800/30 p-4 lg:p-6">
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
                  dockBottomNav={dockBottomNav}
                  versionId={isPreview ? detail.progress.versionId : undefined}
                  previewGroupTestsCount={previewGroupTestsCount}
                  previewIsL0SentenceLocatorFinals={previewIsL0SentenceLocatorFinals}
                  groupTestsTotal={detail.progress.groupTestsTotal}
                  groupTestsRemaining={detail.progress.groupTestsRemaining}
                  isLevelPassed={isLevelPassed}
                  nextLevelInfo={nextLevelInfo}
                  onContentUpdateRequired={onContentUpdateRequired}
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
          </div>
          {dockBottomNav && activeStep && (
            <LevelStepBottomNav
              step={activeStep}
              stepIndex={activeStepIndex + 1}
              totalSteps={steps.length}
              allSteps={steps}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              completingStepId={completingStepId}
              onNavigate={handleNavigate}
              onComplete={onComplete}
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
        </main>
      </div>
    </div>
  );
}
