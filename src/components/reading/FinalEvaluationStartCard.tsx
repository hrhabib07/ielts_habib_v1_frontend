"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Loader2,
  Lock,
  Target,
  Trophy,
} from "lucide-react";
import {
  getFinalPhaseStatus,
  type FinalPhaseStatus,
} from "@/src/lib/api/readingStrictProgression";
import { readingPathPremium } from "@/src/lib/readingPathPremium";
import { cn } from "@/lib/utils";

export interface FinalEvaluationStartCardProps {
  levelId: string;
  groupTestsTotal?: number;
  groupTestsRemaining?: number;
  isLocked?: boolean;
  stepIndex?: number;
  totalSteps?: number;
  hideInlineProgress?: boolean;
}

function StatTile(props: {
  icon: typeof Clock;
  value: string;
  label: string;
}) {
  const Icon = props.icon;
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-2xl border border-amber-200/50 bg-amber-50/40 px-3 py-4 ring-1 ring-amber-500/10 dark:border-amber-900/40 dark:bg-amber-950/20 dark:ring-amber-500/15">
      <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={1.75} aria-hidden />
      <div className="text-center">
        <p className="text-lg font-bold tabular-nums tracking-tight text-foreground">
          {props.value}
        </p>
        <p className={readingPathPremium.microLabel}>{props.label}</p>
      </div>
    </div>
  );
}

