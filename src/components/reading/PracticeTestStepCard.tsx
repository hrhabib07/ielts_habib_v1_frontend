"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Trophy, Eye, RotateCcw } from "lucide-react";
import type {
  PracticeTestStepContent,
  PracticeTestStepStatus,
} from "@/src/lib/api/readingStrictProgression";
import { getPracticeTestStepStatus } from "@/src/lib/api/readingStrictProgression";

export interface PracticeTestStepCardProps {
  levelId: string;
  stepId: string;
  content: PracticeTestStepContent;
  onComplete: (stepId: string) => void;
  onProgressUpdate: (progress: unknown) => void;
}

/**
 * Intro card for practice test. Shows best score so far, review link if attempted,
 * and Start test / Try again button.
 */
export function PracticeTestStepCard({
  levelId,
  stepId,
  content,
}: PracticeTestStepCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<PracticeTestStepStatus | null>(null);

  useEffect(() => {
    getPracticeTestStepStatus(levelId, stepId)
      .then(setStatus)
      .catch(() => setStatus(null));
  }, [levelId, stepId]);

  const handleStartTest = () => {
    router.push(
      `/profile/reading/strict-levels/${levelId}/practice-test?step=${encodeURIComponent(stepId)}`
    );
  };

  const hasAttempts = status && status.attemptCount > 0;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10">
          <FileText className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Reading Practice Test
        </h3>
        {content.title && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{content.title}</p>
        )}
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {content.timeLimitMinutes} minutes. One passage with questions. Your reading target band
          will be used to determine pass/fail. Unlimited attempts until you pass.
        </p>

        {hasAttempts && (
          <div className="mt-5 flex w-full max-w-sm flex-wrap items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Best: Band {status!.bestBandScore}
              </span>
            </div>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {status!.attemptCount} attempt{status!.attemptCount !== 1 ? "s" : ""}
            </span>
            {status!.lastAttemptId && (
              <Link
                href={`/profile/reading/practice-attempt/${status!.lastAttemptId}`}
                className="flex items-center gap-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <Eye className="h-3.5 w-3.5" />
                Review answers
              </Link>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleStartTest}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
          >
            {hasAttempts ? (
              <>
                <RotateCcw className="h-4 w-4" />
                Try again
              </>
            ) : (
              "Start test"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
