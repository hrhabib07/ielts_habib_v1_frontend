"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trophy,
  RotateCcw,
  Eye,
} from "lucide-react";
import {
  getStepContent,
  type PracticeTestStepContent,
  isSentenceLocatorPracticeContent,
} from "@/src/lib/api/readingStrictProgression";
import {
  PracticeTestReadingView,
  type PracticeTestReadingViewHandle,
} from "@/src/components/reading/PracticeTestReadingView";
import {
  SentenceLocatorPracticeView,
  type SentenceLocatorPracticeViewHandle,
} from "@/src/components/reading/SentenceLocatorPracticeView";
import { ReadingTestExitDialog } from "@/src/components/reading/ReadingTestExitDialog";
import { PRACTICE_TEST_MINUTES } from "@/src/constants/readingAssessmentTiming";
import { isReadingPremiumLockResponse } from "@/src/lib/readingPremiumLock";
import { PremiumReadingLockPanel } from "@/src/components/reading/PremiumReadingLockPanel";
import { TestStartCountdownOverlay } from "@/src/components/reading/TestStartCountdownOverlay";

type Phase =
  | "intro"
  | "loading"
  | "test"
  | "result"
  | "error"
  | "premium_locked";

function PracticeTestContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const levelId = params.id;
  const stepId = searchParams.get("step");

  const [phase, setPhase] = useState<Phase>("intro");
  const [content, setContent] = useState<PracticeTestStepContent | null>(null);
  const contentRef = useRef<PracticeTestStepContent | null>(null);
  contentRef.current = content;
  const [result, setResult] = useState<{
    passed: boolean;
    scorePercent: number;
    bandScore: number;
    attemptId?: string;
    attemptNumber?: number;
    bestBandScore?: number;
    isNewBest?: boolean;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const testRef = useRef<PracticeTestReadingViewHandle | SentenceLocatorPracticeViewHandle | null>(null);
  const prefetchedRef = useRef<PracticeTestStepContent | null>(null);
  const prefetchKeyRef = useRef<string | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);
  const [launchCountdownOpen, setLaunchCountdownOpen] = useState(false);

  const openExitDialog = useCallback(() => {
    setExitOpen(true);
  }, []);

  useEffect(() => {
    if (phase !== "test" || !stepId) return;
    window.history.pushState({ readingPracticeLock: true }, "");
    const onPopState = () => {
      window.history.pushState({ readingPracticeLock: true }, "");
      setExitOpen(true);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [phase, stepId]);

  const handleConfirmExit = useCallback(async () => {
    setExitLoading(true);
    const res = await testRef.current?.submitIncompleteForExit();
    setExitLoading(false);
    setExitOpen(false);
    if (!res?.ok) return;
  }, []);

  const loadTest = useCallback(() => {
    if (!levelId || !stepId) {
      setPhase("error");
      setErrorMsg("Missing level or step.");
      return;
    }
    setPhase("loading");
    setContent(null);
    setErrorMsg(null);
    getStepContent(levelId, stepId)
      .then((data) => {
        if (data.type !== "PRACTICE_TEST" || !data.content) {
          setPhase("error");
          setErrorMsg("Not a practice test.");
          return;
        }
        setContent(data.content as PracticeTestStepContent);
        setPhase("test");
      })
      .catch((err) => {
        const ax = err as {
          response?: { status?: number; data?: { message?: string } };
          message?: string;
        };
        const status = ax?.response?.status;
        const backendMessage = ax?.response?.data?.message;
        const msg =
          typeof backendMessage === "string"
            ? backendMessage
            : err instanceof Error
              ? err.message
              : ax?.message;
        if (typeof msg === "string" && msg.includes("LEVEL_CONTENT_UPDATED:")) {
          router.push(`/profile/reading/strict-levels/${levelId}?contentUpdated=1`);
          return;
        }
        if (isReadingPremiumLockResponse(status, msg)) {
          setPhase("premium_locked");
          return;
        }
        setPhase("error");
        setErrorMsg(
          typeof msg === "string" ? msg : "Failed to load test.",
        );
      });
  }, [levelId, stepId, router]);

  const beginTestAfterCountdown = useCallback(() => {
    if (!levelId || !stepId) {
      setPhase("error");
      setErrorMsg("Missing level or step.");
      return;
    }
    setErrorMsg(null);
    const fromPrefetch = prefetchedRef.current;
    if (fromPrefetch) {
      setContent(fromPrefetch);
      setPhase("test");
      return;
    }
    if (contentRef.current) {
      setPhase("test");
      return;
    }
    loadTest();
  }, [levelId, stepId, loadTest]);

  useEffect(() => {
    if (phase !== "intro" || !levelId || !stepId) return;
    const key = `${levelId}:${stepId}`;
    prefetchKeyRef.current = key;
    prefetchedRef.current = null;
    getStepContent(levelId, stepId)
      .then((data) => {
        if (prefetchKeyRef.current !== key) return;
        if (data.type !== "PRACTICE_TEST" || !data.content) {
          prefetchedRef.current = null;
          return;
        }
        prefetchedRef.current = data.content as PracticeTestStepContent;
      })
      .catch(() => {
        if (prefetchKeyRef.current !== key) return;
        prefetchedRef.current = null;
      });
  }, [phase, levelId, stepId]);

  const handleSubmitted = useCallback(
    (res: {
      passed: boolean;
      scorePercent: number;
      bandScore: number;
      attemptId?: string;
      attemptNumber?: number;
      bestBandScore?: number;
      isNewBest?: boolean;
    }) => {
      setResult(res);
      setPhase("result");
    },
    []
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

  if (launchCountdownOpen) {
    return (
      <TestStartCountdownOverlay
        open
        subtitle="Practice test"
        onComplete={() => {
          setLaunchCountdownOpen(false);
          beginTestAfterCountdown();
        }}
      />
    );
  }

  if (phase === "intro") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-md opacity-100 transition-opacity duration-300">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="mb-6 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h1 className="text-center text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Reading Practice Test
            </h1>
            <p className="mt-3 text-center text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
              One passage with questions. You have {PRACTICE_TEST_MINUTES} minutes. Answer all questions
              and submit before the timer runs out. Your reading target band will be used to determine
              pass/fail.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setLaunchCountdownOpen(true)}
                disabled={!stepId}
                className="w-full rounded-xl bg-indigo-600 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start test
              </button>
              <Link
                href={`/profile/reading/strict-levels/${levelId}`}
                className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to level
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-5 opacity-100 transition-opacity duration-200">
          <Loader2 className="h-11 w-11 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Checking access…
          </p>
        </div>
      </div>
    );
  }

  if (phase === "premium_locked" && levelId) {
    return (
      <PremiumReadingLockPanel
        variant="fullscreen"
        levelId={levelId}
        context="practice_test"
      />
    );
  }

  if (phase === "error") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-xl">
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-400/10">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Cannot load test
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {errorMsg ?? "An error occurred."}
          </p>
          <Link
            href={`/profile/reading/strict-levels/${levelId}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to level
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "test" && content) {
    return (
      <>
        <ReadingTestExitDialog
          open={exitOpen}
          title="Submit and leave?"
          description="Leaving now will submit this attempt with your current answers. Blanks count as incorrect. Your band and score will be recorded as an official attempt. Use Continue test to stay and finish."
          confirmLabel="Submit and leave"
          cancelLabel="Continue test"
          confirmLoading={exitLoading}
          onConfirm={handleConfirmExit}
          onCancel={() => setExitOpen(false)}
        />
        <div className="fixed inset-0 z-50 flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
          {isSentenceLocatorPracticeContent(content) ? (
            <SentenceLocatorPracticeView
              ref={testRef}
              levelId={levelId}
              stepId={stepId!}
              content={content}
              onSubmitted={handleSubmitted}
              onRequestExit={openExitDialog}
            />
          ) : (
            <PracticeTestReadingView
              ref={testRef}
              levelId={levelId}
              stepId={stepId!}
              content={content}
              onSubmitted={handleSubmitted}
              onRequestExit={openExitDialog}
            />
          )}
        </div>
      </>
    );
  }

  if (phase === "result" && result) {
    const showNewBest = result.isNewBest && (result.attemptNumber ?? 1) > 1 && result.bestBandScore != null;
    const showPrevBest = (result.attemptNumber ?? 1) > 1 && result.bestBandScore != null;

    return (
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div
          className={`w-full max-w-lg rounded-2xl border p-8 shadow-xl ${
            result.passed
              ? "border-emerald-200/80 bg-white dark:border-emerald-800/50 dark:bg-slate-900"
              : "border-amber-200/80 bg-white dark:border-amber-800/50 dark:bg-slate-900"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            {result.passed ? (
              <CheckCircle2 className="h-16 w-16 text-emerald-600 dark:text-emerald-400" aria-hidden />
            ) : (
              <AlertCircle className="h-16 w-16 text-amber-600 dark:text-amber-400" aria-hidden />
            )}
            <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {result.passed ? "Test passed" : "Test not passed"}
            </h2>

            <div className="mt-6 flex w-full max-w-xs flex-wrap items-center justify-center gap-4">
              <div className="flex flex-col items-center rounded-xl bg-slate-100 dark:bg-slate-800/60 px-6 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Score
                </span>
                <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {result.scorePercent}%
                </span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50 px-6 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Band
                </span>
                <span className="text-2xl font-bold tabular-nums text-indigo-700 dark:text-indigo-300">
                  {result.bandScore}
                </span>
              </div>
            </div>

            {showNewBest && (
              <div className="mt-4 flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/40 px-4 py-2">
                <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  New personal best
                </span>
              </div>
            )}

            {showPrevBest && !showNewBest && result.bestBandScore != null && (
              <p className="mt-3 text-sm text-muted-foreground">
                Best so far: Band {result.bestBandScore}
              </p>
            )}

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              {result.passed
                ? "You reached your target band. Review your answers or proceed."
                : "Review the passage and try again to reach your target band."}
            </p>

            <div className="mt-6 flex w-full flex-col gap-3">
              {result.attemptId &&
                ((content != null && isSentenceLocatorPracticeContent(content)) ||
                  result.passed) && (
                <Link
                  href={`/profile/reading/practice-attempt/${result.attemptId}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  <Eye className="h-4 w-4" />
                  Review answers
                </Link>
              )}
              <button
                type="button"
                onClick={() => setLaunchCountdownOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-3.5 text-[15px] font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </button>
              <button
                type="button"
                onClick={handleBackToLevel}
                className="w-full rounded-xl border border-indigo-500 bg-transparent py-3 text-[15px] font-semibold text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              >
                Back to level
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function PracticeTestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      }
    >
      <PracticeTestContent />
    </Suspense>
  );
}
