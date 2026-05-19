"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  IntegratedLessonBlock,
  IntegratedLessonMicroQuizQuestion,
  MicroQuizQuestionType,
} from "@/src/lib/api/adminReadingVersions";
import type { LessonLocale } from "@/src/lib/localizedText";
import {
  emptyLocalizedText,
  mcqOptionLabel,
  normalizeLocalizedText,
  normalizeLocalizedTextArray,
} from "@/src/lib/localizedText";
import { LocalizedInput, LocalizedTextarea } from "./LocalizedField";

interface MicroQuizBlockEditorProps {
  block: IntegratedLessonBlock;
  editLocale: LessonLocale;
  disabled?: boolean;
  onChange: (patch: Partial<IntegratedLessonBlock>) => void;
}

function emptyMcqQuestion(): IntegratedLessonMicroQuizQuestion {
  return {
    type: "MCQ",
    questionText: emptyLocalizedText(),
    options: [
      emptyLocalizedText(),
      emptyLocalizedText(),
      emptyLocalizedText(),
      emptyLocalizedText(),
    ],
    correctAnswer: "B",
    explanation: emptyLocalizedText(),
    marks: 1,
  };
}

function MicroQuizQuestionRow({
  question,
  index,
  editLocale,
  disabled,
  onChange,
  onRemove,
}: {
  question: IntegratedLessonMicroQuizQuestion;
  index: number;
  editLocale: LessonLocale;
  disabled?: boolean;
  onChange: (q: IntegratedLessonMicroQuizQuestion) => void;
  onRemove: () => void;
}) {
  const types: MicroQuizQuestionType[] = ["MCQ", "TFNG", "FILL_BLANK", "MATCHING"];
  const options = normalizeLocalizedTextArray(question.options);
  while (options.length < 4) options.push(emptyLocalizedText());

  const correctLetter =
    typeof question.correctAnswer === "string" &&
    /^[A-D]$/i.test(question.correctAnswer.trim())
      ? question.correctAnswer.trim().toUpperCase()
      : "B";

  return (
    <div className="rounded-md border border-border bg-background p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Question {index + 1}
        </span>
        {!disabled && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>

      <select
        className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
        value={question.type}
        disabled={disabled}
        onChange={(e) =>
          onChange({ ...question, type: e.target.value as MicroQuizQuestionType })
        }
      >
        {types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <LocalizedTextarea
        label="Question"
        value={question.questionText}
        editLocale={editLocale}
        disabled={disabled}
        rows={2}
        onChange={(questionText) => onChange({ ...question, questionText })}
      />

      {(question.type === "MCQ" || question.type === "MATCHING") &&
        options.slice(0, 4).map((opt, oi) => (
          <LocalizedInput
            key={oi}
            label={`Option ${mcqOptionLabel(oi)}`}
            value={opt}
            editLocale={editLocale}
            disabled={disabled}
            placeholder={`Answer choice ${mcqOptionLabel(oi)}`}
            onChange={(next) => {
              const nextOptions = [...options];
              nextOptions[oi] = next;
              onChange({ ...question, options: nextOptions });
            }}
          />
        ))}

      {question.type === "MCQ" && (
        <div>
          <Label className="text-xs">Correct answer</Label>
          <select
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
            value={correctLetter}
            disabled={disabled}
            onChange={(e) => onChange({ ...question, correctAnswer: e.target.value })}
          >
            {["A", "B", "C", "D"].map((letter) => (
              <option key={letter} value={letter}>
                {letter}
              </option>
            ))}
          </select>
        </div>
      )}

      {question.type === "TFNG" && (
        <div>
          <Label className="text-xs">Correct answer</Label>
          <select
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
            value={String(question.correctAnswer)}
            disabled={disabled}
            onChange={(e) => onChange({ ...question, correctAnswer: e.target.value })}
          >
            {["TRUE", "FALSE", "NOT GIVEN"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      )}

      {question.type === "FILL_BLANK" && (
        <LocalizedInput
          label="Correct answer (exact)"
          value={
            typeof question.correctAnswer === "string"
              ? { en: question.correctAnswer, bn: question.correctAnswer }
              : emptyLocalizedText()
          }
          editLocale={editLocale}
          disabled={disabled}
          onChange={(localized) =>
            onChange({
              ...question,
              correctAnswer: editLocale === "bn" ? localized.bn : localized.en,
            })
          }
        />
      )}

      <LocalizedTextarea
        label="Explanation (shown after wrong attempt)"
        value={question.explanation}
        editLocale={editLocale}
        disabled={disabled}
        rows={2}
        onChange={(explanation) => onChange({ ...question, explanation })}
      />
    </div>
  );
}

export function MicroQuizBlockEditor({
  block,
  editLocale,
  disabled,
  onChange,
}: MicroQuizBlockEditorProps) {
  const questions = block.questions ?? [];

  return (
    <div className="space-y-3">
      <LocalizedInput
        label="Micro-quiz title"
        value={block.quizTitle ?? normalizeLocalizedText("Micro Quiz")}
        editLocale={editLocale}
        disabled={disabled}
        onChange={(quizTitle) => onChange({ quizTitle })}
      />

      {questions.map((q, qi) => (
        <MicroQuizQuestionRow
          key={qi}
          question={q}
          index={qi}
          editLocale={editLocale}
          disabled={disabled}
          onChange={(updated) => {
            const qs = [...questions];
            qs[qi] = updated;
            onChange({ questions: qs });
          }}
          onRemove={() => {
            onChange({ questions: questions.filter((_, i) => i !== qi) });
          }}
        />
      ))}

      {!disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange({ questions: [...questions, emptyMcqQuestion()] })}
        >
          Add MCQ question
        </Button>
      )}
    </div>
  );
}
