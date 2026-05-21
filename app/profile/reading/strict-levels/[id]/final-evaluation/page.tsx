"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  getFinalPhaseStatus,
  getFinalTestContent,
  type FinalPhaseStatus,
  type FinalTestContentResponse,
  type GroupTestContentForStudent,
  type PracticeTestStepContentSentenceLocator,
} from "@/src/lib/api/readingStrictProgression";
import {
  ReadingMockTestView,
  type ReadingMockTestViewHandle,
} from "@/src/components/reading/ReadingMockTestView";
import {
  SentenceLocatorPracticeView,
  type SentenceLocatorPracticeViewHandle,
} from "@/src/components/reading/SentenceLocatorPracticeView";
import { ReadingTestExitDialog } from "@/src/components/reading/ReadingTestExitDialog";
import { isReadingPremiumLockResponse } from "@/src/lib/readingPremiumLock";
import { PremiumReadingLockPanel } from "@/src/components/reading/PremiumReadingLockPanel";
import { TestStartCountdownOverlay } from "@/src/components/reading/TestStartCountdownOverlay";

type Phase = "loading" | "no_test" | "test" | "result" | "premium_locked";
type FinalTestUiMode = "standard" | "sentence_locator";

export default function FinalEvaluationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const levelId = params.id;

  const [phase, setPhase] = useState<Phase>("loading");
  const [finalIndex, setFinalIndex] = useState<1 | 2 | 3 | null>(null);
  const [phaseStatus, setPhaseStatus] = useState<FinalPhaseStatus | null>(null);
  const [testMode, setTestMode] = useState<FinalTestUiMode>("standard");
  const [content, setContent] = useState<GroupTestContentForStudent | null>(null);
  const [sentenceLocatorContent, setSentenceLocatorContent] =
    useState<PracticeTestStepContentSentenceLocator | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    passed: boolean;
    isMastered: boolean;
    bandScore: number;
  } | null>(null);
  const mockTestRef = useRef<ReadingMockTestViewHandle>(null);
  const locatorRef = useRef<SentenceLocatorPracticeViewHandle>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);
  const [entryCountdownOpen, setEntryCountdownOpen] = useState(true);

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
        : await mockTestRef.current?.submitIncompleteForExit();
    setExitLoading(false);
    setExitOpen(false);
    if (!res?.ok) return;
  }, [testMode]);

  const loadTest = useCallback(async () => {
    if (!levelId) return;
    setPhase("loading");
    setContent(null);
    setSentenceLocatorContent(null);
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

  const handleMockSubmitted = useCallback(
    (res: {
      overallPass: boolean;
      miniTestResults: Array<{ bandScore: number; passed: boolean }>;
    }) => {
      const first = res.miniTestResults[0];
      setResult({
        passed: first?.passed ?? false,
        isMastered: res.overallPass,
        bandScore: first?.bandScore ?? 0,
      });
      setPhase("result");
    },
    [],
  );

  const handleLocatorSubmitted = useCallback(
    (res: { passed: boolean; bandScore: number; isMastered?: boolean }) => {
      setResult({
        passed: res.passed,
        isMastered: res.isMastered ?? res.passed,
        bandScore: res.bandScore,
      });
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

  if (entryCountdownOpen) {
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
        <LoaderBlock />
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

  if (phase === "no_test") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="mx-auto h-6 w-6 text-amber-600 dark:text-amber-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            No test available
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {errorMessage ??
              "Complete all practice tests first, or you have already finished this final phase."}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setEntryCountdownOpen(true)}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Try again
            </button>
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
    const showMock = testMode === "standard" && content != null;

    if (showLocator || showMock) {
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
            {showLocator ? (
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
      <div className="fixed inset-0 z-40 flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <ResultCard
          mastered={result.isMastered}
          bandScore={result.bandScore}
          finalIndex={finalIndex}
          onBack={handleBackToLevel}
        />
      </div>
    );
  }

  return null;
}

function LoaderBlock() {
  return (
    <div className="flex flex-col items-center gap-5">
      <Loader2 className="h-11 w-11 animate-spin text-indigo-600 dark:text-indigo-400" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
        Preparing final test…
      </p>
    </div>
  );
}

function ResultCard({
  mastered,
  bandScore,
  finalIndex,
  onBack,
}: {
  mastered: boolean;
  bandScore: number;
  finalIndex: 1 | 2 | 3 | null;
  onBack: () => void;
}) {
  return (
    <div
      className={`w-full max-w-md rounded-2xl border p-8 text-center shadow-xl ${
        mastered
          ? "border-emerald-200/80 bg-white dark:border-emerald-800/50 dark:bg-slate-900"
          : "border-amber-200/80 bg-white dark:border-amber-800/50 dark:bg-slate-900"
      }`}
    >
      {mastered ? (
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <AlertCircle className="mx-auto h-12 w-12 text-amber-600 dark:text-amber-400" />
      )}
      <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
        {mastered ? "Level mastered" : "Final attempt recorded"}
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {mastered
          ? "You reached your target band. This level counts toward your course progress."
          : `Band ${bandScore.toFixed(1)}. ${
              finalIndex != null && finalIndex < 3
                ? `Return to the level to take Final Test ${finalIndex + 1}.`
                : "You may advance to the next level; mastery needs your target band on a final."
            }`}
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-[15px] font-semibold text-white hover:bg-indigo-700"
      >
        Back to level
      </button>
    </div>
  );
}