function FinalTestProgressRail({ status }: { status: FinalPhaseStatus }) {
  const attemptsByIndex = useMemo(
    () => new Map(status.strictAttempts.map((a) => [a.finalTestIndex, a])),
    [status.strictAttempts],
  );

  return (
    <div className="mt-6">
      <p className={cn(readingPathPremium.microLabel, "mb-3")}>Final test sequence</p>
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {([1, 2, 3] as const).map((n) => {
          const attempt = attemptsByIndex.get(n);
          const isNext = status.nextFinalTestIndex === n && !status.isMastered;
          const isPassed = attempt?.passed === true;
          const isAttempted = attempt != null;

          return (
            <div
              key={n}
              className={cn(
                "relative flex flex-col items-center rounded-2xl border px-2 py-3 text-center ring-1 transition-colors sm:px-3 sm:py-3.5",
                isPassed
                  ? "border-emerald-500/30 bg-emerald-500/10 ring-emerald-500/15"
                  : isNext
                    ? "border-amber-400/50 bg-amber-500/10 ring-amber-500/25 shadow-[0_0_0_1px_rgba(245,158,11,0.15)]"
                    : isAttempted
                      ? "border-border/50 bg-muted/30 ring-border/30"
                      : "border-border/35 bg-muted/15 ring-transparent opacity-80",
              )}
            >
              {isNext ? (
                <span className="absolute -top-2 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  Next
                </span>
              ) : null}
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold tabular-nums",
                  isPassed
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : isNext
                      ? "bg-amber-500/20 text-amber-800 dark:text-amber-200"
                      : "bg-muted/60 text-muted-foreground",
                )}
              >
                {isPassed ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                ) : (
                  n
                )}
              </span>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Final {n}
              </p>
              {attempt ? (
                <p
                  className={cn(
                    "mt-0.5 text-xs font-bold tabular-nums",
                    attempt.passed
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground",
                  )}
                >
                  Band {attempt.bandScore}
                </p>
              ) : (
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">Not started</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SequentialFinalEvaluationCard({
  levelId,
  status,
  isLocked,
  stepIndex,
  totalSteps,
  hideInlineProgress,
}: {
  levelId: string;
  status: FinalPhaseStatus;
  isLocked?: boolean;
  stepIndex?: number;
  totalSteps?: number;
  hideInlineProgress?: boolean;
}) {
  const router = useRouter();
  const nextIndex = status.nextFinalTestIndex;
  const hasAttempts = status.strictAttempts.length > 0;
  const canStart = !isLocked && nextIndex != null;
  const resultsHref = `/profile/reading/strict-levels/${levelId}/final-evaluation?view=results`;
  const startHref = `/profile/reading/strict-levels/${levelId}/final-evaluation`;

  const stepPct =
    stepIndex != null && totalSteps != null
      ? Math.round((stepIndex / Math.max(totalSteps, 1)) * 100)
      : null;

  const statusLine = isLocked
    ? "Complete all practice tests to unlock your finals."
    : status.isMastered
      ? "Level mastered — you passed a final at target band."
      : nextIndex != null
        ? `Ready for Final Test ${nextIndex}. Pass at target band to master this level.`
        : hasAttempts
          ? "All three finals attempted — review your scores below."
          : "Final evaluation unlocks after practice tests.";

  useEffect(() => {
    if (canStart) {
      router.prefetch(startHref);
    }
  }, [canStart, router, startHref]);

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
          className="h-1 w-full bg-gradient-to-r from-amber-500/80 via-amber-600 to-amber-500/60"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl"
          aria-hidden
        />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-800 ring-1 ring-amber-500/20 dark:bg-amber-500/15 dark:text-amber-200">
                <Trophy className="h-3 w-3" />
                Final evaluation
              </span>
              {stepIndex != null && totalSteps != null ? (
                <span className={readingPathPremium.microLabel}>
                  Step {stepIndex} of {totalSteps}
                </span>
              ) : null}
            </div>
            {status.isMastered ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Mastered
              </span>
            ) : null}
          </div>

          <div className="mt-6 flex gap-4 sm:mt-7 sm:gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-200/80 dark:from-amber-950/50 dark:to-amber-900/30 dark:text-amber-300 dark:ring-amber-800/50 sm:h-16 sm:w-16">
              <BarChart2 className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className={cn(readingPathPremium.heroTitle, "text-xl sm:text-2xl")}>
                Master this level
              </h1>
              <p className={cn(readingPathPremium.heroBody, "mt-2")}>
                Three focused reading finals in sequence. Pass any one at your target band to
                complete the level — or work through all three to build confidence.
              </p>
            </div>
          </div>

          {!hideInlineProgress && stepPct != null ? (
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
          ) : null}

          {!isLocked ? <FinalTestProgressRail status={status} /> : null}

          <div className="mt-6 flex gap-2.5 sm:gap-3">
            <StatTile icon={Target} value="3" label="Finals" />
            <StatTile icon={Trophy} value="1 pass" label="To master" />
            <StatTile icon={Clock} value="~25m" label="Each test" />
          </div>

          {hasAttempts && status.bestFinalBandScore != null ? (
            <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-200/50 bg-amber-50/40 px-4 py-4 ring-1 ring-amber-500/10 dark:border-amber-900/40 dark:bg-amber-950/25">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <p className={readingPathPremium.microLabel}>Best final score</p>
                  <p className="text-sm font-medium text-muted-foreground">Across all attempts</p>
                </div>
              </div>
              <p className="text-3xl font-bold tabular-nums tracking-tight text-amber-700 dark:text-amber-300">
                {status.bestFinalBandScore}
              </p>
            </div>
          ) : null}

          <p
            className={cn(
              "mt-6 rounded-2xl border px-4 py-3 text-sm leading-relaxed",
              isLocked
                ? "border-amber-200/60 bg-amber-50/50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100"
                : "border-border/40 bg-muted/20 text-muted-foreground",
            )}
          >
            {isLocked ? (
              <span className="inline-flex items-start gap-2">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                {statusLine}
              </span>
            ) : (
              statusLine
            )}
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:mt-8">
            {canStart ? (
              <Link
                href={startHref}
                prefetch
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
                  Start Final Test {nextIndex}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                </span>
              </Link>
            ) : !isLocked && !status.isMastered ? (
              <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-border/40 bg-muted/30 px-5 py-3.5 text-center">
                <p className="text-sm font-semibold text-foreground">No final available right now</p>
                <p className="text-xs text-muted-foreground">
                  Complete practice tests first, or view your previous final scores.
                </p>
              </div>
            ) : null}

            {hasAttempts ? (
              <Link
                href={resultsHref}
                prefetch
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/40 bg-card py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-accent/25 hover:bg-accent/[0.04] hover:text-accent"
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
                View all final results
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : null}

            {canStart ? (
              <p className="text-center text-[11px] text-muted-foreground">
                Timer starts when you begin · one focused passage per final
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LegacyGroupTestFinalCard({
  levelId,
  groupTestsTotal,
  groupTestsRemaining,
  isLocked,
  stepIndex,
  totalSteps,
  hideInlineProgress,
}: {
  levelId: string;
  groupTestsTotal?: number;
  groupTestsRemaining?: number;
  isLocked?: boolean;
  stepIndex?: number;
  totalSteps?: number;
  hideInlineProgress?: boolean;
}) {
  const total = groupTestsTotal ?? 1;
  const remaining = groupTestsRemaining ?? total;
  const attempted = total - remaining;
  const canStart = !isLocked && remaining > 0;
  const finalHref = `/profile/reading/strict-levels/${levelId}/final-evaluation`;
  const stepPct =
    stepIndex != null && totalSteps != null
      ? Math.round((stepIndex / Math.max(totalSteps, 1)) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto w-full max-w-xl"
    >
      <div className={cn("relative overflow-hidden rounded-3xl", readingPathPremium.cardActive, "bg-card/95")}>
        <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-accent/80" aria-hidden />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className={readingPathPremium.microLabel}>Final evaluation</span>
            {stepIndex != null && totalSteps != null ? (
              <span className={readingPathPremium.microLabel}>
                · Step {stepIndex} of {totalSteps}
              </span>
            ) : null}
          </div>
          <h1 className={cn(readingPathPremium.heroTitle, "mt-4 text-xl sm:text-2xl")}>
            Full reading mock
          </h1>
          <p className={cn(readingPathPremium.heroBody, "mt-2")}>
            Three passages with questions in exam conditions.
          </p>

          {!hideInlineProgress && stepPct != null ? (
            <div className="mt-6">
              <div className={readingPathPremium.progressTrack}>
                <div className={readingPathPremium.progressFill} style={{ width: `${stepPct}%` }} />
              </div>
            </div>
          ) : null}

          {isLocked ? (
            <p className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200/60 bg-amber-50/50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-100">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
              Complete all practice tests before attempting the final evaluation.
            </p>
          ) : null}

          {total > 0 && !isLocked ? (
            <p className="mt-4 text-sm font-medium text-accent">
              {remaining > 0
                ? attempted === 0
                  ? `${remaining} attempt${remaining !== 1 ? "s" : ""} available`
                  : `${remaining} attempt${remaining !== 1 ? "s" : ""} remaining`
                : "All attempts completed — view your results."}
            </p>
          ) : null}

          <div className="mt-7">
            {canStart ? (
              <Link
                href={finalHref}
                prefetch
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 dark:bg-accent dark:text-primary-foreground"
              >
                {`Start${attempted > 0 ? ` Attempt ${attempted + 1} of ${total}` : ""} Final Evaluation`}
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : !isLocked && remaining === 0 && attempted > 0 ? (
              <Link
                href={`${finalHref}?view=results`}
                prefetch
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-[15px] font-semibold text-primary-foreground dark:bg-accent dark:text-primary-foreground"
              >
                View Results
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="rounded-2xl border border-border/40 bg-muted/30 px-5 py-3.5 text-center text-sm text-muted-foreground">
                Final evaluation unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function FinalEvaluationStartCard({
  levelId,
  groupTestsTotal,
  groupTestsRemaining,
  isLocked,
  stepIndex,
  totalSteps,
  hideInlineProgress,
}: FinalEvaluationStartCardProps) {
  const [finalStatus, setFinalStatus] = useState<FinalPhaseStatus | null | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;
    getFinalPhaseStatus(levelId)
      .then((status) => {
        if (!cancelled) setFinalStatus(status);
      })
      .catch(() => {
        if (!cancelled) setFinalStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, [levelId]);

  if (finalStatus === undefined) {
    return (
      <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-3 rounded-3xl border border-border/40 bg-card px-6 py-16 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
        <span className="text-sm text-muted-foreground">Loading final evaluation…</span>
      </div>
    );
  }

  if (finalStatus != null) {
    return (
      <SequentialFinalEvaluationCard
        levelId={levelId}
        status={finalStatus}
        isLocked={isLocked}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        hideInlineProgress={hideInlineProgress}
      />
    );
  }

  return (
    <LegacyGroupTestFinalCard
      levelId={levelId}
      groupTestsTotal={groupTestsTotal}
      groupTestsRemaining={groupTestsRemaining}
      isLocked={isLocked}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      hideInlineProgress={hideInlineProgress}
    />
  );
}
