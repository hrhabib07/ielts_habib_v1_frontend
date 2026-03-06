"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  submitPracticeTest,
  type PracticeTestStepContent,
  type GroupTestQuestionForStudent,
  type SubmitPracticeTestResponse,
} from "@/src/lib/api/readingStrictProgression";
import { GapFillingQuestionInput, hasGapPlaceholders, isStructuredNoteQuestion } from "./GapFillingQuestionInput";
import { Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";

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

function getDisplayNumberForQuestion(
  miniTest: PracticeTestStepContent["miniTest"],
  question: GroupTestQuestionForStudent
): number {
  const groups = miniTest.questionGroups;
  if (groups?.length) {
    for (const group of groups) {
      const idx = group.questions.findIndex((q) => q._id === question._id);
      if (idx >= 0) return group.startQuestionNumber + idx;
    }
  }
  return question.questionNumber ?? 1;
}

function QuestionInput({
  question,
  displayNumber,
  value,
  onChange,
  disabled,
}: {
  question: GroupTestQuestionForStudent;
  displayNumber: number;
  value: string | string[];
  onChange: (v: string | string[]) => void;
  disabled?: boolean;
}) {
  const qBody = question.questionBody;
  const rawText = extractQuestionText(qBody);
  const text = rawText.trim() || `Question ${displayNumber}`;

  if (question.blanks?.length && (isStructuredNoteQuestion(question) || hasGapPlaceholders(rawText) || question.blanks.length > 1)) {
    return (
      <GapFillingQuestionInput
        question={question}
        displayNumber={displayNumber}
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputClassName="min-w-[100px] max-w-[180px] inline-flex rounded border border-gray-300 bg-white px-2 py-1.5 text-sm align-baseline dark:border-gray-600 dark:bg-gray-800"
      />
    );
  }

  if (question.blanks?.length) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Q{displayNumber}. {text}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={Array.isArray(value) ? value[0] ?? "" : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.blanks[0]?.options?.length ? `Choose: ${question.blanks[0].options.join(", ")}` : "Answer"}
            disabled={disabled}
            className="max-w-md"
          />
        </div>
      </div>
    );
  }

  if (question.options?.length) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Q{displayNumber}. {text}</Label>
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
        Q{displayNumber}. {text}
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

export interface PracticeTestStepCardProps {
  levelId: string;
  stepId: string;
  content: PracticeTestStepContent;
  onComplete: (stepId: string) => void;
  onProgressUpdate: (progress: SubmitPracticeTestResponse["progress"]) => void;
}

const BAND_OPTIONS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export function PracticeTestStepCard({
  levelId,
  stepId,
  content,
  onComplete,
  onProgressUpdate,
}: PracticeTestStepCardProps) {
  const { title, timeLimitMinutes, passType, passValue, miniTest } = content;
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [targetBandScore, setTargetBandScore] = useState<number>(6);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{ passed: boolean; scorePercent: number; bandScore: number } | null>(null);
  const isBandPass = passType === "BAND";

  const setAnswer = useCallback((qId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const answerList = Object.entries(answers).map(([questionId, val]) => {
      if (Array.isArray(val)) {
        return { questionId, studentAnswers: val.map((s) => String(s).trim()) };
      }
      return { questionId, studentAnswer: String(val).trim() };
    });
    if (answerList.length === 0) return;
    if (isBandPass && (targetBandScore < 0 || targetBandScore > 9)) return;
    setSubmitting(true);
    setLastResult(null);
    try {
      const result = await submitPracticeTest(levelId, stepId, {
        answers: answerList,
        ...(isBandPass && { targetBandScore }),
      });
      setLastResult({
        passed: result.passed,
        scorePercent: result.scorePercent,
        bandScore: result.bandScore,
      });
      onProgressUpdate(result.progress);
      if (result.passed) {
        onComplete(stepId);
      }
    } catch {
      setLastResult({ passed: false, scorePercent: 0, bandScore: 0 });
    } finally {
      setSubmitting(false);
    }
  };

  const passLabel = isBandPass
    ? "reach your target band (choose below)"
    : `≥ ${passValue}%`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {timeLimitMinutes} min
        </span>
        <span>Pass: {passLabel}</span>
      </div>
      {isBandPass && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
          <Label className="text-sm font-medium">Your target band score</Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">
            You need to score at least this band to pass. Choose the band you are aiming for.
          </p>
          <select
            value={targetBandScore}
            onChange={(e) => setTargetBandScore(Number(e.target.value))}
            disabled={submitting}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[6rem]"
          >
            {BAND_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}
      {lastResult && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 ${
            lastResult.passed
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
              : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
          }`}
        >
          {lastResult.passed ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
          )}
          <div>
            <p className={`font-medium ${lastResult.passed ? "text-emerald-800 dark:text-emerald-200" : "text-amber-800 dark:text-amber-200"}`}>
              {lastResult.passed ? "Passed! You can proceed to the next step." : "Not yet. Try again."}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Score: {lastResult.scorePercent}% · Band: {lastResult.bandScore}
            </p>
          </div>
        </div>
      )}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <span className="font-medium">{title}</span>
          {miniTest.passage?.title && (
            <span className="text-muted-foreground ml-2">— {miniTest.passage.title}</span>
          )}
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderPassageContent(miniTest.passage?.content)}
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">
              Questions {miniTest.questions?.length > 0 && `(${miniTest.questions.length})`}
            </h4>
            {(miniTest.questions ?? []).map((q) => (
              <QuestionInput
                key={q._id}
                question={q}
                displayNumber={getDisplayNumberForQuestion(miniTest, q)}
                value={answers[q._id] ?? (q.blanks?.length ? (q.blanks.length > 1 ? [] : "") : "")}
                onChange={(v) => setAnswer(q._id, v)}
                disabled={submitting}
              />
            ))}
          </div>
          <Button type="submit" disabled={submitting || (miniTest.questions?.length ?? 0) === 0}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              lastResult?.passed ? "Completed" : "Submit practice test"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
