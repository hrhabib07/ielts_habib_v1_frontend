"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ChevronRight, ChevronLeft, Menu, AlertTriangle, Map } from "lucide-react";
import { LevelSidebar } from "./LevelSidebar";
import { LevelContent, LevelContentSkeleton } from "./LevelContent";
import { LevelStepBottomNav } from "./LevelStepBottomNav";
import { LevelFeedbackForm } from "./LevelFeedbackForm";
import { readingPathPremium } from "@/src/lib/readingPathPremium";
import { cn } from "@/lib/utils";
import type {
  LevelDetailForStudent,
  SubmitStepQuizResponse,
  LevelCompletionScore,
} from "@/src/lib/api/readingStrictProgression";
import { stripRedundantFinalEvaluationSteps } from "@/src/lib/levelRoadmapUtils";

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
  /** Show link back to level roadmap (reading strict-levels without ?step=). */
  showRoadmapLink?: boolean;
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
  showRoadmapLink = false,
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
  const { progress } = detail;
  const steps = stripRedundantFinalEvaluationSteps(detail.steps);
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

  const isPracticeTestLauncher =
    activeStep?.stepType === "PRACTICE_TEST" && !isCompleted && !isPreview;
  const isFinalEvaluationLauncher =
    activeStep?.stepType === "FINAL_EVALUATION" && !isPreview;
  const isPremiumLauncherStep = isPracticeTestLauncher || isFinalEvaluationLauncher;

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStepId]);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden",
        isPremiumLauncherStep
          ? cn("bg-background", readingPathPremium.pageTexture)
          : "bg-slate-50 dark:bg-slate-950",
      )}
    >
      {showRoadmapLink && hideSidebar && (
        <div className="flex shrink-0 items-center border-b border-border/50 bg-background/80 px-4 py-2.5 backdrop-blur-sm dark:bg-background/60">
          <Link
            href={`/profile/reading/strict-levels/${detail.level._id}`}
            className="inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Map className="h-4 w-4 text-accent" />
            <span className="hidden sm:inline">Level roadmap</span>
            <ChevronLeft className="h-4 w-4 sm:hidden" />
          </Link>
        </div>
      )}
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
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
            isPremiumLauncherStep ? "bg-background" : "bg-white dark:bg-slate-900",
          )}
        >
          <div
            ref={contentScrollRef}
            className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
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
              className="mb-8 overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-indigo-50 shadow-md dark:border-emerald-800/40 dark:from-emerald-950/30 dark:via-slate-900 dark:to-indigo-950/20"
            >
              <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/50">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Level completed!
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {showFeedbackForm
                        ? "Share quick feedback below, then continue to your next level."
                        : showContinue
                          ? nextLevelInfo
                            ? "You passed every step. The next level is unlocked whenever you're ready."
                            : "Congratulations — you've finished every level in this path."
                          : "Checking your progress…"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  {completionScore != null && (
                    <div className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 text-right dark:border-slate-700 dark:bg-slate-900/80">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Overall score
                      </p>
                      <p className="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {completionScore.score}/{completionScore.total}
                        <span className="ml-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
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
                        router.push(
                          `/profile/reading/strict-levels/${nextLevelInfo.levelId}`,
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

          <div
            className={cn(
              isPremiumLauncherStep
                ? cn(
                    "px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5",
                    readingPathPremium.pageTexture,
                  )
                : "rounded-lg bg-slate-50/60 p-4 dark:bg-slate-800/30 lg:p-6",
            )}
          >
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
                  levelOrder={detail.level.order}
                  isLevelPassed={isLevelPassed}
                  nextLevelInfo={nextLevelInfo}
                  onContentUpdateRequired={onContentUpdateRequired}
                  onNavigateToNextLevel={
                    nextLevelInfo
                      ? () => {
                          router.push(
                            `/profile/reading/strict-levels/${nextLevelInfo.levelId}`,
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
              levelId={detail.level._id}
              step={activeStep}
              stepIndex={activeStepIndex + 1}
              totalSteps={steps.length}
              allSteps={steps}
              currentStepIndex={currentIndex}
              completedStepIds={progress.completedStepIds ?? []}
              isLevelPassed={isLevelPassed}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              completingStepId={completingStepId}
              onNavigate={handleNavigate}
              onComplete={onComplete}
              nextLevelInfo={nextLevelInfo}
              onNavigateToNextLevel={
                nextLevelInfo
                  ? () => {
                      router.push(
                        `/profile/reading/strict-levels/${nextLevelInfo.levelId}`,
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
