"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPracticeTest,
  updatePracticeTest,
  deletePracticeTest,
  reorderPracticeTests,
  getPracticeTestPreviewContent,
  type PracticeTest,
  type CreatePracticeTestPayload,
  type UpdatePracticeTestPayload,
  type PracticeTestContentForPreview,
  type GroupTestQuestionForPreview,
  type GroupTestQuestionGroupForPreview,
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
  ChevronUp,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

const MAX_ATTEMPTS_OPTIONS = [
  { value: "unlimited", label: "Unlimited" },
  ...Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
];

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
  const [reorderBusy, setReorderBusy] = useState(false);
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
        setPreviewError(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete practice test");
    } finally {
      setBusyId(null);
    }
  };

  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadPreview = async (id: string) => {
    setPreviewId(id);
    setPreviewContent(null);
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const content = await getPracticeTestPreviewContent(versionId, id);
      setPreviewContent(content);
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Failed to load preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleReorder = async (direction: "up" | "down", index: number) => {
    const sorted = [...(practiceTests ?? [])].sort((a, b) => a.order - b.order);
    if (direction === "up" && index <= 0) return;
    if (direction === "down" && index >= sorted.length - 1) return;
    setError(null);
    setReorderBusy(true);
    try {
      const reordered = [...sorted];
      const swap = direction === "up" ? index - 1 : index + 1;
      [reordered[index], reordered[swap]] = [reordered[swap], reordered[index]];
      const ids = reordered.map((p) => p._id);
      const updated = await reorderPracticeTests(versionId, ids);
      onPracticeTestsChange(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reorder");
    } finally {
      setReorderBusy(false);
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
          existingCount={sorted.length}
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
        <>
          {/* Card layout for small screens */}
          <div className="flex flex-col gap-3 md:hidden">
            {sorted.map((pt, index) => (
              <Card
                key={pt._id}
                className="overflow-hidden rounded-xl border-stone-200 dark:border-stone-800"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-stone-900 dark:text-stone-100 truncate">
                        {pt.title}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {pt.contentCode ?? "—"} · {pt.timeLimitMinutes} min ·{" "}
                        {pt.passType === "PERCENTAGE"
                          ? `≥ ${pt.passValue}%`
                          : "Band (student chooses)"}{" "}
                        · {pt.maxAttempts == null ? "Unlimited" : pt.maxAttempts} attempts
                      </p>
                    </div>
                    <span className="shrink-0 rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-600 dark:text-stone-300">
                      #{pt.order}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => loadPreview(pt._id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                    {!disabled && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setEditingId(pt._id)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-destructive hover:bg-destructive/10"
                          disabled={busyId === pt._id}
                          onClick={() => handleDelete(pt._id, pt.title)}
                        >
                          {busyId === pt._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                  {editingId === pt._id && (
                    <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
                      <EditPracticeTestForm
                        practiceTest={pt}
                        onSave={(p) => handleUpdate(pt._id, p)}
                        onCancel={() => setEditingId(null)}
                        busy={busyId === pt._id}
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Table layout for medium and up */}
          <Card className="overflow-hidden rounded-2xl border-stone-200 shadow-sm dark:border-stone-800 hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80 text-left text-stone-500 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-400">
                  <th className="w-20 p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Code</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Time</th>
                  <th className="p-4 font-medium">Pass</th>
                  <th className="p-4 font-medium">Attempts</th>
                  <th className="p-4 font-medium">Updated</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((pt, index) => (
                  <tr
                    key={pt._id}
                    className="border-b border-stone-100 last:border-0 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900/50"
                  >
                    {editingId === pt._id ? (
                      <td colSpan={8} className="p-4">
                        <EditPracticeTestForm
                          practiceTest={pt}
                          onSave={(p) => handleUpdate(pt._id, p)}
                          onCancel={() => setEditingId(null)}
                          busy={busyId === pt._id}
                        />
                      </td>
                    ) : (
                      <>
                        <td className="p-4">
                          <div className="flex items-center gap-0.5">
                            <span className="font-mono text-xs text-stone-600 dark:text-stone-400 w-5">
                              {pt.order}
                            </span>
                            {!disabled && sorted.length > 1 && (
                              <div className="flex flex-col">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  disabled={reorderBusy || index === 0}
                                  onClick={() => handleReorder("up", index)}
                                  title="Move up"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  disabled={reorderBusy || index === sorted.length - 1}
                                  onClick={() => handleReorder("down", index)}
                                  title="Move down"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
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
                            : "Student chooses target band"}
                        </td>
                        <td className="p-4 text-stone-600 dark:text-stone-400">
                          {pt.maxAttempts == null || pt.maxAttempts === undefined
                            ? "Unlimited"
                            : pt.maxAttempts}
                        </td>
                        <td className="p-4 text-stone-500 dark:text-stone-400">
                          {formatDate(pt.updatedAt)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5"
                              onClick={() => loadPreview(pt._id)}
                              title="Preview passage and questions"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Preview
                            </Button>
                            {!disabled && (
                              <>
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
                              </>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </Card>
        </>
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
        <PracticeTestPreviewModal
          content={previewContent}
          loading={previewLoading}
          error={previewError}
          onClose={() => {
            setPreviewId(null);
            setPreviewContent(null);
            setPreviewError(null);
          }}
          onRetry={() => loadPreview(previewId)}
        />
      )}
    </div>
  );
}

function CreatePracticeTestForm({
  nextOrder,
  existingCount,
  onSave,
  onCancel,
  disabled,
}: {
  nextOrder: number;
  existingCount: number;
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
  const [maxAttemptsRaw, setMaxAttemptsRaw] = useState("unlimited");
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
      const maxAttempts =
        maxAttemptsRaw === "unlimited"
          ? null
          : Math.max(1, Math.min(99, parseInt(maxAttemptsRaw, 10) || 1));
      const effectivePassValue = passType === "BAND" ? 0 : Math.max(0, Math.min(100, passValue));
      await onSave({
        title: title.trim(),
        contentCode: contentCode.trim() || undefined,
        passageQuestionSetId,
        timeLimitMinutes,
        passType,
        passValue: effectivePassValue,
        maxAttempts,
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
              Max attempts
            </Label>
            <select
              value={maxAttemptsRaw}
              onChange={(e) => setMaxAttemptsRaw(e.target.value)}
              disabled={disabled}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            >
              {MAX_ATTEMPTS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Unlimited = student can retry until they pass
            </p>
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
              <option value="PERCENTAGE">Percentage (you set min pass %)</option>
              <option value="BAND">Band score (student chooses their target band)</option>
            </select>
          </div>
          {passType === "PERCENTAGE" && (
            <div className="space-y-2">
              <Label className="text-stone-700 dark:text-stone-300">
                Minimum pass %
              </Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={passValue}
                onChange={(e) => setPassValue(Number(e.target.value) ?? 0)}
                disabled={disabled}
                className="rounded-lg border-stone-200 dark:border-stone-700"
              />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-stone-700 dark:text-stone-300">
            Position in list
          </Label>
          <select
            value={order}
            onChange={(e) => setOrder(Number(e.target.value) || 1)}
            disabled={disabled}
            className="w-full max-w-[10rem] rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
          >
            {Array.from({ length: existingCount + 1 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`}
              </option>
            ))}
          </select>
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
  const [maxAttemptsRaw, setMaxAttemptsRaw] = useState(
    practiceTest.maxAttempts == null || practiceTest.maxAttempts === undefined
      ? "unlimited"
      : String(practiceTest.maxAttempts),
  );
  const [order, setOrder] = useState(practiceTest.order);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const maxAttempts =
        maxAttemptsRaw === "unlimited"
          ? null
          : Math.max(1, Math.min(99, parseInt(maxAttemptsRaw, 10) || 1));
      const effectivePassValue = passType === "BAND" ? 0 : Math.max(0, Math.min(100, passValue));
      await onSave({
        title,
        contentCode: contentCode.trim() || undefined,
        timeLimitMinutes,
        passType,
        passValue: effectivePassValue,
        maxAttempts,
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
      <div className="w-24 space-y-1.5">
        <Label className="text-xs text-stone-600 dark:text-stone-400">Attempts</Label>
        <select
          value={maxAttemptsRaw}
          onChange={(e) => setMaxAttemptsRaw(e.target.value)}
          disabled={busy}
          className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          {MAX_ATTEMPTS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="w-32 space-y-1.5">
        <Label className="text-xs text-stone-600 dark:text-stone-400">Pass</Label>
        <select
          value={passType}
          onChange={(e) => setPassType(e.target.value as "PERCENTAGE" | "BAND")}
          disabled={busy}
          className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900"
        >
          <option value="PERCENTAGE">%</option>
          <option value="BAND">Band (student chooses)</option>
        </select>
      </div>
      {passType === "PERCENTAGE" && (
        <div className="w-16 space-y-1.5">
          <Label className="text-xs text-stone-600 dark:text-stone-400">Min %</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={passValue}
            onChange={(e) => setPassValue(Number(e.target.value) ?? 0)}
            disabled={busy}
            className="rounded-lg border-stone-200 dark:border-stone-700"
          />
        </div>
      )}
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

const QUESTION_TYPE_LABEL: Record<string, string> = {
  TRUE_FALSE_NOT_GIVEN: "True / False / Not Given",
  YES_NO_NOT_GIVEN: "Yes / No / Not Given",
  MCQ_SINGLE: "Multiple choice (single)",
  MCQ_MULTIPLE: "Multiple choice (multiple)",
  MATCHING_HEADINGS: "Matching headings",
  MATCHING_INFORMATION: "Matching information",
  MATCHING_FEATURES: "Matching features",
  MATCHING_SENTENCE_ENDINGS: "Matching sentence endings",
  SENTENCE_COMPLETION: "Sentence completion",
  SUMMARY_COMPLETION: "Summary completion",
  NOTE_COMPLETION: "Note completion",
  TABLE_COMPLETION: "Table completion",
  FLOW_CHART_COMPLETION: "Flow chart completion",
  DIAGRAM_LABEL_COMPLETION: "Diagram label completion",
  SHORT_ANSWER: "Short answer",
};

type PassageParagraph = { paragraphIndex: number; paragraphLabel?: string; text: string };

function renderPassageContent(content: unknown): React.ReactNode {
  if (content == null) return null;
  if (typeof content === "string") {
    return (
      <div className="whitespace-pre-wrap text-[15px] leading-[1.75] text-stone-700 dark:text-stone-300">
        {content}
      </div>
    );
  }
  if (!Array.isArray(content)) return null;
  return (
    <div className="space-y-4 text-[15px] leading-[1.75] text-stone-700 dark:text-stone-300">
      {(content as PassageParagraph[]).map((p) => (
        <p key={p.paragraphIndex}>
          {p.paragraphLabel != null && String(p.paragraphLabel).trim() !== "" && (
            <span className="mr-1.5 font-semibold text-stone-600 dark:text-stone-400">
              {p.paragraphLabel.trim()}
              {!String(p.paragraphLabel).trim().endsWith(".") && ". "}
            </span>
          )}
          {p.text}
        </p>
      ))}
    </div>
  );
}

function extractQuestionText(qBody: unknown): string {
  if (!qBody || typeof qBody !== "object") return "";
  const c = (qBody as { content?: unknown }).content;
  if (typeof c === "string") return c;
  if (Array.isArray(c) && c.length > 0) {
    if (typeof c[0] === "string") return c[0];
    if (Array.isArray(c[0])) return (c[0] as string[]).join(" ");
  }
  const layout = (qBody as { layout?: string }).layout;
  return layout ? `Question (${layout})` : "";
}

function getStructuredNoteContent(qBody: unknown): { heading?: string; sections: Array<{ subheading?: string; lines: string[] }> } | null {
  if (!qBody || typeof qBody !== "object") return null;
  const layout = (qBody as { layout?: string }).layout;
  const c = (qBody as { content?: unknown }).content;
  if (layout !== "NOTE" || !c || typeof c !== "object") return null;
  const note = c as { heading?: string; sections?: unknown };
  if (!Array.isArray(note.sections) || note.sections.length === 0) return null;
  return { heading: note.heading as string | undefined, sections: note.sections as Array<{ subheading?: string; lines: string[] }> };
}

function renderLineWithGapBoxes(
  text: string,
  options?: { displayNumberStart?: number; gapIndexRef?: { current: number } }
): ReactNode {
  if (!/\{\{gap\d+\}\}/.test(text)) return text;
  const GAP_RE = /(\{\{gap\d+\}\})/g;
  const parts = text.split(GAP_RE);
  const gapIndexRef = options?.gapIndexRef ?? { current: 0 };
  const displayNumberStart = options?.displayNumberStart;

  return parts.map((part, i) => {
    if (/{{gap\d+}}/.test(part)) {
      const num = displayNumberStart != null ? displayNumberStart + gapIndexRef.current++ : null;
      return (
        <span
          key={i}
          className="mx-1 inline-flex min-w-[90px] items-center justify-center rounded border-2 border-dashed border-stone-400 bg-stone-100 px-2 py-0.5 align-baseline text-sm text-stone-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
          aria-label="Gap"
        >
          {num != null ? <span className="font-medium">{num}.</span> : <span className="text-stone-400">&nbsp;</span>}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function renderQuestionTextWithGaps(text: string): ReactNode {
  return renderLineWithGapBoxes(text);
}

function formatCorrectAnswer(correctAnswer: string | string[] | undefined): string {
  if (correctAnswer == null) return "—";
  if (Array.isArray(correctAnswer)) return correctAnswer.join(", ");
  return String(correctAnswer);
}

function PracticeTestQuestionBlock({
  question,
  displayNumber,
}: {
  question: GroupTestQuestionForPreview;
  displayNumber: number;
}) {
  const qBody = question.questionBody;
  const structuredNote = getStructuredNoteContent(qBody);
  const rawText = (extractQuestionText(qBody) as string).trim() || `Question ${displayNumber}`;

  const blanks = (question as { blanks?: Array<{ id: number; correctAnswer?: string | string[] }> }).blanks ?? [];
  const blanksWithAnswer = blanks.filter((b) => b.correctAnswer != null);
  const correct = blanksWithAnswer?.length
    ? blanksWithAnswer.map((b) => formatCorrectAnswer(b.correctAnswer)).join("  ·  ")
    : formatCorrectAnswer(question.correctAnswer);

  const blankCount = blanks.length;
  const usePerGapNumbers = structuredNote != null && blankCount > 1;
  const displayNumberEnd = displayNumber + blankCount - 1;
  const displayLabel = usePerGapNumbers ? `${displayNumber}–${displayNumberEnd}` : String(displayNumber);
  const gapIndexRef = { current: 0 };

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-700 dark:bg-stone-800/40">
      <p className="mb-2 text-[15px] font-medium text-stone-900 dark:text-stone-100">
        {displayLabel}.
      </p>
      {structuredNote ? (
        <div className="space-y-3 mb-3 rounded-lg border border-stone-200 bg-white/60 p-4 dark:border-stone-700 dark:bg-stone-900/40">
          {structuredNote.heading && (
            <h4 className="text-base font-semibold text-stone-800 dark:text-stone-200 border-b border-stone-200 dark:border-stone-700 pb-1">
              {structuredNote.heading}
            </h4>
          )}
          {structuredNote.sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {sec.subheading && (
                <p className="text-sm font-medium text-stone-600 dark:text-stone-400">{sec.subheading}</p>
              )}
              <ul className="list-none space-y-1 text-[15px] text-stone-800 dark:text-stone-200">
                {sec.lines.map((line, lIdx) => (
                  <li key={lIdx} className="flex flex-wrap items-baseline gap-0.5">
                    {renderLineWithGapBoxes(line, usePerGapNumbers ? { displayNumberStart: displayNumber, gapIndexRef } : undefined)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-[15px] text-stone-800 dark:text-stone-200">
          {renderQuestionTextWithGaps(rawText)}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 dark:border-emerald-800 dark:bg-emerald-950/40">
        <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
          Correct answer{blanksWithAnswer && blanksWithAnswer.length > 1 ? "s" : ""}:
        </span>
        <span className="text-[14px] font-medium text-emerald-800 dark:text-emerald-200">
          {correct}
        </span>
      </div>
    </div>
  );
}

function PracticeTestPreviewModal({
  content,
  loading,
  error,
  onClose,
  onRetry,
}: {
  content: PracticeTestContentForPreview | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}) {
  const passage = content?.miniTest?.passage;
  const questionGroups = content?.miniTest?.questionGroups;
  const flatQuestions = content?.miniTest?.questions ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="practice-preview-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        tabIndex={-1}
      />
      <div className="relative z-10 flex w-full max-w-3xl flex-col rounded-none sm:rounded-2xl border-0 sm:border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900 max-h-[100dvh] sm:max-h-[90vh] m-0 sm:m-4">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 px-4 py-3 sm:px-6 dark:border-stone-800">
          <h2
            id="practice-preview-title"
            className="min-w-0 truncate text-base font-semibold text-stone-900 dark:text-stone-100 sm:text-lg"
          >
            {content ? (
              <>
                Preview: {content.title}
                <span className="ml-2 hidden text-sm font-normal text-stone-500 dark:text-stone-400 sm:inline">
                  {content.timeLimitMinutes} min · pass{" "}
                  {content.passType === "PERCENTAGE"
                    ? `${content.passValue}%`
                    : "student chooses target band"}
                  {" · "}
                  {content.maxAttempts == null
                    ? "unlimited attempts"
                    : `${content.maxAttempts} attempts`}
                </span>
              </>
            ) : (
              "Practice test preview"
            )}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-lg"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && !content && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-stone-500 dark:text-stone-400">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span>Loading preview…</span>
            </div>
          )}
          {error && !content && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <p className="text-sm font-medium text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          )}
          {content && !loading && (
            <div className="space-y-8">
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Passage
                </h3>
                <h4 className="font-medium text-stone-900 dark:text-stone-100">
                  {passage?.title ?? "Passage"}
                </h4>
                {passage?.subTitle && (
                  <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                    {passage.subTitle}
                  </p>
                )}
                <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50/30 p-4 dark:border-stone-700 dark:bg-stone-800/30">
                  {passage?.content != null
                    ? renderPassageContent(passage.content)
                    : (
                      <p className="text-stone-500 dark:text-stone-400">No passage content.</p>
                    )}
                </div>
                {typeof passage?.wordCount === "number" && (
                  <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                    {passage.wordCount} words
                  </p>
                )}
              </section>
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Questions ({flatQuestions.length})
                </h3>
                {questionGroups && questionGroups.length > 0 ? (
                  <div className="space-y-6">
                    {(questionGroups as GroupTestQuestionGroupForPreview[]).map((grp) => (
                      <div key={`${grp.startQuestionNumber}-${grp.endQuestionNumber}`}>
                        <p className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                          Questions {grp.startQuestionNumber}–{grp.endQuestionNumber}:{" "}
                          {QUESTION_TYPE_LABEL[grp.questionType] ?? grp.questionType}
                        </p>
                        {grp.instruction && (
                          <p className="mb-3 text-xs italic text-stone-500 dark:text-stone-400">
                            {grp.instruction}
                          </p>
                        )}
                        <div className="space-y-3">
                          {grp.questions.map((q) => (
                            <PracticeTestQuestionBlock
                              key={q._id}
                              question={q}
                              displayNumber={q.questionNumber}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {flatQuestions.map((q, idx) => (
                      <PracticeTestQuestionBlock
                        key={q._id}
                        question={q}
                        displayNumber={idx + 1}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
