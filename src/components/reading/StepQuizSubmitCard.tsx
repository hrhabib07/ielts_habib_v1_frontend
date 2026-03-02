"use client";

import { useState, useEffect } from "react";
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
} from "@/src/lib/api/readingStrictProgression";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export interface StepQuizSubmitCardProps {
  levelId: string;
  step: LevelDetailStep;
  onLevelPassed?: () => void;
  onProgressUpdate?: (progress: SubmitStepQuizResponse["progress"]) => void;
  disabled?: boolean;
}

type AnswerValue = string | string[];

export function StepQuizSubmitCard({
  levelId,
  step,
  onLevelPassed,
  onProgressUpdate,
  disabled = false,
}: StepQuizSubmitCardProps) {
  const [status, setStatus] = useState<StepQuizStatus | null>(null);
  const [quizContent, setQuizContent] = useState<StepQuizContentResponse | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scorePercent, setScorePercent] = useState("");
  const [bandScore, setBandScore] = useState("");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [lastResult, setLastResult] = useState<{
    passed: boolean;
    attemptNumber: number;
    remainingAttempts: number | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isBand = step.passType === "BAND";
  const useQuizContent = !!step.contentId;

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getStepQuizStatus(levelId, step._id),
      useQuizContent ? getStepQuizContent(levelId, step._id) : Promise.resolve(null),
    ]).then(([s, content]) => {
      if (cancelled) return;
      setStatus(s);
      setQuizContent(content === undefined && useQuizContent ? null : (content ?? null));
    }).catch(() => {
      if (!cancelled) setStatus(null);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [levelId, step._id, useQuizContent]);

  const setAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status?.canSubmit || submitting || disabled) return;
    setError(null);
    setSubmitting(true);
    try {
      let payload: { scorePercent?: number; bandScore?: number; answers?: Array<{ questionId: string; value: string | string[] }> };
      if (quizContent && Object.keys(answers).length > 0) {
        payload = {
          answers: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value: Array.isArray(value) ? value : (value ?? ""),
          })),
        };
      } else if (isBand) {
        payload = { bandScore: Number(bandScore) };
      } else {
        payload = { scorePercent: Number(scorePercent) };
      }
      const res = await submitStepQuiz(levelId, step._id, payload);
      setLastResult({
        passed: res.passed,
        attemptNumber: res.attemptNumber,
        remainingAttempts: res.remainingAttempts,
      });
      setStatus({
        ...status,
        attemptCount: res.attemptNumber,
        remainingAttempts: res.remainingAttempts,
        passed: res.passed,
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

  if (status.passed) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/50 p-3 text-sm text-green-800 dark:border-green-800/50 dark:bg-green-950/20 dark:text-green-200">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span>Quiz passed.</span>
      </div>
    );
  }

  if (!status.canSubmit) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-200">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>No attempts remaining. This quiz allows only one attempt.</span>
      </div>
    );
  }

  const showQuizForm = quizContent && quizContent.groups?.length > 0;
  const canSubmitManual = isBand
    ? bandScore !== "" && Number(bandScore) >= 0 && Number(bandScore) <= 9
    : scorePercent !== "" && Number(scorePercent) >= 0 && Number(scorePercent) <= 100;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
      {showQuizForm ? (
        <QuizQuestionsForm
          quiz={quizContent}
          answers={answers}
          setAnswer={setAnswer}
          onSubmit={handleSubmit}
          submitting={submitting}
          disabled={disabled}
          error={error}
          lastResult={lastResult}
          remainingAttempts={status.remainingAttempts}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
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
          {lastResult && (
            <p className={`text-xs ${lastResult.passed ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
              {lastResult.passed
                ? `Passed (attempt ${lastResult.attemptNumber}).`
                : `Not passed (attempt ${lastResult.attemptNumber}).${lastResult.remainingAttempts != null ? ` ${lastResult.remainingAttempts} attempt(s) left.` : ""}`}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={disabled || submitting || !canSubmitManual}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit quiz"}
            </Button>
            {status.remainingAttempts != null && status.remainingAttempts > 0 && (
              <span className="text-xs text-muted-foreground">
                {status.remainingAttempts} attempt{status.remainingAttempts !== 1 ? "s" : ""} left
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

function QuizQuestionsForm({
  quiz,
  answers,
  setAnswer,
  onSubmit,
  submitting,
  disabled,
  error,
  lastResult,
  remainingAttempts,
}: {
  quiz: StepQuizContentResponse;
  answers: Record<string, AnswerValue>;
  setAnswer: (questionId: string, value: AnswerValue) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  disabled: boolean;
  error: string | null;
  lastResult: { passed: boolean; attemptNumber: number; remainingAttempts: number | null } | null;
  remainingAttempts: number | null;
}) {
  const groups = [...(quiz.groups ?? [])].sort((a, b) => a.order - b.order);
  const totalQuestions = groups.reduce((s, g) => s + (g.questions?.length ?? 0), 0);
  const answeredCount = Object.keys(answers).filter((k) => {
    const v = answers[k];
    return (Array.isArray(v) ? v.length > 0 : (v ?? "").toString().trim() !== "");
  }).length;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {quiz.description && (
        <p className="text-sm text-muted-foreground">{quiz.description}</p>
      )}
      {groups.map((group) => (
        <div key={`${group.order}-${group.title}`} className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">{group.title}</h4>
          <div className="space-y-3 pl-2">
            {(group.questions ?? []).map((q) => (
              <QuestionField
                key={q._id}
                question={q}
                value={answers[q._id]}
                onChange={(v) => setAnswer(q._id, v)}
                disabled={disabled || submitting}
              />
            ))}
          </div>
        </div>
      ))}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {lastResult && (
        <p className={`text-xs ${lastResult.passed ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
          {lastResult.passed
            ? `Passed (attempt ${lastResult.attemptNumber}).`
            : `Not passed (attempt ${lastResult.attemptNumber}).${lastResult.remainingAttempts != null ? ` ${lastResult.remainingAttempts} attempt(s) left.` : ""}`}
        </p>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={disabled || submitting || answeredCount < totalQuestions}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit quiz"}
        </Button>
        {remainingAttempts != null && remainingAttempts > 0 && (
          <span className="text-xs text-muted-foreground">
            {remainingAttempts} attempt{remainingAttempts !== 1 ? "s" : ""} left
          </span>
        )}
      </div>
    </form>
  );
}

function QuestionField({
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
      <div className="space-y-1.5">
        <Label className="text-xs font-normal">{question.questionText}</Label>
        <div className="flex flex-wrap gap-2">
          {opts.map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name={question._id}
                value={opt}
                checked={strVal === opt}
                onChange={() => onChange(opt)}
                disabled={disabled}
                className="rounded border-input"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === "TFNG") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-normal">{question.questionText}</Label>
        <select
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-9 w-full max-w-[200px] rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">— Select —</option>
          <option value="True">True</option>
          <option value="False">False</option>
          <option value="Not Given">Not Given</option>
        </select>
      </div>
    );
  }

  if (question.type === "FILL_BLANK") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-normal">{question.questionText}</Label>
        <Input
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer"
          disabled={disabled}
          className="h-9 max-w-md"
        />
      </div>
    );
  }

  if (question.type === "MATCHING") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-normal">{question.questionText}</Label>
        <Input
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. A-1, B-2, C-3"
          disabled={disabled}
          className="h-9 max-w-md"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-normal">{question.questionText}</Label>
      <Input
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your answer"
        disabled={disabled}
        className="h-9 max-w-md"
      />
    </div>
  );
}
