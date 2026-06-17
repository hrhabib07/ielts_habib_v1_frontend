"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getStepQuizStatus,
  getStepQuizContent,
  submitStepQuiz,
  type StepQuizStatus,
  type LevelDetailStep,
  type SubmitStepQuizResponse,
  type LevelCompletionScore,
  type StepQuizContentResponse,
  type StepQuizContentQuestion,
  type QuizAttemptReviewItem,
} from "@/src/lib/api/readingStrictProgression";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { TestStartCountdownOverlay } from "@/src/components/reading/TestStartCountdownOverlay";
import { useTheme } from "@/src/components/shared/ThemeProvider";

/** Flatten all questions from groups into one ordered array for step-by-step flow. */
function flattenQuestions(
  quiz: StepQuizContentResponse,
): StepQuizContentQuestion[] {
  const groups = [...(quiz.groups ?? [])].sort((a, b) => a.order - b.order);
  return groups.flatMap((g) => g.questions ?? []);
}

export interface StepQuizSubmitCardProps {
  levelId: string;
  step: LevelDetailStep;
  onLevelPassed?: () => void;
  onProgressUpdate?: (
    progress: SubmitStepQuizResponse["progress"],
    completionScore?: LevelCompletionScore,
  ) => void;
  disabled?: boolean;
  /**
   * Pre-fetched quiz content from the /content endpoint (already stripped of correctAnswer).
   * When provided, the internal /quiz-content network call is skipped.
   * undefined = not provided (component fetches internally).
   * null = explicitly no quiz content.
   */
  externalQuizContent?: StepQuizContentResponse | null;
  /**
   * Skip the "Start Quiz" intro and open the question flow immediately (focused full-page session).
   */
  skipStartGate?: boolean;
}

export type StepQuizSubmitCardHandle = {
  submitIncompleteForExit: () => Promise<{ ok: boolean; error?: string }>;
  isExitConfirmationRequired: () => boolean;
};

type AnswerValue = string | string[];

export const StepQuizSubmitCard = forwardRef<
  StepQuizSubmitCardHandle,
  StepQuizSubmitCardProps
