"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  Lightbulb,
  Loader2,
  X,
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
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { useAutoAdvanceCorrect } from "@/src/hooks/useAutoAdvanceCorrect";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import type { PlayerUiCopy } from "@/src/lib/player-ui-copy";
import { emitXpGain } from "@/src/lib/xp-events";
import {
  buildGapFillAnswer,
  parseGapSourceText,
} from "@/src/lib/player-gap-fill";

type EvalQuestion = Record<string, unknown>;

/** Short pause after a correct answer, then auto-advance. Wrong answers wait for Continue. */
const AUTO_ADVANCE_CORRECT_MS = 1500;

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

/** Quoted target words + blanks + verb trios get their own visual treatment. */
const PROMPT_TOKEN_RE = /[“"']([^“”"']+)[”"']|(_{3,})|((?:\S+\s*→\s*)+\S+)/g;

function TargetChip({ children }: { children: ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex items-baseline rounded-lg bg-primary/12 px-2 py-0.5 text-[1.15em] font-black tracking-tight text-primary ring-1 ring-inset ring-primary/25 dark:bg-primary/20 dark:text-primary-foreground">
      {children}
    </span>
  );
}

function TrioChips({ text }: { text: string }) {
  const tokens = text.split("→").map((token) => token.trim());
  return (
    <span className="mx-0.5 inline-flex flex-wrap items-center gap-1.5 align-middle">
      {tokens.map((token, idx) => (
        <span key={`${token}-${idx}`} className="inline-flex items-center gap-1.5">
          {idx > 0 ? <span className="text-primary/50">→</span> : null}
          <span
            className={cn(
              "inline-flex items-center rounded-lg px-2 py-0.5 text-[0.95em] font-black tracking-tight",
              /^_{3,}$/.test(token)
                ? "border-2 border-dashed border-primary/50 bg-primary/5 px-4 text-primary"
                : "bg-muted text-foreground ring-1 ring-inset ring-border",
            )}
          >
            {/^_{3,}$/.test(token) ? "?" : token}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Renders a prompt with the important word(s) visually highlighted. */
function PromptRich({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const nodes: ReactNode[] = [];
  const regex = new RegExp(PROMPT_TOKEN_RE.source, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null = regex.exec(text);
  let key = 0;

  while (match) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      nodes.push(<TargetChip key={`c-${key}`}>{match[1]}</TargetChip>);
    } else if (match[2]) {
      nodes.push(
        <span
          key={`g-${key}`}
          className="mx-1 inline-block min-w-[3.5rem] rounded-md border-2 border-dashed border-primary/50 bg-primary/5 px-2 text-center align-middle font-black text-primary"
        >
          ?
        </span>,
      );
    } else if (match[3]) {
      nodes.push(<TrioChips key={`t-${key}`} text={match[3]} />);
    }
    lastIndex = match.index + match[0].length;
    key += 1;
    match = regex.exec(text);
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return (
    <p
      className={cn(
        "text-balance text-xl font-bold leading-snug text-foreground sm:text-2xl",
        className,
      )}
    >
      {nodes}
    </p>
  );
}

/** The sentence a question is about · shown as a focused stage panel. */
function QuestionSentence({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-border/70 bg-gradient-to-br from-muted/60 via-background to-primary/[0.04] px-4 py-3.5 text-lg font-bold leading-relaxed text-foreground shadow-sm sm:text-xl dark:from-card dark:to-primary/10">
      {text}
    </p>
  );
}

/**
 * True when every rearrange tile is present in the answer string (order = student order).
 * Handles multi-word tiles like "The garden" that must not be counted as two words.
 */
function isRearrangeAnswerComplete(words: string[], answer: string): boolean {
  let rest = answer.trim().replace(/[.!?]+$/, "").trim();
  if (!rest) return false;

  const remaining = [...words];
  while (remaining.length > 0) {
    const matches = remaining
      .map((word, index) => ({ word, index }))
      .filter(({ word }) => rest === word || rest.startsWith(`${word} `))
      .sort((a, b) => b.word.length - a.word.length);
    const best = matches[0];
    if (!best) return false;
    remaining.splice(best.index, 1);
    rest = rest.slice(best.word.length).trimStart();
  }
  return rest.length === 0;
}

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
    if (typeof answer !== "string") return false;
    return isRearrangeAnswerComplete(question.words as string[], answer);
  }
  if (stageType === "translation") {
    const source = String(question.sourceText ?? "");
    const parsed = parseGapSourceText(source);
    if (parsed) {
      const draftGaps = answers[`${id}__gaps`];
      if (!Array.isArray(draftGaps) || draftGaps.length < parsed.gapCount) {
        return false;
      }
      return draftGaps
        .slice(0, parsed.gapCount)
        .every((v) => String(v ?? "").trim() !== "");
    }
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
  copy: PlayerUiCopy["eval"],
): string {
  if (result.correct) return copy.correctGreat;

  if (stageType === "correct_incorrect") {
    return result.correctAnswer === "correct" ? copy.ciWasCorrect : copy.ciWasIncorrect;
  }

  const expected = result.correctAnswer ?? result.correctAnswers?.[0];
  if (expected) return copy.wrongWithAnswer(expected);
  return copy.wrongGeneric;
}

function ThinkAgainPrompt({ copy }: { copy: PlayerUiCopy["eval"] }) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl border-2 border-primary/40 bg-primary/10 px-4 py-3.5 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
      role="status"
    >
      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="space-y-1 text-left">
        <p className="text-base font-bold text-foreground">{copy.thinkAgainTitle}</p>
        <p className="font-medium leading-relaxed text-muted-foreground">{copy.thinkAgainBody}</p>
      </div>
    </div>
  );
}

function QuestionFeedback({
  result,
  stageType,
  copy,
}: {
  result: PlayerAnswerCheckResult;
  stageType: string;
  copy: PlayerUiCopy["eval"];
}) {
  const { locale } = useUiLocale();
  const explanation =
    locale === "bn"
      ? (result.explanationBn ?? result.explanationEn)
      : (result.explanationEn ?? result.explanationBn);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border-2 px-4 py-3.5 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300",
        result.correct
          ? "border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-destructive/40 bg-destructive/10 text-destructive",
      )}
      role="status"
    >
      {result.correct ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
      )}
      <div className="space-y-2 text-left">
        <p className="text-base font-bold leading-relaxed">
          {feedbackMessage(result, stageType, copy)}
        </p>
        {explanation ? (
          <p className="leading-relaxed text-foreground/90">{explanation}</p>
        ) : null}
      </div>
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
  const { locale } = useUiLocale();
  const options = (question.options as string[] | undefined) ?? [];
  const promptText = localizeEvalPrompt(String(question.prompt ?? ""), locale);
  const locked =
    Boolean(checkResult) &&
    !thinkAgain &&
    (!retryMode || checkResult?.correct === true);
  const correctOption = thinkAgain ? undefined : checkResult?.correctAnswer;

  return (
    <div className="space-y-4">
      {question.sentence ? <QuestionSentence text={String(question.sentence)} /> : null}
      <PromptRich text={promptText} />
      <div className="grid gap-2.5 sm:grid-cols-2">
        {options.map((opt, index) => {
          const isSelected = value === opt;
          const isCorrectOption = locked && !thinkAgain && correctOption === opt;
          const isWrongPick = locked && !thinkAgain && isSelected && !checkResult?.correct;
          const isThinkAgainPick = thinkAgain && isSelected;
          const letter = OPTION_LETTERS[index] ?? String(index + 1);

          return (
            <button
              key={opt}
              type="button"
              disabled={disabled || locked}
              onClick={() => onChange(opt)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-2xl border-2 bg-card px-3.5 py-3.5 text-left transition-all duration-150",
                "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:hover:translate-y-0 disabled:hover:shadow-none",
                isCorrectOption && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
                isWrongPick && "border-red-500 bg-red-50 dark:bg-red-950/40",
                isThinkAgainPick && "border-primary/60 bg-primary/5 dark:bg-primary/10",
                !locked &&
                  !thinkAgain &&
                  isSelected &&
                  "border-primary bg-primary/10 shadow-md ring-2 ring-primary/25 dark:bg-primary/15",
                !locked && !isSelected && "border-border/80 hover:border-primary/50",
                locked && !isCorrectOption && !isWrongPick && "opacity-50",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-colors",
                  isCorrectOption
                    ? "bg-emerald-500 text-white"
                    : isWrongPick
                      ? "bg-red-500 text-white"
                      : isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary",
                )}
              >
                {isCorrectOption ? (
                  <Check className="h-5 w-5 stroke-[3]" />
                ) : isWrongPick ? (
                  <X className="h-5 w-5 stroke-[3]" />
                ) : (
                  letter
                )}
              </span>
              <span className="min-w-0 flex-1 text-base font-semibold leading-snug text-foreground">
                {opt}
              </span>
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
  copy,
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
  copy: PlayerUiCopy["eval"];
}) {
  const { locale } = useUiLocale();
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
      <div className="space-y-4">
        <QuestionSentence text={String(question.sentence)} />
        <PromptRich text={copy.correctIncorrectPrompt} />
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "correct", label: copy.correct, Icon: Check },
              { value: "incorrect", label: copy.incorrect, Icon: X },
            ] as const
          ).map(({ value, label, Icon }) => {
            const isSelected = answers[id] === value;
            const isCorrectOption =
              locked && !thinkAgain && checkResult?.correctAnswer === value;
            const isWrongPick =
              locked && !thinkAgain && isSelected && !checkResult?.correct;
            return (
              <button
                key={value}
                type="button"
                disabled={disabled || locked}
                onClick={() => touchAnswer((prev) => ({ ...prev, [id]: value }))}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border-2 bg-card px-4 py-4 text-base font-bold transition-all duration-150",
                  "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none",
                  isCorrectOption && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                  isWrongPick && "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
                  !locked &&
                    isSelected &&
                    "border-primary bg-primary/10 text-primary shadow-md ring-2 ring-primary/25",
                  !locked && !isSelected && "border-border/80 text-foreground hover:border-primary/50",
                  locked && !isCorrectOption && !isWrongPick && "opacity-50",
                )}
              >
                <Icon className="h-5 w-5 stroke-[3]" />
                {label}
              </button>
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
    const sourceText = String(question.sourceText ?? "");
    const gapParts = parseGapSourceText(sourceText);

    if (gapParts) {
      const gapValues: string[] = Array.from({ length: gapParts.gapCount }, () => "");
      // Prefer dedicated gap state key when rebuilding from full answer is ambiguous;
      // we keep gap drafts in answers[`${id}__gaps`] as string[].
      const draftGaps = answers[`${id}__gaps`];
      if (Array.isArray(draftGaps)) {
        draftGaps.forEach((v, i) => {
          if (i < gapValues.length) gapValues[i] = String(v ?? "");
        });
      }

      const segments = gapParts.englishTemplate.split(/_{3,}/);

      const setGapAt = (index: number, value: string) => {
        touchAnswer((prev) => {
          const prevGaps = (prev[`${id}__gaps`] as string[] | undefined) ?? gapValues;
          const nextGaps = Array.from({ length: gapParts.gapCount }, (_, i) =>
            i === index ? value : String(prevGaps[i] ?? ""),
          );
          return {
            ...prev,
            [`${id}__gaps`]: nextGaps,
            [id]: buildGapFillAnswer(sourceText, nextGaps),
          };
        });
      };

      return (
        <div className="space-y-4">
          {gapParts.banglaHint ? (
            <p className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-base font-semibold leading-relaxed text-foreground">
              {gapParts.banglaHint}
            </p>
          ) : null}
          <PromptRich text={copy.gapFillPrompt} className="text-lg sm:text-xl" />
          <QuestionHints hints={question.hints} label={copy.clueLabel} />
          <p
            className={cn(
              "rounded-xl border bg-background px-3 py-3 text-base font-semibold leading-relaxed text-foreground",
              locked && checkResult?.correct && "border-primary",
              locked && !checkResult?.correct && "border-destructive",
            )}
          >
            {segments.map((segment, idx) => {
              const gapValue = gapValues[idx] ?? "";
              const gapSize = Math.min(
                18,
                Math.max(3, gapValue.length || copy.gapPlaceholder.length || 3),
              );
              return (
                <span key={`seg-${idx}`}>
                  {segment}
                  {idx < gapParts.gapCount ? (
                    <input
                      type="text"
                      disabled={disabled || locked}
                      value={gapValue}
                      onChange={(e) => setGapAt(idx, e.target.value)}
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-label={`Gap ${idx + 1}`}
                      placeholder={copy.gapPlaceholder}
                      size={gapSize}
                      className={cn(
                        "mx-0.5 inline-block h-8 max-w-[12rem] rounded-md border border-sky-500/50 bg-sky-500/10 px-1.5 py-0.5 align-baseline text-center text-base font-bold text-foreground outline-none",
                        "field-sizing-content focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30",
                        locked && checkResult?.correct && "border-primary bg-primary/10",
                        locked && !checkResult?.correct && "border-destructive bg-destructive/10",
                      )}
                    />
                  ) : null}
                </span>
              );
            })}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {question.sourceText ? (
          <QuestionSentence text={String(question.sourceText)} />
        ) : null}
        <PromptRich text={copy.translatePrompt} className="text-lg sm:text-xl" />
        <QuestionHints hints={question.hints} label={copy.clueLabel} />
        <input
          type="text"
          disabled={disabled || locked}
          value={(answers[id] as string) ?? ""}
          onChange={(e) => touchAnswer((prev) => ({ ...prev, [id]: e.target.value }))}
          className={cn(
            "w-full rounded-2xl border-2 border-border/80 bg-background px-4 py-3.5 text-base font-semibold outline-none transition",
            "focus:border-primary focus:ring-4 focus:ring-primary/15",
            locked && checkResult?.correct && "border-emerald-500",
            locked && !checkResult?.correct && "border-destructive",
          )}
          placeholder={copy.answerPlaceholder}
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
      <div className="space-y-5">
        <QuestionSentence text={String(question.sentence)} />
        {parts.map((part, idx) => (
          <div key={`${id}-${idx}`}>
            <PromptRich
              text={localizeEvalPrompt(part.prompt, locale)}
              className="mb-2.5 text-lg sm:text-xl"
            />
            <div className="flex flex-wrap gap-2">
              {part.options.map((opt) => {
                const current = (answers[id] as Record<string, string> | undefined) ?? {};
                const selected = current[String(idx)] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
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
                    className={cn(
                      "rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all duration-150",
                      "hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none",
                      selected
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/25"
                        : "border-border/80 bg-card text-foreground hover:border-primary/50",
                      locked && !selected && "opacity-50",
                    )}
                  >
                    {opt}
                  </button>
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
  checkAnswer,
}: {
  missionSlug: string;
  stageOrder: number;
  stageType: string;
  questions: EvalQuestion[];
  instruction?: string;
  onComplete: (answers: Record<string, unknown>) => void;
  submitting: boolean;
  aside?: ReactNode;
  retryMode?: boolean;
  preservedAnswers?: Record<string, unknown>;
  /** Override live check (e.g. free demo without student auth). */
  checkAnswer?: (
    questionId: string,
    answer: unknown,
  ) => Promise<PlayerAnswerCheckResult>;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  const copy = PLAYER_UI.eval;
  const autoAdvanceCorrect = useAutoAdvanceCorrect();
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
  const handleContinueRef = useRef<() => void>(() => undefined);
  /** Prevents auto-advance + manual Continue from skipping a question (blank UI / no button). */
  const continueLockRef = useRef<string | null>(null);
  const [advanceLockedForId, setAdvanceLockedForId] = useState<string | null>(null);

  const buildSubmitAnswers = () => {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries({ ...preservedAnswers, ...answers })) {
      if (key.endsWith("__gaps")) continue;
      cleaned[key] = value;
    }
    return cleaned;
  };

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
      setStepError(copy.pickAnswerFirst);
      return;
    }
    setStepError(null);
    setChecking(true);
    void primeEvalSfx();
    try {
      const result = checkAnswer
        ? await checkAnswer(questionId, answers[questionId])
        : await checkPlayerAnswer(
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
        const xp = result.xpAwarded ?? 0;
        if (xp > 0) {
          emitXpGain(xp, "answer");
        }
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
      setStepError(copy.checkFailed);
    } finally {
      setChecking(false);
    }
  };

  const handleContinue = () => {
    if (!isChecked || !questionId) return;
    if (retryMode && currentCheck && !currentCheck.correct) {
      setStepError(copy.needCorrectToContinue);
      return;
    }
    // Sync lock: auto-advance timer + Continue click must not both run.
    if (continueLockRef.current === questionId) return;
    continueLockRef.current = questionId;
    setAdvanceLockedForId(questionId);

    if (isLast || currentIndex >= total - 1) {
      if (submitting) return;
      onComplete(buildSubmitAnswers());
      return;
    }
    setStepError(null);
    setCurrentIndex((i) => Math.min(i + 1, Math.max(total - 1, 0)));
  };
  handleContinueRef.current = handleContinue;

  // Correct + preference ON: short auto-advance. Wrong (or preference OFF): wait for Continue.
  useEffect(() => {
    if (!isChecked || checking || !questionId) return;
    if (!currentCheck?.correct) return;
    if (!autoAdvanceCorrect) return;
    if (continueLockRef.current === questionId) return;

    const timer = window.setTimeout(() => {
      handleContinueRef.current();
    }, AUTO_ADVANCE_CORRECT_MS);

    return () => window.clearTimeout(timer);
  }, [isChecked, checking, questionId, currentCheck, autoAdvanceCorrect]);

  // Recover if index overshoots (legacy double-advance) so the CTA never vanishes.
  useEffect(() => {
    if (total === 0 || currentIndex < total) return;
    setCurrentIndex(total - 1);
  }, [currentIndex, total]);

  const prevSubmittingRef = useRef(false);

  // After a failed stage submit (submitting true → false), unlock last-question Submit.
  useEffect(() => {
    const wasSubmitting = prevSubmittingRef.current;
    prevSubmittingRef.current = submitting;
    if (submitting || !wasSubmitting) return;
    if (!isLast || !questionId) return;
    if (advanceLockedForId !== questionId) return;
    continueLockRef.current = null;
    setAdvanceLockedForId(null);
  }, [submitting, isLast, questionId, advanceLockedForId]);

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
          <div className="flex items-center gap-3 sm:block sm:space-y-2">
            <div className="flex shrink-0 items-center justify-between gap-2 sm:w-full">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary sm:rounded-full sm:bg-primary/10 sm:px-3 sm:py-1">
                <span className="hidden sm:inline">{copy.questionLabel}</span>
                <span className="tabular-nums">
                  {currentIndex + 1}/{total}
                </span>
              </span>
              <span className="hidden text-xs font-bold tabular-nums text-muted-foreground sm:inline">
                {Math.round(progressPct)}%
              </span>
            </div>
            <div className="flex flex-1 gap-1">
              {questions.map((q, idx) => (
                <span
                  key={String(q.id)}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors duration-300 sm:h-2",
                    idx < currentIndex
                      ? "bg-emerald-500"
                      : idx === currentIndex
                        ? "bg-primary"
                        : "bg-muted",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border-2 border-border/60 bg-gradient-to-b from-card to-muted/20 p-4 shadow-lg shadow-primary/[0.04] sm:p-7 dark:to-background">
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
              copy={copy}
            />
          </div>

          {isThinkAgain ? <ThinkAgainPrompt copy={copy} /> : null}
          {currentCheck ? (
            <QuestionFeedback result={currentCheck} stageType={stageType} copy={copy} />
          ) : null}

          {currentCheck && !currentCheck.correct && !retryMode ? (
            <p className="text-sm font-medium leading-relaxed text-foreground/80">
              {copy.readThenContinue}
            </p>
          ) : null}

          {currentCheck?.correct && !autoAdvanceCorrect ? (
            <p className="text-sm font-medium leading-relaxed text-foreground/80">
              {copy.continueWhenReady}
            </p>
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
                className="h-12 w-full gap-2 rounded-xl text-base font-bold shadow-md transition-transform hover:-translate-y-0.5 disabled:hover:translate-y-0 sm:w-auto sm:min-w-[180px]"
              >
                {checking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {copy.checking}
                  </>
                ) : isThinkAgain ? (
                  copy.checkAgain
                ) : (
                  copy.checkAnswer
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={
                  submitting ||
                  advanceLockedForId === questionId ||
                  (retryMode && currentCheck != null && !currentCheck.correct)
                }
                className="h-12 w-full gap-2 rounded-xl text-base font-bold shadow-md transition-transform hover:-translate-y-0.5 disabled:hover:translate-y-0 sm:w-auto sm:min-w-[180px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {copy.submitting}
                  </>
                ) : isLast ? (
                  retryMode ? (
                    copy.submitFixed
                  ) : (
                    copy.submit
                  )
                ) : (
                  <>
                    {copy.nextQuestion}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </>
      ) : total > 0 ? (
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="lg"
            disabled={submitting}
            className="min-w-[160px] gap-2"
            onClick={() => {
              if (submitting) return;
              onComplete(buildSubmitAnswers());
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {copy.submitting}
              </>
            ) : retryMode ? (
              copy.submitFixed
            ) : (
              copy.submit
            )}
          </Button>
        </div>
      ) : null}
    </form>
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      {retryMode ? (
        <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground">
          {copy.retryBanner}
        </div>
      ) : null}

      {instruction && !retryMode ? (
        <InstructionNote text={instruction} />
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

/** Task hint: one tappable line on phones, always open from `sm` up. */
function InstructionNote({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border/50 bg-muted/40 dark:bg-card/60">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-left sm:hidden"
      >
        <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span
          className={cn(
            "min-w-0 flex-1 text-xs leading-snug text-muted-foreground",
            !open && "truncate",
          )}
        >
          {text}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <p className="hidden px-4 py-3 text-sm font-medium leading-relaxed text-muted-foreground sm:block">
        {text}
      </p>
    </div>
  );
}

/** Verb / word clues for gap-fill and translation. Large, high-contrast chips. */
function QuestionHints({
  hints,
  label,
}: {
  hints: unknown;
  label: string;
}) {
  if (!Array.isArray(hints) || hints.length === 0) return null;
  const items = hints
    .map((h) => String(h ?? "").trim())
    .filter(Boolean);
  if (items.length === 0) return null;

  return (
    <div
      className="rounded-2xl border-2 border-sky-500/35 bg-sky-500/10 px-4 py-3.5 dark:border-sky-400/30 dark:bg-sky-500/15"
      role="group"
      aria-label={label}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" aria-hidden />
        <p className="text-sm font-bold uppercase tracking-wide text-sky-800 dark:text-sky-200">
          {label}
        </p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {items.map((h) => (
          <li
            key={h}
            className="rounded-xl border border-sky-500/25 bg-background px-3.5 py-2 text-lg font-bold leading-snug text-foreground shadow-sm sm:text-xl"
          >
            {h}
          </li>
        ))}
      </ul>
    </div>
  );
}
