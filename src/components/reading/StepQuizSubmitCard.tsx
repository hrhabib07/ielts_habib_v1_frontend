"use client";

import { useState, useEffect, useMemo } from "react";
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
  type StepQuizContentResponse,
  type StepQuizContentQuestion,
  type QuizAttemptReviewItem,
} from "@/src/lib/api/readingStrictProgression";
import { Loader2, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

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
  onProgressUpdate?: (progress: SubmitStepQuizResponse["progress"]) => void;
  disabled?: boolean;
  /**
   * Pre-fetched quiz content from the /content endpoint (already stripped of correctAnswer).
   * When provided, the internal /quiz-content network call is skipped.
   * undefined = not provided (component fetches internally).
   * null = explicitly no quiz content.
   */
  externalQuizContent?: StepQuizContentResponse | null;
}

type AnswerValue = string | string[];

export function StepQuizSubmitCard({
  levelId,
  step,
  onLevelPassed,
  onProgressUpdate,
  disabled = false,
  externalQuizContent,
}: StepQuizSubmitCardProps) {
  const [status, setStatus] = useState<StepQuizStatus | null>(null);
  const [quizContent, setQuizContent] = useState<
    StepQuizContentResponse | null | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scorePercent, setScorePercent] = useState("");
  const [bandScore, setBandScore] = useState("");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [quizStarted, setQuizStarted] = useState(false);
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

  const handleSubmitQuiz = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!status?.canSubmit || submitting || disabled) return;
    if (!effectiveQuizContent) return;
    const questions = flattenQuestions(effectiveQuizContent);
    const payloadAnswers = questions.map((q) => ({
      questionId: q._id,
      value: answers[q._id] ?? (Array.isArray(answers[q._id]) ? [] : ""),
    }));
    const allAnswered = payloadAnswers.every((a) => {
      const v = a.value;
      return Array.isArray(v) ? v.length > 0 : String(v ?? "").trim() !== "";
    });
    if (!allAnswered) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        answers: payloadAnswers.map(({ questionId, value }) => ({
          questionId,
          value: Array.isArray(value) ? value : (value ?? ""),
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
      setStatus({
        ...status,
        attemptCount: res.attemptNumber,
        remainingAttempts: res.remainingAttempts,
        passed: res.passed,
        hasAttempt: true,
        score: res.score,
        total: res.total,
        percentage: res.percentage,
        canSubmit: res.remainingAttempts === null || res.remainingAttempts > 0,
        answers: res.review,
      });
      setQuizStarted(false);
      onProgressUpdate?.(res.progress);
      // Do not redirect after submit — stay on page and show review mode.
      // User can navigate back via sidebar or "Back to levels" when done.
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status?.canSubmit || submitting || disabled) return;
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
        canSubmit: res.remainingAttempts === null || res.remainingAttempts > 0,
      });
      onProgressUpdate?.(res.progress);
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

  if (status.hasAttempt) {
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
              {passed ? "You passed!" : "Not passed"}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
            {scoreStr && <span>Score: {scoreStr}</span>}
            {pctStr && <span>Percentage: {pctStr}</span>}
            <span>Status: {passed ? "Passed" : "Failed"}</span>
          </div>
        </div>

        {status.answers && status.answers.length > 0 && (
          <QuizAttemptReview answers={status.answers} />
        )}

        {!passed && !status.canSubmit && (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            No attempts remaining. This quiz allows only one attempt.
          </p>
        )}

        {!passed && status.canSubmit && (
          <div className="pt-2">
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
      <div className="rounded-xl border border-border/60 bg-muted/5 p-6 text-center">
        <p className="mb-4 text-base font-medium text-foreground">
          This quiz has {flattenQuestions(effectiveQuizContent as StepQuizContentResponse).length} questions.
        </p>
        <Button
          type="button"
          size="lg"
          onClick={() => {
            setQuizStarted(true);
            setError(null);
          }}
          disabled={disabled}
          className="min-w-[160px]"
        >
          Start Quiz
        </Button>
      </div>
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
}

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
  const hasCurrentAnswer =
    currentQuestion &&
    (() => {
      const v = answers[currentQuestion._id];
      return Array.isArray(v)
        ? v.length > 0
        : String(v ?? "").trim() !== "";
    })();
  const isLast = currentIndex === total - 1;
  const canSubmit =
    total > 0 &&
    questions.every((q) => {
      const v = answers[q._id];
      return Array.isArray(v) ? v.length > 0 : String(v ?? "").trim() !== "";
    });

  if (total === 0) return null;

  return (
    <div className="space-y-6 rounded-xl border border-border/60 bg-muted/5 p-6 transition-all duration-300">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {total}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
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
            disabled={!hasCurrentAnswer || submitting}
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
        <p className="text-xs text-muted-foreground">
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
      <div className="space-y-4">
        <p className="text-lg font-medium leading-snug text-foreground">
          {question.questionText}
        </p>
        <div className="grid gap-2 sm:grid-cols-1">
          {opts.map((opt) => {
            const selected = strVal === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => !disabled && onChange(opt)}
                disabled={disabled}
                className={`flex w-full items-start rounded-xl border-2 p-4 text-left text-base transition-all duration-200 ${
                  selected
                    ? "border-primary bg-primary/10 font-medium text-foreground"
                    : "border-border/60 bg-muted/30 text-foreground hover:border-primary/50 hover:bg-muted/50"
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
      <div className="space-y-4">
        <p className="text-lg font-medium leading-snug text-foreground">
          {question.questionText}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {options.map((opt) => {
            const selected = strVal === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => !disabled && onChange(opt)}
                disabled={disabled}
                className={`flex w-full items-center justify-center rounded-xl border-2 p-4 text-base transition-all duration-200 ${
                  selected
                    ? "border-primary bg-primary/10 font-medium text-foreground"
                    : "border-border/60 bg-muted/30 text-foreground hover:border-primary/50 hover:bg-muted/50"
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
      <div className="space-y-4">
        <p className="text-lg font-medium leading-snug text-foreground">
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
          className="h-12 text-base"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium leading-snug text-foreground">
        {question.questionText}
      </p>
      <Input
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your answer"
        disabled={disabled}
        className="h-12 text-base"
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
                  {a.selectedAnswer.join(", ") || "—"}
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

