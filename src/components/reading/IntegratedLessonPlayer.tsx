"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmbeddedLearningBody } from "@/src/components/shared/EmbeddedLearningBody";
import {
  submitIntegratedLesson,
  type IntegratedLessonBlockForStudent,
  type IntegratedLessonStepContent,
  type SubmitIntegratedLessonResponse,
} from "@/src/lib/api/readingStrictProgression";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface IntegratedLessonPlayerProps {
  levelId: string;
  stepId: string;
  content: IntegratedLessonStepContent;
  onComplete?: (res: SubmitIntegratedLessonResponse) => void;
}

export function IntegratedLessonPlayer({
  levelId,
  stepId,
  content,
  onComplete,
}: IntegratedLessonPlayerProps) {
  const blocks = useMemo(
    () =>
      [...(content.blocks ?? [])].sort(
        (a, b) => a.order - b.order,
      ) as IntegratedLessonBlockForStudent[],
    [content.blocks],
  );

  const [blockIndex, setBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [microFail, setMicroFail] = useState(false);

  const current = blocks[blockIndex];
  const isLastBlock = blockIndex >= blocks.length - 1;
  const hasMicroQuiz = blocks.some((b) => b.type === "MICRO_QUIZ");

  const finishNotesOnly = useCallback(async () => {
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
  }, [levelId, stepId, onComplete]);

  const submitMicroQuiz = async () => {
    if (!current || current.type !== "MICRO_QUIZ") return;
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
    setBlockIndex((i) => i + 1);
  };

  if (!current) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        This lesson has no content yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        {content.lessonCode} · Block {blockIndex + 1} of {blocks.length}
      </p>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {current.type === "NOTE" && (
        <>
          {current.body ? (
            <EmbeddedLearningBody
              html={current.body}
              title={content.title}
              className="prose prose-sm sm:prose-base dark:prose-invert max-w-none"
            />
          ) : (
            <p className="text-sm text-muted-foreground">No note content.</p>
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
              "Complete lesson"
            ) : (
              "Continue"
            )}
          </Button>
        </>
      )}

      {current.type === "MICRO_QUIZ" && (
        <>
          <h3 className="text-lg font-semibold text-foreground">
            {current.quizTitle ?? "Quick check"}
          </h3>
          <div className="space-y-4">
            {(current.questions ?? []).map((q, qi) => (
              <div key={q._id ?? qi} className="space-y-2 rounded-lg border border-border p-4">
                <p className="text-sm font-medium text-foreground">{q.questionText}</p>
                {q.type === "TFNG" ? (
                  <select
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    value={answers[qi] ?? ""}
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
                ) : q.options && q.options.length > 0 ? (
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                      >
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          checked={answers[qi] === opt}
                          onChange={() =>
                            setAnswers((prev) => ({ ...prev, [qi]: opt }))
                          }
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <Input
                    value={answers[qi] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [qi]: e.target.value }))
                    }
                    placeholder="Your answer"
                  />
                )}
              </div>
            ))}
          </div>

          {microFail && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Not all answers are correct. Review the note and try again (unlimited attempts).
            </p>
          )}

          <Button
            type="button"
            className="w-full sm:w-auto gap-2"
            disabled={submitting}
            onClick={() => void submitMicroQuiz()}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Submit micro-quiz
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
