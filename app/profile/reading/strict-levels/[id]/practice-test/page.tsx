"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  type PracticeTestStepContent,
  isSentenceLocatorPracticeContent,
  isGamlishScanningPracticeContent,
  isGamlishTfngPracticeContent,
  isProgressiveMcqPracticeContent,
  isFullMockPracticeContent,
} from "@/src/lib/api/readingStrictProgression";
import type { PracticeTestReadingViewHandle } from "@/src/components/reading/PracticeTestReadingView";
import type { SentenceLocatorPracticeViewHandle } from "@/src/components/reading/SentenceLocatorPracticeView";
import type { GamlishScanningPracticeViewHandle } from "@/src/components/reading/gamlish-scanning/GamlishScanningPracticeView";
import type { GamlishTfngPracticeViewHandle } from "@/src/components/reading/gamlish-tfng/GamlishTfngPracticeView";
import type { ProgressiveMcqPracticeViewHandle } from "@/src/components/reading/ProgressiveMcqPracticeView";
import type { ReadingMockTestViewHandle } from "@/src/components/reading/ReadingMockTestView";
import { ReadingAssessmentResultView } from "@/src/components/reading/ReadingAssessmentResultView";
import { ReadingTestExitDialog } from "@/src/components/reading/ReadingTestExitDialog";
import { PRACTICE_TEST_MINUTES } from "@/src/constants/readingAssessmentTiming";
import { isReadingPremiumLockResponse } from "@/src/lib/readingPremiumLock";
import { PremiumReadingLockPanel } from "@/src/components/reading/PremiumReadingLockPanel";
import { TestStartCountdownOverlay } from "@/src/components/reading/TestStartCountdownOverlay";
import {
  getStepContentCached,
  peekPracticeTestContentCached,
  preloadPracticeTestViews,
} from "@/src/lib/readingStepContentCache";

const ReadingMockTestView = dynamic(
  () =>
    import("@/src/components/reading/ReadingMockTestView").then(
      (m) => m.ReadingMockTestView,
    ),
  { ssr: false, loading: () => null },
);

const PracticeTestReadingView = dynamic(
  () =>
    import("@/src/components/reading/PracticeTestReadingView").then(
      (m) => m.PracticeTestReadingView,
    ),
  { ssr: false, loading: () => null },
);

const SentenceLocatorPracticeView = dynamic(
  () =>
    import("@/src/components/reading/SentenceLocatorPracticeView").then(
      (m) => m.SentenceLocatorPracticeView,
    ),
  { ssr: false, loading: () => null },
);

const GamlishScanningPracticeView = dynamic(
  () =>
    import("@/src/components/reading/gamlish-scanning/GamlishScanningPracticeView").then(
      (m) => m.GamlishScanningPracticeView,
    ),
  { ssr: false, loading: () => null },
);

const GamlishTfngPracticeView = dynamic(
  () =>
    import("@/src/components/reading/gamlish-tfng/GamlishTfngPracticeView").then(
      (m) => m.GamlishTfngPracticeView,
    ),
  { ssr: false, loading: () => null },
);

const ProgressiveMcqPracticeView = dynamic(
  () =>
    import("@/src/components/reading/ProgressiveMcqPracticeView").then(
      (m) => m.ProgressiveMcqPracticeView,
    ),
  { ssr: false, loading: () => null },
);

type Phase =
  | "intro"
  | "loading"
  | "test"
  | "result"
  | "error"
  | "premium_locked";

