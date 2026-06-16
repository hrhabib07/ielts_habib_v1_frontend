"use client";

import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  submitPracticeTest,
  submitFinalTest,
  type PracticeTestStepContentProgressiveMcq,
  type ProgressiveMcqReviewItemDto,
  type McqOptionKeyDto,
} from "@/src/lib/api/readingStrictProgression";
import { ProgressiveMcqReviewBreakdown } from "./ProgressiveMcqReviewBreakdown";

const STORAGE_KEY_TIME = "ielts-reading-progressive-mcq-remaining-v1";
const OPTION_KEYS: McqOptionKeyDto[] = ["A", "B", "C", "D"];

function useProgressiveMcqTimer(stepId: string, totalMinutes: number) {
  const totalSeconds = Math.max(1, Math.floor(totalMinutes)) * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const key = `${STORAGE_KEY_TIME}-${stepId}`;
    sessionStorage.removeItem(key);
    setRemainingSeconds(totalSeconds);
  }, [stepId, totalSeconds]);

  useEffect(() => {
    const key = `${STORAGE_KEY_TIME}-${stepId}`;
    sessionStorage.setItem(key, String(remainingSeconds));
  }, [stepId, remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const t = setInterval(() => setRemainingSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [remainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const display = `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  return { remainingSeconds, display };
}

export interface ProgressiveMcqPracticeViewHandle {
  submitIncompleteForExit: () => Promise<{ ok: boolean; error?: string }>;
}

export interface ProgressiveMcqPracticeViewProps {
  levelId: string;
  stepId: string;
  content: PracticeTestStepContentProgressiveMcq;
  sessionKey?: string;
  finalTestIndex?: 1 | 2 | 3;
  onSubmitted: (res: {
    passed: boolean;
    scorePercent: number;
    bandScore: number;
    attemptId?: string;
    attemptNumber?: number;
    bestBandScore?: number;
    isNewBest?: boolean;
    isMastered?: boolean;
    levelComplete?: boolean;
    mcqCorrect?: { correct: number; total: number };
    progressiveMcqReview?: ProgressiveMcqReviewItemDto[];
    finalTestIndex?: 1 | 2 | 3;
    nextFinalTestIndex?: 1 | 2 | 3 | null;
  }) => void;
  onProgressUpdate?: () => void;
  onRequestExit?: () => void;
}

type Phase = "quiz" | "review" | "done";

export const ProgressiveMcqPracticeView = forwardRef<
  ProgressiveMcqPracticeViewHandle,
  ProgressiveMcqPracticeViewProps
>(function ProgressiveMcqPracticeView(
  {
    levelId,
    stepId,
    content,
    sessionKey,
    finalTestIndex,
    onSubmitted,
    onProgressUpdate,
    onRequestExit,
  },
  ref,
) {
  const { progressiveMcq, title, timeLimitMinutes } = content;
  const timerKey = sessionKey ?? stepId;
  const items = useMemo(
    () => [...progressiveMcq.items].sort((a, b) => a.order - b.order),
    [progressiveMcq.items],
  );

  const [phase, setPhase] = useState<Phase>("quiz");
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, McqOptionKeyDto | undefined>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewItems, setReviewItems] = useState<ProgressiveMcqReviewItemDto[]>([]);
  const [submitResult, setSubmitResult] = useState<{
    passed: boolean;
    scorePercent: number;
    bandScore: number;
    attemptId?: string;
    attemptNumber?: number;
    bestBandScore?: number;
    isNewBest?: boolean;
    mcqCorrect?: { correct: number; total: number };
    isMastered?: boolean;
    nextFinalTestIndex?: 1 | 2 | 3 | null;
  } | null>(null);

  const activeItem = items[activeIdx];
  const total = items.length;
  const progressPercent = total > 0 ? ((activeIdx + 1) / total) * 100 : 0;
  const isLast = activeIdx === total - 1;
  const { display: timeDisplay } = useProgressiveMcqTimer(timerKey, timeLimitMinutes);

  const setAnswer = useCallback((itemId: string, option: McqOptionKeyDto) => {
    setAnswers((prev) => ({ ...prev, [itemId]: option }));
  }, []);

  const runSubmit = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    setError(null);
    setSubmitting(true);
    try {
      const answerList = items.map((item) => ({
        questionId: item.id,
        studentAnswer: answers[item.id] ?? "",
      }));

      if (finalTestIndex != null) {
        const res = await submitFinalTest(levelId, finalTestIndex, { answers: answerList });
        const mcqCorrect =
          res.mcqCorrect ??
          (total > 0
            ? {
                correct: Math.min(total, Math.round((res.bandScore / 9) * total)),
                total,
              }
            : undefined);
        const scorePercent =
          mcqCorrect && mcqCorrect.total > 0
            ? Math.round((mcqCorrect.correct / mcqCorrect.total) * 100)
            : 0;
        onProgressUpdate?.();
        setReviewItems(res.progressiveMcqReview ?? []);
        setSubmitResult({
          passed: res.passed,
          scorePercent,
          bandScore: res.bandScore,
          mcqCorrect,
          isMastered: res.isMastered,
          nextFinalTestIndex: res.nextFinalTestIndex,
        });
        setPhase("review");
        return { ok: true };
      }

      const res = await submitPracticeTest(levelId, stepId, { answers: answerList });
      onProgressUpdate?.();
      setReviewItems(res.progressiveMcqReview ?? []);
      setSubmitResult({
        passed: res.passed,
        scorePercent: res.scorePercent,
        bandScore: res.bandScore,
        attemptId: res.attemptId,
        attemptNumber: res.attemptNumber,
        bestBandScore: res.bestBandScore,
        isNewBest: res.isNewBest,
        mcqCorrect: res.mcqCorrect,
      });
      setPhase("review");
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Submit failed";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setSubmitting(false);
    }
  }, [answers, finalTestIndex, items, levelId, onProgressUpdate, stepId, total]);

  useImperativeHandle(ref, () => ({
    submitIncompleteForExit: runSubmit,
  }));

  const handleFinishReview = useCallback(() => {
    if (!submitResult) return;
    setPhase("done");
    onSubmitted({
      ...submitResult,
      progressiveMcqReview: reviewItems,
      finalTestIndex,
    });
  }, [finalTestIndex, onSubmitted, reviewItems, submitResult]);

  if (phase === "review" && submitResult) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-gradient-to-b from-slate-50 to-indigo-50/40 dark:from-slate-950 dark:to-indigo-950/20">
        <header className="shrink-0 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8">
          <ProgressiveMcqReviewBreakdown
            items={reviewItems}
            scoreSummary={{
              correct:
                submitResult.mcqCorrect?.correct ??
                reviewItems.filter((r) => r.isCorrect).length,
              total: submitResult.mcqCorrect?.total ?? reviewItems.length,
              scorePercent: submitResult.scorePercent,
              bandScore: submitResult.bandScore,
            }}
          />
        </div>
        <footer className="shrink-0 border-t border-slate-200/80 bg-white/95 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/95">
          <Button type="button" className="w-full" size="lg" onClick={handleFinishReview}>
            Continue
          </Button>
        </footer>
      </div>
    );
  }

  if (phase === "done") {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        {onRequestExit ? (
          <button
            type="button"
            onClick={onRequestExit}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Exit test"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <span className="w-9" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Question {activeIdx + 1} of {total}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-medium tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          {timeDisplay}
        </div>
      </header>

      <div className="h-1 shrink-0 bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-indigo-600 transition-all duration-300 dark:bg-indigo-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto w-full max-w-xl space-y-6">
          <p className="text-center text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {progressiveMcq.instruction}
          </p>

          {activeItem && (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-indigo-50/60 px-4 py-2.5 dark:border-slate-800 dark:bg-indigo-950/30">
                  <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800 dark:text-indigo-200">
                    Context {activeItem.order}
                    {activeItem.contextTitle ? `: ${activeItem.contextTitle}` : ""}
                  </p>
                </div>
                <p className="px-4 py-4 text-[15px] leading-relaxed text-slate-800 dark:text-slate-100">
                  {activeItem.contextText}
                </p>
              </div>

              <div>
                <p className="mb-4 text-base font-semibold leading-snug text-slate-900 dark:text-slate-50">
                  {activeItem.questionText}
                </p>
                <div className="space-y-2.5" role="radiogroup" aria-label={`Question ${activeItem.order}`}>
                  {OPTION_KEYS.map((key) => {
                    const selected = answers[activeItem.id] === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={submitting}
                        onClick={() => setAnswer(activeItem.id, key)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all",
                          selected
                            ? "border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-500/30 dark:border-indigo-400 dark:bg-indigo-950/40"
                            : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            selected
                              ? "bg-indigo-600 text-white dark:bg-indigo-500"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                          )}
                        >
                          {key}
                        </span>
                        <span className="leading-relaxed text-slate-800 dark:text-slate-100">
                          {activeItem.options[key]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-200/80 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3">
          {activeIdx > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveIdx((i) => i - 1)}
              disabled={submitting}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          ) : (
            <span />
          )}
          <div className="flex-1" />
          {!isLast ? (
            <Button
              type="button"
              onClick={() => setActiveIdx((i) => i + 1)}
              disabled={submitting}
              className="gap-1.5"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void runSubmit()}
              disabled={submitting}
              className="min-w-[120px] gap-1.5"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit test"}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
});
