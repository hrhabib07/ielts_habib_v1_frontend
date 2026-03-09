"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPassageQuestionSet,
  getMyPassageQuestionSets,
  getMyPassages,
  getMyQuestionSets,
  listPassageCodes,
  updatePassageQuestionSet,
  type CreatePassageQuestionSetPayload,
  type PassageQuestionSet,
} from "@/src/lib/api/instructor";
import { ArrowLeft, Plus, Loader2, Pencil, Eye } from "lucide-react";
import PassageQuestionSetPreviewModal from "@/src/components/shared/PassageQuestionSetPreviewModal";

export default function PassageQuestionSetsPage() {
  const [sets, setSets] = useState<PassageQuestionSet[]>([]);
  const [passages, setPassages] = useState<Awaited<ReturnType<typeof getMyPassages>>>([]);
  const [questionSets, setQuestionSets] = useState<Awaited<ReturnType<typeof getMyQuestionSets>>>([]);
  const [codes, setCodes] = useState<Awaited<ReturnType<typeof listPassageCodes>>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewSet, setPreviewSet] = useState<PassageQuestionSet | null>(null);
  const [form, setForm] = useState<CreatePassageQuestionSetPayload>({
    passageId: "",
    passageCode: "",
    passageNumber: 1,
    title: "",
    hasParagraphIndexing: false,
    difficulty: "MEDIUM",
    questionGroupIds: [],
    expectedTotalQuestions: 5,
    recommendedTime: 20,
  });

  useEffect(() => {
    Promise.all([
      getMyPassageQuestionSets(),
      getMyPassages(),
      getMyQuestionSets(),
      listPassageCodes(),
    ])
      .then(([pqs, p, qs, c]) => {
        setSets(pqs);
        setPassages(p);
        setQuestionSets(qs);
        setCodes(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!previewSet || passages.length === 0) return;
    const pid =
      typeof previewSet.passageId === "object"
        ? (previewSet.passageId as { _id: string })._id
        : previewSet.passageId;
    if (!passages.find((p) => p._id === pid)) setPreviewSet(null);
  }, [previewSet, passages]);

  const resetForm = () => {
    setForm({
      passageId: passages[0]?._id ?? "",
      passageCode: codes[0]?._id ?? "",
      passageNumber: 1,
      title: "",
      hasParagraphIndexing: false,
      difficulty: "MEDIUM",
      questionGroupIds: [],
      expectedTotalQuestions: 5,
      recommendedTime: 20,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.passageId || !form.passageCode || form.questionGroupIds.length === 0) {
      setError("Select a passage, passage code, and at least one question group.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await updatePassageQuestionSet(editingId, form);
        setSets((prev) =>
          prev.map((s) => (s._id === editingId ? updated : s)),
        );
        resetForm();
      } else {
        const payload: CreatePassageQuestionSetPayload = {
          ...form,
          expectedTotalQuestions: computedExpectedTotal > 0 ? computedExpectedTotal : form.expectedTotalQuestions,
        };
        const created = await createPassageQuestionSet(payload);
        setSets((prev) => [created, ...prev]);
        resetForm();
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || (err instanceof Error ? err.message : "Failed to save. Check passage, passage code, and that question groups belong to this passage."));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGroup = (id: string) => {
    setForm((f) => ({
      ...f,
      questionGroupIds: (
        f.questionGroupIds.includes(id)
          ? f.questionGroupIds.filter((x) => x !== id)
          : [...f.questionGroupIds, id]
      ).sort((a, b) => {
        const left = questionSets.find((qs) => qs._id === a);
        const right = questionSets.find((qs) => qs._id === b);
        if (!left || !right) return 0;
        if (left.startQuestionNumber !== right.startQuestionNumber) {
          return left.startQuestionNumber - right.startQuestionNumber;
        }
        return left.endQuestionNumber - right.endQuestionNumber;
      }),
    }));
  };

  const groupsForPassage = (passageId: string) =>
    questionSets.filter((s) => {
      const pid =
        typeof s.passageId === "object"
          ? (s.passageId as { _id: string })._id
          : s.passageId;
      return pid === passageId;
    })
      .slice()
      .sort((a, b) => {
        if (a.startQuestionNumber !== b.startQuestionNumber) {
          return a.startQuestionNumber - b.startQuestionNumber;
        }
        return a.endQuestionNumber - b.endQuestionNumber;
      });

  /** Compute total questions from selected groups (start/end range per group). Backend requires this to match. */
  const computedExpectedTotal = (() => {
    const selected = questionSets.filter((qs) => form.questionGroupIds.includes(qs._id));
    return selected.reduce(
      (sum, g) => sum + (g.endQuestionNumber - g.startQuestionNumber + 1),
      0,
    );
  })();

  const startEdit = (s: PassageQuestionSet) => {
    const passageId =
      typeof s.passageId === "object"
        ? (s.passageId as { _id: string })._id
        : s.passageId;
    const passageCodeId =
      typeof s.passageCode === "object"
        ? (s.passageCode as { _id: string })._id
        : s.passageCode;
    const ids = (s.questionGroupIds || []).map((g) =>
      typeof g === "object" ? (g as { _id: string })._id : g,
    );
    setForm({
      passageId,
      passageCode: passageCodeId,
      passageNumber: s.passageNumber as 1 | 2 | 3,
      title: s.title ?? "",
      hasParagraphIndexing: s.hasParagraphIndexing ?? false,
      difficulty: s.difficulty,
      questionGroupIds: ids.slice().sort((a, b) => {
        const left = questionSets.find((qs) => qs._id === a);
        const right = questionSets.find((qs) => qs._id === b);
        if (!left || !right) return 0;
        if (left.startQuestionNumber !== right.startQuestionNumber) {
          return left.startQuestionNumber - right.startQuestionNumber;
        }
        return left.endQuestionNumber - right.endQuestionNumber;
      }),
      expectedTotalQuestions: s.expectedTotalQuestions ?? s.totalQuestions ?? 5,
      recommendedTime: s.recommendedTime,
    });
    setEditingId(s._id);
  };

  const passageTitle = (id: string) =>
    passages.find((p) => p._id === id)?.title ?? id;
  const codeLabel = (id: string) => {
    const c = codes.find((x) => x._id === id);
    return c ? `${c.book}/${c.test}/${c.passage}` : id;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Passage question sets
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Link passages + passage codes + question groups. These become tests for students.
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
          {editingId ? "Edit passage question set" : "Create passage question set"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pqs-title">Title / name</Label>
            <Input
              id="pqs-title"
              placeholder="e.g. Cambridge 18 Test 2 Passage 1"
              value={form.title ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value.trim() }))
              }
              className="mt-1 max-w-md"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              A short name to identify this question set in the dashboard and when building group tests.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Passage</Label>
              <select
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
            </div>
            <div>
              <Label>Passage code</Label>
              <select
                value={form.passageCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, passageCode: e.target.value }))
                }
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                required
              >
                <option value="">Select passage code…</option>
                {codes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.book} / {c.test} / {c.passage}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
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
              <Label>Difficulty</Label>
              <select
                value={form.difficulty}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    difficulty: e.target
                      .value as CreatePassageQuestionSetPayload["difficulty"],
                  }))
                }
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>
            <div>
              <Label>Recommended time (min)</Label>
              <Input
                type="number"
                min={1}
                value={form.recommendedTime}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    recommendedTime: parseInt(e.target.value, 10) || 20,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasParagraphIndexing"
              checked={form.hasParagraphIndexing ?? false}
              onChange={(e) =>
                setForm((f) => ({ ...f, hasParagraphIndexing: e.target.checked }))
              }
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="hasParagraphIndexing" className="font-normal cursor-pointer">
              Has paragraph indexing (A, B, C, D)
            </Label>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Enable only for question types that need paragraph labels (e.g. list of headings, which paragraph contains the following information). Default: No.
          </p>

          <div>
            <Label>
              Expected total questions
              {form.questionGroupIds.length > 0 && (
                <span className="ml-1 font-normal text-muted-foreground">
                  (auto from selected groups: {computedExpectedTotal})
                </span>
              )}
            </Label>
            <Input
              type="number"
              min={1}
              value={form.questionGroupIds.length > 0 ? computedExpectedTotal : form.expectedTotalQuestions}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  expectedTotalQuestions: parseInt(e.target.value, 10) || 5,
                }))
              }
              readOnly={form.questionGroupIds.length > 0}
              className="w-24"
            />
          </div>

          <div>
            <Label>Question groups (select for this set)</Label>
            <p className="mb-2 text-xs text-muted-foreground">
              Select question groups belonging to this passage.
            </p>
            <div className="space-y-2 rounded-md border p-3">
              {groupsForPassage(form.passageId).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No question sets for this passage.{" "}
                  <Link
                    href="/dashboard/instructor/question-sets"
                    className="underline"
                  >
                    Create question sets first
                  </Link>
                </p>
              ) : (
                groupsForPassage(form.passageId).map((qs) => (
                  <label
                    key={qs._id}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={form.questionGroupIds.includes(qs._id)}
                      onChange={() => toggleGroup(qs._id)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      Q{qs.startQuestionNumber}–{qs.endQuestionNumber}:{" "}
                      {qs.instruction.slice(0, 50)}…
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingId ? "Update" : "Create"} passage question set
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
          My passage question sets
        </h2>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading…
          </div>
        ) : sets.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No passage question sets yet. Create one above.
          </div>
        ) : (
          <ul className="divide-y">
            {sets.map((s) => (
              <li
                key={s._id}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/20"
              >
                <div>
                  <p className="font-medium">
                    {s.title?.trim()
                      ? s.title
                      : `${passageTitle(
                          typeof s.passageId === "object"
                            ? (s.passageId as { _id: string })._id
                            : s.passageId,
                        )} · P${s.passageNumber} · ${codeLabel(
                          typeof s.passageCode === "object"
                            ? (s.passageCode as { _id: string })._id
                            : s.passageCode,
                        )}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(s.expectedTotalQuestions ?? s.totalQuestions) ?? 0} questions · {s.recommendedTime} min
                    · {s.difficulty}
                    {s.hasParagraphIndexing && " · A/B/C/D"}
                    {s.isPublished && " · Published"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewSet(s)}
                    title="Preview passage question set"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {previewSet && (() => {
        const passageId =
          typeof previewSet.passageId === "object"
            ? (previewSet.passageId as { _id: string })._id
            : previewSet.passageId;
        const passage = passages.find((p) => p._id === passageId);
        const groupIds = (previewSet.questionGroupIds || []).map((g) =>
          typeof g === "object" ? (g as { _id: string })._id : g,
        );
        const groups = questionSets
          .filter((qs) => groupIds.includes(qs._id))
          .sort((a, b) => {
            if (a.startQuestionNumber !== b.startQuestionNumber) {
              return a.startQuestionNumber - b.startQuestionNumber;
            }
            return a.endQuestionNumber - b.endQuestionNumber;
          });
        if (!passage) return null;
        return (
          <PassageQuestionSetPreviewModal
            passage={passage}
            passageQuestionSet={previewSet}
            questionGroups={groups}
            onClose={() => setPreviewSet(null)}
          />
        );
      })()}
    </div>
  );
}
