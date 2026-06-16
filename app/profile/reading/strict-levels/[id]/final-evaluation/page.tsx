"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import {
  getFinalPhaseStatus,
  getFinalTestContent,
  type FinalPhaseStatus,
  type FinalTestContentResponse,
  type GroupTestContentForStudent,
  type PracticeTestStepContentSentenceLocator,
  type PracticeTestStepContentProgressiveMcq,
  type PracticeTestStepContentGamlishTfng,
} from "@/src/lib/api/readingStrictProgression";
import {
  ReadingMockTestView,
  type ReadingMockTestViewHandle,
} from "@/src/components/reading/ReadingMockTestView";
import {
  SentenceLocatorPracticeView,
  type SentenceLocatorPracticeViewHandle,
} from "@/src/components/reading/SentenceLocatorPracticeView";
import {
  ProgressiveMcqPracticeView,
  type ProgressiveMcqPracticeViewHandle,
} from "@/src/components/reading/ProgressiveMcqPracticeView";
import {
  GamlishTfngPracticeView,
  type GamlishTfngPracticeViewHandle,
} from "@/src/components/reading/gamlish-tfng/GamlishTfngPracticeView";
import { ReadingTestExitDialog } from "@/src/components/reading/ReadingTestExitDialog";
import { isReadingPremiumLockResponse } from "@/src/lib/readingPremiumLock";
import { PremiumReadingLockPanel } from "@/src/components/reading/PremiumReadingLockPanel";
import { ReadingAssessmentResultView } from "@/src/components/reading/ReadingAssessmentResultView";
import { FinalEvaluationResultsSummary } from "@/src/components/reading/FinalEvaluationResultsSummary";
import { TestStartCountdownOverlay } from "@/src/components/reading/TestStartCountdownOverlay";

type Phase =
  | "loading"
  | "no_test"
  | "test"
  | "result"
  | "summary"
  | "premium_locked";
type FinalTestUiMode = "standard" | "sentence_locator" | "progressive_mcq" | "gamlish_tfng";

function FinalEvaluationPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const levelId = params.id;
  const viewResults = searchParams.get("view") === "results";

  const [phase, setPhase] = useState<Phase>("loading");
  const [finalIndex, setFinalIndex] = useState<1 | 2 | 3 | null>(null);
  const [phaseStatus, setPhaseStatus] = useState<FinalPhaseStatus | null>(null);
  const [testMode, setTestMode] = useState<FinalTestUiMode>("standard");
  const [content, setContent] = useState<GroupTestContentForStudent | null>(null);
  const [sentenceLocatorContent, setSentenceLocatorContent] =
    useState<PracticeTestStepContentSentenceLocator | null>(null);
  const [progressiveMcqContent, setProgressiveMcqContent] =
    useState<PracticeTestStepContentProgressiveMcq | null>(null);
  const [gamlishTfngContent, setGamlishTfngContent] =
    useState<PracticeTestStepContentGamlishTfng | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    passed: boolean;
    isMastered: boolean;
    bandScore: number;
    levelComplete?: boolean;
    finalTestIndex?: 1 | 2 | 3;
    nextFinalTestIndex?: 1 | 2 | 3 | null;
    scorePercent?: number;
    statementsCorrect?: { correct: number; total: number };
    title?: string;
  } | null>(null);
  const mockTestRef = useRef<ReadingMockTestViewHandle>(null);
  const locatorRef = useRef<SentenceLocatorPracticeViewHandle>(null);
  const progressiveMcqRef = useRef<ProgressiveMcqPracticeViewHandle>(null);
  const gamlishTfngRef = useRef<GamlishTfngPracticeViewHandle>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);
  const [entryCountdownOpen, setEntryCountdownOpen] = useState(!viewResults);

  useEffect(() => {
    if (phase !== "test" || !levelId) return;
    window.history.pushState({ readingFinalTestLock: true }, "");
    const onPopState = () => {
      window.history.pushState({ readingFinalTestLock: true }, "");
      setExitOpen(true);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [phase, levelId]);

  const handleConfirmExit = useCallback(async () => {
    setExitLoading(true);
    const res =
      testMode === "sentence_locator"
        ? await locatorRef.current?.submitIncompleteForExit()
        : testMode === "gamlish_tfng"
          ? await gamlishTfngRef.current?.submitIncompleteForExit()
          : testMode === "progressive_mcq"
            ? await progressiveMcqRef.current?.submitIncompleteForExit()
            : await mockTestRef.current?.submitIncompleteForExit();
    setExitLoading(false);
    setExitOpen(false);
    if (!res?.ok) return;
  }, [testMode]);

  const loadResultsSummary = useCallback(async () => {
    if (!levelId) return;
    setPhase("loading");
    setErrorMessage(null);
    try {
      const status = await getFinalPhaseStatus(levelId);
      if (!status) {
        setPhase("no_test");
        setErrorMessage("This level does not use sequential final tests.");
        return;
      }
      setPhaseStatus(status);
      if (status.strictAttempts.length === 0) {
        setPhase("no_test");
        setErrorMessage(
          status.nextFinalTestIndex != null
            ? `Start Final Test ${status.nextFinalTestIndex} to see your first result here.`
            : "No final test results yet.",
        );
        return;
      }
      setPhase("summary");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load results.";
      setErrorMessage(msg);
      setPhase("no_test");
    }
  }, [levelId]);

  const loadTest = useCallback(async () => {
    if (!levelId) return;
    setPhase("loading");
    setContent(null);
    setSentenceLocatorContent(null);
    setProgressiveMcqContent(null);
    setGamlishTfngContent(null);
    setErrorMessage(null);

    try {
      const status = await getFinalPhaseStatus(levelId);
      if (!status) {
        setPhase("no_test");
        setErrorMessage("This level does not use sequential final tests.");
        return;
      }
      setPhaseStatus(status);

      const index = status.nextFinalTestIndex;
      if (index == null) {
        if (status.strictAttempts.length > 0) {
          setPhase("summary");
          return;
        }
        setPhase("no_test");
        setErrorMessage(
          status.strictFinalsComplete && !status.isMastered
            ? "All three finals are complete. You can continue to the next level."
            : "No final test is available right now.",
        );
        return;
      }

      setFinalIndex(index);
      const testContent: FinalTestContentResponse = await getFinalTestContent(levelId, index);

      if (
        testContent.contentFormat === "SENTENCE_LOCATOR" &&
        testContent.sentenceLocator
      ) {
        setTestMode("sentence_locator");
        setSentenceLocatorContent({
          contentFormat: "SENTENCE_LOCATOR",
          practiceTestId: `final-${index}`,
          title: testContent.title ?? `Final test ${index}`,
          timeLimitMinutes: testContent.timeLimitMinutes ?? 25,
          passType: "BAND",
          passValue: 0,
          sentenceLocator: testContent.sentenceLocator,
        });
      } else if (
        testContent.contentFormat === "PROGRESSIVE_MCQ" &&
        testContent.progressiveMcq
      ) {
        setTestMode("progressive_mcq");
        setProgressiveMcqContent({
          contentFormat: "PROGRESSIVE_MCQ",
          practiceTestId: `final-${index}`,
          title: testContent.title ?? `Final test ${index}`,
          timeLimitMinutes: testContent.timeLimitMinutes ?? 20,
          passType: "BAND",
          passValue: 0,
          progressiveMcq: testContent.progressiveMcq,
        });
      } else if (
        testContent.contentFormat === "GAMLISH_TFNG" &&
        testContent.gamlishTfng
      ) {
        setTestMode("gamlish_tfng");
        setGamlishTfngContent({
          contentFormat: "GAMLISH_TFNG",
          practiceTestId: `final-${index}`,
          title: testContent.title ?? `Final test ${index}`,
          timeLimitMinutes: testContent.timeLimitMinutes ?? 10,
          passType: "BAND",
          passValue: 0,
          gamlishTfng: testContent.gamlishTfng,
        });
      } else if (testContent.miniTest) {
        setTestMode("standard");
        setContent({
          groupTestId: `sequential-final-${index}`,
          miniTests: [testContent.miniTest, testContent.miniTest, testContent.miniTest],
        });
      } else {
        setPhase("no_test");
        setErrorMessage("Final test content is not configured.");
        return;
      }
      setPhase("test");
    } catch (err) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = ax?.response?.status;
      const backendMessage = ax?.response?.data?.message;
      const msg =
        typeof backendMessage === "string"
          ? backendMessage
          : err instanceof Error
            ? err.message
            : "Unable to load the test. Please try again.";
      if (typeof msg === "string" && msg.includes("LEVEL_CONTENT_UPDATED:")) {
        router.push(`/profile/reading/strict-levels/${levelId}?contentUpdated=1`);
        return;
      }
      if (isReadingPremiumLockResponse(status, msg)) {
        setPhase("premium_locked");
        return;
      }
      setErrorMessage(typeof msg === "string" ? msg : "Unable to load the test.");
      setPhase("no_test");
    }
  }, [levelId, router]);

  useEffect(() => {
    if (!levelId || !viewResults) return;
    setEntryCountdownOpen(false);
    void loadResultsSummary();
  }, [levelId, viewResults, loadResultsSummary]);

  const handleMockSubmitted = useCallback(
    (res: {
      overallPass: boolean;
      miniTestResults: Array<{ bandScore: number; passed: boolean }>;
      newPassStatus?: string;
      isMastered?: boolean;
      levelComplete?: boolean;
      finalTestIndex?: 1 | 2 | 3;
      nextFinalTestIndex?: 1 | 2 | 3 | null;
      bandScore?: number;
      passed?: boolean;
    }) => {
      const first = res.miniTestResults[0];
      setResult({
        passed: res.passed ?? first?.passed ?? false,
        isMastered: res.isMastered ?? res.overallPass,
        bandScore: res.bandScore ?? first?.bandScore ?? 0,
        levelComplete: res.levelComplete ?? res.newPassStatus === "PASSED",
        finalTestIndex: res.finalTestIndex ?? finalIndex ?? undefined,
        nextFinalTestIndex: res.nextFinalTestIndex,
        title: finalIndex != null ? `Final test ${finalIndex}` : "Final evaluation",
      });
      setPhase("result");
    },
    [finalIndex],
  );

  const handleLocatorSubmitted = useCallback(
    (res: {
      passed: boolean;
      bandScore: number;
      isMastered?: boolean;
      levelComplete?: boolean;
      finalTestIndex?: 1 | 2 | 3;
      nextFinalTestIndex?: 1 | 2 | 3 | null;
      scorePercent?: number;
      statementsCorrect?: { correct: number; total: number };
    }) => {
      setResult({
        passed: res.passed,
        isMastered: res.isMastered ?? res.passed,
        bandScore: res.bandScore,
        levelComplete: res.levelComplete,
        finalTestIndex: res.finalTestIndex ?? finalIndex ?? undefined,
        nextFinalTestIndex: res.nextFinalTestIndex,
        scorePercent: res.scorePercent,
        statementsCorrect: res.statementsCorrect,
        title: sentenceLocatorContent?.title ?? (finalIndex != null ? `Final test ${finalIndex}` : undefined),
      });
      setPhase("result");
    },
    [finalIndex, sentenceLocatorContent?.title],
  );

  const handleTfngSubmitted = useCallback(
    (res: {
      passed: boolean;
      bandScore: number;
      isMastered?: boolean;
      levelComplete?: boolean;
      finalTestIndex?: 1 | 2 | 3;
      nextFinalTestIndex?: 1 | 2 | 3 | null;
      scorePercent?: number;
      statementsCorrect?: { correct: number; total: number };
    }) => {
      setResult({
        passed: res.passed,
        isMastered: res.isMastered ?? res.passed,
        bandScore: res.bandScore,
        levelComplete: res.levelComplete,
        finalTestIndex: res.finalTestIndex ?? finalIndex ?? undefined,
        nextFinalTestIndex: res.nextFinalTestIndex,
        scorePercent: res.scorePercent,
        statementsCorrect: res.statementsCorrect,
        title: gamlishTfngContent?.title ?? (finalIndex != null ? `Final test ${finalIndex}` : undefined),
      });
      setPhase("result");
    },
    [finalIndex, gamlishTfngContent?.title],
  );

  const handleProgressiveMcqSubmitted = useCallback(
    (res: {
      passed: boolean;
      bandScore: number;
      isMastered?: boolean;
      levelComplete?: boolean;
      finalTestIndex?: 1 | 2 | 3;
      nextFinalTestIndex?: 1 | 2 | 3 | null;
      scorePercent?: number;
      mcqCorrect?: { correct: number; total: number };
    }) => {
      setResult({
        passed: res.passed,
        isMastered: res.isMastered ?? res.passed,
        bandScore: res.bandScore,
        levelComplete: res.levelComplete,
        finalTestIndex: res.finalTestIndex ?? finalIndex ?? undefined,
        nextFinalTestIndex: res.nextFinalTestIndex,
        scorePercent: res.scorePercent,
        statementsCorrect: res.mcqCorrect,
        title: progressiveMcqContent?.title ?? (finalIndex != null ? `Final test ${finalIndex}` : undefined),
      });
      setPhase("result");
    },
    [finalIndex, progressiveMcqContent?.title],
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

  if (entryCountdownOpen && !viewResults) {
    return (
      <TestStartCountdownOverlay
        open
        variant="navy"
        subtitle={
          phaseStatus?.nextFinalTestIndex != null
            ? `Final test ${phaseStatus.nextFinalTestIndex} of 3`
            : "Final evaluation"
        }
        onComplete={() => {
          setEntryCountdownOpen(false);
          void loadTest();
        }}
      />
    );
  }

  if (phase === "loading") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoaderBlock label={viewResults ? "Loading your results…" : "Preparing final test…"} />
      </div>
    );
  }

  if (phase === "premium_locked") {
    return (
      <PremiumReadingLockPanel
        variant="fullscreen"
        levelId={levelId}
        context="final_evaluation"
      />
    );
  }

  if (phase === "summary" && phaseStatus) {
    return (
      <FinalEvaluationResultsSummary
        status={phaseStatus}
        levelId={levelId}
        onBackToLevel={handleBackToLevel}
      />
    );
  }

  if (phase === "no_test") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="mx-auto h-6 w-6 text-amber-600 dark:text-amber-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {viewResults ? "No results yet" : "No test available"}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {errorMessage ??
              (viewResults
                ? "Complete at least one final test to see results here."
                : "Complete all practice tests first, or you have already finished this final phase.")}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {!viewResults && phaseStatus?.nextFinalTestIndex != null ? (
              <button
                type="button"
                onClick={() => {
                  setEntryCountdownOpen(true);
                }}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Start Final Test {phaseStatus.nextFinalTestIndex}
              </button>
            ) : null}
            <Link
              href={`/profile/reading/strict-levels/${levelId}`}
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to level
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "test" && finalIndex != null) {
    const showLocator =
      testMode === "sentence_locator" && sentenceLocatorContent != null;
    const showProgressiveMcq =
      testMode === "progressive_mcq" && progressiveMcqContent != null;
    const showGamlishTfng =
      testMode === "gamlish_tfng" && gamlishTfngContent != null;
    const showMock = testMode === "standard" && content != null;

    if (showLocator || showProgressiveMcq || showGamlishTfng || showMock) {
      return (
        <>
          <ReadingTestExitDialog
            open={exitOpen}
            title="Submit and leave?"
            description="Going back will submit this final test with your current answers. In strict mode this counts as your only attempt for this final."
            confirmLabel="Submit and leave"
            cancelLabel="Continue test"
            confirmLoading={exitLoading}
            onConfirm={handleConfirmExit}
            onCancel={() => setExitOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950">
            {showProgressiveMcq ? (
              <ProgressiveMcqPracticeView
                ref={progressiveMcqRef}
                levelId={levelId}
                stepId={`final-${finalIndex}`}
                sessionKey={`final-pmcq-${levelId}-${finalIndex}`}
                finalTestIndex={finalIndex}
                content={progressiveMcqContent}
                onSubmitted={handleProgressiveMcqSubmitted}
                onRequestExit={() => setExitOpen(true)}
              />
            ) : showGamlishTfng ? (
              <GamlishTfngPracticeView
                ref={gamlishTfngRef}
                levelId={levelId}
                sessionKey={`final-tfng-${levelId}-${finalIndex}`}
                finalTestIndex={finalIndex}
                content={gamlishTfngContent}
                onSubmitted={handleTfngSubmitted}
                onRequestExit={() => setExitOpen(true)}
              />
            ) : showLocator ? (
              <SentenceLocatorPracticeView
                ref={locatorRef}
                levelId={levelId}
                stepId={`final-${finalIndex}`}
                sessionKey={`final-${levelId}-${finalIndex}`}
                finalTestIndex={finalIndex}
                content={sentenceLocatorContent}
                onSubmitted={handleLocatorSubmitted}
                onRequestExit={() => setExitOpen(true)}
              />
            ) : (
              <ReadingMockTestView
                ref={mockTestRef}
                levelId={levelId}
                content={content!}
                sequentialFinalIndex={finalIndex}
                onSubmitted={handleMockSubmitted}
              />
            )}
          </div>
        </>
      );
    }
  }

  if (phase === "result" && result) {
    return (
      <ReadingAssessmentResultView
        variant="final"
        passed={result.passed}
        bandScore={result.bandScore}
        scorePercent={result.statementsCorrect ? undefined : result.scorePercent}
        statementsCorrect={result.statementsCorrect}
        title={result.title}
        isMastered={result.isMastered}
        levelComplete={result.levelComplete}
        finalTestIndex={result.finalTestIndex ?? finalIndex ?? undefined}
        nextFinalTestIndex={result.nextFinalTestIndex}
        levelId={levelId}
        onBackToLevel={handleBackToLevel}
      />
    );
  }

  return null;
}

export default function FinalEvaluationPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
          <LoaderBlock />
        </div>
      }
    >
      <FinalEvaluationPageContent />
    </Suspense>
  );
}

function LoaderBlock({ label = "Preparing final test…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <Loader2 className="h-11 w-11 animate-spin text-indigo-600 dark:text-indigo-400" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
    </div>
  );
}
