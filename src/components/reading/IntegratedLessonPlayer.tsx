"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmbeddedLearningBody } from "@/src/components/shared/EmbeddedLearningBody";
import {
  submitIntegratedLesson,
  type IntegratedLessonBlockForStudent,
  type IntegratedLessonStepContent,
  type SubmitIntegratedLessonResponse,
} from "@/src/lib/api/readingStrictProgression";
import type { IntegratedLessonBlock } from "@/src/lib/api/adminReadingVersions";
import { LessonLocaleToggle } from "@/src/features/reading-version/LessonLocaleToggle";
import {
  formatCorrectAnswerLabel,
  isIntegratedQuestionCorrect,
} from "@/src/features/reading-version/integratedLessonGrading";
import {
  getStoredLessonLocale,
  mcqOptionLabel,
  pickLocalizedText,
  setStoredLessonLocale,
  type LessonLocale,
  type LocalizedText,
} from "@/src/lib/localizedText";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";

interface IntegratedLessonPlayerProps {
  levelId: string;
  stepId: string;
  content: IntegratedLessonStepContent;
  onComplete?: (res: SubmitIntegratedLessonResponse) => void;
  /** Instructor preview: local grading, explanations, no API progress writes */
  previewMode?: boolean;
  instructorGradingBlocks?: IntegratedLessonBlock[];
}

function resolveBlockText(
  value: string | LocalizedText | undefined,
  locale: LessonLocale,
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return pickLocalizedText(value, locale);
}

type QuestionResult = {
  correct: boolean;
  explanation?: string;
  correctLabel: string;
};

