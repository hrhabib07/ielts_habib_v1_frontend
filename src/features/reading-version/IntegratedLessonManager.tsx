"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createIntegratedLesson,
  updateIntegratedLesson,
  deleteIntegratedLesson,
  type IntegratedLesson,
  type IntegratedLessonBlock,
} from "@/src/lib/api/adminReadingVersions";
import { DeleteConfirmDialog } from "@/src/components/shared/DeleteConfirmDialog";
import { validateIntegratedLessonBlocks } from "./integratedLessonValidation";
import { LessonJsonImportPanel } from "./LessonJsonImportPanel";
import { parseIntegratedLessonJson, serializeIntegratedLessonToJson } from "./integratedLessonJson";
import { LEVEL_0_LESSON_JSON_EXAMPLE } from "./integratedLessonJsonExample";
import { IntegratedLessonPreviewModal } from "@/src/components/reading/IntegratedLessonPreviewModal";
import { buildIntegratedLessonPreviewPayload } from "./integratedLessonPreviewMapper";
import { ChevronDown, Eye, Loader2, Plus, BookOpen } from "lucide-react";

interface IntegratedLessonManagerProps {
  versionId: string;
  lessons: IntegratedLesson[];
  disabled: boolean;
  onLessonsChange: (lessons: IntegratedLesson[]) => void;
  onStepsSync?: () => void;
  levelOrder?: number;
}

function normalizeBlocks(blocks: IntegratedLessonBlock[]): IntegratedLessonBlock[] {
  return blocks.map((b, i) => ({ ...b, order: i }));
}

function LessonEditor({
  lesson,
  disabled,
  onSaved,
  onDeleted,
}: {
  lesson: IntegratedLesson;
  disabled: boolean;
  onSaved: (updated: IntegratedLesson) => void;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState(lesson.title);
  const [blocks, setBlocks] = useState<IntegratedLessonBlock[]>(
    normalizeBlocks(lesson.blocks ?? []),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRestartKey, setPreviewRestartKey] = useState(0);

  const blockSummary = `${blocks.length} blocks · ${blocks.filter((b) => b.type === "NOTE").length} notes · ${blocks.filter((b) => b.type === "MICRO_QUIZ").length} quizzes`;

  const previewPayload = buildIntegratedLessonPreviewPayload(
    { _id: lesson._id, title: title.trim() || lesson.title, lessonCode: lesson.lessonCode, lessonNumber: lesson.lessonNumber },
    normalizeBlocks(blocks),
  );

  const openPreview = () => {
    const validationError = validateIntegratedLessonBlocks(
      title.trim() || lesson.title,
      normalizeBlocks(blocks),
    );
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setPreviewOpen(true);
  };

  const save = async () => {
    setError(null);
    const normalized = normalizeBlocks(blocks);
    const validationError = validateIntegratedLessonBlocks(title, normalized);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateIntegratedLesson(lesson._id, {
        title: title.trim(),
        blocks: normalized,
      });
      onSaved(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    await deleteIntegratedLesson(lesson._id);
    onDeleted();
    setDeleteOpen(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{lesson.lessonCode}</p>
          <p className="truncate font-medium text-foreground">{title || lesson.title}</p>
          <p className="text-xs text-muted-foreground">{blockSummary}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border px-4 py-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <LessonJsonImportPanel
            disabled={disabled}
            getJsonToExport={() => serializeIntegratedLessonToJson(title, blocks)}
            onApply={({ title: importedTitle, blocks: importedBlocks }) => {
              setTitle(importedTitle);
              setBlocks(normalizeBlocks(importedBlocks));
              setError(null);
            }}
          />

          <div>
            <Label>Lesson title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={disabled}
              className="mt-1"
            />
          </div>

          <p className="text-xs text-muted-foreground">{blockSummary}</p>

          {!disabled && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                disabled={blocks.length === 0}
                onClick={openPreview}
              >
                <Eye className="h-3.5 w-3.5" />
                Preview as student
              </Button>
              <Button type="button" size="sm" disabled={saving} onClick={() => void save()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save lesson"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                Delete lesson
              </Button>
            </div>
          )}
        </div>
      )}

      <IntegratedLessonPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={title.trim() || lesson.title}
        lessonCode={lesson.lessonCode}
        content={previewPayload.content}
        instructorGradingBlocks={previewPayload.instructorGradingBlocks}
        restartKey={previewRestartKey}
        onRestart={() => setPreviewRestartKey((k) => k + 1)}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        itemName={lesson.title}
        itemType="lesson"
        onConfirm={() => void confirmDelete()}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}

export function IntegratedLessonManager({
  versionId,
  lessons,
  disabled,
  onLessonsChange,
  onStepsSync,
  levelOrder = 0,
}: IntegratedLessonManagerProps) {
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState(
    levelOrder === 0 ? "Level 0 — The Mastery Foundation" : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = [...lessons].sort((a, b) => a.lessonNumber - b.lessonNumber);

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setError("Lesson title is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const parsed =
        levelOrder === 0
          ? parseIntegratedLessonJson(LEVEL_0_LESSON_JSON_EXAMPLE)
          : null;
      const initialBlocks =
        parsed?.ok && parsed.blocks.length > 0
          ? parsed.blocks
          : [{ type: "NOTE" as const, order: 0, body: { en: "", bn: "" } }];

      const created = await createIntegratedLesson(versionId, {
        title: newTitle.trim(),
        blocks: initialBlocks,
      });
      onLessonsChange([...lessons, created].sort((a, b) => a.lessonNumber - b.lessonNumber));
      onStepsSync?.();
      setNewTitle(levelOrder === 0 ? "Level 0 — The Mastery Foundation" : "");
      setCreating(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create lesson");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Fast workflow</p>
        <ol className="list-decimal pl-4 space-y-0.5">
          <li>Copy the AI prompt (or open the example JSON file in the repo).</li>
          <li>Paste your raw note → AI returns JSON in the Gamlish format.</li>
          <li>Paste JSON here → Apply to lesson → Preview as student → Save lesson.</li>
        </ol>
        <p>
          Example file:{" "}
          <code className="text-[11px]">content/examples/level-00-lesson.example.json</code>
        </p>
      </div>

      {sorted.length === 0 && !creating && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-10 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No lessons yet. Create one to paste JSON.</p>
        </div>
      )}

      {sorted.map((lesson) => (
        <LessonEditor
          key={lesson._id}
          lesson={lesson}
          disabled={disabled}
          onSaved={(updated) => {
            onLessonsChange(
              lessons
                .map((l) => (l._id === updated._id ? updated : l))
                .sort((a, b) => a.lessonNumber - b.lessonNumber),
            );
            onStepsSync?.();
          }}
          onDeleted={() => {
            onLessonsChange(lessons.filter((l) => l._id !== lesson._id));
            onStepsSync?.();
          }}
        />
      ))}

      {!disabled && (
        <>
          {creating ? (
            <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border p-4">
              <div className="min-w-[200px] flex-1">
                <Label>New lesson title</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button type="button" size="sm" disabled={busy} onClick={() => void handleCreate()}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setCreating(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Add lesson
            </Button>
          )}
        </>
      )}
    </div>
  );
}
