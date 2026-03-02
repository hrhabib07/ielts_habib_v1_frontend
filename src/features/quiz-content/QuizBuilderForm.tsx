"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuizGroup, QuizQuestion, QuizQuestionType } from "@/src/lib/api/quizContent";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

const QUESTION_TYPES: { value: QuizQuestionType; label: string }[] = [
  { value: "MCQ", label: "Multiple choice (MCQ)" },
  { value: "TFNG", label: "True / False / Not Given" },
  { value: "FILL_BLANK", label: "Fill in the blank" },
  { value: "MATCHING", label: "Matching" },
];

const newQuestion = (order: number): QuizQuestion => ({
  type: "MCQ",
  questionText: "",
  options: ["", ""],
  correctAnswer: "",
  marks: 1,
});

const newGroup = (order: number): QuizGroup => ({
  title: "",
  order,
  questions: [newQuestion(0)],
});

export interface QuizBuilderFormState {
  title: string;
  description: string;
  timeLimit: string;
  groups: QuizGroup[];
}

const defaultState: QuizBuilderFormState = {
  title: "",
  description: "",
  timeLimit: "",
  groups: [newGroup(0)],
};

function normalizeGroups(groups: QuizGroup[]): QuizGroup[] {
  return groups.map((g, i) => ({
    ...g,
    order: i,
    questions: g.questions.map((q, j) => ({ ...q, marks: q.marks || 1 })),
  }));
}

export interface QuizBuilderFormProps {
  initialState?: Partial<QuizBuilderFormState> & { groups?: QuizGroup[] };
  onSubmit: (payload: {
    title: string;
    description?: string;
    timeLimit?: number;
    groups: QuizGroup[];
  }) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function QuizBuilderForm({
  initialState,
  onSubmit,
  submitLabel = "Save",
  isSubmitting = false,
}: QuizBuilderFormProps) {
  const [form, setForm] = useState<QuizBuilderFormState>(() => ({
    ...defaultState,
    ...initialState,
    groups: initialState?.groups?.length
      ? initialState.groups.map((g, i) => ({ ...g, order: i }))
      : defaultState.groups,
  }));

  const [expandedGroup, setExpandedGroup] = useState<number>(0);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const update = (patch: Partial<QuizBuilderFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const addGroup = () => {
    setForm((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup(prev.groups.length)],
    }));
    setExpandedGroup(form.groups.length);
  };