>(function StepQuizSubmitCard(
  {
    levelId,
    step,
    onLevelPassed,
    onProgressUpdate,
    disabled = false,
    externalQuizContent,
    skipStartGate = false,
  },
  ref,
) {
  const [status, setStatus] = useState<StepQuizStatus | null>(null);
  const [quizContent, setQuizContent] = useState<
    StepQuizContentResponse | null | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scorePercent, setScorePercent] = useState("");
  const [bandScore, setBandScore] = useState("");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [quizStarted, setQuizStarted] = useState(skipStartGate);
  const [startCountdownOpen, setStartCountdownOpen] = useState(false);
  const [lastResult, setLastResult] = useState<{
    passed: boolean;
    attemptNumber: number;
    remainingAttempts: number | null;
    score?: number;
    total?: number;
    percentage?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isBand = step.passType === "BAND";
  const useQuizContent = !!step.contentId;

  // Use pre-fetched content when provided; fall back to internally fetched content.
  const effectiveQuizContent: StepQuizContentResponse | null | undefined =
    externalQuizContent !== undefined ? externalQuizContent : quizContent;

  useEffect(() => {
    let cancelled = false;
    // Skip the /quiz-content network call when content was already fetched via /content.
    const quizFetch: Promise<StepQuizContentResponse | null> =
      externalQuizContent !== undefined
        ? Promise.resolve(externalQuizContent)
        : useQuizContent
          ? getStepQuizContent(levelId, step._id)
          : Promise.resolve(null);

    Promise.all([getStepQuizStatus(levelId, step._id), quizFetch])
      .then(([s, fetchedContent]) => {
        if (cancelled) return;
        setStatus(s);
        // Only update internal state when not driven by the external prop.
        if (externalQuizContent === undefined) {
          setQuizContent(fetchedContent);
        }
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [levelId, step._id, useQuizContent, externalQuizContent]);

  const setAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const performSubmit = useCallback(
    async (allowIncomplete: boolean): Promise<{ ok: boolean; error?: string }> => {
      if (!status?.canSubmit || status.passed || submitting || disabled) {
        return { ok: false, error: "Cannot submit right now." };
      }
      if (!effectiveQuizContent) {
        return { ok: false, error: "Quiz content is not available." };
      }
      const questions = flattenQuestions(effectiveQuizContent);
      const payloadAnswers = questions.map((q) => ({
        questionId: q._id,
        value: answers[q._id] ?? (Array.isArray(answers[q._id]) ? [] : ""),
      }));
      const allAnswered = payloadAnswers.every((a) => {
        const v = a.value;
        return Array.isArray(v) ? v.length > 0 : String(v ?? "").trim() !== "";
      });
      if (!allAnswered && !allowIncomplete) {
        setError("Please answer all questions before submitting.");
        return { ok: false, error: "Please answer all questions before submitting." };
      }
      setError(null);
      setSubmitting(true);
      try {
        const payload = {
          answers: payloadAnswers.map(({ questionId: qid, value: val }) => ({
            questionId: qid,
            value: Array.isArray(val) ? val : (val ?? ""),
          })),
        };
        const res = await submitStepQuiz(levelId, step._id, payload);
        setLastResult({
          passed: res.passed,
          attemptNumber: res.attemptNumber,
          remainingAttempts: res.remainingAttempts,
          score: res.score,
          total: res.total,
          percentage: res.percentage,
        });
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                attemptCount: res.attemptNumber,
                remainingAttempts: res.remainingAttempts,
                passed: res.passed,
                hasAttempt: true,
                score: res.score,
                total: res.total,
                percentage: res.percentage,
                canSubmit:
                  !res.passed &&
                  (res.remainingAttempts === null || res.remainingAttempts > 0),
                answers: res.review,
              }
            : prev,
        );
        setQuizStarted(false);
        const completionScore =
          res.progress.passStatus === "PASSED" &&
          res.score != null &&
          res.total != null
            ? { score: res.score, total: res.total, percentage: res.percentage }
            : undefined;
        onProgressUpdate?.(res.progress, completionScore);
        return { ok: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Submit failed";
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setSubmitting(false);
      }
    },
    [
      status,
      submitting,
      disabled,
      effectiveQuizContent,
      answers,
      levelId,
      step._id,
      onProgressUpdate,
    ],
  );

  const handleSubmitQuiz = async (e?: React.FormEvent) => {
    e?.preventDefault();
    await performSubmit(true);
  };

  useImperativeHandle(
    ref,
    () => ({
      submitIncompleteForExit: () => performSubmit(true),
      isExitConfirmationRequired: () => {
        if (loading || submitting || !status) return false;
        const showQuiz =
          !!effectiveQuizContent && (effectiveQuizContent.groups?.length ?? 0) > 0;
        if (!showQuiz || !effectiveQuizContent) return false;
        if (status.passed === true) return false;
        if (!status.hasAttempt) return quizStarted;
        if (status.canSubmit) return true;
        return false;
      },
    }),
    [loading, submitting, status, effectiveQuizContent, quizStarted, performSubmit],
  );

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status?.canSubmit || status.passed || submitting || disabled) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload = isBand
        ? { bandScore: Number(bandScore) }
        : { scorePercent: Number(scorePercent) };
      const res = await submitStepQuiz(levelId, step._id, payload);
      setLastResult({
        passed: res.passed,
        attemptNumber: res.attemptNumber,
        remainingAttempts: res.remainingAttempts,
        score: res.score,
        total: res.total,
        percentage: res.percentage,
      });
      setStatus({
        ...status,
        attemptCount: res.attemptNumber,
        remainingAttempts: res.remainingAttempts,
        passed: res.passed,
        hasAttempt: true,
        score: res.score,
        total: res.total,
        percentage: res.percentage,
        canSubmit: !res.passed && (res.remainingAttempts === null || res.remainingAttempts > 0),
      });
      const completionScore =
        res.progress.passStatus === "PASSED" &&
        res.score != null &&
        res.total != null
          ? { score: res.score, total: res.total, percentage: res.percentage }
          : undefined;
      onProgressUpdate?.(res.progress, completionScore);
      if (res.passed && res.progress.passStatus === "PASSED" && onLevelPassed) {
        onLevelPassed();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !status) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading quiz…
      </div>
    );
  }

  if (!status.isQuizStep) return null;

  const showQuizForm =
    !!effectiveQuizContent && (effectiveQuizContent.groups?.length ?? 0) > 0;
  const canSubmitManual = isBand
    ? bandScore !== "" && Number(bandScore) >= 0 && Number(bandScore) <= 9
    : scorePercent !== "" &&
      Number(scorePercent) >= 0 &&
      Number(scorePercent) <= 100;

  const isPassed = status.passed === true;

  if (status.hasAttempt || isPassed) {
    const scoreStr =
      status.score != null && status.total != null
        ? `${status.score} / ${status.total}`
        : null;
    const pctStr = status.percentage != null ? `${status.percentage}%` : null;
    const passed = status.passed;
    return (
      <div className="space-y-4">
        <div
          className={`flex flex-col gap-1.5 rounded-lg border p-4 text-sm ${
            passed
              ? "border-green-200 bg-green-50/50 text-green-800 dark:border-green-800/50 dark:bg-green-950/20 dark:text-green-200"
              : "border-amber-200 bg-amber-50/50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {passed ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <span className="font-medium">
              {passed ? "You passed the quiz! Congratulations." : "Not passed this time"}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
            {scoreStr && <span>Score: {scoreStr}</span>}
            {pctStr && <span>Percentage: {pctStr}</span>}
            <span>Status: {passed ? "Passed" : "Failed"}</span>
          </div>
          {passed && (
            <p className="mt-1.5 text-xs opacity-90">
              Quiz is locked after passing. Review your answers below, including the correct ones.
            </p>
          )}
        </div>

        {status.answers && status.answers.length > 0 && (
          <QuizAttemptReview answers={status.answers} />
        )}
        {passed && (!status.answers || status.answers.length === 0) && (
          <p className="text-xs text-green-700 dark:text-green-300">
            You have already passed this quiz. Further attempts are disabled.
          </p>
        )}

        {!passed && !status.canSubmit && (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            No attempts remaining for this quiz.
          </p>
        )}

        {!passed && status.canSubmit && (
          <div className="pt-2">
            <p className="mb-2 text-xs font-medium text-amber-800 dark:text-amber-200">
              You can retake the quiz below.
            </p>
            {showQuizForm ? (
              <QuizFlowOneByOne
                quiz={effectiveQuizContent as StepQuizContentResponse}
                answers={answers}
                setAnswer={setAnswer}
                onSubmit={handleSubmitQuiz}
                submitting={submitting}
                disabled={disabled}
                error={error}
                remainingAttempts={status.remainingAttempts}
                submitLabel="Retake Quiz"
              />
            ) : (
              <form onSubmit={handleSubmitManual} className="space-y-3">
                {isBand ? (
                  <div>
                    <Label className="text-xs">Band score (0–9)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={9}
                      step={0.5}
                      value={bandScore}
                      onChange={(e) => setBandScore(e.target.value)}
                      placeholder="e.g. 6.5"
                      disabled={disabled || submitting}
                      className="mt-1 h-9 max-w-[120px]"
                    />
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs">Score % (0–100)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={scorePercent}
                      onChange={(e) => setScorePercent(e.target.value)}
                      placeholder="e.g. 75"
                      disabled={disabled || submitting}
                      className="mt-1 h-9 max-w-[120px]"
                    />
                  </div>
                )}
                {error && <p className="text-xs text-destructive">{error}</p>}
                <Button
                  type="submit"
                  size="sm"
                  disabled={disabled || submitting || !canSubmitManual}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Retake Quiz"
                  )}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!showQuizForm) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/10 p-4">
        <form onSubmit={handleSubmitManual} className="space-y-3">
          {isBand ? (
            <div>
              <Label className="text-sm">Band score (0–9)</Label>
              <Input
                type="number"
                min={0}
                max={9}
                step={0.5}
                value={bandScore}
                onChange={(e) => setBandScore(e.target.value)}
                placeholder="e.g. 6.5"
                disabled={disabled || submitting}
                className="mt-1 h-10 max-w-[120px]"
              />
            </div>
          ) : (
            <div>
              <Label className="text-sm">Score % (0–100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={scorePercent}
                onChange={(e) => setScorePercent(e.target.value)}
                placeholder="e.g. 75"
                disabled={disabled || submitting}
                className="mt-1 h-10 max-w-[120px]"
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            size="sm"
            disabled={disabled || submitting || !canSubmitManual}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
          </Button>
        </form>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <>
        <TestStartCountdownOverlay
          open={startCountdownOpen}
          variant="navy"
          subtitle="Quiz"
          onComplete={() => {
            setStartCountdownOpen(false);
            setQuizStarted(true);
            setError(null);
          }}
        />
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 text-center shadow-[0_8px_30px_rgb(15,23,42,0.08)] ring-1 ring-slate-900/5 dark:border-slate-600 dark:bg-slate-900 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] dark:ring-white/10">
          <p className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
            This quiz has {flattenQuestions(effectiveQuizContent as StepQuizContentResponse).length} questions.
          </p>
          <Button
            type="button"
            size="lg"
            onClick={() => setStartCountdownOpen(true)}
            disabled={disabled}
            className="min-w-[160px]"
          >
            Start Quiz
          </Button>
        </div>
      </>
    );
  }

  return (
    <QuizFlowOneByOne
      quiz={effectiveQuizContent as StepQuizContentResponse}
      answers={answers}
      setAnswer={setAnswer}
      onSubmit={handleSubmitQuiz}
      submitting={submitting}
      disabled={disabled}
      error={error}
      remainingAttempts={status.remainingAttempts}
      submitLabel="Submit"
    />
  );
});

/** One-question-at-a-time quiz flow with progress bar and Prev/Next/Submit. */
function QuizFlowOneByOne({
  quiz,
  answers,
  setAnswer,
  onSubmit,
  submitting,
  disabled,
  error,
  remainingAttempts,
  submitLabel = "Submit",
}: {
  quiz: StepQuizContentResponse;
  answers: Record<string, AnswerValue>;
  setAnswer: (questionId: string, value: AnswerValue) => void;
  onSubmit: (e?: React.FormEvent) => void;
  submitting: boolean;
  disabled: boolean;
  error: string | null;
  remainingAttempts: number | null;
  submitLabel?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const questions = useMemo(() => flattenQuestions(quiz), [quiz]);
  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const progressPercent = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
  const isLast = currentIndex === total - 1;
  const canSubmit = total > 0;

  const { theme: uiTheme, toggleTheme } = useTheme();

  if (total === 0) return null;

  return (
    <div className="space-y-6 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(15,23,42,0.08)] ring-1 ring-slate-900/5 transition-all duration-300 dark:border-slate-600 dark:bg-slate-900 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] dark:ring-white/10 sm:p-8">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <span>
            Question {currentIndex + 1} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={uiTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title="Theme"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              {uiTheme === "dark" ? (
                <Sun className="h-4 w-4" aria-hidden />
              ) : (
                <Moon className="h-4 w-4" aria-hidden />
              )}
            </button>
            <span className="tabular-nums text-indigo-700 dark:text-indigo-300">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out dark:bg-indigo-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="min-h-[120px]">
        {currentQuestion && (
          <SingleQuestionCard
            question={currentQuestion}
            value={answers[currentQuestion._id]}
            onChange={(v) => setAnswer(currentQuestion._id, v)}
            disabled={disabled || submitting}
          />
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {currentIndex > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentIndex((i) => i - 1)}
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
            onClick={() => setCurrentIndex((i) => i + 1)}
            disabled={submitting}
            className="gap-1.5"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => onSubmit()}
            disabled={!canSubmit || submitting || disabled}
            className="gap-1.5"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              submitLabel
            )}
          </Button>
        )}
      </div>

      {remainingAttempts != null && remainingAttempts > 0 && (
        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} left
        </p>
      )}
    </div>
  );
}

function SingleQuestionCard({
  question,
  value,
  onChange,
  disabled,
}: {
  question: StepQuizContentQuestion;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  disabled: boolean;
}) {
  const opts = question.options ?? [];
  const strVal = Array.isArray(value) ? value.join(", ") : (value ?? "");

  if (question.type === "MCQ" && opts.length > 0) {
    return (
      <div className="space-y-5">
        <p className="text-lg font-semibold leading-snug text-slate-900 dark:text-slate-50">
          {question.questionText}
        </p>
        <div className="grid gap-3 sm:grid-cols-1">
          {opts.map((opt) => {
            const selected = strVal === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => !disabled && onChange(opt)}
                disabled={disabled}
                className={`flex w-full items-start rounded-xl border-2 p-4 text-left text-base font-medium transition-all duration-200 ${
                  selected
                    ? "border-indigo-600 bg-indigo-50 text-slate-900 shadow-sm dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-50"
                    : "border-slate-300 bg-slate-50 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/70 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-indigo-500 dark:hover:bg-slate-800/90"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "TFNG") {
    const options = ["True", "False", "Not Given"];
    return (
      <div className="space-y-5">
        <p className="text-lg font-semibold leading-snug text-slate-900 dark:text-slate-50">
          {question.questionText}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {options.map((opt) => {
            const selected = strVal === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => !disabled && onChange(opt)}
                disabled={disabled}
                className={`flex w-full items-center justify-center rounded-xl border-2 p-4 text-base font-medium transition-all duration-200 ${
                  selected
                    ? "border-indigo-600 bg-indigo-50 text-slate-900 shadow-sm dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-50"
                    : "border-slate-300 bg-slate-50 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/70 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-indigo-500 dark:hover:bg-slate-800/90"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "FILL_BLANK" || question.type === "MATCHING") {
    return (
      <div className="space-y-5">
        <p className="text-lg font-semibold leading-snug text-slate-900 dark:text-slate-50">
          {question.questionText}
        </p>
        <Input
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            question.type === "MATCHING"
              ? "e.g. A-1, B-2, C-3"
              : "Your answer"
          }
          disabled={disabled}
          className="h-12 border-2 border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-lg font-semibold leading-snug text-slate-900 dark:text-slate-50">
        {question.questionText}
      </p>
      <Input
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your answer"
        disabled={disabled}
        className="h-12 border-2 border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
      />
    </div>
  );
}

function QuizAttemptReview({
  answers,
}: {
  answers: QuizAttemptReviewItem[];
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-muted/5 p-4">
      <h4 className="text-sm font-medium">Your answers</h4>
      <div className="space-y-4">
        {answers.map((a, idx) => (
          <div
            key={a.questionId}
            className={`rounded-lg border p-3 ${
              a.isCorrect
                ? "border-green-200 bg-green-50/50 dark:border-green-800/50 dark:bg-green-950/20"
                : "border-red-200 bg-red-50/30 dark:border-red-800/50 dark:bg-red-950/20"
            }`}
          >
            <p className="text-sm font-medium text-foreground">
              {idx + 1}. {a.questionText}
            </p>
            <div className="mt-2 space-y-1.5 text-xs">
              <div>
                <span className="text-muted-foreground">Your answer: </span>
                <span
                  className={
                    a.isCorrect
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }
                >
                  {a.selectedAnswer.join(", ") || ""}
                </span>
              </div>
              {!a.isCorrect && (
                <div>
                  <span className="text-muted-foreground">Correct answer: </span>
                  <span className="text-green-700 dark:text-green-300">
                    {Array.isArray(a.correctAnswer)
                      ? a.correctAnswer.join(", ")
                      : a.correctAnswer}
                  </span>
                </div>
              )}
              <span
                className={`inline-block rounded px-1.5 py-0.5 ${
                  a.isCorrect
                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                }`}
              >
                {a.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

