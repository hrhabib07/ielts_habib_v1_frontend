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
  type Passage,
  type QuestionSet,
} from "@/src/lib/api/instructor";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Eye,
  Save,
  AlertCircle,
} from "lucide-react";
import MetaFormFields from "@/src/components/instructor/MetaFormFields";
import QuestionSetPreviewModal from "@/src/components/shared/QuestionSetPreviewModal";
import {
  QUESTION_TYPE_CONFIG,
  QUESTION_TYPE_KEYS,
} from "@/src/lib/questionTypeConfig";

/* ─────────────────────────────────── helpers ──── */

function getPassageId(s: QuestionSet): string {
  return typeof s.passageId === "object"
    ? (s.passageId as { _id: string })._id
    : s.passageId;
}

function nextOrderForPassage(sets: QuestionSet[], passageId: string): number {
  const max = sets
    .filter((s) => getPassageId(s) === passageId)
    .reduce((m, s) => Math.max(m, s.order), 0);
  return max + 1;
}

function makeDefaultForm(
  passages: Passage[],
  sets: QuestionSet[],
): CreateQuestionSetPayload {
  const firstId = passages[0]?._id ?? "";
  const type: CreateQuestionSetPayload["questionType"] = "MCQ_SINGLE";
  const cfg = QUESTION_TYPE_CONFIG[type];
  return {
    passageId: firstId,
    passageNumber: 1,
    order: firstId ? nextOrderForPassage(sets, firstId) : 1,
    instruction: cfg.defaultInstruction,
    startQuestionNumber: 1,
    endQuestionNumber: 5,
    questionType: type,
    meta: cfg.defaultMeta,
  };
}

/* ─────────────────────────────────── page ──── */

