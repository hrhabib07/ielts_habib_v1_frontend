"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPracticeTest,
  updatePracticeTest,
  deletePracticeTest,
  getPracticeTestPreviewContent,
  type PracticeTest,
  type CreatePracticeTestPayload,
  type UpdatePracticeTestPayload,
  type PracticeTestContentForPreview,
} from "@/src/lib/api/adminReadingVersions";
import { getMyPassageQuestionSets, type PassageQuestionSet } from "@/src/lib/api/instructor";
import { Trash2, Plus, Loader2, X, Check, Pencil, Eye } from "lucide-react";

interface PracticeTestBuilderProps {
  versionId: string;
  practiceTests: PracticeTest[];
  disabled: boolean;
  onPracticeTestsChange: (practiceTests: PracticeTest[]) => void;
}

export function PracticeTestBuilder({
  versionId,
  practiceTests,
  disabled,
  onPracticeTestsChange,
}: PracticeTestBuilderProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<PracticeTestContentForPreview | null>(null);

  const handleCreate = async (payload: CreatePracticeTestPayload) => {
    setError(null);
    try {
      const created = await createPracticeTest(versionId, payload);
      onPracticeTestsChange(
        [...practiceTests, created].sort((a, b) => a.order - b.order),
      );
      setAdding(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create practice test");
    }
  };

  const handleUpdate = async (
    practiceTestId: string,
    payload: UpdatePracticeTestPayload,
  ) => {
    setError(null);
    setBusyId(practiceTestId);
    try {
      const updated = await updatePracticeTest(practiceTestId, payload);
      onPracticeTestsChange(
        practiceTests
          .map((p) => (p._id === practiceTestId ? updated : p))
          .sort((a, b) => a.order - b.order),
      );
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update practice test");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (practiceTestId: string) => {
    setError(null);
    setBusyId(practiceTestId);
    try {
      await deletePracticeTest(practiceTestId);
      onPracticeTestsChange(practiceTests.filter((p) => p._id !== practiceTestId));
      if (previewId === practiceTestId) setPreviewId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete practice test");
    } finally {
      setBusyId(null);
    }
  };

  const loadPreview = async (id: string) => {
    setPreviewId(id);
    setPreviewContent(null);
    try {
      const content = await getPracticeTestPreviewContent(versionId, id);
      setPreviewContent(content);
    } catch {
      setPreviewContent(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Practice tests</CardTitle>
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAdding(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add practice test
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Each practice test = one passage question set (one mini test). Students get unlimited attempts until they reach the pass score. Add a step of type &quot;Practice Test&quot; in the Level Builder and attach a practice test.
        </p>
        {adding && (
          <PracticeTestForm
            nextOrder={
              practiceTests.length > 0
                ? Math.max(...practiceTests.map((p) => p.order)) + 1
                : 1
            }
            onSave={handleCreate}
            onCancel={() => setAdding(false)}
            disabled={disabled}
          />
        )}
        <ul className="space-y-2">
          {(practiceTests ?? [])
            .sort((a, b) => a.order - b.order)
            .map((pt) => (
              <li key={pt._id} className="flex items-center gap-2 rounded-md border p-3">
                {editingId === pt._id ? (
                  <PracticeTestEditForm
                    practiceTest={pt}
                    onSave={(p) => handleUpdate(pt._id, p)}
                    onCancel={() => setEditingId(null)}
                    busy={busyId === pt._id}
                  />
                ) : (
                  <>
                    <span className="text-muted-foreground w-8">#{pt.order}</span>
                    <span className="text-sm flex-1 font-medium">
                      {pt.contentCode ? `[${pt.contentCode}] ` : ""}
                      {pt.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {pt.timeLimitMinutes} min · pass {pt.passType === "PERCENTAGE" ? `${pt.passValue}%` : `band ${pt.passValue}`}
                    </span>
                    {!disabled && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => loadPreview(pt._id)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingId(pt._id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(pt._id)}
                          disabled={busyId === pt._id}
                        >
                          {busyId === pt._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
        </ul>
        {previewId && (
          <PracticeTestPreview
            content={previewContent}
            onClose={() => {
              setPreviewId(null);
              setPreviewContent(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface PracticeTestFormProps {
  nextOrder: number;
  onSave: (p: CreatePracticeTestPayload) => Promise<void>;
  onCancel: () => void;
  disabled: boolean;
}

function PracticeTestForm({
  nextOrder,
  onSave,
  onCancel,
  disabled,
}: PracticeTestFormProps) {
  const [title, setTitle] = useState("");
  const [contentCode, setContentCode] = useState("");
  const [passageQuestionSetId, setPassageQuestionSetId] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(3);
  const [passType, setPassType] = useState<"PERCENTAGE" | "BAND">("PERCENTAGE");
  const [passValue, setPassValue] = useState(60);
  const [order, setOrder] = useState(nextOrder);
  const [pqsList, setPqsList] = useState<PassageQuestionSet[]>([]);
  const [loadingPqs, setLoadingPqs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyPassageQuestionSets()
      .then((list) => setPqsList(list.filter((p) => p.questionGroupIds?.length)))
      .catch(() => setPqsList([]))
      .finally(() => setLoadingPqs(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !passageQuestionSetId) return;
    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        contentCode: contentCode.trim() || undefined,
        passageQuestionSetId,
        timeLimitMinutes,
        passType,
        passValue,
        order,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const options = pqsList.map((p) => {
    const meta = `P${p.passageNumber} · ${p.expectedTotalQuestions ?? p.totalQuestions ?? 0} q`;
    const label = p.title?.trim() ? `${p.title} (${meta})` : `Passage ${p.passageNumber} · ${meta}`;
    return { value: p._id, label };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-muted/20 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Title <span className="text-destructive">*</span></Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Practice: Matching headings"
            disabled={disabled}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label>Content code (optional)</Label>
          <Input
            value={contentCode}
            onChange={(e) => setContentCode(e.target.value)}
            placeholder="e.g. PT-1"
            disabled={disabled}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label className="mb-2 block">Passage Question Set (one mini test) <span className="text-destructive">*</span></Label>
        {loadingPqs ? (
          <p className="text-sm text-muted-foreground">Loading passage question sets…</p>
        ) : (
          <select
            value={passageQuestionSetId}
            onChange={(e) => setPassageQuestionSetId(e.target.value)}
            disabled={disabled}
            className="mt-1 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="">Select…</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Time limit (minutes)</Label>
          <Input
            type="number"
            min={1}
            max={60}
            value={timeLimitMinutes}
            onChange={(e) => setTimeLimitMinutes(Number(e.target.value) || 3)}
            disabled={disabled}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Pass type</Label>
          <select
            value={passType}
            onChange={(e) => setPassType(e.target.value as "PERCENTAGE" | "BAND")}
            disabled={disabled}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="BAND">Band score</option>
          </select>
        </div>
        <div>
          <Label>Pass value ({passType === "PERCENTAGE" ? "min %" : "min band"})</Label>
          <Input
            type="number"
            min={0}
            max={passType === "PERCENTAGE" ? 100 : 9}
            value={passValue}
            onChange={(e) => setPassValue(Number(e.target.value) ?? 0)}
            disabled={disabled}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Order</Label>
          <Input
            type="number"
            min={1}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value) || 1)}
            disabled={disabled}
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting || disabled || loadingPqs || !title.trim() || !passageQuestionSetId}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Create practice test
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" /> Cancel
        </Button>
      </div>
    </form>
  );
}

interface PracticeTestEditFormProps {
  practiceTest: PracticeTest;
  onSave: (p: UpdatePracticeTestPayload) => Promise<void>;
  onCancel: () => void;
  busy: boolean;
}

function PracticeTestEditForm({
  practiceTest,
  onSave,
  onCancel,
  busy,
}: PracticeTestEditFormProps) {
  const [title, setTitle] = useState(practiceTest.title);
  const [contentCode, setContentCode] = useState(practiceTest.contentCode ?? "");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(practiceTest.timeLimitMinutes);
  const [passType, setPassType] = useState(practiceTest.passType as "PERCENTAGE" | "BAND");
  const [passValue, setPassValue] = useState(practiceTest.passValue);
  const [order, setOrder] = useState(practiceTest.order);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave({
        title,
        contentCode: contentCode.trim() || undefined,
        timeLimitMinutes,
        passType,
        passValue,
        order,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 w-full">
      <div className="min-w-[140px]">
        <Label className="text-xs">Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={busy}
          className="mt-1"
          required
        />
      </div>
      <div className="w-20">
        <Label className="text-xs">Code</Label>
        <Input
          value={contentCode}
          onChange={(e) => setContentCode(e.target.value)}
          placeholder="PT-1"
          disabled={busy}
          className="mt-1"
        />
      </div>
      <div className="w-20">
        <Label className="text-xs">Min</Label>
        <Input
          type="number"
          min={1}
          max={60}
          value={timeLimitMinutes}
          onChange={(e) => setTimeLimitMinutes(Number(e.target.value) || 3)}
          disabled={busy}
          className="mt-1"
        />
      </div>
      <div className="w-24">
        <Label className="text-xs">Pass</Label>
        <select
          value={passType}
          onChange={(e) => setPassType(e.target.value as "PERCENTAGE" | "BAND")}
          disabled={busy}
          className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
        >
          <option value="PERCENTAGE">%</option>
          <option value="BAND">Band</option>
        </select>
      </div>
      <div className="w-16">
        <Input
          type="number"
          min={0}
          max={passType === "PERCENTAGE" ? 100 : 9}
          value={passValue}
          onChange={(e) => setPassValue(Number(e.target.value) ?? 0)}
          disabled={busy}
          className="mt-1"
        />
      </div>
      <div className="w-14">
        <Label className="text-xs">Order</Label>
        <Input
          type="number"
          min={1}
          value={order}
          onChange={(e) => setOrder(Number(e.target.value) || 1)}
          disabled={busy}
          className="mt-1"
        />
      </div>
      <Button type="submit" size="sm" disabled={submitting || busy}>
        {submitting || busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </form>
  );
}

function PracticeTestPreview({
  content: previewContent,
  onClose,
}: {
  content: PracticeTestContentForPreview | null;
  onClose: () => void;
}) {
  if (!previewContent) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Loading preview…</span>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
    );
  }
  const { miniTest } = previewContent;
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">
          Preview: {previewContent.title} ({previewContent.timeLimitMinutes} min · pass {previewContent.passType === "PERCENTAGE" ? `${previewContent.passValue}%` : `band ${previewContent.passValue}`})
        </h4>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
      <div className="text-sm space-y-2">
        <p className="font-medium">{miniTest.passage?.title ?? "Passage"}</p>
        <p className="text-muted-foreground line-clamp-2">
          {typeof miniTest.passage?.content === "string"
            ? miniTest.passage.content.slice(0, 200) + "..."
            : "—"}
        </p>
        <p className="text-muted-foreground">{miniTest.questions?.length ?? 0} questions</p>
      </div>
    </div>
  );
}
