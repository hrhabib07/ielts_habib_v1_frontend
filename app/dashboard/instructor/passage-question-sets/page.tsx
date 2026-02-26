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
import { ArrowLeft, Plus, Loader2, Pencil } from "lucide-react";

export default function PassageQuestionSetsPage() {
  const [sets, setSets] = useState<PassageQuestionSet[]>([]);
  const [passages, setPassages] = useState<Awaited<ReturnType<typeof getMyPassages>>>([]);
  const [questionSets, setQuestionSets] = useState<Awaited<ReturnType<typeof getMyQuestionSets>>>([]);
  const [codes, setCodes] = useState<Awaited<ReturnType<typeof listPassageCodes>>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePassageQuestionSetPayload>({
    passageId: "",
    passageCode: "",
    passageNumber: 1,
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

  const resetForm = () => {
    setForm({
      passageId: passages[0]?._id ?? "",
      passageCode: codes[0]?._id ?? "",
      passageNumber: 1,
      difficulty: "MEDIUM",
      questionGroupIds: [],
      expectedTotalQuestions: 5,
      recommendedTime: 20,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.passageId || !form.passageCode || form.questionGroupIds.length === 0)
      return;
    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await updatePassageQuestionSet(editingId, form);
        setSets((prev) =>
          prev.map((s) => (s._id === editingId ? updated : s)),
        );
        resetForm();
      } else {
        const created = await createPassageQuestionSet(form);
        setSets((prev) => [created, ...prev]);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGroup = (id: string) => {
    setForm((f) => ({
      ...f,
      questionGroupIds: f.questionGroupIds.includes(id)
        ? f.questionGroupIds.filter((x) => x !== id)
        : [...f.questionGroupIds, id],
    }));
  };

  const groupsForPassage = (passageId: string) =>
    questionSets.filter((s) => {
      const pid =
        typeof s.passageId === "object"
          ? (s.passageId as { _id: string })._id
          : s.passageId;
      return pid === passageId;
    });

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
      difficulty: s.difficulty,
      questionGroupIds: ids,
      expectedTotalQuestions: s.expectedTotalQuestions,
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

          <div>
            <Label>Expected total questions</Label>
            <Input
              type="number"
              min={1}
              value={form.expectedTotalQuestions}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  expectedTotalQuestions: parseInt(e.target.value, 10) || 5,
                }))
              }
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
                    {passageTitle(
                      typeof s.passageId === "object"
                        ? (s.passageId as { _id: string })._id
                        : s.passageId,
                    )} · P{s.passageNumber} · {codeLabel(
                      typeof s.passageCode === "object"
                        ? (s.passageCode as { _id: string })._id
                        : s.passageCode,
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.expectedTotalQuestions} questions · {s.recommendedTime} min
                    · {s.difficulty}
                    {s.isPublished && " · Published"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => startEdit(s)}>
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