function TestShellLoader({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[100dvh] flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

function PracticeTestContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const levelId = params.id;
  const stepId = searchParams.get("step");
  const autostart = searchParams.get("autostart") === "1";

  const [phase, setPhase] = useState<Phase>(autostart ? "loading" : "intro");
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
    levelComplete?: boolean;
    statementsCorrect?: { correct: number; total: number };
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const testRef = useRef<
    | PracticeTestReadingViewHandle
    | SentenceLocatorPracticeViewHandle
    | GamlishScanningPracticeViewHandle
    | GamlishTfngPracticeViewHandle
    | ProgressiveMcqPracticeViewHandle
    | ReadingMockTestViewHandle
    | null
  >(null);
  const prefetchedRef = useRef<PracticeTestStepContent | null>(null);
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

  const applyPracticeContent = useCallback(async (practiceContent: PracticeTestStepContent) => {
    preloadPracticeTestViews();
    if (isGamlishScanningPracticeContent(practiceContent)) {
      await import("@/src/components/reading/gamlish-scanning/GamlishScanningPracticeView");
    } else if (isGamlishTfngPracticeContent(practiceContent)) {
      await import("@/src/components/reading/gamlish-tfng/GamlishTfngPracticeView");
    } else if (isSentenceLocatorPracticeContent(practiceContent)) {
      await import("@/src/components/reading/SentenceLocatorPracticeView");
    } else if (isFullMockPracticeContent(practiceContent)) {
      await import("@/src/components/reading/ReadingMockTestView");
    } else {
      await import("@/src/components/reading/PracticeTestReadingView");
    }
    prefetchedRef.current = practiceContent;
    setContent(practiceContent);
    setPhase("test");
  }, []);

  const resolvePracticeContent = useCallback(async (): Promise<boolean> => {
    if (!levelId || !stepId) {
      setPhase("error");
      setErrorMsg("Missing level or step.");
      return false;
    }

    const cached = peekPracticeTestContentCached(levelId, stepId);
    if (cached) {
      await applyPracticeContent(cached);
      return true;
    }

    setPhase("loading");
    setErrorMsg(null);
    try {
      const data = await getStepContentCached(levelId, stepId);
      if (data.type !== "PRACTICE_TEST" || !data.content) {
        setPhase("error");
        setErrorMsg("Not a practice test.");
        return false;
      }
      await applyPracticeContent(data.content as PracticeTestStepContent);
      return true;
    } catch (err) {
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
        return false;
      }
      if (isReadingPremiumLockResponse(status, msg)) {
        setPhase("premium_locked");
        return false;
      }
      setPhase("error");
      setErrorMsg(typeof msg === "string" ? msg : "Failed to load test.");
      return false;
    }
  }, [applyPracticeContent, levelId, router, stepId]);

  useEffect(() => {
    if (!levelId || !stepId) return;
    preloadPracticeTestViews();
    const cached = peekPracticeTestContentCached(levelId, stepId);
    if (cached) prefetchedRef.current = cached;
    void getStepContentCached(levelId, stepId)
      .then((data) => {
        if (data.type === "PRACTICE_TEST" && data.content) {
          prefetchedRef.current = data.content as PracticeTestStepContent;
        }
      })
      .catch(() => {});

    if (autostart) {
      void resolvePracticeContent();
    }
  }, [autostart, levelId, resolvePracticeContent, stepId]);

  const handleSubmitted = useCallback(
    (res: {
      passed: boolean;
      scorePercent: number;
      bandScore: number;
      attemptId?: string;
      attemptNumber?: number;
      bestBandScore?: number;
      isNewBest?: boolean;
      levelComplete?: boolean;
      statementsCorrect?: { correct: number; total: number };
    }) => {
      setResult(res);
      setPhase("result");
    },
    [],
  );

  const handleTryAgain = useCallback(() => {
    setResult(null);
    const ready = contentRef.current ?? prefetchedRef.current;
    if (ready) {
      void applyPracticeContent(ready);
      return;
    }
    void resolvePracticeContent();
  }, [applyPracticeContent, resolvePracticeContent]);

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
        fast
        subtitle="Practice test"
        onComplete={() => {
          setLaunchCountdownOpen(false);
          void resolvePracticeContent();
        }}
      />
    );
  }

  if (phase === "intro") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h1 className="text-center text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Reading Practice Test
            </h1>
            <p className="mt-3 text-center text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
              One passage with questions. You have {PRACTICE_TEST_MINUTES} minutes. Answer all
              questions and submit before the timer runs out.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setLaunchCountdownOpen(true)}
                disabled={!stepId}
                className="w-full rounded-xl bg-indigo-600 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start test
              </button>
              <Link
                href={`/profile/reading/strict-levels/${levelId}`}
                className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
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
    return <TestShellLoader label="Opening practice test…" />;
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
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="mx-auto h-6 w-6 text-amber-600 dark:text-amber-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Cannot load test
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {errorMsg ?? "An error occurred."}
          </p>
          <Link
            href={`/profile/reading/strict-levels/${levelId}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
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
          description="Leaving now will submit this attempt with your current answers. Blanks count as incorrect."
          confirmLabel="Submit and leave"
          cancelLabel="Continue test"
          confirmLoading={exitLoading}
          onConfirm={handleConfirmExit}
          onCancel={() => setExitOpen(false)}
        />
        <div className="fixed inset-0 z-50 flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
          {isProgressiveMcqPracticeContent(content) ? (
            <ProgressiveMcqPracticeView
              ref={testRef}
              levelId={levelId}
              stepId={stepId!}
              content={content}
              onSubmitted={handleSubmitted}
              onRequestExit={openExitDialog}
            />
          ) : isGamlishTfngPracticeContent(content) ? (
            <GamlishTfngPracticeView
              ref={testRef}
              levelId={levelId}
              stepId={stepId!}
              content={content}
              onSubmitted={handleSubmitted}
              onRequestExit={openExitDialog}
            />
          ) : isGamlishScanningPracticeContent(content) ? (
            <GamlishScanningPracticeView
              ref={testRef}
              levelId={levelId}
              stepId={stepId!}
              content={content}
              onSubmitted={handleSubmitted}
              onRequestExit={openExitDialog}
            />
          ) : isSentenceLocatorPracticeContent(content) ? (
            <SentenceLocatorPracticeView
              ref={testRef}
              levelId={levelId}
              stepId={stepId!}
              content={content}
              onSubmitted={handleSubmitted}
              onRequestExit={openExitDialog}
            />
          ) : isFullMockPracticeContent(content) ? (
            <ReadingMockTestView
              ref={testRef}
              levelId={levelId}
              practiceStepId={stepId!}
              content={{
                groupTestId: content.practiceTestId,
                miniTests: content.miniTests,
              }}
              onSubmitted={(res) => {
                handleSubmitted({
                  passed: res.passed ?? res.overallPass,
                  scorePercent: res.scorePercent ?? 0,
                  bandScore: res.bandScore ?? 0,
                  attemptId: res.attemptId,
                  attemptNumber: res.attemptNumber,
                  bestBandScore: res.bestBandScore,
                  isNewBest: res.isNewBest,
                  levelComplete: res.levelComplete,
                });
              }}
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
    const isSl =
      content != null &&
      (isSentenceLocatorPracticeContent(content) ||
        isGamlishScanningPracticeContent(content) ||
        isGamlishTfngPracticeContent(content));
    const isPm = content != null && isProgressiveMcqPracticeContent(content);
    const showReview = Boolean(result.attemptId) && (isSl || result.passed) && !isPm;
    const statementsCorrect =
      result.statementsCorrect ??
      (isSl && content && isSentenceLocatorPracticeContent(content) && content.sentenceLocator.statements.length
        ? {
            correct: Math.round(
              (result.scorePercent / 100) * content.sentenceLocator.statements.length,
            ),
            total: content.sentenceLocator.statements.length,
          }
        : isSl && content && isGamlishTfngPracticeContent(content)
          ? {
              correct: Math.round(
                (result.scorePercent / 100) * content.gamlishTfng.questions.length,
              ),
              total: content.gamlishTfng.questions.length,
            }
          : isSl && content && isGamlishScanningPracticeContent(content)
          ? {
              correct: Math.round(
                (result.scorePercent / 100) * content.gamlishScanning.questions.length,
              ),
              total: content.gamlishScanning.questions.length,
            }
          : undefined);

    return (
      <ReadingAssessmentResultView
        variant="practice"
        passed={result.passed}
        bandScore={result.bandScore}
        scorePercent={isSl ? undefined : result.scorePercent}
        statementsCorrect={statementsCorrect}
        title={content?.title}
        attemptId={result.attemptId}
        attemptNumber={result.attemptNumber}
        bestBandScore={result.bestBandScore}
        isNewBest={result.isNewBest}
        levelComplete={result.levelComplete}
        showReview={showReview}
        levelId={levelId}
        onTryAgain={handleTryAgain}
        onBackToLevel={handleBackToLevel}
      />
    );
  }

  return null;
}

export default function PracticeTestPage() {
  return (
    <Suspense fallback={<TestShellLoader label="Loading…" />}>
      <PracticeTestContent />
    </Suspense>
  );
}
