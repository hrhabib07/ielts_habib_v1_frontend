"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import type { ProgressiveMcqReviewItemDto, McqOptionKeyDto } from "@/src/lib/api/readingStrictProgression";

export function ProgressiveMcqReviewBreakdown(props: {
  items: ProgressiveMcqReviewItemDto[];
  title?: string;
  scoreSummary?: { correct: number; total: number; scorePercent?: number; bandScore?: number };
}) {
  const { items, title = "The Gamlish Logic Breakdown", scoreSummary } = props;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/15">
          <Lightbulb className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h2>
        {scoreSummary && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {scoreSummary.correct} of {scoreSummary.total} correct
            {scoreSummary.scorePercent != null ? ` · ${scoreSummary.scorePercent}%` : ""}
            {scoreSummary.bandScore != null ? ` · Band ${scoreSummary.bandScore}` : ""}
          </p>
        )}
      </div>

      <ol className="space-y-4">
        {items.map((item) => (
          <li
            key={item.itemId}
            className={cn(
              "overflow-hidden rounded-2xl border shadow-sm",
              item.isCorrect
                ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                : "border-rose-200/80 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-950/15",
            )}
          >
            <div className="flex items-start gap-3 border-b border-inherit px-4 py-3 sm:px-5">
              {item.isCorrect ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Question {item.order}
                  {item.contextTitle ? ` · ${item.contextTitle}` : ""}
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-100">
                  {item.questionText}
                </p>
              </div>
            </div>

            <div className="space-y-3 px-4 py-4 sm:px-5">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Your answer
                  </p>
                  <p className="mt-1 text-sm text-slate-800 dark:text-slate-100">
                    {item.yourOption ? (
                      <>
                        <span className="font-semibold">{item.yourOption})</span>{" "}
                        {item.yourOptionText ?? ""}
                      </>
                    ) : (
                      <span className="text-slate-400">No answer</span>
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 px-3 py-2.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                    Correct answer
                  </p>
                  <p className="mt-1 text-sm font-medium text-indigo-950 dark:text-indigo-100">
                    <span className="font-semibold">{item.correctOption})</span>{" "}
                    {item.correctOptionText}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                  Gamlish Logic
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-amber-950/90 dark:text-amber-50/90">
                  {item.explanation}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function formatMcqOptionLabel(key: McqOptionKeyDto, text: string): string {
  return `${key}) ${text}`;
}
