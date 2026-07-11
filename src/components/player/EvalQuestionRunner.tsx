"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  checkPlayerAnswer,
  type PlayerAnswerCheckResult,
} from "@/src/lib/api/player";
import { localizeEvalPrompt } from "@/src/lib/player-eval-prompt-bn";
import {
  playCorrectEvalSfx,
  playThinkAgainEvalSfx,
  playWrongEvalSfx,
  primeEvalSfx,
} from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";
import { RearrangeWordTiles } from "@/src/components/player/RearrangeWordTiles";

type EvalQuestion = Record<string, unknown>;

function isQuestionAnswered(
  question: EvalQuestion,
  stageType: string,
  answers: Record<string, unknown>,
): boolean {
  const id = String(question.id);
  const answer = answers[id];

  if (
    stageType === "mcq" ||
    stageType === "story_mcq" ||
    stageType === "correct_incorrect"
  ) {
    return typeof answer === "string" && answer.trim() !== "";
  }
  if (stageType === "rearrange" && Array.isArray(question.words)) {
    if (typeof answer !== "string" || !answer.trim()) return false;
    const expectedCount = (question.words as string[]).length;
    const placedCount = answer
      .trim()
      .replace(/[.!?]+$/, "")
      .split(/\s+/)
      .filter(Boolean).length;
    return placedCount === expectedCount;
  }
  if (stageType === "translation") {
    return typeof answer === "string" && answer.trim() !== "";
  }
  if (stageType === "compound_mcq" && Array.isArray(question.parts)) {
    const parts = question.parts as unknown[];
    const record = (answer as Record<string, string> | undefined) ?? {};
    return parts.every((_, idx) => Boolean(record[String(idx)]?.trim()));
  }
  return false;
}

function feedbackMessage(
  result: PlayerAnswerCheckResult,
  stageType: string,
): string {
  if (result.correct) return "সঠিক! দারুণ কাজ!";

  if (stageType === "correct_incorrect") {
    return result.correctAnswer === "correct"
      ? "ভুল। বাক্যটি সঠিক ছিল।"
      : "ভুল। বাক্যটি ঠিক ছিল না।";
  }

  const expected = result.correctAnswer ?? result.correctAnswers?.[0];
  if (expected) return `এই প্রশ্নে ভুল হয়েছে। সঠিক উত্তর দেখো: ${expected}`;
  return "এই প্রশ্নে ভুল হয়েছে। পরের বার আরও সাবধানে চেষ্টা করো।";
}

function ThinkAgainPrompt() {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
      role="status"
    >
      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="space-y-1 text-left">
        <p className="font-semibold text-foreground">
          আবার ভেবে দেখো
        </p>
        <p className="font-medium leading-relaxed text-muted-foreground">
          উত্তরটা ঠিক মনে হচ্ছে না। সাবধানে আবার বেছে নাও, তুমি পারবে!
        </p>
      </div>
    </div>
  );
}

function QuestionFeedback({
  result,
  stageType,
}: {
  result: PlayerAnswerCheckResult;
  stageType: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300",
        result.correct
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-destructive/40 bg-destructive/10 text-destructive",
      )}
      role="status"
    >
      {result.correct ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <p className="font-medium leading-relaxed">
        {feedbackMessage(result, stageType)}
      </p>
    </div>
  );
}

