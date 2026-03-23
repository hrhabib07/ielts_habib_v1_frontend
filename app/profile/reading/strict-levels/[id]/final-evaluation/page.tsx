"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  getNextGroupTestContent,
  type GroupTestContentForStudent,
} from "@/src/lib/api/readingStrictProgression";
import { ReadingMockTestView } from "@/src/components/reading/ReadingMockTestView";

type Phase = "intro" | "loading" | "no_test" | "test" | "result";

export default function FinalEvaluationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const levelId = params.id;

  const [phase, setPhase] = useState<Phase>("loading");
  const [content, setContent] = useState<GroupTestContentForStudent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    overallPass: boolean;
    miniTestResults: Array<{ bandScore: number; passed: boolean }>;
    newPassStatus: string;
    promotionType?: "STREAK" | "AVERAGE";
    finalAverageMockBandScore?: number;
  } | null>(null);

  const loadTest = useCallback(() => {
    if (!levelId) return;
    setPhase("loading");
    setContent(null);
    setErrorMessage(null);
    getNextGroupTestContent(levelId)
      .then((data) => {
        if (data) {
          setContent(data);
          setPhase("test");
        } else {
          setPhase("no_test");
        }
      })
      .catch((err) => {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "Unable to load the test. Please try again.";
        setErrorMessage(typeof msg === "string" ? msg : "Unable to load the test.");
        setPhase("no_test");
      });
  }, [levelId]);

  useEffect(() => {
    if (levelId) loadTest();
  }, [levelId, loadTest]);

  const handleSubmitted = useCallback(
    (res: {
      overallPass: boolean;
      miniTestResults: Array<{ bandScore: number; passed: boolean }>;
      newPassStatus: string;
      promotionType?: "STREAK" | "AVERAGE";
      finalAverageMockBandScore?: number;
    }) => {
      setResult(res);
      setPhase("result");
    },
    [],
  );

  const handleBackToLevel = useCallback(() => {
    router.push(`/profile/reading/strict-levels/${levelId}`);
  }, [router, levelId]);

  if (!levelId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Invalid level.</p>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-5 opacity-100 transition-opacity duration-200">
          <div className="relative">
            <div className="h-11 w-11 rounded-full border-2 border-indigo-200 dark:border-indigo-800" />
            <Loader2 className="absolute inset-0 m-auto h-11 w-11 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Loading your test…
          </p>
        </div>
      </div>
    );
  }

  if (phase === "no_test") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-xl transition-opacity duration-300">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-400/10">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            No test available
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {errorMessage ??
              "No group tests are ready for this level, or you’ve already completed them. Check back later or continue with the level."}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={loadTest}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.99]"
            >
              Try again
            </button>
            <Link
              href={`/profile/reading/strict-levels/${levelId}`}
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to level
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "test" && content) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950">
        <ReadingMockTestView
          levelId={levelId}
          content={content}
          onSubmitted={handleSubmitted}
        />
      </div>
    );
  }

  if (phase === "result" && result) {
    const unlocked = result.overallPass;
    const isAveragePromotion = result.promotionType === "AVERAGE";
    return (
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div
          className={`w-full max-w-md rounded-2xl border p-8 shadow-xl transition-opacity duration-300 ${
            unlocked
              ? "border-emerald-200/80 bg-white dark:border-emerald-800/50 dark:bg-slate-900"
              : "border-amber-200/80 bg-white dark:border-amber-800/50 dark:bg-slate-900"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            {unlocked ? (
              <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
            )}
            <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              {unlocked ? (isAveragePromotion ? "Promoted with average score" : "Test passed") : "Test not passed"}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {unlocked
                ? isAveragePromotion
                  ? `You unlocked the next level using your average mock band score.`
                  : "You’ve met the consecutive mock requirement."
                : "Review the level and try again when ready."}
            </p>
            {unlocked && isAveragePromotion && typeof result.finalAverageMockBandScore === "number" && (
              <div className="mt-3 w-full rounded-xl border border-emerald-200/80 bg-emerald-50/50 px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Average mock band score
                </span>
                <div className="mt-1 text-2xl font-bold tabular-nums text-emerald-900 dark:text-emerald-200">
                  {result.finalAverageMockBandScore.toFixed(2)}
                </div>
              </div>
            )}
            <div className="mt-6 w-full space-y-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
              {result.miniTestResults.map((r, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm font-medium"
                >
                  <span className="text-slate-600 dark:text-slate-400">
                    Passage {i + 1}
                  </span>
                  <span
                    className={
                      r.passed
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }
                  >
                    Band {r.bandScore} {r.passed ? "✓" : "✗"}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleBackToLevel}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.99]"
            >
              Back to level
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
