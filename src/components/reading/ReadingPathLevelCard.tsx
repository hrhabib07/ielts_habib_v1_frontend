"use client";

import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  Sparkles,
  Trophy,
  Video,
} from "lucide-react";
import type { Level } from "@/src/lib/api/levels";
import type { LevelDetailForStudent, LevelDetailStep } from "@/src/lib/api/readingStrictProgression";
import {
  getMockLevelLaunchState,
  isMockLevelOrder,
  shouldUseMockLevelPlaceholder,
} from "@/src/lib/readingMockLevelsLaunch";
import {
  pathLineSegmentClass,
  pathNodeClass,
  readingPathPremium,
  type PathLineSegment,
} from "@/src/lib/readingPathPremium";
import { formatLevelDisplayTitle } from "@/src/lib/formatLevelDisplayTitle";
import { groupLevelStepsIntoPhases } from "@/src/lib/readingPathZones";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<string, typeof BookOpen> = {
  VIDEO: Video,
  INSTRUCTION: BookOpen,
  QUIZ: Sparkles,
  PRACTICE_TEST: BookOpen,
  FINAL_EVALUATION: Trophy,
  INTEGRATED_LESSON: BookOpen,
};

function stepStatusFor(
  step: LevelDetailStep,
  stepIndex: number,
  detail: LevelDetailForStudent,
  curriculumDemoAccount: boolean,
) {
  const completedSet = new Set((detail.progress.completedStepIds ?? []).map(String));
  const completed = completedSet.has(step._id);
  const currentIndex = detail.progress.currentStepIndex ?? 0;
  const isLevelPassed = detail.progress.passStatus === "PASSED";
  const current = !isLevelPassed && stepIndex === currentIndex;
  const locked =
    !curriculumDemoAccount && !isLevelPassed && !completed && stepIndex > currentIndex;
  return { completed, current, locked };
}