  const removeGroup = (index: number) => {
    if (form.groups.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index),
    }));
    if (expandedGroup >= form.groups.length - 1) setExpandedGroup(Math.max(0, form.groups.length - 2));
  };

  const moveGroup = (index: number, dir: 1 | -1) => {
    const next = index + dir;
    if (next < 0 || next >= form.groups.length) return;
    const arr = [...form.groups];
    [arr[index], arr[next]] = [arr[next], arr[index]];
    setForm((prev) => ({ ...prev, groups: arr.map((g, i) => ({ ...g, order: i })) }));
    setExpandedGroup(next);
  };

  const updateGroup = (index: number, patch: Partial<QuizGroup>) => {
    setForm((prev) => ({
      ...prev,
      groups: prev.groups.map((g, i) => (i === index ? { ...g, ...patch } : g)),
    }));
  };

  const addQuestion = (groupIndex: number) => {
    setForm((prev) => {
      const groups = [...prev.groups];
      const g = groups[groupIndex];
      groups[groupIndex] = {
        ...g,
        questions: [...g.questions, newQuestion(g.questions.length)],
      };
      return { ...prev, groups };
    });
  };

  const removeQuestion = (groupIndex: number, qIndex: number) => {
    setForm((prev) => {
      const groups = [...prev.groups];
      const g = groups[groupIndex];
      if (g.questions.length <= 1) return prev;
      groups[groupIndex] = {
        ...g,
        questions: g.questions.filter((_, i) => i !== qIndex),
      };
      return { ...prev, groups };
    });
  };

  const updateQuestion = (groupIndex: number, qIndex: number, patch: Partial<QuizQuestion>) => {
    setForm((prev) => {
      const groups = prev.groups.map((g, i) => {
        if (i !== groupIndex) return g;
        return {
          ...g,
          questions: g.questions.map((q, j) =>
            j === qIndex ? { ...q, ...patch } : q,
          ),
        };
      });
      return { ...prev, groups };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const groups = normalizeGroups(form.groups);
    const timeLimit = form.timeLimit.trim() ? parseInt(form.timeLimit, 10) : undefined;
    if (Number.isNaN(timeLimit) && form.timeLimit.trim()) return;
    await onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      timeLimit: timeLimit && timeLimit > 0 ? timeLimit : undefined,
      groups,
    });
  };

  const totalMarks = form.groups.reduce(
    (sum, g) => sum + g.questions.reduce((s, q) => s + (q.marks ?? 1), 0),
    0,
  );
  const canSubmit =
    form.title.trim().length > 0 &&
    form.groups.every(
      (g) => g.title.trim().length > 0 && g.questions.length > 0 && g.questions.every((q) => q.questionText.trim().length > 0),
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Quiz title"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Brief description"
              className="mt-1 min-h-[80px]"
              rows={3}
            />
          </div>
          <div className="max-w-[200px]">
            <Label htmlFor="timeLimit">Time limit (minutes, optional)</Label>
            <Input
              id="timeLimit"
              type="number"
              min={0}
              value={form.timeLimit}
              onChange={(e) => update({ timeLimit: e.target.value })}
              placeholder="e.g. 30"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Groups & questions</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addGroup} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add group
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.groups.map((group, gIdx) => (
            <div
              key={gIdx}
              className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-700 dark:bg-stone-900/30"
            >
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveGroup(gIdx, -1)}
                    disabled={gIdx === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveGroup(gIdx, 1)}
                    disabled={gIdx === form.groups.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <GripVertical className="h-4 w-4 text-stone-400" />
                <Input
                  value={group.title}
                  onChange={(e) => updateGroup(gIdx, { title: e.target.value })}
                  placeholder={`Group ${gIdx + 1} title`}
                  className="flex-1 font-medium"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => removeGroup(gIdx)}
                  disabled={form.groups.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedGroup(expandedGroup === gIdx ? -1 : gIdx)}
                >
                  {expandedGroup === gIdx ? "Collapse" : "Expand"}
                </Button>
              </div>

              {expandedGroup === gIdx && (
                <div className="mt-4 space-y-4 pl-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-500">
                      {group.questions.length} question(s)
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addQuestion(gIdx)}
                      className="gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add question
                    </Button>
                  </div>
                  {group.questions.map((q, qIdx) => {
                    const qKey = `g${gIdx}-q${qIdx}`;
                    const isExpanded = expandedQuestion === qKey;
                    return (
                      <div
                        key={qKey}
                        className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900/50"
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 shrink-0 text-stone-400" />
                          <button
                            type="button"
                            className="flex-1 text-left text-sm font-medium text-stone-700 dark:text-stone-300"
                            onClick={() =>
                              setExpandedQuestion(isExpanded ? null : qKey)
                            }
                          >
                            Q{qIdx + 1}: {q.questionText.slice(0, 50) || "New question"}
                            {q.questionText.length > 50 ? "…" : ""}
                          </button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeQuestion(gIdx, qIdx)}
                            disabled={group.questions.length <= 1}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {isExpanded && (
                          <div className="mt-4 space-y-4 border-t border-stone-200 pt-4 dark:border-stone-700">
                            <div>
                              <Label>Type</Label>
                              <Select
                                value={q.type}
                                onValueChange={(v) =>
                                  updateQuestion(gIdx, qIdx, {
                                    type: v as QuizQuestionType,
                                    options: v === "MCQ" ? ["", ""] : undefined,
                                    correctAnswer: v === "MCQ" ? "" : q.correctAnswer,
                                  })
                                }
                              >
                                <SelectTrigger className="mt-1 w-[200px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {QUESTION_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                      {t.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Question text</Label>
                              <Textarea
                                value={q.questionText}
                                onChange={(e) =>
                                  updateQuestion(gIdx, qIdx, {
                                    questionText: e.target.value,
                                  })
                                }
                                placeholder="Enter question"
                                className="mt-1 min-h-[60px]"
                                rows={2}
                              />
                            </div>
                            {q.type === "MCQ" && (
                              <div>
                                <Label>Options (one per line or comma-separated)</Label>
                                <Textarea
                                  value={(q.options ?? []).join("\n")}
                                  onChange={(e) => {
                                    const opts = e.target.value
                                      .split(/[\n,]/)
                                      .map((s) => s.trim())
                                      .filter(Boolean);
                                    updateQuestion(gIdx, qIdx, {
                                      options: opts.length ? opts : ["", ""],
                                    });
                                  }}
                                  placeholder="Option A&#10;Option B&#10;Option C"
                                  className="mt-1 min-h-[80px] font-mono text-sm"
                                  rows={4}
                                />
                                <div className="mt-2">
                                  <Label>Correct answer (exact option text)</Label>
                                  <Input
                                    value={
                                      typeof q.correctAnswer === "string"
                                        ? q.correctAnswer
                                        : (q.correctAnswer as string[])?.[0] ?? ""
                                    }
                                    onChange={(e) =>
                                      updateQuestion(gIdx, qIdx, {
                                        correctAnswer: e.target.value,
                                      })
                                    }
                                    placeholder="e.g. Option A"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                            )}
                            {(q.type === "TFNG" || q.type === "FILL_BLANK") && (
                              <div>
                                <Label>Correct answer</Label>
                                <Input
                                  value={
                                    Array.isArray(q.correctAnswer)
                                      ? q.correctAnswer.join(", ")
                                      : String(q.correctAnswer ?? "")
                                  }
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    updateQuestion(gIdx, qIdx, {
                                      correctAnswer:
                                        q.type === "MATCHING"
                                          ? v.split(",").map((s) => s.trim()).filter(Boolean)
                                          : v,
                                    });
                                  }}
                                  placeholder={
                                    q.type === "TFNG"
                                      ? "True / False / Not Given"
                                      : "Expected answer"
                                  }
                                  className="mt-1"
                                />
                              </div>
                            )}
                            {q.type === "MATCHING" && (
                              <div>
                                <Label>Correct answers (comma-separated pairs or list)</Label>
                                <Input
                                  value={
                                    Array.isArray(q.correctAnswer)
                                      ? q.correctAnswer.join(", ")
                                      : String(q.correctAnswer ?? "")
                                  }
                                  onChange={(e) => {
                                    const v = e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean);
                                    updateQuestion(gIdx, qIdx, { correctAnswer: v });
                                  }}
                                  placeholder="A-1, B-2, C-3"
                                  className="mt-1"
                                />
                              </div>
                            )}
                            <div className="max-w-[120px]">
                              <Label>Marks</Label>
                              <Input
                                type="number"
                                min={0}
                                value={q.marks ?? 1}
                                onChange={(e) =>
                                  updateQuestion(gIdx, qIdx, {
                                    marks: Math.max(0, parseInt(e.target.value, 10) || 0),
                                  })
                                }
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between border-t border-stone-200 pt-6 dark:border-stone-800">
        <p className="text-sm text-stone-500">
          Total marks: <span className="font-medium text-stone-700 dark:text-stone-300">{totalMarks}</span>
        </p>
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
