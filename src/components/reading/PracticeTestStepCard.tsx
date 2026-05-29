"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Trophy, Eye, RotateCcw, ChevronRight } from "lucide-react";
import type {
  PracticeTestStepContent,
  PracticeTestStepStatus,
} from "@/src/lib/api/readingStrictProgression";
import {
  getPracticeTestStepStatus,
  isSentenceLocatorPracticeContent,
} from "@/src/lib/api/readingStrictProgression";
import { PRACTICE_TEST_MINUTES } from "@/src/constants/readingAssessmentTiming";
import {
  prefetchStepContent,
  preloadPracticeTestViews,
} from "@/src/lib/readingStepContentCache";
import {
  practiceTestHref,
  prefetchPracticeTestRoute,
} from "@/src/lib/prefetchReadingRoutes";

export interface PracticeTestStepCardProps {
  levelId: string;
  stepId: string;
  content: PracticeTestStepContent;
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

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10">
          <FileText className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {isSl ? "Sentence locator practice" : "Reading practice test"}
        </h3>
        {content.title && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{content.title}</p>
        )}
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {isSl
            ? `Up to ${content.timeLimitMinutes} minutes. Match each statement to the exact sentence in the passage. Pass when you meet the configured score. You can retry until you pass.`
            : `${PRACTICE_TEST_MINUTES} minutes. One passage with questions. Your reading target band will be used to determine pass/fail. Unlimited attempts until you pass.`}
        </p>

        {hasAttempts && (
          <div className="mt-5 flex w-full max-w-sm flex-wrap items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
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
            {showReviewLink && status!.lastAttemptId && (
              <Link
                href={`/profile/reading/practice-attempt/${status!.lastAttemptId}`}
                prefetch
                className="flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
              >
                <Eye className="h-3.5 w-3.5" />
                Review answers
              </Link>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={testHref}
            prefetch
            onMouseEnter={() => {
              prefetchStepContent(levelId, stepId);
              preloadPracticeTestViews();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
          >
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
          </Link>
        </div>
      </div>
    </div>
  );
}
