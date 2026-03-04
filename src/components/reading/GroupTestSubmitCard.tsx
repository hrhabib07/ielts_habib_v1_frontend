"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getNextGroupTestContent,
  submitGroupTest,
  type GroupTestContentForStudent,
  type GroupTestMiniTestContent,
  type GroupTestQuestionForStudent,
} from "@/src/lib/api/readingStrictProgression";
import { Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

export interface GroupTestSubmitCardProps {
  levelId: string;
  onLevelPassed?: () => void;
  onProgressUpdate?: () => void;
  disabled?: boolean;
}

type PassageParagraph = { paragraphIndex: number; paragraphLabel: string; text: string };

function renderPassageContent(content: unknown): React.ReactNode {
  if (!content || !Array.isArray(content)) return null;
  return (
    <div className="space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      {(content as PassageParagraph[]).map((p) => (
        <p key={p.paragraphIndex}>
          {p.paragraphLabel && (
            <span className="font-medium text-gray-500 dark:text-gray-400 mr-1">
              {p.paragraphLabel}
            </span>
          )}
          {p.text}
        </p>
      ))}
    </div>
  );
}

function MiniTestSection({
  miniTest,
  index,
  answers,
  setAnswer,
  disabled,
}: {
  miniTest: GroupTestMiniTestContent;
  index: number;
  answers: Record<string, string>;
  setAnswer: (qId: string, value: string) => void;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="font-medium">Passage {index + 1}: {miniTest.passage.title}</span>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {expanded && (
        <div className="p-4 space-y-6 border-t border-gray-200 dark:border-gray-700">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderPassageContent(miniTest.passage.content)}
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">
              Questions {miniTest.questions.length > 0 && `(${miniTest.questions.length})`}
            </h4>
            {miniTest.questions.length === 0 ? (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No questions configured for this passage. Contact your instructor.
              </p>
            ) : (
              miniTest.questions.map((q) => (
                <QuestionInput
                  key={q._id}
                  question={q}
                  value={answers[q._id] ?? ""}
                  onChange={(v) => setAnswer(q._id, v)}
                  disabled={disabled}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function extractQuestionText(qBody: unknown): string {
  if (!qBody || typeof qBody !== "object") return "";
  const c = (qBody as { content?: unknown }).content;
  if (typeof c === "string") return c;
  if (Array.isArray(c) && c.length > 0) {
    if (typeof c[0] === "string") return c[0];
    if (Array.isArray(c[0])) return (c[0] as string[]).join(" ");
  }
  const layout = (qBody as { layout?: string }).layout;
  return layout ? `Question (${layout})` : "";
}

function QuestionInput({
  question,
  value,
  onChange,
  disabled,
}: {
  question: GroupTestQuestionForStudent;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const qBody = question.questionBody;
  const rawText = extractQuestionText(qBody);
  const text = rawText.trim() || `Question ${question.questionNumber}`;

  if (question.blanks?.length) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Q{question.questionNumber}. {text}</Label>
        {question.blanks.map((b) => (
          <div key={b.id} className="flex items-center gap-2">
            <Input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={b.options?.length ? `Choose: ${b.options.join(", ")}` : `Answer (max ${b.wordLimit ?? "—"} words)`}
              disabled={disabled}
              className="max-w-md"
            />
          </div>
        ))}
      </div>
    );
  }

  if (question.options?.length) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Q{question.questionNumber}. {text}</Label>
        <div className="space-y-1.5 pl-2">
          {question.options.map((opt, i) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question._id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                disabled={disabled}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={question._id} className="text-sm font-medium">
        Q{question.questionNumber}. {text}
      </Label>
      <Input
        id={question._id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your answer"
        disabled={disabled}
        className="max-w-md"
      />
    </div>
  );
}

export function GroupTestSubmitCard({
  levelId,
  onLevelPassed,
  onProgressUpdate,
  disabled = false,
}: GroupTestSubmitCardProps) {
  const [content, setContent] = useState<GroupTestContentForStudent | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    overallPass: boolean;
    miniTestResults: Array<{ bandScore: number; passed: boolean }>;
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    getNextGroupTestContent(levelId)
      .then((data) => {
        if (!cancelled) setContent(data);
      })
      .catch(() => {
        if (!cancelled) setContent(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [levelId]);

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || submitting || disabled) return;

    const miniTestAnswers = content.miniTests.map((mt) => ({
      answers: mt.questions.map((q) => ({
        questionId: q._id,
        studentAnswer: answers[q._id]?.trim() ?? "",
      })),
    }));

    const allAnswered = miniTestAnswers.every((ma) =>
      ma.answers.every((a) => a.studentAnswer !== ""),
    );
    if (!allAnswered) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await submitGroupTest(levelId, content.groupTestId, {
        miniTestAnswers: miniTestAnswers as [
          { answers: Array<{ questionId: string; studentAnswer: string }> },
          { answers: Array<{ questionId: string; studentAnswer: string }> },
          { answers: Array<{ questionId: string; studentAnswer: string }> },
        ],
      });
      setResult({
        overallPass: res.overallPass,
        miniTestResults: res.miniTestResults,
      });
      onProgressUpdate?.();
      if (res.overallPass && res.newPassStatus === "PASSED" && onLevelPassed) {
        onLevelPassed();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || content === undefined) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 text-sm text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading group test…
      </div>
    );
  }

  if (!content) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 text-sm text-gray-500">
        No group test available. Complete previous steps first.
      </div>
    );
  }

  if (result) {
    const passed = result.overallPass;
    return (
      <div
        className={`flex flex-col gap-4 rounded-xl border p-6 ${
          passed
            ? "border-green-200 bg-green-50/50 dark:border-green-800/50 dark:bg-green-950/20"
            : "border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20"
        }`}
      >
        <div className="flex items-center gap-2">
          {passed ? (
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          )}
          <span className="font-semibold">
            {passed ? "Group test passed!" : "Group test not passed"}
          </span>
        </div>
        <div className="space-y-1 text-sm">
          {result.miniTestResults.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span>Passage {i + 1}:</span>
              <span className={r.passed ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
                Band {r.bandScore} {r.passed ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {content.miniTests.map((mt, i) => (
          <MiniTestSection
            key={mt.miniTestId}
            miniTest={mt}
            index={i}
            answers={answers}
            setAnswer={setAnswer}
            disabled={disabled}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <Button
        type="submit"
        size="lg"
        disabled={disabled || submitting}
        className="w-full sm:w-auto"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Submit Group Test"
        )}
      </Button>
    </form>
  );
}
