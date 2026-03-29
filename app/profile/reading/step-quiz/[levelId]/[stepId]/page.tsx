"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  getLevelDetail,
  getStepContent,
  type LevelDetailForStudent,
  type StepContent,
} from "@/src/lib/api/readingStrictProgression";
import {
  StepQuizSubmitCard,
  type StepQuizSubmitCardHandle,
} from "@/src/components/reading/StepQuizSubmitCard";
import { ReadingTestExitDialog } from "@/src/components/reading/ReadingTestExitDialog";

const QUIZ_TYPES = ["QUIZ", "VOCABULARY_TEST"] as const;

export default function ReadingStepQuizFocusPage() {
  const params = useParams<{ levelId: string; stepId: string }>();
  const router = useRouter();
  const levelId = params.levelId;
  const stepId = params.stepId;
  const quizRef = useRef<StepQuizSubmitCardHandle>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<LevelDetailForStudent | null>(null);
  const [stepContent, setStepContent] = useState<StepContent | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);

  const backToLessonHref = `/profile/reading/strict-levels/${levelId}?step=${encodeURIComponent(stepId)}`;

  const load = useCallback(() => {
    if (!levelId || !stepId) return;
    setLoading(true);
    setError(null);
    Promise.all([getLevelDetail(levelId), getStepContent(levelId, stepId)])
      .then(([d, content]) => {
        const step = d.steps.find((s) => s._id === stepId);
        if (!step) {
          setError("This step was not found in this level.");
          setDetail(null);
          setStepContent(null);
          return;
        }
        if (!QUIZ_TYPES.includes(step.stepType as (typeof QUIZ_TYPES)[number])) {
          setError("This step is not a quiz.");
          setDetail(null);
          setStepContent(null);
          return;
        }
        if (
          !content ||
          (content.type !== "QUIZ" && content.type !== "VOCABULARY_TEST")
        ) {
          setError("Unable to load quiz content for this step.");
          setDetail(null);
          setStepContent(null);
          return;
        }
        setDetail(d);
        setStepContent(content);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load quiz.");
        setDetail(null);
        setStepContent(null);
      })
      .finally(() => setLoading(false));
  }, [levelId, stepId]);

  useEffect(() => {
    load();
  }, [load]);

  const openExitDialog = useCallback(() => {
    if (!quizRef.current?.isExitConfirmationRequired()) {
      router.push(backToLessonHref);
      return;
    }
    setExitOpen(true);
  }, [router, backToLessonHref]);

  useEffect(() => {
    if (loading || error || !levelId || !stepId) return;
    window.history.pushState({ readingQuizLock: true }, "");
    const onPopState = () => {
      window.history.pushState({ readingQuizLock: true }, "");
      if (!quizRef.current?.isExitConfirmationRequired()) {
        router.push(backToLessonHref);
        return;
      }
      setExitOpen(true);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [loading, error, levelId, stepId, router, backToLessonHref]);

  const handleConfirmExit = useCallback(async () => {
    setExitLoading(true);
    const res = await quizRef.current?.submitIncompleteForExit();
    setExitLoading(false);
    setExitOpen(false);
    if (!res?.ok) return;
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] dark:text-[#60a5fa]" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading quiz…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">{error}</p>
        <Link
          href={backToLessonHref}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white dark:bg-[#3b82f6]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to lesson
        </Link>
      </div>
    );
  }

  if (!detail || !stepContent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] dark:text-[#60a5fa]" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading quiz…</p>
      </div>
    );
  }

  const step = detail.steps.find((s) => s._id === stepId);
  if (!step) return null;

  const quizPayload =
    stepContent.type === "QUIZ" || stepContent.type === "VOCABULARY_TEST"
      ? stepContent.content
      : null;
  if (!quizPayload) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
          Unable to load quiz content for this step.
        </p>
        <Link
          href={backToLessonHref}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white dark:bg-[#3b82f6]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to lesson
        </Link>
      </div>
    );
  }

  return (
    <>
      <ReadingTestExitDialog
        open={exitOpen}
        title="Submit and leave?"
        description="Leaving now will submit this attempt with your current answers. Unanswered questions count as incorrect. Your score will be recorded and this counts as one attempt where limits apply. Choose Continue test to stay and finish."
        confirmLabel="Submit and leave"
        cancelLabel="Continue test"
        confirmLoading={exitLoading}
        onConfirm={handleConfirmExit}
        onCancel={() => setExitOpen(false)}
      />
      <div className="flex min-h-screen flex-col bg-slate-200/90 dark:bg-slate-950">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-300/90 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={openExitDialog}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-[#1e3a8a] dark:text-slate-400 dark:hover:text-[#60a5fa]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <p className="min-w-0 truncate text-center text-sm font-semibold text-slate-900 dark:text-slate-100">
            {step.title}
          </p>
          <span className="w-16 shrink-0 sm:w-20" aria-hidden />
        </header>

        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">
          <StepQuizSubmitCard
            ref={quizRef}
            levelId={levelId}
            step={step}
            skipStartGate
            externalQuizContent={quizPayload}
          />
        </div>
      </div>
    </>
  );
}
