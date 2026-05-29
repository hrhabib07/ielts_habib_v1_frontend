"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import {
  getFinalPhaseStatus,
  type FinalPhaseStatus,
} from "@/src/lib/api/readingStrictProgression";

export interface FinalEvaluationStartCardProps {
  levelId: string;
  groupTestsTotal?: number;
  groupTestsRemaining?: number;
  isLocked?: boolean;
}

export function FinalEvaluationStartCard({
  levelId,
  groupTestsTotal,
  groupTestsRemaining,
  isLocked,
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
      <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Loading final evaluation…
        </span>
      </div>
    );
  }

  if (finalStatus != null) {
    return (
      <SequentialFinalEvaluationCard
        levelId={levelId}
        status={finalStatus}
        isLocked={isLocked}
      />
    );
  }

  return (
    <LegacyGroupTestFinalCard
      levelId={levelId}
      groupTestsTotal={groupTestsTotal}
      groupTestsRemaining={groupTestsRemaining}
      isLocked={isLocked}
    />
  );
}

function SequentialFinalEvaluationCard({
  levelId,
  status,
  isLocked,
}: {
  levelId: string;
  status: FinalPhaseStatus;
  isLocked?: boolean;
}) {
  const nextIndex = status.nextFinalTestIndex;
  const hasAttempts = status.strictAttempts.length > 0;
  const canStart = !isLocked && nextIndex != null;
  const resultsHref = `/profile/reading/strict-levels/${levelId}/final-evaluation?view=results`;
  const startHref = `/profile/reading/strict-levels/${levelId}/final-evaluation`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Final Evaluation
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Three sequential final tests (Final 1 → 2 → 3). Each is one focused reading task.
        Pass any final at your target band to master the level.
      </p>
      {isLocked ? (
        <p className="mt-3 text-sm font-medium text-amber-600 dark:text-amber-400">
          Complete all practice tests before attempting the final evaluation.
        </p>
      ) : (
        <p className="mt-3 text-sm font-medium text-[#1e3a8a] dark:text-[#60a5fa]">
          {nextIndex != null
            ? `Next up: Final Test ${nextIndex} of 3`
            : hasAttempts
              ? status.isMastered
                ? "All required finals complete — you mastered this level."
                : "All three finals complete — view your scores below."
              : "Final evaluation unlocks after practice tests."}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {canStart ? (
          <Link
            href={startHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f172a] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
          >
            Start Final Test {nextIndex}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : null}
        {hasAttempts ? (
          <Link
            href={resultsHref}
            className={
              canStart
                ? "inline-flex items-center justify-center gap-2 rounded-xl border border-[#1e3a8a]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#1e3a8a] transition-colors hover:bg-[#1e3a8a]/5 dark:border-[#3b82f6]/40 dark:bg-slate-900 dark:text-[#60a5fa] dark:hover:bg-[#3b82f6]/10"
                : "inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f172a] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
            }
          >
            View Results
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : !canStart && !isLocked ? (
          <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-500 dark:bg-slate-600 dark:text-slate-400">
            Start Final Evaluation
            <ChevronRight className="h-4 w-4" />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function LegacyGroupTestFinalCard({
  levelId,
  groupTestsTotal,
  groupTestsRemaining,
  isLocked,
}: {
  levelId: string;
  groupTestsTotal?: number;
  groupTestsRemaining?: number;
  isLocked?: boolean;
}) {
  const total = groupTestsTotal ?? 1;
  const remaining = groupTestsRemaining ?? total;
  const attempted = total - remaining;
  const canStart = !isLocked && remaining > 0;
  const finalHref = `/profile/reading/strict-levels/${levelId}/final-evaluation`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Final Evaluation
      </h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        This is a full Reading mock test in exam conditions: three passages with questions.
      </p>
      {isLocked && (
        <p className="mt-3 text-sm font-medium text-amber-600 dark:text-amber-400">
          Complete all practice tests before attempting the final evaluation.
        </p>
      )}
      {total > 0 && !isLocked && (
        <p className="mt-3 text-sm font-medium text-[#1e3a8a] dark:text-[#60a5fa]">
          {remaining > 0
            ? attempted === 0
              ? `${remaining} attempt${remaining !== 1 ? "s" : ""} available`
              : `${remaining} attempt${remaining !== 1 ? "s" : ""} remaining`
            : "All attempts completed — view your results."}
        </p>
      )}
      {canStart ? (
        <Link
          href={finalHref}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f172a] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
        >
          {`Start${attempted > 0 ? ` Attempt ${attempted + 1} of ${total}` : ""} Final Evaluation`}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : !isLocked && remaining === 0 && attempted > 0 ? (
        <Link
          href={`${finalHref}?view=results`}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f172a] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
        >
          View Results
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <div
          className="mt-5 inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-500 dark:bg-slate-600 dark:text-slate-400"
          aria-disabled
        >
          Start Final Evaluation
          <ChevronRight className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
