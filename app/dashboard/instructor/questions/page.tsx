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
  updateQuestion,
  type CreateQuestionPayload,
  type Question,
} from "@/src/lib/api/instructor";
import { ArrowLeft, Plus, Loader2, Pencil } from "lucide-react";

const QUESTION_TYPES: { value: CreateQuestionPayload["type"]; label: string }[] = [
  { value: "MCQ_SINGLE", label: "MCQ Single" },
  { value: "MCQ_MULTIPLE", label: "MCQ Multiple" },
  { value: "TRUE_FALSE_NOT_GIVEN", label: "True/False/Not Given" },
  { value: "YES_NO_NOT_GIVEN", label: "Yes/No/Not Given" },
  { value: "MATCHING_HEADINGS", label: "Matching Headings" },
  { value: "MATCHING_INFORMATION", label: "Matching Information" },
  { value: "MATCHING_FEATURES", label: "Matching Features" },
  { value: "MATCHING_SENTENCE_ENDINGS", label: "Matching Sentence Endings" },
  { value: "SENTENCE_COMPLETION", label: "Sentence Completion" },
  { value: "SUMMARY_COMPLETION", label: "Summary Completion" },
  { value: "NOTE_COMPLETION", label: "Note Completion" },
  { value: "TABLE_COMPLETION", label: "Table Completion" },
  { value: "FLOW_CHART_COMPLETION", label: "Flow Chart Completion" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "DIAGRAM_LABEL_COMPLETION", label: "Diagram Label" },
];

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [passages, setPassages] = useState<Awaited<ReturnType<typeof getMyPassages>>>([]);
  const [questionSets, setQuestionSets] = useState<Awaited<ReturnType<typeof getMyQuestionSets>>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateQuestionPayload>({
    passageId: "",
    questionSetId: "",
    questionNumber: 1,
    type: "MCQ_SINGLE",
    questionBody: { layout: "TEXT", content: "" },
    options: ["A", "B", "C", "D"],
    correctAnswer: "A",
    difficulty: "MEDIUM",
  });

  useEffect(() => {
    Promise.all([getMyQuestions(), getMyPassages(), getMyQuestionSets()])
      .then(([q, p, s]) => {
        setQuestions(q);
        setPassages(p);
        setQuestionSets(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({
      passageId: passages[0]?._id ?? "",
      questionSetId: questionSets[0]?._id ?? "",
      questionNumber: 1,
      type: "MCQ_SINGLE",
      questionBody: { layout: "TEXT", content: "" },
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      difficulty: "MEDIUM",
    });
    setEditingId(null);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.passageId || !form.questionSetId) return;
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
    setForm({
      passageId,
      questionSetId,
      questionNumber: q.questionNumber,
      type: q.type,
      questionBody: q.questionBody,
      blanks: q.blanks,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
    });
    setEditingId(q._id);
  };

  const passageTitle = (id: string) =>
    passages.find((p) => p._id === id)?.title ?? id;
  const setInstruction = (id: string) =>
    questionSets.find((s) => s._id === id)?.instruction ?? id;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create questions for question sets. Requires passages and question sets.
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
                    Q{s.startQuestionNumber}–{s.endQuestionNumber}: {s.instruction.slice(0, 40)}…
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
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
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as CreateQuestionPayload["type"],
                  }))
                }
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    difficulty: e.target
                      .value as CreateQuestionPayload["difficulty"],
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
                  questionBody: {
                    layout: "TEXT",
                    content: e.target.value,
                  },
                }))
              }
              rows={4}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Enter the question text…"
              required
            />
          </div>

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
              required
            />
          </div>

          <div>
            <Label>Explanation (optional)</Label>
            <textarea
              value={form.explanation ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, explanation: e.target.value || undefined }))
              }
              rows={2}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Optional explanation for the answer"
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

      <Card className="overflow-hidden">
        <h2 className="border-b bg-muted/40 px-4 py-3 font-semibold">
          My questions
        </h2>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading…
          </div>
        ) : questions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No questions yet. Create one above.
          </div>
        ) : (
          <ul className="divide-y">
            {questions.map((q) => (
              <li
                key={q._id}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/20"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    Q{q.questionNumber}:{" "}
                    {typeof q.questionBody.content === "string"
                      ? q.questionBody.content.slice(0, 60) + (q.questionBody.content.length > 60 ? "…" : "")
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {passageTitle(
                      typeof q.passageId === "object"
                        ? (q.passageId as { _id: string })._id
                        : q.passageId,
                    )} · {q.type} · {q.difficulty}
                    {q.isPublished && " · Published"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => startEdit(q)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
