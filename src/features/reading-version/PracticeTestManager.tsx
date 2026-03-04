"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  Trash2,
  Plus,
  Loader2,
  X,
  Check,
  Pencil,
  Eye,
  ClipboardCheck,
  ExternalLink,
} from "lucide-react";

interface PracticeTestManagerProps {
  versionId: string;
  levelId: string;
  levelTitle: string;
  practiceTests: PracticeTest[];
  disabled: boolean;
  onPracticeTestsChange: (practiceTests: PracticeTest[]) => void;
}

function formatDate(s: string | undefined): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function PracticeTestManager({
  versionId,
  levelId,
  levelTitle,
  practiceTests,
  disabled,
  onPracticeTestsChange,
}: PracticeTestManagerProps) {
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

  const handleDelete = async (practiceTestId: string, title: string) => {
    if (
      !window.confirm(
        `Delete practice test "${title}"? This cannot be undone.`,
      )
    )
      return;
    setError(null);
    setBusyId(practiceTestId);
    try {
      await deletePracticeTest(practiceTestId);
      onPracticeTestsChange(practiceTests.filter((p) => p._id !== practiceTestId));
      if (previewId === practiceTestId) {
        setPreviewId(null);
        setPreviewContent(null);
      }
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

  const sorted = [...(practiceTests ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">
            Practice tests for {levelTitle}
          </h3>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            Each test = one passage + question set. Add a step of type &quot;Practice Test&quot; in the Level Builder and select one of these.
          </p>
        </div>
        {!disabled && (
          <Button
            type="button"
            size="sm"
            className="gap-2 bg-stone-700 text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-700"
            onClick={() => {
              setAdding(true);
              setError(null);
            }}
          >
            <Plus className="h-4 w-4" />
            Add practice test
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {adding && (
        <CreatePracticeTestForm
          nextOrder={
            sorted.length > 0 ? Math.max(...sorted.map((p) => p.order)) + 1 : 1
          }
          onSave={handleCreate}
          onCancel={() => setAdding(false)}
          disabled={disabled}
        />
      )}

      {sorted.length === 0 && !adding && (
        <Card className="overflow-hidden rounded-2xl border-stone-200 dark:border-stone-800">
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800">
              <ClipboardCheck className="h-7 w-7 text-stone-500 dark:text-stone-400" />
            </div>
            <div>
              <p className="font-medium text-stone-900 dark:text-stone-100">
                No practice tests yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">
                Add your first practice test above. Each test uses one passage question set (one mini test). Students get unlimited attempts until they pass.
              </p>
            </div>
            {!disabled && (
              <Button
                size="sm"
                className="gap-2 bg-stone-700 text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-700"
                onClick={() => setAdding(true)}
              >
                <Plus className="h-4 w-4" />
                Add practice test
              </Button>
            )}
          </div>
        </Card>
      )}

      {sorted.length > 0 && (
        <Card className="overflow-hidden rounded-2xl border-stone-200 shadow-sm dark:border-stone-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80 text-left text-stone-500 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-400">
                  <th className="p-4 font-medium">#</th>
                  <th className="p-4 font-medium">Code</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Time</th>
                  <th className="p-4 font-medium">Pass</th>
                  <th className="p-4 font-medium">Updated</th>
                  {!disabled && (
                    <th className="p-4 text-right font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sorted.map((pt) => (
                  <tr
                    key={pt._id}
                    className="border-b border-stone-100 last:border-0 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900/50"
                  >
                    {editingId === pt._id ? (
                      <td colSpan={disabled ? 6 : 7} className="p-4">
                        <EditPracticeTestForm
                          practiceTest={pt}
                          onSave={(p) => handleUpdate(pt._id, p)}
                          onCancel={() => setEditingId(null)}
                          busy={busyId === pt._id}
                        />
                      </td>
                    ) : (
                      <>
                        <td className="p-4 font-mono text-xs text-stone-600 dark:text-stone-400">
                          {pt.order}
                        </td>
                        <td className="p-4 font-mono text-xs text-stone-600 dark:text-stone-400">
                          {pt.contentCode ?? "—"}
                        </td>
                        <td className="p-4 font-medium text-stone-900 dark:text-stone-100">
                          {pt.title}
                        </td>
                        <td className="p-4 text-stone-600 dark:text-stone-400">
                          {pt.timeLimitMinutes} min
                        </td>
                        <td className="p-4 text-stone-600 dark:text-stone-400">
                          {pt.passType === "PERCENTAGE"
                            ? `≥ ${pt.passValue}%`
                            : `≥ band ${pt.passValue}`}
                        </td>
                        <td className="p-4 text-stone-500 dark:text-stone-400">
                          {formatDate(pt.updatedAt)}
                        </td>
                        {!disabled && (
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5"
                                onClick={() => loadPreview(pt._id)}
                                title="Preview"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Preview
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5"
                                onClick={() => setEditingId(pt._id)}
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 text-destructive hover:bg-destructive/10"
                                disabled={busyId === pt._id}
                                onClick={() => handleDelete(pt._id, pt.title)}
                                title="Delete"
                              >
                                {busyId === pt._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                Delete
                              </Button>
                            </div>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
        <span>Attach to a step:</span>
        <Link
          href={`/dashboard/instructor/reading-levels/${levelId}/versions/${versionId}/edit`}
          className="inline-flex items-center gap-1 font-medium text-stone-700 hover:underline dark:text-stone-300"
        >
          Level Builder
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <span>→ add step type &quot;Practice Test&quot; and select one from this list.</span>
      </div>

      {previewId && (
        <PreviewModal
          content={previewContent}
          onClose={() => {
            setPreviewId(null);
            setPreviewContent(null);
          }}
        />
      )}
    </div>
  );
}

function CreatePracticeTestForm({
  nextOrder,
  onSave,
  onCancel,
  disabled,
}: {
  nextOrder: number;
  onSave: (p: CreatePracticeTestPayload) => Promise<void>;
  onCancel: () => void;
  disabled: boolean;
}) {
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
    const label = p.title?.trim()
      ? `${p.title} (${meta})`
      : `Passage ${p.passageNumber} · ${meta}`;
    return { value: p._id, label };
  });

  return (
    <Card className="overflow-hidden rounded-2xl border-stone-200 dark:border-stone-800">
      <div className="border-b border-stone-200 bg-stone-50/50 px-6 py-3 dark:border-stone-800 dark:bg-stone-900/30">
        <h4 className="font-medium text-stone-900 dark:text-stone-100">
          New practice test
        </h4>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-stone-700 dark:text-stone-300">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Practice: Matching headings"
              disabled={disabled}
              className="rounded-lg border-stone-200 dark:border-stone-700"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-stone-700 dark:text-stone-300">
              Content code (optional)
            </Label>
            <Input
              value={contentCode}
              onChange={(e) => setContentCode(e.target.value)}
              placeholder="e.g. PT-1"
              disabled={disabled}
              className="rounded-lg border-stone-200 dark:border-stone-700"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-stone-700 dark:text-stone-300">
            Passage Question Set (one mini test) <span className="text-destructive">*</span>
          </Label>
          {loadingPqs ? (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Loading passage question sets…
            </p>
          ) : (
            <select
              value={passageQuestionSetId}
              onChange={(e) => setPassageQuestionSetId(e.target.value)}
              disabled={disabled}
              className="w-full max-w-md rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
              required
            >
              <option value="">Select a set…</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-stone-700 dark:text-stone-300">
              Time limit (min)
            </Label>
            <Input
              type="number"
              min={1}
              max={60}
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(Number(e.target.value) || 3)}
              disabled={disabled}
              className="rounded-lg border-stone-200 dark:border-stone-700"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-stone-700 dark:text-stone-300">
              Pass type
            </Label>
            <select
              value={passType}
              onChange={(e) => setPassType(e.target.value as "PERCENTAGE" | "BAND")}
              disabled={disabled}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="BAND">Band score</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-stone-700 dark:text-stone-300">
              Pass value ({passType === "PERCENTAGE" ? "min %" : "min band"})
            </Label>
            <Input
              type="number"
              min={0}
              max={passType === "PERCENTAGE" ? 100 : 9}
              value={passValue}
              onChange={(e) => setPassValue(Number(e.target.value) ?? 0)}
              disabled={disabled}
              className="rounded-lg border-stone-200 dark:border-stone-700"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-stone-700 dark:text-stone-300">Order</Label>
            <Input
              type="number"
              min={1}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value) || 1)}
              disabled={disabled}
              className="rounded-lg border-stone-200 dark:border-stone-700"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            type="submit"
            size="sm"
            disabled={
              submitting ||
              disabled ||
              loadingPqs ||
              !title.trim() ||
              !passageQuestionSetId
            }
            className="gap-2 bg-stone-700 text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-700"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Create practice test
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

function EditPracticeTestForm({
  practiceTest,
  onSave,
  onCancel,
  busy,
}: {
  practiceTest: PracticeTest;
  onSave: (p: UpdatePracticeTestPayload) => Promise<void>;
  onCancel: () => void;
  busy: boolean;
}) {
  const [title, setTitle] = useState(practiceTest.title);
  const [contentCode, setContentCode] = useState(practiceTest.contentCode ?? "");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    practiceTest.timeLimitMinutes,
  );
  const [passType, setPassType] = useState<"PERCENTAGE" | "BAND">(
    practiceTest.passType as "PERCENTAGE" | "BAND",
  );
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 rounded-lg border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/30"
    >
      <div className="min-w-[180px] space-y-1.5">
        <Label className="text-xs text-stone-600 dark:text-stone-400">Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={busy}
          className="rounded-lg border-stone-200 dark:border-stone-700"
          required
        />
      </div>
      <div className="w-24 space-y-1.5">
        <Label className="text-xs text-stone-600 dark:text-stone-400">Code</Label>
        <Input
          value={contentCode}
          onChange={(e) => setContentCode(e.target.value)}
          placeholder="PT-1"
          disabled={busy}
          className="rounded-lg border-stone-200 dark:border-stone-700"
        />
      </div>
      <div className="w-20 space-y-1.5">
        <Label className="text-xs text-stone-600 dark:text-stone-400">Min</Label>
        <Input
          type="number"
          min={1}
          max={60}
          value={timeLimitMinutes}
          onChange={(e) => setTimeLimitMinutes(Number(e.target.value) || 3)}
          disabled={busy}
          className="rounded-lg border-stone-200 dark:border-stone-700"
        />
      </div>
      <div className="w-28 space-y-1.5">
        <Label className="text-xs text-stone-600 dark:text-stone-400">Pass</Label>
        <select
          value={passType}
          onChange={(e) => setPassType(e.target.value as "PERCENTAGE" | "BAND")}
          disabled={busy}
          className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="PERCENTAGE">Percentage</option>
          <option value="BAND">Band</option>
        </select>
      </div>
      <div className="w-16 space-y-1.5">
        <Input
          type="number"
          min={0}
          max={passType === "PERCENTAGE" ? 100 : 9}
          value={passValue}
          onChange={(e) => setPassValue(Number(e.target.value) ?? 0)}
          disabled={busy}
          className="rounded-lg border-stone-200 dark:border-stone-700"
        />
      </div>
      <div className="w-16 space-y-1.5">
        <Label className="text-xs text-stone-600 dark:text-stone-400">Order</Label>
        <Input
          type="number"
          min={1}
          value={order}
          onChange={(e) => setOrder(Number(e.target.value) || 1)}
          disabled={busy}
          className="rounded-lg border-stone-200 dark:border-stone-700"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={submitting || busy}
          className="gap-1.5 bg-stone-700 text-white hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-700"
        >
          {submitting || busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function PreviewModal({
  content,
  onClose,
}: {
  content: PracticeTestContentForPreview | null;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        tabIndex={-1}
      />
      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-800">
          <h2 id="preview-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {content ? (
              <>
                Preview: {content.title}
                <span className="ml-2 text-sm font-normal text-stone-500 dark:text-stone-400">
                  {content.timeLimitMinutes} min · pass{" "}
                  {content.passType === "PERCENTAGE"
                    ? `${content.passValue}%`
                    : `band ${content.passValue}`}
                </span>
              </>
            ) : (
              "Loading preview…"
            )}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {!content ? (
            <div className="flex items-center justify-center gap-2 py-12 text-stone-500 dark:text-stone-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading…</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-stone-900 dark:text-stone-100">
                  {content.miniTest.passage?.title ?? "Passage"}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-stone-600 dark:text-stone-400 line-clamp-6">
                  {typeof content.miniTest.passage?.content === "string"
                    ? content.miniTest.passage.content
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50/50 px-4 py-3 dark:border-stone-800 dark:bg-stone-900/50">
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {content.miniTest.questions?.length ?? 0} questions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