export function ReadingPathLevelCard(props: {
  level: Level;
  levelIndex: number;
  displayNumber: number;
  unlocked: boolean;
  isCurrent: boolean;
  isExpanded: boolean;
  detail: LevelDetailForStudent | null;
  detailLoading: boolean;
  levels: Level[];
  currentOrder: number;
  detailCache: Record<string, LevelDetailForStudent>;
  curriculumDemoAccount: boolean;
  onToggle: () => void;
}) {
  const {
    level,
    displayNumber,
    unlocked,
    isCurrent,
    isExpanded,
    detail,
    detailLoading,
    levels,
    currentOrder,
    detailCache,
    curriculumDemoAccount,
    onToggle,
  } = props;

  const isPassed = detail?.progress.passStatus === "PASSED";
  const mockPlaceholder = shouldUseMockLevelPlaceholder(level.order);
  const mockLaunchState =
    mockPlaceholder && isMockLevelOrder(level.order)
      ? getMockLevelLaunchState({
          levelOrder: level.order,
          levelIndex: props.levelIndex,
          levels,
          currentOrder,
          detailCache,
          contextDetail: null,
          levelIdFromPath: null,
          curriculumDemoAccount,
        })
      : null;
  const isComingSoon = mockLaunchState === "coming_soon";
  const phases = detail ? groupLevelStepsIntoPhases(detail.steps) : [];
  const completedSteps = detail
    ? (detail.progress.completedStepIds ?? []).length
    : 0;
  const totalSteps = detail?.steps.length ?? 0;

  const levelTitle = formatLevelDisplayTitle(level, displayNumber);

  const lineSegment: PathLineSegment = isPassed
    ? "completed"
    : unlocked || mockPlaceholder
      ? "available"
      : "locked";

  const nodeState = isPassed
    ? "completed"
    : isCurrent
      ? "current"
      : unlocked || mockPlaceholder
        ? "unlocked"
        : "locked";

  const cardSurface = !unlocked && !mockPlaceholder
    ? readingPathPremium.cardLocked
    : isCurrent
      ? readingPathPremium.cardActive
      : readingPathPremium.cardDefault;

  return (
    <div className="relative pl-10 sm:pl-12">
      <div
        className={cn(
          "absolute left-[11px] top-0 h-full sm:left-[15px]",
          pathLineSegmentClass(lineSegment),
        )}
        aria-hidden
      />

      <div
        className={cn(
          "absolute left-0 top-5 flex h-6 w-6 items-center justify-center rounded-full border-2 sm:h-7 sm:w-7",
          pathNodeClass(nodeState),
        )}
      >
        {isPassed ? (
          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        ) : !unlocked && !mockPlaceholder ? (
          <Lock className="h-3 w-3 opacity-60" />
        ) : (
          <span className="text-[10px] font-bold tabular-nums sm:text-xs">{displayNumber}</span>
        )}
      </div>

      <div className="relative z-0">
        {isCurrent && !isPassed && (
          <div className={cn(readingPathPremium.cardActiveGlow, "-z-10")} aria-hidden />
        )}

        <div
          className={cn(
            "relative overflow-hidden rounded-2xl transition-all duration-300 ease-out",
            cardSurface,
            "bg-card",
            !unlocked && !mockPlaceholder && "saturate-[0.85]",
            mockPlaceholder && mockLaunchState === "locked" && "saturate-90",
          )}
        >
          <button
            type="button"
            onClick={onToggle}
            disabled={!unlocked && !mockPlaceholder}
            className={cn(
              "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors sm:px-5 sm:py-5",
              (unlocked || mockPlaceholder) && "hover:bg-accent/[0.02] dark:hover:bg-accent/[0.04]",
              !unlocked && !mockPlaceholder && "cursor-not-allowed",
            )}
          >
            <div className="min-w-0 flex-1">
              <p className={readingPathPremium.microLabel}>
                Level {displayNumber}
                {isComingSoon && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent dark:bg-accent/15">
                    <Clock className="h-3 w-3" />
                    Soon
                  </span>
                )}
              </p>
              <h3 className="mt-1 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {levelTitle}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {isPassed
                  ? "Completed"
                  : detail
                    ? `${completedSteps}/${totalSteps} steps`
                    : unlocked
                      ? "Tap to view curriculum"
                      : mockPlaceholder
                        ? "Preview locked curriculum"
                        : "Complete the previous level to unlock"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 pt-0.5">
              {isCurrent && !isPassed && (
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent ring-1 ring-accent/15">
                  Active
                </span>
              )}
              {(unlocked || mockPlaceholder) &&
                (isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground/70" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground/70" />
                ))}
            </div>
          </button>

          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-out",
              isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="overflow-hidden">
              <div className="border-t border-border/30 px-4 pb-5 pt-3 dark:border-border/40 sm:px-5">
                {detailLoading && !detail && (
                  <div className="space-y-3 py-3 animate-pulse">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 rounded-xl bg-muted/60 dark:bg-muted/40" />
                    ))}
                  </div>
                )}

                {isComingSoon && (
                  <div className="mb-4 rounded-xl border border-accent/15 bg-accent/[0.04] px-4 py-3 text-sm text-foreground ring-1 ring-accent/10 dark:border-accent/25 dark:bg-accent/10">
                    Full mock content unlocks in the first week after launch, in sha Allah. Your
                    progress is saved.
                  </div>
                )}

                {detail &&
                  phases.map((phase) => (
                    <div key={phase.id} className="mb-4 last:mb-0">
                      <p className={cn(readingPathPremium.microLabel, "mb-2.5")}>{phase.title}</p>
                      <ul className="space-y-2">
                        {phase.steps.map((step) => {
                          const stepIndex = detail.steps.findIndex((s) => s._id === step._id);
                          const status = stepStatusFor(
                            step,
                            stepIndex >= 0 ? stepIndex : step.order,
                            detail,
                            curriculumDemoAccount,
                          );
                          const Icon = STEP_ICONS[step.stepType] ?? BookOpen;
                          const mockLocked =
                            mockLaunchState === "locked" ||
                            (isComingSoon && mockPlaceholder);
                          const href = `/profile/reading/strict-levels/${level._id}?step=${encodeURIComponent(step._id)}`;
                          const canNavigate =
                            !mockLocked &&
                            (curriculumDemoAccount ||
                              status.completed ||
                              status.current ||
                              isPassed);

                          return (
                            <li key={step._id}>
                              {canNavigate ? (
                                <Link
                                  href={href}
                                  className={cn(
                                    "flex items-center gap-3 text-sm transition-all hover:ring-accent/20",
                                    status.current
                                      ? readingPathPremium.stepRowCurrent
                                      : readingPathPremium.stepRowDefault,
                                  )}
                                >
                                  <StepRowContent
                                    step={step}
                                    status={status}
                                    Icon={Icon}
                                    mockLocked={false}
                                  />
                                </Link>
                              ) : (
                                <div
                                  className={cn(
                                    "flex items-center gap-3 text-sm",
                                    readingPathPremium.stepRowLocked,
                                    mockLocked && "cursor-pointer hover:bg-muted/30",
                                  )}
                                  onClick={() => {
                                    if (mockPlaceholder) {
                                      window.location.href = href;
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (
                                      mockPlaceholder &&
                                      (e.key === "Enter" || e.key === " ")
                                    ) {
                                      window.location.href = href;
                                    }
                                  }}
                                  role={mockPlaceholder ? "button" : undefined}
                                  tabIndex={mockPlaceholder ? 0 : undefined}
                                >
                                  <StepRowContent
                                    step={step}
                                    status={status}
                                    Icon={Icon}
                                    mockLocked={mockLocked || status.locked}
                                  />
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepRowContent(props: {
  step: LevelDetailStep;
  status: { completed: boolean; current: boolean; locked: boolean };
  Icon: typeof BookOpen;
  mockLocked: boolean;
}) {
  const { step, status, Icon, mockLocked } = props;
  return (
    <>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
          status.completed
            ? "bg-accent/10 text-accent ring-accent/15 dark:bg-accent/15"
            : status.current
              ? "bg-primary text-primary-foreground ring-accent/20 dark:bg-accent dark:text-primary-foreground"
              : "bg-muted/50 text-muted-foreground ring-transparent dark:bg-muted/40",
        )}
      >
        {status.completed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : mockLocked || status.locked ? (
          <Lock className="h-3.5 w-3.5 opacity-70" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium tracking-tight text-foreground">{step.title}</p>
        {status.current && !status.completed && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
            Continue here
          </p>
        )}
      </div>
    </>
  );
}
