"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createQuestionSet,
  getMyPassages,
  getMyQuestionSets,
  updateQuestionSet,
  deleteQuestionSet,
  type CreateQuestionSetPayload,
  type QuestionSet,
} from "@/src/lib/api/instructor";
import { ArrowLeft, Plus, Loader2, Pencil, Trash2 } from "lucide-react";

const QUESTION_TYPES: { value: CreateQuestionSetPayload["questionType"]; label: string }[] = [
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

function getDefaultMeta(type: CreateQuestionSetPayload["questionType"]): CreateQuestionSetPayload["meta"] {
  switch (type) {
    case "MCQ_SINGLE":
    case "MCQ_MULTIPLE":
      return { options: ["A", "B", "C", "D"], selectCount: 1 };
    case "TRUE_FALSE_NOT_GIVEN":
      return { labels: ["TRUE", "FALSE", "NOT GIVEN"] };
    case "YES_NO_NOT_GIVEN":
      return { labels: ["YES", "NO", "NOT GIVEN"] };
    case "MATCHING_HEADINGS":
      return { headings: ["Heading A", "Heading B"], allowReuse: false };
    case "MATCHING_INFORMATION":
      return { paragraphs: ["A", "B", "C"] };
    case "MATCHING_FEATURES":
      return { features: ["Feature A", "Feature B"] };
    case "MATCHING_SENTENCE_ENDINGS":
      return { endings: ["ending A", "ending B"] };
    case "SENTENCE_COMPLETION":
    case "SUMMARY_COMPLETION":
    case "NOTE_COMPLETION":
    case "TABLE_COMPLETION":
    case "FLOW_CHART_COMPLETION":
      return { wordLimit: 2 };
    case "SHORT_ANSWER":
      return { wordLimit: 3 };
    case "DIAGRAM_LABEL_COMPLETION":
      return { labels: ["label1", "label2"] };
    default:
      return { options: ["A", "B"], selectCount: 1 };
  }
}

export default function QuestionSetsPage() {
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [passages, setPassages] = useState<Awaited<ReturnType<typeof getMyPassages>>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateQuestionSetPayload>({
    passageId: "",
    passageNumber: 1,
    order: 1,
    instruction: "Choose the correct letter, A, B, C or D.",
    startQuestionNumber: 1,
    endQuestionNumber: 5,
    questionType: "MCQ_SINGLE",
    meta: { options: ["A", "B", "C", "D"], selectCount: 1 },
  });

  useEffect(() => {
    Promise.all([getMyQuestionSets(), getMyPassages()])
      .then(([s, p]) => {
        setSets(s);
        setPassages(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({
      passageId: passages[0]?._id ?? "",
      passageNumber: 1,
      order: 1,
      instruction: "Choose the correct letter, A, B, C or D.",
      startQuestionNumber: 1,
      endQuestionNumber: 5,
      questionType: "MCQ_SINGLE",
      meta: getDefaultMeta("MCQ_SINGLE"),
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.passageId) return;
    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await updateQuestionSet(editingId, form);
        setSets((prev) =>
          prev.map((s) => (s._id === editingId ? updated : s)),
        );
        resetForm();
      } else {
        const created = await createQuestionSet(form);
        setSets((prev) => [created, ...prev]);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question set?")) return;
    try {
      await deleteQuestionSet(id);
      setSets((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (s: QuestionSet) => {
    const passageId =
      typeof s.passageId === "object"
        ? (s.passageId as { _id: string })._id
        : s.passageId;
    setForm({
      passageId,
      passageNumber: s.passageNumber as 1 | 2 | 3,
      order: s.order,
      instruction: s.instruction,
      startQuestionNumber: s.startQuestionNumber,
      endQuestionNumber: s.endQuestionNumber,
      questionType: s.questionType,
      meta: s.meta ?? getDefaultMeta(s.questionType as CreateQuestionSetPayload["questionType"]),
    });
    setEditingId(s._id);
  };

  const onQuestionTypeChange = (t: CreateQuestionSetPayload["questionType"]) => {
    setForm((f) => ({
      ...f,
      questionType: t,
      meta: getDefaultMeta(t),
    }));
  };

  const passageTitle = (id: string) =>
    passages.find((p) => p._id === id)?.title ?? id;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Question sets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create question groups for passages. Each group has a type and meta.
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
          {editingId ? "Edit question set" : "Create question set"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="passageId">Passage</Label>
            <select
              id="passageId"
              value={form.passageId}
              onChange={(e) =>
                setForm((f) => ({ ...f, passageId: e.target.value }))
              }
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              required
            >
              <option value="">Select passage…</option>
              {passages.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
            {passages.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                <Link href="/dashboard/instructor/passages" className="underline">
                  Create passages first
                </Link>
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Passage number (1, 2, 3)</Label>
              <select
                value={form.passageNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    passageNumber: parseInt(e.target.value, 10) as 1 | 2 | 3,
                  }))
                }
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
            <div>
              <Label>Order</Label>
              <Input
                type="number"
                min={1}
                value={form.order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 1 }))
                }
              />
            </div>
          </div>

          <div>
            <Label>Instruction</Label>
            <Input
              value={form.instruction}
              onChange={(e) =>
                setForm((f) => ({ ...f, instruction: e.target.value }))
              }
              placeholder="e.g. Choose the correct letter"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Start question number</Label>
              <Input
                type="number"
                min={1}
                value={form.startQuestionNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    startQuestionNumber: parseInt(e.target.value, 10) || 1,
                  }))
                }
              />
            </div>
            <div>
              <Label>End question number</Label>
              <Input
                type="number"
                min={1}
                value={form.endQuestionNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    endQuestionNumber: parseInt(e.target.value, 10) || 1,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <Label>Question type</Label>
            <select
              value={form.questionType}
              onChange={(e) =>
                onQuestionTypeChange(
                  e.target.value as CreateQuestionSetPayload["questionType"],
                )
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
            <Label>Meta (JSON)</Label>
            <textarea
              value={JSON.stringify(form.meta ?? {}, null, 2)}
              onChange={(e) => {
                try {
                  setForm((f) => ({
                    ...f,
                    meta: JSON.parse(e.target.value || "{}"),
                  }));
                } catch {}
              }}
              rows={4}
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm"
              placeholder='{"options": ["A","B","C","D"], "selectCount": 1}'
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingId ? "Update" : "Create"} question set
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
          My question sets
        </h2>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading…
          </div>
        ) : sets.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No question sets yet. Create one above.
          </div>
        ) : (
          <ul className="divide-y">
            {sets.map((s) => (
              <li
                key={s._id}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/20"
              >
                <div>
                  <p className="font-medium">{s.instruction}</p>
                  <p className="text-xs text-muted-foreground">
                    {passageTitle(
                      typeof s.passageId === "object"
                        ? (s.passageId as { _id: string })._id
                        : s.passageId,
                    )} · P{s.passageNumber} · Q{s.startQuestionNumber}–{s.endQuestionNumber} · {s.questionType}
                    {s.isPublished && " · Published"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(s._id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