function McqOptions({
  question,
  value,
  onChange,
  disabled,
  checkResult,
  retryMode,
  thinkAgain,
}: {
  question: EvalQuestion;
  value: string | undefined;
  onChange: (v: string) => void;
  disabled?: boolean;
  checkResult?: PlayerAnswerCheckResult | null;
  retryMode?: boolean;
  thinkAgain?: boolean;
}) {
  const options = (question.options as string[] | undefined) ?? [];
  const promptBn = localizeEvalPrompt(String(question.prompt ?? ""));
  const locked =
    Boolean(checkResult) &&
    !thinkAgain &&
    (!retryMode || checkResult?.correct === true);
  const correctOption = thinkAgain ? undefined : checkResult?.correctAnswer;

  return (
    <div className="space-y-3">
      {question.sentence ? (
        <p className="text-base font-semibold text-foreground">
          {String(question.sentence)}
        </p>
      ) : null}
      <p className="text-sm font-medium text-foreground">{promptBn}</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = value === opt;
          const isCorrectOption =
            locked && !thinkAgain && correctOption === opt;
          const isWrongPick =
            locked && !thinkAgain && isSelected && !checkResult?.correct;
          const isThinkAgainPick = thinkAgain && isSelected;

          return (
            <button
              key={opt}
              type="button"
              disabled={disabled || locked}
              onClick={() => onChange(opt)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                isCorrectOption &&
                  "border-primary bg-primary/5 dark:bg-primary/10",
                isWrongPick && "border-red-500 bg-red-50 dark:bg-red-950/40",
                isThinkAgainPick &&
                  "border-primary/60 bg-primary/5 dark:bg-primary/10",
                !locked &&
                  !thinkAgain &&
                  isSelected &&
                  "border-primary bg-primary/10 dark:bg-primary/15",
                !locked &&
                  !isSelected &&
                  "border-border hover:border-primary/40",
                locked && !isCorrectOption && !isWrongPick && "opacity-60",
              )}
            >
              <span className="font-semibold text-primary">
                {opt.charAt(0).toUpperCase()}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EvaluationQuestionBody({
  question,
  stageType,
  answers,
  setAnswers,
  disabled,
  checkResult,
  retryMode,
  onAnswerChange,
  thinkAgain,
}: {
  question: EvalQuestion;
  stageType: string;
  answers: Record<string, unknown>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  disabled?: boolean;
  checkResult?: PlayerAnswerCheckResult | null;
  retryMode?: boolean;
  onAnswerChange?: (questionId: string) => void;
  thinkAgain?: boolean;
}) {
  const id = String(question.id);
  const locked =
    Boolean(checkResult) &&
    !thinkAgain &&
    (!retryMode || checkResult?.correct === true);
  const touchAnswer = (
    updater: (prev: Record<string, unknown>) => Record<string, unknown>,
  ) => {
    setAnswers((prev) => {
      const next = updater(prev);
      onAnswerChange?.(id);
      return next;
    });
  };

  if (stageType === "mcq" || stageType === "story_mcq") {
    return (
      <McqOptions
        question={question}
        value={answers[id] as string | undefined}
        onChange={(v) => touchAnswer((prev) => ({ ...prev, [id]: v }))}
        disabled={disabled}
        checkResult={checkResult}
        retryMode={retryMode}
        thinkAgain={thinkAgain}
      />
    );
  }

  if (stageType === "correct_incorrect") {
    return (
      <div className="space-y-3">
        <p className="text-base font-semibold">{String(question.sentence)}</p>
        <p className="text-sm font-medium text-foreground">
          বাক্যটি সঠিক নাকি ভুল?
        </p>
        <div className="flex gap-2">
          {(
            [
              { value: "correct", label: "সঠিক" },
              { value: "incorrect", label: "ভুল" },
            ] as const
          ).map(({ value, label }) => {
            const isSelected = answers[id] === value;
            const isCorrectOption =
              locked && !thinkAgain && checkResult?.correctAnswer === value;
            const isWrongPick =
              locked && !thinkAgain && isSelected && !checkResult?.correct;
            return (
              <Button
                key={value}
                type="button"
                variant={isSelected && !locked ? "default" : "outline"}
                disabled={disabled || locked}
                onClick={() =>
                  touchAnswer((prev) => ({ ...prev, [id]: value }))
                }
                className={cn(
                  "flex-1",
                  isCorrectOption &&
                    "border-primary bg-primary hover:bg-primary",
                  isWrongPick &&
                    "border-red-500 bg-red-600 hover:bg-red-600 text-white",
                )}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  if (stageType === "rearrange" && Array.isArray(question.words)) {
    return (
      <RearrangeWordTiles
        questionId={id}
        words={question.words as string[]}
        value={(answers[id] as string) ?? ""}
        onChange={(sentence) => touchAnswer((prev) => ({ ...prev, [id]: sentence }))}
        disabled={disabled}
        locked={locked}
        isCorrect={checkResult?.correct}
      />
    );
  }

  if (stageType === "translation") {
    return (
      <div className="space-y-3">
        {question.sourceText ? (
          <p className="text-base font-semibold">{String(question.sourceText)}</p>
        ) : null}
        <p className="text-sm font-medium text-foreground">ইংরেজিতে অনুবাদ করো</p>
        {Array.isArray(question.hints) ? (
          <ul className="list-inside list-disc text-xs text-muted-foreground">
            {(question.hints as string[]).map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        ) : null}
        <input
          type="text"
          disabled={disabled || locked}
          value={(answers[id] as string) ?? ""}
          onChange={(e) => touchAnswer((prev) => ({ ...prev, [id]: e.target.value }))}
          className={cn(
            "w-full rounded-lg border bg-background px-3 py-2.5 text-sm",
            locked && checkResult?.correct && "border-primary",
            locked && !checkResult?.correct && "border-destructive",
          )}
          placeholder="উত্তর লেখো…"
        />
      </div>
    );
  }

  if (stageType === "compound_mcq" && Array.isArray(question.parts)) {
    const parts = question.parts as Array<{
      prompt: string;
      options: string[];
    }>;
    return (
      <div className="space-y-4">
        <p className="text-base font-semibold">{String(question.sentence)}</p>
        {parts.map((part, idx) => (
          <div key={`${id}-${idx}`}>
            <p className="mb-2 text-sm font-medium text-foreground">
              {localizeEvalPrompt(part.prompt)}
            </p>
            <div className="flex flex-wrap gap-2">
              {part.options.map((opt) => {
                const current =
                  (answers[id] as Record<string, string> | undefined) ?? {};
                const selected = current[String(idx)] === opt;
                return (
                  <Button
                    key={opt}
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    disabled={disabled || locked}
                    onClick={() =>
                      touchAnswer((prev) => ({
                        ...prev,
                        [id]: {
                          ...((prev[id] as Record<string, string>) ?? {}),
                          [String(idx)]: opt,
                        },
                      }))
                    }
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export function EvalQuestionRunner({
  missionSlug,
  stageOrder,
  stageType,
  questions,
  instruction,
  onComplete,
  submitting,
  aside,
  retryMode = false,
  preservedAnswers = {},
}: {
  missionSlug: string;
  stageOrder: number;
  stageType: string;
  questions: EvalQuestion[];
  instruction?: string;
  onComplete: (answers: Record<string, unknown>) => void;
  submitting: boolean;
  aside?: ReactNode;
  /** When true, only wrong questions are shown and each must be answered correctly before continuing. */
  retryMode?: boolean;
  /** Correct answers from a previous attempt — merged into the final submit payload. */
  preservedAnswers?: Record<string, unknown>;
}) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkResults, setCheckResults] = useState<
    Record<string, PlayerAnswerCheckResult>
  >({});
  const [wrongAttemptCounts, setWrongAttemptCounts] = useState<
    Record<string, number>
  >({});

  const handleAnswerChange = (questionId: string) => {
    const attempts = wrongAttemptCounts[questionId] ?? 0;
    const confirmedWrong =
      checkResults[questionId] && !checkResults[questionId].correct;

    if (attempts === 1 && !confirmedWrong) {
      setStepError(null);
      return;
    }

    if (retryMode && confirmedWrong) {
      setCheckResults((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
      setWrongAttemptCounts((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }

    setStepError(null);
  };

  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex >= total - 1;
  const progressPct = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;
  const questionId = currentQuestion ? String(currentQuestion.id) : "";
  const currentAnswered =
    currentQuestion && isQuestionAnswered(currentQuestion, stageType, answers);
  const currentCheck = checkResults[questionId] ?? null;
  const wrongAttempts = wrongAttemptCounts[questionId] ?? 0;
  const isThinkAgain = wrongAttempts === 1 && !currentCheck;
  const isChecked = Boolean(currentCheck);

  const handleCheck = async () => {
    if (!currentQuestion || !currentAnswered) {
      setStepError("আগে একটি উত্তর বেছে নাও।");
      return;
    }
    setStepError(null);
    setChecking(true);
    void primeEvalSfx();
    try {
      const result = await checkPlayerAnswer(
        missionSlug,
        stageOrder,
        questionId,
        answers[questionId],
      );

      if (result.correct) {
        setWrongAttemptCounts((prev) => {
          const next = { ...prev };
          delete next[questionId];
          return next;
        });
        setCheckResults((prev) => ({ ...prev, [questionId]: result }));
        void playCorrectEvalSfx();
        return;
      }

      const nextWrongAttempts = wrongAttempts + 1;
      setWrongAttemptCounts((prev) => ({
        ...prev,
        [questionId]: nextWrongAttempts,
      }));

      if (nextWrongAttempts >= 2) {
        setCheckResults((prev) => ({ ...prev, [questionId]: result }));
        void playWrongEvalSfx();
        return;
      }

      void playThinkAgainEvalSfx();
    } catch {
      setStepError("উত্তর যাচাই করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setChecking(false);
    }
  };

  const handleContinue = () => {
    if (!isChecked) return;
    if (retryMode && currentCheck && !currentCheck.correct) {
      setStepError("সঠিক উত্তর দাও, তারপর এগিয়ে যাও।");
      return;
    }
    if (isLast) {
      onComplete({ ...preservedAnswers, ...answers });
      return;
    }
    setStepError(null);
    setCurrentIndex((i) => i + 1);
  };

  const handlePrimaryAction = (event?: FormEvent) => {
    event?.preventDefault();
    if (!isChecked) {
      void handleCheck();
      return;
    }
    handleContinue();
  };

  const questionPanel = (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        handlePrimaryAction();
      }}
    >
      {total > 0 && currentQuestion ? (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>প্রশ্ন</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
            <EvaluationQuestionBody
              question={currentQuestion}
              stageType={stageType}
              answers={answers}
              setAnswers={setAnswers}
              disabled={submitting || checking}
              checkResult={currentCheck}
              retryMode={retryMode}
              onAnswerChange={handleAnswerChange}
              thinkAgain={isThinkAgain}
            />
          </div>

          {isThinkAgain ? <ThinkAgainPrompt /> : null}
          {currentCheck ? (
            <QuestionFeedback result={currentCheck} stageType={stageType} />
          ) : null}

          {stepError ? (
            <p className="text-sm text-destructive" role="alert">
              {stepError}
            </p>
          ) : null}

          <div className="flex justify-end pt-1">
            {!isChecked ? (
              <Button
                type="submit"
                size="lg"
                disabled={!currentAnswered || checking || submitting}
                className="min-w-[160px] gap-2"
              >
                {checking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    যাচাই হচ্ছে…
                  </>
                ) : isThinkAgain ? (
                  "আবার যাচাই করো"
                ) : (
                  "উত্তর যাচাই করো"
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={
                  submitting ||
                  (retryMode && currentCheck != null && !currentCheck.correct)
                }
                className="min-w-[160px] gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    জমা হচ্ছে…
                  </>
                ) : isLast ? (
                  retryMode ? (
                    "সব ঠিক করো ও জমা দিন"
                  ) : (
                    "জমা দিন"
                  )
                ) : (
                  <>
                    পরের প্রশ্ন
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </>
      ) : null}
    </form>
  );

  return (
    <div className="space-y-5">
      {retryMode ? (
        <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground">
          তুমি শুধু যে প্রশ্নগুলো ভুল করেছিলে সেগুলো আবার করো। প্রতিটি সঠিক হলে
          পরের ধাপে যেতে পারবে।
        </div>
      ) : null}

      {instruction && !retryMode ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {instruction}
        </p>
      ) : null}

      {aside ? (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="lg:sticky lg:top-24">{aside}</div>
          <div>{questionPanel}</div>
        </div>
      ) : (
        questionPanel
      )}
    </div>
  );
}
