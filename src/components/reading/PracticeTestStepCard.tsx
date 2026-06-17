"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Eye,
  Repeat,
  RotateCcw,
  ChevronRight,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import type {
  PracticeTestStepContent,
  PracticeTestStepStatus,
} from "@/src/lib/api/readingStrictProgression";
import {
  getPracticeTestStepStatus,
  isSentenceLocatorPracticeContent,
} from "@/src/lib/api/readingStrictProgression";
import { PRACTICE_TEST_MINUTES } from "@/src/constants/readingAssessmentTiming";
import { readingPathPremium } from "@/src/lib/readingPathPremium";
import {
  isSequentialFinalTitle,
  sequentialFinalNumberFromTitle,
} from "@/src/lib/levelRoadmapUtils";
import { stripLevelTitlePrefix } from "@/src/lib/formatLevelDisplayTitle";
import {
  prefetchStepContent,
  preloadPracticeTestViews,
} from "@/src/lib/readingStepContentCache";
import {
  practiceTestHref,
  prefetchPracticeTestRoute,
} from "@/src/lib/prefetchReadingRoutes";
import { cn } from "@/lib/utils";

export interface PracticeTestStepCardProps {
  levelId: string;
  stepId: string;
  stepTitle: string;
  stepIndex: number;
  totalSteps: number;
  content?: PracticeTestStepContent | null;
  /** Hide in-card progress when bottom step nav is visible. */
  hideInlineProgress?: boolean;
}

function StatTile(props: {
  icon: typeof Clock;
  label: string;
  value: string;
  accent?: "default" | "final";
}) {
  const Icon = props.icon;
  const isFinal = props.accent === "final";
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center gap-2 rounded-2xl border px-3 py-4 ring-1",
        isFinal
          ? "border-amber-200/60 bg-amber-50/50 ring-amber-500/10 dark:border-amber-900/40 dark:bg-amber-950/20 dark:ring-amber-500/15"
          : "border-border/40 bg-muted/30 ring-[color:var(--accent)]/[0.04] dark:bg-muted/20",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          isFinal ? "text-amber-600 dark:text-amber-400" : "text-accent",
        )}
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="text-center">
        <p className="text-lg font-bold tabular-nums tracking-tight text-foreground">
          {props.value}
        </p>
        <p className={readingPathPremium.microLabel}>{props.label}</p>
      </div>
    </div>
  );
}

/**
 * Pre-test launch. aligned with Gamlish reading-path surfaces (light, premium SaaS).
 */
