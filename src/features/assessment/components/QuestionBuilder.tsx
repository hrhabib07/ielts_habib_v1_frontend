"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import type {
  AssessmentQuestion,
  QuestionType,
  McqOption,
} from "@/src/lib/api/assessment";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "mcq", label: "MCQ" },
  { value: "true_false", label: "True / False" },
  { value: "short_answer", label: "Short answer" },
];

export interface QuestionDraft {
  _id?: string;
  type: QuestionType;
  title: string;
  options?: McqOption[];
  correctAnswer: string | boolean;
  marks: number;
  order: number;
  negativeMarks?: number;
}

interface QuestionBuilderProps {
  questions: AssessmentQuestion[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<unknown>;
  onCreate: (payload: Omit<QuestionDraft, "_id" | "order">) => Promise<void>;
  onUpdate: (id: string, payload: Partial<QuestionDraft>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  creating?: boolean;
}

export function QuestionBuilder({
  questions,
  loading,
  error,
  onRefresh,
  onCreate,
  onUpdate,
  onDelete,
  creating = false,
}: QuestionBuilderProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [moveLoading, setMoveLoading] = React.useState<string | null>(null);

  const moveUp = async (q: AssessmentQuestion) => {
    const idx = questions.findIndex((x) => x._id === q._id);
    if (idx <= 0) return;
    const prev = questions[idx - 1];
    setMoveLoading(q._id);
    try {
      await onUpdate(q._id, { order: prev.order });
      await onUpdate(prev._id, { order: q.order });
      await onRefresh();
    } finally {
      setMoveLoading(null);
    }
  };

  const moveDown = async (q: AssessmentQuestion) => {
    const idx = questions.findIndex((x) => x._id === q._id);
    if (idx < 0 || idx >= questions.length - 1) return;
    const next = questions[idx + 1];
    setMoveLoading(q._id);
    try {
      await onUpdate(q._id, { order: next.order });
      await onUpdate(next._id, { order: q.order });
      await onRefresh();
    } finally {
      setMoveLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRefresh}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle>Questions ({questions.length})</CardTitle>
        <Button
          size="sm"
          onClick={() => setExpandedId("new")}
          disabled={creating}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add question
        </Button>
      </div>

      {expandedId === "new" && (
        <QuestionForm
          draft={{
            type: "mcq",
            title: "",
            options: [{ key: "A", text: "" }, { key: "B", text: "" }],
            correctAnswer: "A",
            marks: 1,
            order: questions.length,
            negativeMarks: 0,
          }}
          onSave={async (payload) => {
            await onCreate(payload);
            setExpandedId(null);
            await onRefresh();
          }}
          onCancel={() => setExpandedId(null)}
        />
      )}

      <div className="space-y-2">
        {questions
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((q) => (
            <Card key={q._id}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Q{q.order + 1}. {q.title.slice(0, 50)}
                      {q.title.length > 50 ? "…" : ""}
                    </span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {q.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {q.marks} pt{q.marks !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => moveUp(q)}
                      disabled={questions.findIndex((x) => x._id === q._id) === 0 || moveLoading !== null}
                    >
                      {moveLoading === q._id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ChevronUp className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => moveDown(q)}
                      disabled={
                        questions.findIndex((x) => x._id === q._id) >= questions.length - 1 ||
                        moveLoading !== null
                      }
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        setExpandedId(expandedId === q._id ? null : q._id)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={async () => {
                        if (window.confirm("Delete this question?")) {
                          await onDelete(q._id);
                          await onRefresh();
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedId === q._id && (
                <CardContent className="border-t pt-4">
                  <QuestionForm
                    draft={{
                      type: q.type,
                      title: q.title,
                      options: q.options,
                      correctAnswer: q.correctAnswer,
                      marks: q.marks,
                      order: q.order,
                      negativeMarks: q.negativeMarks,
                    }}
                    onSave={async (payload) => {
                      await onUpdate(q._id, payload);
                      setExpandedId(null);
                      await onRefresh();
                    }}
                    onCancel={() => setExpandedId(null)}
                  />
                </CardContent>
              )}
            </Card>
          ))}
      </div>
    </div>
  );
}

interface QuestionFormProps {
  draft: QuestionDraft;
  onSave: (payload: Omit<QuestionDraft, "_id" | "order">) => Promise<void>;
  onCancel: () => void;
}

function QuestionForm({ draft, onSave, onCancel }: QuestionFormProps) {
  const [type, setType] = React.useState<QuestionType>(draft.type);
  const [title, setTitle] = React.useState(draft.title);
  const [options, setOptions] = React.useState<McqOption[]>(
    draft.options ?? [{ key: "A", text: "" }, { key: "B", text: "" }],
  );
  const [correctAnswer, setCorrectAnswer] = React.useState<string | boolean>(
    draft.correctAnswer,
  );
  const [marks, setMarks] = React.useState(draft.marks);
  const [negativeMarks, setNegativeMarks] = React.useState(draft.negativeMarks ?? 0);
  const [submitting, setSubmitting] = React.useState(false);

  const isMcq = type === "mcq";
  const isTrueFalse = type === "true_false";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave({
        type,
        title,
        options: isMcq ? options : undefined,
        correctAnswer: isTrueFalse ? (correctAnswer as boolean) : correctAnswer,
        marks,
        negativeMarks: negativeMarks || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Type</Label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as QuestionType)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Question text *</Label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          required
        />
      </div>
      {isMcq && (
        <div className="space-y-2">
          <Label>Options</Label>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={opt.key}
                onChange={(e) =>
                  setOptions((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i]!, key: e.target.value };
                    return next;
                  })
                }
                placeholder="Key"
                className="w-16"
              />
              <Input
                value={opt.text}
                onChange={(e) =>
                  setOptions((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i]!, text: e.target.value };
                    return next;
                  })
                }
                placeholder="Option text"
                className="flex-1"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() =>
              setOptions((prev) => [
                ...prev,
                { key: String.fromCharCode(65 + prev.length), text: "" },
              ])
            }
          >
            Add option
          </Button>
        </div>
      )}
      <div className="space-y-2">
        <Label>Correct answer *</Label>
        {isTrueFalse ? (
          <select
            value={String(correctAnswer)}
            onChange={(e) => setCorrectAnswer(e.target.value === "true")}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        ) : isMcq ? (
          <select
            value={String(correctAnswer)}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            {options.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.key}. {opt.text || "(empty)"}
              </option>
            ))}
          </select>
        ) : (
          <Input
            value={String(correctAnswer)}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            required
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Marks *</Label>
          <Input
            type="number"
            min={0}
            value={marks}
            onChange={(e) => setMarks(parseInt(e.target.value, 10) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label>Negative marks</Label>
          <Input
            type="number"
            min={0}
            value={negativeMarks}
            onChange={(e) =>
              setNegativeMarks(parseFloat(e.target.value) || 0)
            }
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
