"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReadingAssessmentResultViewProps {
  variant: "practice" | "final";
  passed: boolean;
  bandScore: number;
  scorePercent?: number;
  statementsCorrect?: { correct: number; total: number };
  title?: string;
  attemptId?: string;
  attemptNumber?: number;
  bestBandScore?: number;
  isNewBest?: boolean;
  levelComplete?: boolean;
  isMastered?: boolean;
  finalTestIndex?: 1 | 2 | 3;
  nextFinalTestIndex?: 1 | 2 | 3 | null;
  showReview?: boolean;
  levelId: string;
  onTryAgain?: () => void;
  onBackToLevel: () => void;
}

function formatBand(band: number): string {
  return Number.isInteger(band) ? String(band) : band.toFixed(1);
}

export function ReadingAssessmentResultView({
  variant,
  passed,
  bandScore,
  scorePercent,
  statementsCorrect,
  title,
  attemptId,
  attemptNumber,
  bestBandScore,
  isNewBest,
  levelComplete,
  isMastered,
  finalTestIndex,
  nextFinalTestIndex,
  showReview = false,
  levelId,
  onTryAgain,
  onBackToLevel,
}: ReadingAssessmentResultViewProps) {
  const showNewBest =
    Boolean(isNewBest) && (attemptNumber ?? 1) > 1 && bestBandScore != null;
  const showPrevBest =
    (attemptNumber ?? 1) > 1 && bestBandScore != null && !showNewBest;

  const headline = levelComplete
    ? "Level complete!"
    : variant === "final"
      ? isMastered
        ? "Level mastered"
        : passed
          ? `Final test ${finalTestIndex ?? ""} passed`
          : finalTestIndex != null && finalTestIndex < 3
            ? `Final test ${finalTestIndex} recorded`
            : "Final evaluation complete"
      : passed
        ? "Practice test passed"
        : "Keep practising";

  const subline = levelComplete
    ? "You finished every step in this level. Great work — you can move on when you're ready."
    : variant === "final"
      ? isMastered
        ? "You reached your target band. This level counts toward your course progress."
        : passed
          ? "You hit your target band on this final. Return to the level to see your progress."
          : nextFinalTestIndex != null
            ? `Band ${formatBand(bandScore)} — return to the level to take Final Test ${nextFinalTestIndex}.`
            : finalTestIndex != null && finalTestIndex >= 3
              ? `Band ${formatBand(bandScore)}. You may advance to the next level; mastery needs your target band on a final.`
              : `Band ${formatBand(bandScore)}. Review your answers or try the next final when it unlocks.`
      : passed
        ? "You reached your target. Review your answers or continue with the next step on the level."
        : "Review the passage and try again to reach your target band.";

  const tone = levelComplete || isMastered || (passed && variant === "practice")
    ? "success"
    : passed
      ? "success"
      : "retry";

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex min-h-[100dvh] items-center justify-center overflow-y-auto px-4 py-8",
        tone === "success"
          ? "bg-gradient-to-br from-emerald-50 via-white to-indigo-50 dark:from-emerald-950/40 dark:via-slate-950 dark:to-indigo-950/30"
          : "bg-gradient-to-br from-amber-50 via-white to-slate-100 dark:from-amber-950/30 dark:via-slate-950 dark:to-slate-900",
      )}
    >
      <div className="w-full max-w-lg">
        <div
          className={cn(
            "overflow-hidden rounded-3xl border shadow-2xl shadow-slate-900/10 dark:shadow-black/40",
            tone === "success"
              ? "border-emerald-200/80 bg-white dark:border-emerald-800/40 dark:bg-slate-900"
              : "border-amber-200/80 bg-white dark:border-amber-800/40 dark:bg-slate-900",
          )}
        >
          <div
            className={cn(
              "px-6 py-8 text-center sm:px-8",
              levelComplete
                ? "bg-gradient-to-br from-indigo-600 to-emerald-600 text-white"
                : tone === "success"
                  ? "bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 dark:from-emerald-500/15 dark:to-indigo-500/15"
                  : "bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/5",
            )}
          >
            <div
              className={cn(
                "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl",
                levelComplete
                  ? "bg-white/20 ring-1 ring-white/30"
                  : tone === "success"
                    ? "bg-emerald-100 dark:bg-emerald-900/50"
                    : "bg-amber-100 dark:bg-amber-900/40",
              )}
            >
              {levelComplete ? (
                <Sparkles className="h-8 w-8 text-white" aria-hidden />
              ) : tone === "success" ? (
                <CheckCircle2
                  className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
              ) : (
                <Target className="h-8 w-8 text-amber-600 dark:text-amber-400" aria-hidden />
              )}
            </div>
            {title ? (
              <p
                className={cn(
                  "mt-4 text-xs font-semibold uppercase tracking-wider",
                  levelComplete
                    ? "text-emerald-100"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                {title}
              </p>
            ) : null}
            <h1
              className={cn(
                "mt-2 text-2xl font-bold tracking-tight sm:text-[1.65rem]",
                levelComplete ? "text-white" : "text-slate-900 dark:text-slate-50",
              )}
            >
              {headline}
            </h1>
            <p
              className={cn(
                "mx-auto mt-3 max-w-md text-sm leading-relaxed",
                levelComplete
                  ? "text-emerald-50/95"
                  : "text-slate-600 dark:text-slate-400",
              )}
            >
              {subline}
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8">
            {variant === "final" && finalTestIndex != null && (
              <div className="mb-6 flex items-center justify-center gap-2">
                {([1, 2, 3] as const).map((n) => {
                  const done = n < finalTestIndex || (n === finalTestIndex && passed);
                  const current = n === finalTestIndex;
                  return (
                    <div
                      key={n}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold",
                        done
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                          : current
                            ? "bg-indigo-600 text-white ring-2 ring-indigo-300 dark:ring-indigo-500"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
                      )}
                    >
                      {n}
                    </div>
                  );
                })}
              </div>
            )}

            <div
              className={cn(
                "gap-3",
                statementsCorrect != null || scorePercent != null
                  ? "grid grid-cols-2"
                  : "flex justify-center",
              )}
            >
              <div
                className={cn(
                  "rounded-2xl border border-indigo-200/80 bg-indigo-50/80 px-4 py-4 text-center dark:border-indigo-800/50 dark:bg-indigo-950/40",
                  statementsCorrect == null && scorePercent == null && "w-full max-w-xs",
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Band score
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-indigo-800 dark:text-indigo-200">
                  {formatBand(bandScore)}
                </p>
              </div>
              {(statementsCorrect != null || scorePercent != null) && (
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {statementsCorrect ? "Statements" : "Accuracy"}
                  </p>
                  <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    {statementsCorrect
                      ? `${statementsCorrect.correct}/${statementsCorrect.total}`
                      : `${Math.round(scorePercent ?? 0)}%`}
                  </p>
                  {statementsCorrect ? (
                    <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">correct</p>
                  ) : null}
                </div>
              )}
            </div>

            {showNewBest && (
              <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-amber-100 px-4 py-2 dark:bg-amber-900/40">
                <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  New personal best
                </span>
              </div>
            )}

            {showPrevBest && bestBandScore != null && (
              <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
                Best so far: Band {formatBand(bestBandScore)}
              </p>
            )}

            {!passed && variant === "practice" && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-2.5 text-xs leading-relaxed text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                You can retry as many times as you need until you pass this practice test.
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2.5">
              {levelComplete ? (
                <button
                  type="button"
                  onClick={onBackToLevel}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  View level summary
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
              {showReview && attemptId ? (
                <Link
                  href={`/profile/reading/practice-attempt/${attemptId}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  <Eye className="h-4 w-4" />
                  Review answers
                </Link>
              ) : null}
              {onTryAgain && !levelComplete ? (
                <button
                  type="button"
                  onClick={onTryAgain}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl border py-3.5 text-[15px] font-semibold transition-colors",
                    showReview && attemptId
                      ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                      : passed
                        ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        : "bg-indigo-600 text-white hover:bg-indigo-700",
                  )}
                >
                  <RotateCcw className="h-4 w-4" />
                  Try again
                </button>
              ) : null}
              <button
                type="button"
                onClick={onBackToLevel}
                className={cn(
                  "w-full rounded-xl py-3 text-[15px] font-semibold transition-colors",
                  levelComplete && !showReview
                    ? "hidden"
                    : levelComplete || (variant === "final" && !onTryAgain)
                      ? "flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 py-3.5 shadow-sm"
                      : "border border-transparent text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40",
                )}
              >
                {variant === "final" ? "Continue on level" : "Back to level"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
