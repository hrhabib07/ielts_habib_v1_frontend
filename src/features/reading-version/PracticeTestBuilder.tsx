"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  createPracticeTest,
  updatePracticeTest,
  deletePracticeTest,
  deleteAllPracticeTestsByVersion,
  reorderPracticeTests,
  getPracticeTestPreviewContent,
  type PracticeTest,
  type CreatePracticeTestPayload,
  type UpdatePracticeTestPayload,
  type PracticeTestContentForPreview,
  createSentenceLocatorPracticeTest,
  createGamlishScanningPracticeTest,
  type CreateSentenceLocatorPracticeTestPayload,
  type CreateGamlishScanningPracticeTestPayload,
  isSentenceLocatorPreviewContent,
  isGamlishScanningPreviewContent,
  isProgressiveMcqPreviewContent,
  isFullMockPreviewContent,
  type SentenceLocatorContentAuthoringPreview,
} from "@/src/lib/api/adminReadingVersions";
import { DeleteConfirmDialog } from "@/src/components/shared/DeleteConfirmDialog";
import { GamlishScanningCreateForm } from "./GamlishScanningCreateForm";
import { getMyPassageQuestionSets, type PassageQuestionSet } from "@/src/lib/api/instructor";
import { Trash2, Plus, Loader2, X, Check, Pencil, Eye, ChevronUp, ChevronDown } from "lucide-react";

const MAX_ATTEMPTS_OPTIONS = [
  { value: "unlimited", label: "Unlimited" },
  ...Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
];

interface PracticeTestBuilderProps {
  versionId: string;
  practiceTests: PracticeTest[];
  disabled: boolean;
  onPracticeTestsChange: (practiceTests: PracticeTest[]) => void;
  /** Level 0: practice test IDs registered in the final-test pool (section 3). */
  finalTestPracticeTestIds?: string[];
  isL0Foundation?: boolean;
  /** Reading fundamentals (DB order 0 / student Level 1). */
  isReadingL0Foundation?: boolean;
}

