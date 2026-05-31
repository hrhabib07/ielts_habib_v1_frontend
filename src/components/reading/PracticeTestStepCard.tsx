"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  Eye,
  FileText,
  Repeat,
  RotateCcw,
  ChevronRight,
  Target,
  Trophy,
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
  content: PracticeTestStepContent;
  stepIndex: number;
  totalSteps: number;
}

function StatTile(props: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  const Icon = props.icon;
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border/35 bg-muted/30 px-3 py-3.5 ring-1 ring-[color:var(--accent)]/[0.04] dark:bg-muted/20">
      <Icon className="h-4 w-4 text-accent/80" strokeWidth={1.75} aria-hidden />
      <div className="text-center">
        <p className="text-sm font-semibold tabular-nums text-foreground">{props.value}</p>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {props.label}
        </p>
      </div>
    </div>
  );
}

/**
 * Focused pre-test launch — single accent, no duplicate chrome.
 */
export function PracticeTestStepCard({
  levelId,
  stepId,
  content,
  stepIndex,
  totalSteps,
}: PracticeTestStepCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PracticeTestStepStatus | null>(null);
  const testHref = practiceTestHref(levelId, stepId, true);

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

  const hasAttempts = status && status.attemptCount > 0;
  const isSl = isSentenceLocatorPracticeContent(content);
  const showReviewLink =
    Boolean(status?.lastAttemptId) &&
    (isSl ? status?.canReviewLastAttempt !== false : Boolean(status?.lastAttemptPassed));

  const minutes = isSl ? content.timeLimitMinutes : PRACTICE_TEST_MINUTES;
  const headline = content.title?.trim() || (isSl ? "Sentence locator" : "Practice test");

  return (
    <div className="mx-auto w-full max-w-md animate-fade-up">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/40 bg-card",
          "shadow-[0_8px_32px_-12px_rgba(15,23,42,0.12)] ring-1 ring-[color:var(--accent)]/[0.08]",
          "dark:border-border/50 dark:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.55)] dark:ring-accent/12",
        )}
      >
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-accent/70" aria-hidden />

        <div className="px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex items-center justify-between gap-3">
            <p className={readingPathPremium.microLabel}>
              Step {stepIndex} of {totalSteps} · Practice
            </p>
            {hasAttempts && (
              <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                {status!.attemptCount}× tried
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center text-center">
            <div className="mb-5 flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20 dark:bg-accent/15">
              <FileText className="h-7 w-7" strokeWidth={1.65} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">{headline}</h1>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {isSl
                ? "Match each statement to the exact sentence in the passage."
                : "One timed passage. Hit your target band to unlock the next step."}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2">
            <StatTile icon={Clock} value={`${minutes}m`} label="Duration" />
            {isSl ? (
              <StatTile icon={Target} value="Match" label="Format" />
            ) : (
              <StatTile icon={BookOpen} value="1" label="Passage" />
            )}
            <StatTile icon={Repeat} value="∞" label="Retries" />
          </div>

          {hasAttempts && (
            <div className="mt-6 space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-accent/25 bg-gradient-to-br from-accent/[0.12] via-card to-accent/[0.06] px-4 py-4 ring-1 ring-accent/15 dark:from-accent/20 dark:via-card dark:to-accent/10">
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,0.35)_50%,transparent_65%)] opacity-60 animate-cta-shimmer dark:opacity-25"
                  aria-hidden
                />
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent ring-1 ring-accent/25 dark:bg-accent/20">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className={readingPathPremium.microLabel}>Current best</p>
                      <p className="text-sm font-medium text-muted-foreground">Band score</p>
                    </div>
                  </div>
                  <p
                    className="animate-reading-count text-3xl font-bold tabular-nums tracking-tight text-accent drop-shadow-[0_1px_12px_rgba(30,58,138,0.25)] dark:drop-shadow-[0_1px_16px_rgba(56,189,248,0.35)]"
                    style={{ animationDelay: "0.15s" }}
                  >
                    {status!.bestBandScore}
                  </p>
                </div>
              </div>

              {showReviewLink && status!.lastAttemptId && (
                <Link
                  href={`/profile/reading/practice-attempt/${status!.lastAttemptId}`}
                  prefetch
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/40 bg-muted/25 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/[0.06] hover:text-accent dark:bg-muted/15"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  Review last attempt
                </Link>
              )}
            </div>
          )}

          <div className="mt-7">
            <Link
              href={testHref}
              prefetch
              onMouseEnter={() => {
                prefetchStepContent(levelId, stepId);
                preloadPracticeTestViews();
              }}
              className={cn(
                "group/btn relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-accent px-4 py-3.5 text-[15px] font-semibold text-accent-foreground",
                "shadow-[0_2px_12px_-2px_rgba(30,58,138,0.4)] transition-all duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(30,58,138,0.5)]",
                "active:translate-y-0 active:scale-[0.992]",
                "dark:shadow-[0_2px_14px_-2px_rgba(56,189,248,0.35)]",
              )}
            >
              <span
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.22)_50%,transparent_70%)] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100 group-hover/btn:animate-cta-shimmer"
                aria-hidden
              />
              <span className="relative z-10 inline-flex items-center gap-2.5">
                {hasAttempts ? (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Try again
                  </>
                ) : (
                  <>
                    Start test
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </span>
            </Link>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Timer starts when you begin · answers save automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