export default function QuestionSetsPage() {
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<CreateQuestionSetPayload>(() =>
    makeDefaultForm([], []),
  );

  // Preview state: (passage + questionSet)
  const [preview, setPreview] = useState<{
    passage: Passage;
    questionSet: QuestionSet;
  } | null>(null);

  useEffect(() => {
    Promise.all([getMyQuestionSets(), getMyPassages()])
      .then(([s, p]) => {
        setSets(s);
        setPassages(p);
        setForm(makeDefaultForm(p, s));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── when passage changes, auto-suggest order ── */
  const handlePassageChange = (passageId: string) => {
    setForm((f) => ({
      ...f,
      passageId,
      order: nextOrderForPassage(sets, passageId),
    }));
  };

  /* ── when question type changes → reset instruction + meta ── */
  const handleTypeChange = (t: CreateQuestionSetPayload["questionType"]) => {
    const cfg = QUESTION_TYPE_CONFIG[t];
    setForm((f) => ({
      ...f,
      questionType: t,
      instruction: cfg.defaultInstruction,
      meta: cfg.defaultMeta,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setSubmitError(null);
    setForm(makeDefaultForm(passages, sets));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.passageId) return;
    setSubmitError(null);
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
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "An unexpected error occurred. Please try again.";
      setSubmitError(msg);
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
    setSubmitError(null);
    setForm({
      passageId: getPassageId(s),
      passageNumber: s.passageNumber as 1 | 2 | 3,
      order: s.order,
      instruction: s.instruction,
      startQuestionNumber: s.startQuestionNumber,
      endQuestionNumber: s.endQuestionNumber,
      questionType: s.questionType,
      meta:
        s.meta ??
        QUESTION_TYPE_CONFIG[
          s.questionType as CreateQuestionSetPayload["questionType"]
        ]?.defaultMeta ??
        {},
    });
    setEditingId(s._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPreview = (s: QuestionSet) => {
    const pid = getPassageId(s);
    const passage = passages.find((p) => p._id === pid);
    if (!passage) return;
    setPreview({ passage, questionSet: s });
  };

  const passageTitle = (pid: string) =>
    passages.find((p) => p._id === pid)?.title ?? pid;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* ── page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Question sets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage question groups. Each group belongs to a passage and has a type, instruction and meta.
          </p>
        </div>
        <Link href="/dashboard/instructor">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* ── create / edit form ── */}
      <Card className="p-6">
        <h2 className="mb-5 text-lg font-semibold">
          {editingId ? "Edit question set" : "Create question set"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* passage */}
          <div>
            <Label htmlFor="passageId">Passage</Label>
            <select
              id="passageId"
              value={form.passageId}
              onChange={(e) => handlePassageChange(e.target.value)}
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

          {/* passage number + order */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Passage number</Label>
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
              <Label>
                Order
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  (must be unique within passage)
                </span>
              </Label>
              <Input
                type="number"
                min={1}
                value={form.order}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    order: parseInt(e.target.value, 10) || 1,
                  }))
                }
                className="mt-1"
              />
              {form.passageId && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Suggested next order:{" "}
                  <button
                    type="button"
                    className="font-semibold underline decoration-dotted"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        order: nextOrderForPassage(sets, f.passageId),
                      }))
                    }
                  >
                    {nextOrderForPassage(
                      sets.filter((s) => s._id !== editingId),
                      form.passageId,
                    )}
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* question type */}
          <div>
            <Label>Question type</Label>
            <select
              value={form.questionType}
              onChange={(e) =>
                handleTypeChange(
                  e.target.value as CreateQuestionSetPayload["questionType"],
                )
              }
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              {QUESTION_TYPE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {QUESTION_TYPE_CONFIG[key].label}
                </option>
              ))}
            </select>
          </div>

          {/* instruction (editable, auto-filled) */}
          <div>
            <Label>
              Instruction
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (auto-filled from type — override if needed)
              </span>
            </Label>
            <textarea
              value={form.instruction}
              onChange={(e) =>
                setForm((f) => ({ ...f, instruction: e.target.value }))
              }
              rows={2}
              placeholder="e.g. Choose the correct letter, A, B, C or D."
              required
              className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            />
          </div>

          {/* question range */}
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
                className="mt-1"
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
                className="mt-1"
              />
            </div>
          </div>

          {/* meta fields (structured, per-type) */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-3 text-sm font-medium">
              Meta fields
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                – specific to{" "}
                {QUESTION_TYPE_CONFIG[form.questionType]?.label ?? form.questionType}
              </span>
            </p>
            <MetaFormFields
              questionType={form.questionType}
              meta={form.meta ?? {}}
              onChange={(meta) => setForm((f) => ({ ...f, meta }))}
            />
          </div>

          {/* error banner */}
          {submitError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* actions */}
          <div className="flex gap-2 border-t pt-4">
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingId ? (
                <Save className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingId ? "Save changes" : "Create question set"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* ── list of question sets ── */}
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
            {sets.map((s) => {
              const pid = getPassageId(s);
              const canPreview = passages.some((p) => p._id === pid);
              return (
                <li
                  key={s._id}
                  className="flex items-start justify-between gap-4 px-4 py-3 hover:bg-muted/20"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.instruction}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {passageTitle(pid)} · P{s.passageNumber} · Order{" "}
                      {s.order} · Q{s.startQuestionNumber}–
                      {s.endQuestionNumber} ·{" "}
                      {QUESTION_TYPE_CONFIG[
                        s.questionType as CreateQuestionSetPayload["questionType"]
                      ]?.label ?? s.questionType}
                      {s.isPublished && " · Published"}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openPreview(s)}
                      disabled={!canPreview}
                      title={
                        canPreview
                          ? "Preview with passage"
                          : "Passage data not loaded"
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(s)}
                      title="Edit question set"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(s._id)}
                      title="Delete question set"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* ── preview modal ── */}
      {preview && (
        <QuestionSetPreviewModal
          passage={preview.passage}
          questionSet={preview.questionSet}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