export function PracticeTestBuilder({
  versionId,
  practiceTests,
  disabled,
  onPracticeTestsChange,
  finalTestPracticeTestIds = [],
  isL0Foundation = false,
  isReadingL0Foundation = false,
}: PracticeTestBuilderProps) {
  const finalSlotIdSet = new Set(finalTestPracticeTestIds);
  const finalSlotIndex = new Map(
    finalTestPracticeTestIds.map((id, i) => [id, i + 1] as const),
  );
  const [adding, setAdding] = useState(false);
  const [addingLocator, setAddingLocator] = useState(false);
  const [addingGamlish, setAddingGamlish] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reorderBusy, setReorderBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<PracticeTestContentForPreview | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; title: string } | null>(null);
  const [deleteAllBusy, setDeleteAllBusy] = useState(false);
  const [editingLocatorJson, setEditingLocatorJson] =
    useState<SentenceLocatorContentAuthoringPreview | null>(null);
  const [editingLocatorLoading, setEditingLocatorLoading] = useState(false);

  useEffect(() => {
    if (!editingId) {
      setEditingLocatorJson(null);
      setEditingLocatorLoading(false);
      return;
    }
    let cancelled = false;
    setEditingLocatorLoading(true);
    getPracticeTestPreviewContent(versionId, editingId)
      .then((c) => {
        if (cancelled) return;
        if (isSentenceLocatorPreviewContent(c)) setEditingLocatorJson(c.sentenceLocator);
        else setEditingLocatorJson(null);
      })
      .catch(() => {
        if (!cancelled) setEditingLocatorJson(null);
      })
      .finally(() => {
        if (!cancelled) setEditingLocatorLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editingId, versionId]);

  const handleCreateLocator = async (payload: CreateSentenceLocatorPracticeTestPayload) => {
    setError(null);
    try {
      const created = await createSentenceLocatorPracticeTest(versionId, payload);
      onPracticeTestsChange(
        [...practiceTests, created].sort((a, b) => a.order - b.order),
      );
      setAddingLocator(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create sentence locator test");
    }
  };

  const handleCreateGamlish = async (payload: CreateGamlishScanningPracticeTestPayload) => {
    setError(null);
    try {
      const created = await createGamlishScanningPracticeTest(versionId, payload);
      onPracticeTestsChange(
        [...practiceTests, created].sort((a, b) => a.order - b.order),
      );
      setAddingGamlish(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create Gamlish scanning test");
    }
  };

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

  const handleDeleteConfirm = async (mode: "detach" | "permanent") => {
    if (!deleteDialog) return;
    const { id: practiceTestId } = deleteDialog;
    setError(null);
    setBusyId(practiceTestId);
    try {
      await deletePracticeTest(practiceTestId, mode);
      onPracticeTestsChange(practiceTests.filter((p) => p._id !== practiceTestId));
      setDeleteDialog(null);
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

  const sortedList = [...(practiceTests ?? [])].sort((a, b) => a.order - b.order);
  const isMisplacedL0Final = (pt: PracticeTest) =>
    /\b(l0\s*[—–-]\s*)?final\b/i.test(pt.title) && !finalSlotIdSet.has(pt._id);
  const practiceOnlyList = isL0Foundation
    ? sortedList.filter((p) => !finalSlotIdSet.has(p._id) && !isMisplacedL0Final(p))
    : sortedList;
  const finalOnlyList = isL0Foundation
    ? sortedList.filter((p) => finalSlotIdSet.has(p._id))
    : [];
  const handleDeleteAll = async () => {
    if (sortedList.length === 0) return;
    const confirmed = window.prompt(
      `Type DELETE ALL to permanently delete ${sortedList.length} practice test(s) in this level.`,
      "",
    );
    if ((confirmed ?? "").trim() !== "DELETE ALL") return;
    setDeleteAllBusy(true);
    setError(null);
    try {
      await deleteAllPracticeTestsByVersion(versionId, "permanent");
      onPracticeTestsChange([]);
      setPreviewId(null);
      setPreviewContent(null);
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete all practice tests");
    } finally {
      setDeleteAllBusy(false);
    }
  };

  const handleReorder = async (direction: "up" | "down", index: number) => {
    if (direction === "up" && index <= 0) return;
    if (direction === "down" && index >= sortedList.length - 1) return;
    setError(null);
    setReorderBusy(true);
    try {
      const reordered = [...sortedList];
      const swap = direction === "up" ? index - 1 : index + 1;
      const a = reordered[index];
      const b = reordered[swap];
      if (!a || !b) return;
      reordered[index] = b;
      reordered[swap] = a;
      const updated = await reorderPracticeTests(versionId, reordered.map((p) => p._id));
      onPracticeTestsChange(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reorder");
    } finally {
      setReorderBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Practice tests</CardTitle>
        {!disabled && (
          <div className="flex items-center gap-2">
            {sortedList.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/40 hover:bg-destructive/10"
                onClick={handleDeleteAll}
                disabled={deleteAllBusy}
              >
                {deleteAllBusy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                Delete all
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAdding(true)}
              disabled={isL0Foundation && practiceOnlyList.length >= 3}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add practice test
            </Button>
            {isReadingL0Foundation ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddingGamlish(true)}
                disabled={practiceOnlyList.length >= 3}
              >
                <Plus className="h-4 w-4 mr-1" />
                Gamlish scanning
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddingLocator(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Sentence locator
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Quick guide:</span> (1) Create tests with the buttons
          above — a <span className="font-medium text-foreground">Practice Test</span> step is added automatically after
          your lessons. (2) Open <span className="font-medium text-foreground">Preview level</span> to verify. (3) Use{" "}
          <span className="font-medium text-foreground">Preview</span> (eye) to
          verify. Standard tests use a passage question set; Reading Fundamentals uses Gamlish scanning JSON — see{" "}
          <code className="rounded bg-background px-1 py-0.5 text-[11px]">docs/GAMLISH_SCANNING_PRACTICE_TEST_JSON.md</code>.
          {isL0Foundation ? (
            <>
              {" "}
              <span className="font-medium text-indigo-800 dark:text-indigo-200">
                Level 0 finals belong in section 3 — not here. Tests marked Final are managed there.
              </span>
            </>
          ) : null}
        </div>
        {isL0Foundation && practiceOnlyList.length >= 3 && (
          <p className="text-xs text-muted-foreground">
            Level 0 allows exactly 3 practice tests here. Add finals in section 2.
          </p>
        )}
        {isL0Foundation && finalOnlyList.length > 0 && (
          <div className="rounded-lg border border-indigo-200/80 bg-indigo-50/40 px-3 py-2.5 dark:border-indigo-900/50 dark:bg-indigo-950/25">
            <p className="text-xs font-medium text-indigo-900 dark:text-indigo-100 mb-2">
              Registered as Level 0 final tests (edit in section 3)
            </p>
            <ul className="space-y-1 text-sm text-indigo-900/90 dark:text-indigo-100/90">
              {finalOnlyList.map((pt) => (
                <li key={pt._id} className="flex items-center gap-2">
                  <span className="rounded bg-indigo-200/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase dark:bg-indigo-800">
                    Final {finalSlotIndex.get(pt._id) ?? "?"}
                  </span>
                  <span>{pt.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {addingGamlish && (
          <GamlishScanningCreateForm
            nextOrder={
              practiceTests.length > 0
                ? Math.max(...practiceTests.map((p) => p.order)) + 1
                : 1
            }
            onSave={handleCreateGamlish}
            onCancel={() => setAddingGamlish(false)}
            disabled={disabled}
          />
        )}
        {addingLocator && (
          <SentenceLocatorCreateForm
            nextOrder={
              practiceTests.length > 0
                ? Math.max(...practiceTests.map((p) => p.order)) + 1
                : 1
            }
            onSave={handleCreateLocator}
            onCancel={() => setAddingLocator(false)}
            disabled={disabled}
          />
        )}
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
          {practiceOnlyList.map((pt) => {
            const index = sortedList.findIndex((p) => p._id === pt._id);
            return (
              <li key={pt._id} className="flex items-center gap-2 rounded-md border p-3">
                {editingId === pt._id ? (
                  <PracticeTestEditForm
                    practiceTest={pt}
                    initialSentenceLocator={editingLocatorJson}
                    locatorLoading={editingLocatorLoading}
                    onSave={(p) => handleUpdate(pt._id, p)}
                    onCancel={() => setEditingId(null)}
                    busy={busyId === pt._id}
                  />
                ) : (
                  <>
                    <div className="flex flex-col items-center w-10 gap-0">
                      <span className="text-muted-foreground text-xs">#{pt.order}</span>
                      {!disabled && sortedList.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleReorder("up", index)}
                            disabled={reorderBusy || index === 0}
                            className="p-0.5 rounded hover:bg-muted"
                            title="Move up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorder("down", index)}
                            disabled={reorderBusy || index === sortedList.length - 1}
                            className="p-0.5 rounded hover:bg-muted"
                            title="Move down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                    <span className="text-sm flex-1 font-medium">
                      {pt.contentCode ? `[${pt.contentCode}] ` : ""}
                      {pt.title}
                      {pt.contentFormat === "GAMLISH_SCANNING" ? (
                        <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                          GS
                        </span>
                      ) : pt.contentFormat === "SENTENCE_LOCATOR" ? (
                        <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
                          SL
                        </span>
                      ) : pt.contentFormat === "FULL_MOCK" ? (
                        <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                          Full mock
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {pt.timeLimitMinutes} min · pass {pt.passType === "PERCENTAGE" ? `${pt.passValue}%` : `band ${pt.passValue}`}
                      {pt.maxAttempts != null ? ` · ${pt.maxAttempts} attempts` : " · unlimited"}
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
                          onClick={() => setDeleteDialog({ id: pt._id, title: pt.title })}
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
            );
          })}
        </ul>
        {deleteDialog && (
          <DeleteConfirmDialog
            open={!!deleteDialog}
            onClose={() => setDeleteDialog(null)}
            onConfirm={handleDeleteConfirm}
            itemName={deleteDialog.title}
            itemType="practice test"
            busy={!!busyId}
          />
        )}
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

const SENTENCE_LOCATOR_JSON_PLACEHOLDER = `{
  "passageTitle": "Urban green spaces",
  "passageSubTitle": "Sample",
  "instruction": "Click the sentence in the passage that matches each statement.",
  "paragraphs": [
    { "paragraphIndex": 0, "sentences": ["Cities need trees.", "Parks reduce heat."] },
    { "paragraphIndex": 1, "sentences": ["Residents report better wellbeing.", "Funding remains uneven."] }
  ],
  "statements": [
    {
      "id": "s1",
      "order": 1,
      "statement": "People feel healthier when green space exists.",
      "targetParagraphIndex": 1,
      "targetSentenceIndex": 0,
      "anchorKeywords": ["wellbeing", "Residents"],
      "gamlishHack": "Match wellbeing / residents to the wellbeing sentence.",
      "difficulty": "MEDIUM"
    }
  ],
  "reviewAfterEachAttempt": true,
  "showCoachHintsDuringAttempt": false
}`;

interface SentenceLocatorCreateFormProps {
  nextOrder: number;
  onSave: (p: CreateSentenceLocatorPracticeTestPayload) => Promise<void>;
  onCancel: () => void;
  disabled: boolean;
}

function SentenceLocatorCreateForm({
  nextOrder,
  onSave,
  onCancel,
  disabled,
}: SentenceLocatorCreateFormProps) {
  const [title, setTitle] = useState("");
  const [contentCode, setContentCode] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [passType, setPassType] = useState<"PERCENTAGE" | "BAND">("PERCENTAGE");
  const [passValue, setPassValue] = useState(60);
  const [maxAttemptsRaw, setMaxAttemptsRaw] = useState("unlimited");
  const [order, setOrder] = useState(nextOrder);
  const [jsonText, setJsonText] = useState(SENTENCE_LOCATOR_JSON_PLACEHOLDER);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!title.trim()) return;
    let sentenceLocator: SentenceLocatorContentAuthoringPreview;
    try {
      const parsed = JSON.parse(jsonText) as unknown;
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        setLocalError("JSON must be an object (the sentenceLocator payload).");
        return;
      }
      sentenceLocator = parsed as SentenceLocatorContentAuthoringPreview;
    } catch {
      setLocalError("Invalid JSON. Fix syntax and try again.");
      return;
    }
    const maxAttempts =
      maxAttemptsRaw === "unlimited"
        ? null
        : Math.max(1, Math.min(99, parseInt(maxAttemptsRaw, 10) || 1));
    const effectivePassValue = passType === "BAND" ? 0 : Math.max(0, Math.min(100, passValue));
    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        contentCode: contentCode.trim() || undefined,
        sentenceLocator,
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-violet-200/60 bg-violet-50/20 dark:border-violet-900/40 dark:bg-violet-950/20 p-4">
      <p className="text-sm font-medium text-foreground">New sentence locator practice test</p>
      <p className="text-xs text-muted-foreground">
        Paste the inner <code className="rounded bg-muted px-1">sentenceLocator</code> object as JSON
        (see repo file <code className="rounded bg-muted px-1">docs/SENTENCE_LOCATOR_PRACTICE_TEST_JSON.md</code>).
      </p>
      {localError && <p className="text-sm text-destructive">{localError}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Level 0 — locate evidence"
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
            placeholder="e.g. SL-1"
            disabled={disabled}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label>
          Sentence locator JSON <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          disabled={disabled}
          className="mt-1 min-h-[220px] font-mono text-xs"
          spellCheck={false}
        />
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
          <Label>Max attempts</Label>
          <select
            value={maxAttemptsRaw}
            onChange={(e) => setMaxAttemptsRaw(e.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {MAX_ATTEMPTS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Pass type</Label>
          <select
            value={passType}
            onChange={(e) => setPassType(e.target.value as "PERCENTAGE" | "BAND")}
            disabled={disabled}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="PERCENTAGE">Percentage (min pass %)</option>
            <option value="BAND">Band score (student chooses target)</option>
          </select>
        </div>
        {passType === "PERCENTAGE" && (
          <div>
            <Label>Minimum pass %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={passValue}
              onChange={(e) => setPassValue(Number(e.target.value) ?? 0)}
              disabled={disabled}
              className="mt-1"
            />
          </div>
        )}
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
        <Button type="submit" size="sm" disabled={submitting || disabled || !title.trim()}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Create sentence locator test
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" /> Cancel
        </Button>
      </div>
    </form>
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
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [passType, setPassType] = useState<"PERCENTAGE" | "BAND">("BAND");
  const [passValue, setPassValue] = useState(0);
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
          <Label>Max attempts</Label>
          <select
            value={maxAttemptsRaw}
            onChange={(e) => setMaxAttemptsRaw(e.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {MAX_ATTEMPTS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Pass type</Label>
          <select
            value={passType}
            onChange={(e) => setPassType(e.target.value as "PERCENTAGE" | "BAND")}
            disabled={disabled}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="PERCENTAGE">Percentage (min pass %)</option>
            <option value="BAND">Band score (student chooses target)</option>
          </select>
        </div>
        {passType === "PERCENTAGE" && (
          <div>
            <Label>Minimum pass %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={passValue}
              onChange={(e) => setPassValue(Number(e.target.value) ?? 0)}
              disabled={disabled}
              className="mt-1"
            />
          </div>
        )}
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
  initialSentenceLocator: SentenceLocatorContentAuthoringPreview | null;
  locatorLoading: boolean;
  onSave: (p: UpdatePracticeTestPayload) => Promise<void>;
  onCancel: () => void;
  busy: boolean;
}

function PracticeTestEditForm({
  practiceTest,
  initialSentenceLocator,
  locatorLoading,
  onSave,
  onCancel,
  busy,
}: PracticeTestEditFormProps) {
  const [title, setTitle] = useState(practiceTest.title);
  const [contentCode, setContentCode] = useState(practiceTest.contentCode ?? "");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(practiceTest.timeLimitMinutes);
  const [passType, setPassType] = useState(practiceTest.passType as "PERCENTAGE" | "BAND");
  const [passValue, setPassValue] = useState(practiceTest.passValue);
  const [maxAttemptsRaw, setMaxAttemptsRaw] = useState(
    practiceTest.maxAttempts == null || practiceTest.maxAttempts === undefined
      ? "unlimited"
      : String(practiceTest.maxAttempts),
  );
  const [order, setOrder] = useState(practiceTest.order);
  const [locatorJson, setLocatorJson] = useState("");
  const [locatorError, setLocatorError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSentenceLocator = practiceTest.contentFormat === "SENTENCE_LOCATOR";

  useEffect(() => {
    if (!isSentenceLocator) return;
    if (initialSentenceLocator) {
      setLocatorJson(JSON.stringify(initialSentenceLocator, null, 2));
      setLocatorError(null);
    } else if (!locatorLoading) {
      setLocatorJson("");
    }
  }, [isSentenceLocator, initialSentenceLocator, locatorLoading, practiceTest._id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocatorError(null);
    setSubmitting(true);
    try {
      const maxAttempts =
        maxAttemptsRaw === "unlimited"
          ? null
          : Math.max(1, Math.min(99, parseInt(maxAttemptsRaw, 10) || 1));
      const effectivePassValue = passType === "BAND" ? 0 : Math.max(0, Math.min(100, passValue));
      const base: UpdatePracticeTestPayload = {
        title,
        contentCode: contentCode.trim() || undefined,
        timeLimitMinutes,
        passType,
        passValue: effectivePassValue,
        maxAttempts,
        order,
      };
      if (isSentenceLocator) {
        let sentenceLocatorContent: SentenceLocatorContentAuthoringPreview;
        try {
          const parsed = JSON.parse(locatorJson) as unknown;
          if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            setLocatorError("Locator JSON must be an object.");
            return;
          }
          sentenceLocatorContent = parsed as SentenceLocatorContentAuthoringPreview;
        } catch {
          setLocatorError("Invalid JSON.");
          return;
        }
        await onSave({ ...base, sentenceLocatorContent });
      } else {
        await onSave(base);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
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
          <Label className="text-xs">Attempts</Label>
          <select
            value={maxAttemptsRaw}
            onChange={(e) => setMaxAttemptsRaw(e.target.value)}
            disabled={busy}
            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          >
            {MAX_ATTEMPTS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
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
        {passType === "PERCENTAGE" && (
          <div className="w-16">
            <Label className="text-xs">Min %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={passValue}
              onChange={(e) => setPassValue(Number(e.target.value) ?? 0)}
              disabled={busy}
              className="mt-1"
            />
          </div>
        )}
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
      </div>
      {isSentenceLocator && (
        <div className="w-full min-w-0 space-y-1 rounded-md border bg-muted/20 p-2">
          <Label className="text-xs">Sentence locator JSON (full replace)</Label>
          {locatorLoading ? (
            <p className="text-xs text-muted-foreground py-2">Loading current content…</p>
          ) : (
            <Textarea
              value={locatorJson}
              onChange={(e) => setLocatorJson(e.target.value)}
              disabled={busy}
              className="min-h-[160px] font-mono text-xs"
              spellCheck={false}
            />
          )}
          {locatorError && <p className="text-xs text-destructive">{locatorError}</p>}
        </div>
      )}
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
  if (isSentenceLocatorPreviewContent(previewContent)) {
    const sl = previewContent.sentenceLocator;
    const paraCount = sl.paragraphs?.length ?? 0;
    const stmtCount = sl.statements?.length ?? 0;
    return (
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-medium text-sm">
            Preview: {previewContent.title} ({previewContent.timeLimitMinutes} min · pass{" "}
            {previewContent.passType === "PERCENTAGE"
              ? `${previewContent.passValue}%`
              : `band ${previewContent.passValue}`}
            ){" "}
            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
              SL
            </span>
          </h4>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-medium">{sl.passageTitle}</p>
          {sl.passageSubTitle ? (
            <p className="text-muted-foreground text-xs">{sl.passageSubTitle}</p>
          ) : null}
          {sl.instruction ? (
            <p className="text-muted-foreground text-xs line-clamp-3">{sl.instruction}</p>
          ) : null}
          <p className="text-muted-foreground">
            {paraCount} paragraph{paraCount !== 1 ? "s" : ""} · {stmtCount} statement
            {stmtCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    );
  }
  if (isFullMockPreviewContent(previewContent)) {
    const passageCount: number = previewContent.miniTests.length;
    const questionCount = previewContent.miniTests.reduce(
      (n, mt) => n + (mt.questions?.length ?? 0),
      0,
    );
    return (
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">
            Preview: {previewContent.title} ({previewContent.timeLimitMinutes} min · pass{" "}
            {previewContent.passType === "PERCENTAGE"
              ? `${previewContent.passValue}%`
              : `band ${previewContent.passValue}`}
            ){" "}
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
              Full mock
            </span>
          </h4>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {passageCount} passage{passageCount !== 1 ? "s" : ""} · {questionCount} question
          {questionCount !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  if (isProgressiveMcqPreviewContent(previewContent)) {
    const itemCount = previewContent.progressiveMcq.items.length;
    return (
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">
            Preview: {previewContent.title} ({previewContent.timeLimitMinutes} min · pass{" "}
            {previewContent.passType === "PERCENTAGE"
              ? `${previewContent.passValue}%`
              : `band ${previewContent.passValue}`}
            ){" "}
            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-800 dark:bg-violet-900/50 dark:text-violet-200">
              Progressive MCQ
            </span>
          </h4>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {itemCount} context question{itemCount !== 1 ? "s" : ""} · paraphrase engine format
        </p>
      </div>
    );
  }
  if (!("miniTest" in previewContent)) {
    return null;
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
