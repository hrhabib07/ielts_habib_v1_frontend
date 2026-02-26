"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createQuestion,
  getMyQuestions,
  getMyPassages,
  getMyQuestionSets,
  getActiveWeaknessTags,
  updateQuestion,
  type CreateQuestionPayload,
  type Question,
  type WeaknessTag,
  type QuestionSet,
} from "@/src/lib/api/instructor";
import { QUESTION_TYPE_CONFIG } from "@/src/lib/questionTypeConfig";
import { ArrowLeft, Plus, Loader2, Pencil, Eye, X, ChevronDown } from "lucide-react";
import QuestionPreviewModal from "@/src/components/shared/QuestionPreviewModal";

/* ─── Weakness tag chip multi-select ─────────────────────────────────────── */

function WeaknessTagPicker({
  allTags,
  selectedIds,
  onChange,
}: {
  allTags: WeaknessTag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  };

  const selectedTags = allTags.filter((t) => selectedIds.includes(t._id));

  return (
    <div className="space-y-2">
      {/* Selected chips */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((t) => (
            <span
              key={t._id}
              className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700"
            >
              {t.name}
              <button
                type="button"
                onClick={() => toggle(t._id)}
                className="ml-0.5 rounded-full text-stone-400 hover:text-stone-700 focus:outline-none"
                aria-label={`Remove ${t.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm hover:bg-muted/30 focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <span className="text-muted-foreground">
            {selectedIds.length === 0
              ? "Select weakness / trap tags…"
              : `${selectedIds.length} tag${selectedIds.length > 1 ? "s" : ""} selected`}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-lg">
            {allTags.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No active tags available.
              </p>
            ) : (
              allTags.map((t) => {
                const selected = selectedIds.includes(t._id);
                return (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => toggle(t._id)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50 ${
                      selected ? "bg-muted/40" : ""
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 flex-shrink-0 rounded-sm border ${
                        selected
                          ? "border-primary bg-primary"
                          : "border-input bg-transparent"
                      }`}
                    />
                    <span className="font-medium text-foreground">{t.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {t.category}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [passages, setPassages] = useState<Awaited<ReturnType<typeof getMyPassages>>>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [weaknessTags, setWeaknessTags] = useState<WeaknessTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const [form, setForm] = useState<CreateQuestionPayload>({
    passageId: "",
    questionSetId: "",
    questionNumber: 1,
    questionBody: { layout: "TEXT", content: "" },
    options: [],
    correctAnswer: "",
    weaknessTags: [],
    explanation: "",
    difficulty: "MEDIUM",
  });

  useEffect(() => {
    Promise.all([
      getMyQuestions(),
      getMyPassages(),
      getMyQuestionSets(),
      getActiveWeaknessTags(),
    ])
      .then(([q, p, s, tags]) => {
        setQuestions(q);
        setPassages(p);
        setQuestionSets(s);
        setWeaknessTags(tags);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({
      passageId: passages[0]?._id ?? "",
      questionSetId: "",
      questionNumber: 1,
      questionBody: { layout: "TEXT", content: "" },
      options: [],
      correctAnswer: "",
      weaknessTags: [],
      explanation: "",
      difficulty: "MEDIUM",
    });
    setEditingId(null);
  };

  /* Derived: passage options (deduped from question sets) */
  const passageOptions = questionSets.length
    ? questionSets
        .map((s) => {
          const pid =
            typeof s.passageId === "object"
              ? (s.passageId as { _id: string })._id
              : s.passageId;
          const p = passages.find((x) => x._id === pid);
          return { id: pid, title: p?.title ?? pid };
        })
        .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
    : [];

  const setsForPassage = (passageId: string) =>
    questionSets.filter((s) => {
      const pid =
        typeof s.passageId === "object"
          ? (s.passageId as { _id: string })._id
          : s.passageId;
      return pid === passageId;
    });

  /* Type derived from the selected question set — read-only, never sent to API */
  const derivedType =
    questionSets.find((s) => s._id === form.questionSetId)?.questionType ?? null;

  const derivedTypeLabel = derivedType
    ? (QUESTION_TYPE_CONFIG[derivedType as keyof typeof QUESTION_TYPE_CONFIG]?.label ??
      derivedType)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.passageId || !form.questionSetId) return;
    if (!(form.explanation ?? "").trim() || (form.explanation ?? "").trim().length < 5)
      return;
    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await updateQuestion(editingId, form);
        setQuestions((prev) =>
          prev.map((q) => (q._id === editingId ? updated : q)),
        );
        resetForm();
      } else {
        const created = await createQuestion(form);
        setQuestions((prev) => [created, ...prev]);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (q: Question) => {
    const passageId =
      typeof q.passageId === "object"
        ? (q.passageId as { _id: string })._id
        : q.passageId;
    const questionSetId =
      typeof q.questionSetId === "object"
        ? (q.questionSetId as { _id: string })._id
        : q.questionSetId;
    const tagIds = Array.isArray(q.weaknessTags)
      ? q.weaknessTags.map((t) =>
          typeof t === "object" && t && "_id" in t ? t._id : String(t),
        )
      : [];
    setForm({
      passageId,
      questionSetId,
      questionNumber: q.questionNumber,
      questionBody: q.questionBody,
      blanks: q.blanks,
      options: q.options,
      correctAnswer: q.correctAnswer,
      weaknessTags: tagIds,
      explanation: q.explanation ?? "",
      difficulty: q.difficulty,
    });
    setEditingId(q._id);
  };

  /* Preview helpers */
  const passageForQuestion = (q: Question) => {
    const pid =
      typeof q.passageId === "object"
        ? (q.passageId as { _id: string })._id
        : q.passageId;
    return passages.find((p) => p._id === pid) ?? null;
  };

  const questionSetForQuestion = (q: Question) => {
    const sid =
      typeof q.questionSetId === "object"
        ? (q.questionSetId as { _id: string })._id
        : q.questionSetId;
    return questionSets.find((s) => s._id === sid) ?? null;
  };

  const passageTitle = (id: string) =>
    passages.find((p) => p._id === id)?.title ?? id;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create questions for question sets. Type is auto-derived from the selected question set.
          </p>
        </div>
        <Link href="/dashboard/instructor">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? "Edit question" : "Create question"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Passage + Question Set */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Passage</Label>
              <select
                value={form.passageId}
                onChange={(e) => {
                  const pid = e.target.value;
                  const sets = setsForPassage(pid);
                  setForm((f) => ({
                    ...f,
                    passageId: pid,
                    questionSetId: sets[0]?._id ?? "",
                  }));
                }}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                required
              >
                <option value="">Select passage…</option>
                {passageOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Question set</Label>
              <select
                value={form.questionSetId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, questionSetId: e.target.value }))
                }
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                required
              >
                <option value="">Select question set…</option>
                {setsForPassage(form.passageId).map((s) => (
                  <option key={s._id} value={s._id}>
                    Q{s.startQuestionNumber}–{s.endQuestionNumber}:{" "}
                    {s.instruction.slice(0, 40)}…
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Derived type badge */}
          {derivedTypeLabel && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Question type (from set):
              </span>
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
                {derivedTypeLabel}
              </span>
            </div>
          )}

          {/* Question number + difficulty */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Question number</Label>
              <Input
                type="number"
                min={1}
                value={form.questionNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    questionNumber: parseInt(e.target.value, 10) || 1,
                  }))
                }
              />
            </div>
            <div>
              <Label>Difficulty</Label>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    difficulty: e.target.value as CreateQuestionPayload["difficulty"],
                  }))
                }
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
          </div>

          {/* Question body */}
          <div>
            <Label>Question body (text content)</Label>
            <textarea
              value={
                typeof form.questionBody.content === "string"
                  ? form.questionBody.content
                  : JSON.stringify(form.questionBody.content)
              }
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  questionBody: { layout: "TEXT", content: e.target.value },
                }))
              }
              rows={4}
              spellCheck={false}
              autoComplete="off"
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Enter the question text…"
              required
            />
          </div>

          {/* Options */}
          <div>
            <Label>Options (comma-separated for MCQ)</Label>
            <Input
              value={
                Array.isArray(form.options)
                  ? form.options.join(", ")
                  : (form.options as string) ?? ""
              }
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  options: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="A, B, C, D"
            />
          </div>

          {/* Correct answer */}
          <div>
            <Label>Correct answer</Label>
            <Input
              value={
                Array.isArray(form.correctAnswer)
                  ? form.correctAnswer.join(", ")
                  : (form.correctAnswer as string) ?? ""
              }
              onChange={(e) => {
                const v = e.target.value.trim();
                setForm((f) => ({
                  ...f,
                  correctAnswer: v.includes(",")
                    ? v.split(",").map((s) => s.trim())
                    : v,
                }));
              }}
              placeholder="A or A, B for multiple"
            />
          </div>

          {/* Weakness tag picker */}
          <div>
            <Label className="mb-1.5 block">Weakness / trap tags</Label>
            <WeaknessTagPicker
              allTags={weaknessTags}
              selectedIds={form.weaknessTags ?? []}
              onChange={(ids) => setForm((f) => ({ ...f, weaknessTags: ids }))}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Linked to analytics when students answer this question incorrectly.
            </p>
          </div>

          {/* Explanation */}
          <div>
            <Label>Explanation (required)</Label>
            <textarea
              value={form.explanation ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, explanation: e.target.value }))
              }
              rows={4}
              spellCheck={false}
              autoComplete="off"
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Detailed explanation for the correct answer (min 5 characters)"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingId ? "Update" : "Create"} question
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Questions list */}
      <Card className="overflow-hidden">
        <h2 className="border-b bg-muted/40 px-4 py-3 font-semibold">
          My questions
        </h2>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading…</div>
        ) : questions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No questions yet. Create one above.
          </div>
        ) : (
          <ul className="divide-y">
            {questions.map((q) => {
              const qPassageId =
                typeof q.passageId === "object"
                  ? (q.passageId as { _id: string })._id
                  : q.passageId;
              const typeLabel =
                QUESTION_TYPE_CONFIG[q.type as keyof typeof QUESTION_TYPE_CONFIG]
                  ?.label ?? q.type;

              return (
                <li
                  key={q._id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/20"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      Q{q.questionNumber}:{" "}
                      {typeof q.questionBody.content === "string"
                        ? q.questionBody.content.slice(0, 60) +
                          (q.questionBody.content.length > 60 ? "…" : "")
                        : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {passageTitle(qPassageId)} · {typeLabel} · {q.difficulty}
                      {q.isPublished && " · Published"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Preview question"
                      onClick={() => setPreviewQuestion(q)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Edit question"
                      onClick={() => startEdit(q)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Question preview modal */}
      {previewQuestion && (() => {
        const p = passageForQuestion(previewQuestion);
        const qs = questionSetForQuestion(previewQuestion);
        if (!p || !qs) return null;
        return (
          <QuestionPreviewModal
            question={previewQuestion}
            passage={p}
            questionSet={qs}
            onClose={() => setPreviewQuestion(null)}
          />
        );
      })()}
    </div>
  );
}