export function PracticeTestStepCard({
  levelId,
  stepId,
  stepTitle,
  content,
  stepIndex,
  totalSteps,
  hideInlineProgress = false,
}: PracticeTestStepCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PracticeTestStepStatus | null>(null);
  const testHref = practiceTestHref(levelId, stepId, true);

  const isFinal = useMemo(() => isSequentialFinalTitle(stepTitle), [stepTitle]);
  const finalNumber = useMemo(() => sequentialFinalNumberFromTitle(stepTitle), [stepTitle]);
  const kindLabel = isFinal
    ? finalNumber != null
      ? `Final ${finalNumber}`
      : "Final test"
    : "Practice test";

  const displayTitle = useMemo(() => {
    const fromContent = content?.title?.trim();
    if (fromContent) return stripLevelTitlePrefix(fromContent);
    return stripLevelTitlePrefix(stepTitle.trim()) || kindLabel;
  }, [content?.title, stepTitle, kindLabel]);

  useEffect(() => {
    prefetchStepContent(levelId, stepId);
    preloadPracticeTestViews();
    prefetchPracticeTestRoute(router, levelId, stepId, true);
  }, [levelId, stepId, router]);

  useEffect(() => {
    getPracticeTestStepStatus(levelId, stepId)
      .then(setStatus)
      .catch(() => setStatus(null));
  }, [levelId, stepId]);

  const hasAttempts = status != null && status.attemptCount > 0;
  const attemptsExhausted = Boolean(status?.attemptsExhausted);
  const canStartTest = !attemptsExhausted;
  const isSl = content != null && isSentenceLocatorPracticeContent(content);
  const showReviewLink =
    Boolean(status?.lastAttemptId) &&
    (isSl ? status?.canReviewLastAttempt !== false : Boolean(status?.lastAttemptPassed));

  const minutes = content
    ? isSl
      ? content.timeLimitMinutes
      : PRACTICE_TEST_MINUTES
    : PRACTICE_TEST_MINUTES;

  const stepPct = Math.round((stepIndex / Math.max(totalSteps, 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto w-full max-w-xl"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          readingPathPremium.cardActive,
          "bg-card/95 backdrop-blur-sm",
        )}
      >
        <div className={cn(readingPathPremium.cardActiveGlow, "-z-10")} aria-hidden />
        <div
          className={cn(
            "h-1 w-full",
            isFinal
              ? "bg-gradient-to-r from-amber-500/80 via-amber-600 to-amber-500/60"
              : "bg-gradient-to-r from-primary via-accent to-accent/80",
          )}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 blur-3xl dark:bg-accent/15"
          aria-hidden
        />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ring-1",
                  isFinal
                    ? "bg-amber-500/10 text-amber-800 ring-amber-500/20 dark:bg-amber-500/15 dark:text-amber-200"
                    : "bg-accent/10 text-accent ring-accent/15 dark:bg-accent/15",
                )}
              >
                {isFinal ? <Trophy className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                {kindLabel}
              </span>
              <span className={readingPathPremium.microLabel}>
                Step {stepIndex} of {totalSteps}
              </span>
            </div>
            {hasAttempts && (
              <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                {status!.attemptCount}� tried
              </span>
            )}
          </div>

          <div className="mt-6 flex gap-4 sm:mt-7 sm:gap-5">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 sm:h-16 sm:w-16",
                isFinal
                  ? "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 ring-amber-200/80 dark:from-amber-950/50 dark:to-amber-900/30 dark:text-amber-300 dark:ring-amber-800/50"
                  : "bg-gradient-to-br from-accent/15 to-accent/5 text-accent ring-accent/20 dark:from-accent/25 dark:to-accent/10",
              )}
            >
              {isFinal ? (
                <Trophy className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.5} />
              ) : (
                <BookOpen className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.5} />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className={cn(readingPathPremium.heroTitle, "text-xl sm:text-2xl")}>
                {displayTitle}
              </h1>
              <p className={cn(readingPathPremium.heroBody, "mt-2")}>
                {isFinal
                  ? attemptsExhausted && !status?.passed
                    ? "One attempt used. Continue to the next final below, or pass at target band to finish the level."
                    : "One attempt only. pass at target band to complete the level, or move on to the next final."
                  : isSl
                    ? "Match each statement to the exact sentence in the passage."
                    : "One timed passage. Hit your target band to unlock the next step."}
              </p>
            </div>
          </div>

          {!hideInlineProgress && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Level progress</span>
                <span className="tabular-nums">{stepPct}%</span>
              </div>
              <div className={readingPathPremium.progressTrack}>
                <div
                  className={readingPathPremium.progressFill}
                  style={{ width: `${stepPct}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2.5 sm:gap-3">
            <StatTile
              icon={Clock}
              value={`${minutes}m`}
              label="Duration"
              accent={isFinal ? "final" : "default"}
            />
            {isSl ? (
              <StatTile icon={Target} value="Match" label="Format" accent={isFinal ? "final" : "default"} />
            ) : (
              <StatTile icon={BookOpen} value="1" label="Passage" accent={isFinal ? "final" : "default"} />
            )}
            <StatTile
              icon={Repeat}
              value={isFinal ? "1" : "∞"}
              label={isFinal ? "Attempt" : "Retries"}
              accent={isFinal ? "final" : "default"}
            />
          </div>

          {hasAttempts && (
            <div className="mt-6 space-y-3">
              <div
                className={cn(
                  "flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 ring-1",
                  isFinal
                    ? "border-amber-200/50 bg-amber-50/40 ring-amber-500/10 dark:border-amber-900/40 dark:bg-amber-950/25"
                    : "border-accent/20 bg-accent/[0.04] ring-accent/10 dark:bg-accent/10",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl ring-1",
                      isFinal
                        ? "bg-amber-500/15 text-amber-700 ring-amber-500/20 dark:text-amber-300"
                        : "bg-accent/10 text-accent ring-accent/15",
                    )}
                  >
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={readingPathPremium.microLabel}>Current best</p>
                    <p className="text-sm font-medium text-muted-foreground">Band score</p>
                  </div>
                </div>
                <p
                  className={cn(
                    "text-3xl font-bold tabular-nums tracking-tight",
                    isFinal ? "text-amber-700 dark:text-amber-300" : "text-accent",
                  )}
                >
                  {status!.bestBandScore}
                </p>
              </div>

              {showReviewLink && status!.lastAttemptId && (
                <Link
                  href={`/profile/reading/practice-attempt/${status!.lastAttemptId}`}
                  prefetch
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/40 bg-card py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-accent/25 hover:bg-accent/[0.04] hover:text-accent"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  Review last attempt
                </Link>
              )}
            </div>
          )}

          <div className="mt-7 sm:mt-8">
            {canStartTest ? (
            <Link
              href={testHref}
              prefetch
              onMouseEnter={() => {
                prefetchStepContent(levelId, stepId);
                preloadPracticeTestViews();
              }}
              className={cn(
                "group/btn relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-sm",
                "bg-primary transition-all duration-200 hover:bg-primary/90 hover:shadow-md",
                "dark:bg-accent dark:text-primary-foreground dark:hover:bg-accent/90",
                "active:scale-[0.992]",
              )}
            >
              <span
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.12)_50%,transparent_70%)] opacity-0 transition-opacity group-hover/btn:opacity-100"
                aria-hidden
              />
              <span className="relative z-10 inline-flex items-center gap-2">
                {hasAttempts && !isFinal ? (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Try again
                  </>
                ) : (
                  <>
                    Start test
                    <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                  </>
                )}
              </span>
            </Link>
            ) : (
              <div
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-center",
                  isFinal
                    ? "border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/25"
                    : "border-border/40 bg-muted/30",
                )}
              >
                <p className="text-sm font-semibold text-foreground">Attempt used</p>
                <p className="text-xs text-muted-foreground">
                  Use <strong className="font-semibold text-foreground">Next</strong> below to try the
                  next final test.
                </p>
              </div>
            )}
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Timer starts when you begin · answers save automatically
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