export function IntegratedLessonPlayer({
  levelId,
  stepId,
  content,
  onComplete,
  previewMode = false,
  instructorGradingBlocks,
}: IntegratedLessonPlayerProps) {
  const [locale, setLocale] = useState<LessonLocale>("en");

  useEffect(() => {
    setLocale(getStoredLessonLocale());
  }, []);

  const handleLocaleChange = (next: LessonLocale) => {
    setLocale(next);
    setStoredLessonLocale(next);
  };

  const blocks = useMemo(
    () =>
      [...(content.blocks ?? [])].sort(
        (a, b) => a.order - b.order,
      ) as IntegratedLessonBlockForStudent[],
    [content.blocks],
  );

  const gradingByOrder = useMemo(() => {
    const map = new Map<number, IntegratedLessonBlock>();
    const source = instructorGradingBlocks ?? content.instructorGradingBlocks ?? [];
    for (const b of source) {
      if (b.type === "MICRO_QUIZ") map.set(b.order, b);
    }
    return map;
  }, [instructorGradingBlocks, content.instructorGradingBlocks]);

  const isPreview = previewMode;

  const [blockIndex, setBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [microFail, setMicroFail] = useState(false);
  const [questionResults, setQuestionResults] = useState<QuestionResult[] | null>(null);
  const [previewLessonDone, setPreviewLessonDone] = useState(false);

  const current = blocks[blockIndex];
  const isLastBlock = blockIndex >= blocks.length - 1;
  const hasMicroQuiz = blocks.some((b) => b.type === "MICRO_QUIZ");

  const finishNotesOnly = useCallback(async () => {
    if (isPreview) {
      setPreviewLessonDone(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitIntegratedLesson(levelId, stepId, {
        completeNotesOnly: true,
      });
      onComplete?.(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not complete lesson");
    } finally {
      setSubmitting(false);
    }
  }, [isPreview, levelId, stepId, onComplete]);

  const gradePreviewMicroQuiz = (): boolean => {
    const gradingBlock = gradingByOrder.get(current?.order ?? -1);
    if (!gradingBlock?.questions?.length) return false;

    const results: QuestionResult[] = gradingBlock.questions.map((q, qi) => {
      const selected = answers[qi];
      const correct = isIntegratedQuestionCorrect(q, selected, locale);
      return {
        correct,
        explanation: q.explanation
          ? resolveBlockText(q.explanation, locale)
          : undefined,
        correctLabel: formatCorrectAnswerLabel(q, locale),
      };
    });

    setQuestionResults(results);
    const allCorrect = results.every((r) => r.correct);
    setMicroFail(!allCorrect);
    return allCorrect;
  };

  const submitMicroQuiz = async () => {
    if (!current || current.type !== "MICRO_QUIZ") return;

    if (isPreview) {
      setSubmitting(true);
      setError(null);
      gradePreviewMicroQuiz();
      setSubmitting(false);
      return;
    }

    const questions = current.questions ?? [];
    setSubmitting(true);
    setError(null);
    setMicroFail(false);
    try {
      const payload = {
        blockOrder: current.order,
        answers: questions.map((_, qi) => ({
          questionIndex: qi,
          value: answers[qi] ?? "",
        })),
      };
      const res = await submitIntegratedLesson(levelId, stepId, payload);
      if (!res.passed) {
        setMicroFail(true);
        return;
      }
      if (res.lessonComplete) {
        onComplete?.(res);
        return;
      }
      setAnswers({});
      setBlockIndex((i) => i + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const continueFromNote = () => {
    if (isLastBlock && !hasMicroQuiz) {
      void finishNotesOnly();
      return;
    }
    setQuestionResults(null);
    setMicroFail(false);
    setBlockIndex((i) => i + 1);
  };

  const retryMicroQuiz = () => {
    setAnswers({});
    setQuestionResults(null);
    setMicroFail(false);
  };

  if (previewLessonDone) {
    return (
      <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
          Lesson complete (preview)
        </p>
        <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80">
          Students would mark this step complete after passing all micro-quizzes.
        </p>
      </div>
    );
  }

  if (!current) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        This lesson has no content yet.
      </p>
    );
  }

  return (
    <div className={cn("space-y-6", locale === "bn" && "font-bengali")} lang={locale === "bn" ? "bn" : "en"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {content.lessonCode} · Block {blockIndex + 1} of {blocks.length}
        </p>
        <LessonLocaleToggle locale={locale} onChange={handleLocaleChange} compact />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {current.type === "NOTE" && (
        <>
          {resolveBlockText(current.body, locale) ? (
            <EmbeddedLearningBody
              html={resolveBlockText(current.body, locale)}
              title={content.title}
              className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
            />
          ) : (
            <p className="text-sm text-muted-foreground">No note content in this language yet.</p>
          )}
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={submitting}
            onClick={continueFromNote}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLastBlock && !hasMicroQuiz ? (
              isPreview ? "Finish preview" : "Complete lesson"
            ) : (
              "Continue"
            )}
          </Button>
        </>
      )}

      {current.type === "MICRO_QUIZ" && (
        <>
          <h3 className="text-lg font-semibold text-foreground">
            {resolveBlockText(current.quizTitle, locale) || "Quick check"}
          </h3>
          <div className="space-y-4">
            {(current.questions ?? []).map((q, qi) => {
              const options =
                q.options?.map((opt) =>
                  typeof opt === "string" ? opt : pickLocalizedText(opt, locale),
                ) ?? [];
              const result = questionResults?.[qi];

              return (
                <div
                  key={q._id ?? qi}
                  className={cn(
                    "space-y-2 rounded-lg border p-4",
                    result?.correct === true && "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20",
                    result?.correct === false && "border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20",
                    result == null && "border-border",
                  )}
                >
                  <p className="text-sm font-medium text-foreground">
                    {qi + 1}. {resolveBlockText(q.questionText, locale)}
                  </p>
                  {q.type === "TFNG" ? (
                    <select
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      value={answers[qi] ?? ""}
                      disabled={questionResults != null}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [qi]: e.target.value }))
                      }
                    >
                      <option value="">Select…</option>
                      {["True", "False", "Not Given"].map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : options.length > 0 ? (
                    <div className="space-y-2">
                      {options.map((opt, oi) => {
                        const letter = mcqOptionLabel(oi);
                        const value = q.type === "MCQ" ? letter : opt;
                        return (
                          <label
                            key={letter}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm",
                              questionResults != null && "pointer-events-none opacity-90",
                            )}
                          >
                            <input
                              type="radio"
                              name={`q-${qi}`}
                              checked={answers[qi] === value}
                              disabled={questionResults != null}
                              onChange={() =>
                                setAnswers((prev) => ({ ...prev, [qi]: value }))
                              }
                            />
                            <span className="font-medium text-muted-foreground">{letter}.</span>
                            {opt}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                      value={answers[qi] ?? ""}
                      disabled={questionResults != null}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [qi]: e.target.value }))
                      }
                      placeholder="Your answer"
                    />
                  )}

                  {result && (
                    <div
                      className={cn(
                        "mt-2 flex gap-2 rounded-md px-3 py-2 text-xs",
                        result.correct
                          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
                          : "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100",
                      )}
                    >
                      {result.correct ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0" />
                      )}
                      <div>
                        {result.correct ? (
                          <p className="font-medium">Correct</p>
                        ) : (
                          <p className="font-medium">
                            Incorrect · Answer: {result.correctLabel}
                          </p>
                        )}
                        {result.explanation && (
                          <p className="mt-1 opacity-90">{result.explanation}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {microFail && !questionResults && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Not all answers are correct. Review the note above and try again (unlimited
              attempts).
            </p>
          )}

          {microFail && questionResults && isPreview && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Fix your answers using the feedback above, then try again.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {questionResults && microFail && isPreview && (
              <Button type="button" variant="outline" size="sm" onClick={retryMicroQuiz}>
                Try again
              </Button>
            )}
            <Button
              type="button"
              className="gap-2"
              disabled={submitting || (questionResults != null && microFail && isPreview)}
              onClick={() => {
                if (questionResults && !microFail) {
                  if (isLastBlock) {
                    setPreviewLessonDone(true);
                    return;
                  }
                  setAnswers({});
                  setQuestionResults(null);
                  setMicroFail(false);
                  setBlockIndex((i) => i + 1);
                  return;
                }
                void submitMicroQuiz();
              }}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {questionResults && !microFail ? "Continue" : "Submit micro-quiz"}
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
