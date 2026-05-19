"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createIntegratedLesson,
  updateIntegratedLesson,
  deleteIntegratedLesson,
  type IntegratedLesson,
  type IntegratedLessonBlock,
  type IntegratedLessonMicroQuizQuestion,
  type MicroQuizQuestionType,
} from "@/src/lib/api/adminReadingVersions";
import { DeleteConfirmDialog } from "@/src/components/shared/DeleteConfirmDialog";
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2, BookOpen } from "lucide-react";

interface IntegratedLessonManagerProps {
  versionId: string;
  lessons: IntegratedLesson[];
  disabled: boolean;
  onLessonsChange: (lessons: IntegratedLesson[]) => void;
  onStepsSync?: () => void;
}

function emptyNoteBlock(order: number): IntegratedLessonBlock {
  return { type: "NOTE", order, body: "" };
}

function emptyMicroQuizBlock(order: number): IntegratedLessonBlock {
  return {
    type: "MICRO_QUIZ",
    order,
    quizTitle: "Quick check",
    questions: [
      {
        type: "MCQ",
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 1,
      },
    ],
  };
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
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [blocks, setBlocks] = useState<IntegratedLessonBlock[]>(
    normalizeBlocks(lesson.blocks ?? []),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      const updated = await updateIntegratedLesson(lesson._id, {
        title: title.trim(),
        blocks: normalizeBlocks(blocks),
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

  const updateBlock = (index: number, patch: Partial<IntegratedLessonBlock>) => {
    setBlocks((prev) =>
      normalizeBlocks(prev.map((b, i) => (i === index ? { ...b, ...patch } : b))),
    );
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= blocks.length) return;
    const copy = [...blocks];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    setBlocks(normalizeBlocks(copy));
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
          <p className="truncate font-medium text-foreground">{lesson.title}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border px-4 py-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <Label>Lesson title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={disabled}
              className="mt-1"
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Blocks (notes + micro-quizzes)</p>
            {blocks.map((block, index) => (
              <div
                key={`${block.type}-${index}`}
                className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {block.type === "NOTE" ? "Note" : "Micro-quiz"} · #{index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={disabled || index === 0}
                      onClick={() => moveBlock(index, -1)}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={disabled || index === blocks.length - 1}
                      onClick={() => moveBlock(index, 1)}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    {!disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() =>
                          setBlocks(normalizeBlocks(blocks.filter((_, i) => i !== index)))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {block.type === "NOTE" ? (
                  <Textarea
                    value={block.body ?? ""}
                    onChange={(e) => updateBlock(index, { body: e.target.value })}
                    disabled={disabled}
                    rows={6}
                    placeholder="Lesson note (HTML supported)"
                    className="font-mono text-sm"
                  />
                ) : (
                  <>
                    <Input
                      value={block.quizTitle ?? ""}
                      onChange={(e) => updateBlock(index, { quizTitle: e.target.value })}
                      disabled={disabled}
                      placeholder="Micro-quiz title"
                    />
                    {(block.questions ?? []).map((q, qi) => (
                      <MicroQuizQuestionEditor
                        key={qi}
                        question={q}
                        disabled={disabled}
                        onChange={(updated) => {
                          const qs = [...(block.questions ?? [])];
                          qs[qi] = updated;
                          updateBlock(index, { questions: qs });
                        }}
                        onRemove={() => {
                          const qs = (block.questions ?? []).filter((_, i) => i !== qi);
                          updateBlock(index, { questions: qs });
                        }}
                      />
                    ))}
                    {!disabled && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const qs = [...(block.questions ?? [])];
                          qs.push({
                            type: "MCQ",
                            questionText: "",
                            options: ["", "", "", ""],
                            correctAnswer: "",
                            marks: 1,
                          });
                          updateBlock(index, { questions: qs });
                        }}
                      >
                        Add question
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {!disabled && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBlocks(normalizeBlocks([...blocks, emptyNoteBlock(blocks.length)]))}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add note
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setBlocks(normalizeBlocks([...blocks, emptyMicroQuizBlock(blocks.length)]))
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add micro-quiz
              </Button>
            </div>
          )}

          {!disabled && (
            <div className="flex flex-wrap gap-2 pt-2">
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

      <DeleteConfirmDialog
        open={deleteOpen}
        title="Delete lesson?"
        description="This removes the lesson and its step from this version."
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

function MicroQuizQuestionEditor({
  question,
  disabled,
  onChange,
  onRemove,
}: {
  question: IntegratedLessonMicroQuizQuestion;
  disabled: boolean;
  onChange: (q: IntegratedLessonMicroQuizQuestion) => void;
  onRemove: () => void;
}) {
  const types: MicroQuizQuestionType[] = ["MCQ", "TFNG", "FILL_BLANK", "MATCHING"];

  return (
    <div className="rounded-md border border-border bg-background p-3 space-y-2">
      <div className="flex gap-2">
        <select
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
          value={question.type}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...question, type: e.target.value as MicroQuizQuestionType })
          }
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {!disabled && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>
      <Input
        value={question.questionText}
        onChange={(e) => onChange({ ...question, questionText: e.target.value })}
        disabled={disabled}
        placeholder="Question text"
      />
      {(question.type === "MCQ" || question.type === "MATCHING") && (
        <Textarea
          value={(question.options ?? []).join("\n")}
          onChange={(e) =>
            onChange({
              ...question,
              options: e.target.value.split("\n").map((s) => s.trim()),
            })
          }
          disabled={disabled}
          rows={4}
          placeholder="One option per line"
        />
      )}
      <Input
        value={
          Array.isArray(question.correctAnswer)
            ? question.correctAnswer.join(", ")
            : question.correctAnswer
        }
        onChange={(e) => onChange({ ...question, correctAnswer: e.target.value.trim() })}
        disabled={disabled}
        placeholder="Correct answer"
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
}: IntegratedLessonManagerProps) {
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = [...lessons].sort((a, b) => a.lessonNumber - b.lessonNumber);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createIntegratedLesson(versionId, {
        title: newTitle.trim(),
        blocks: [emptyNoteBlock(0)],
      });
      onLessonsChange([...lessons, created].sort((a, b) => a.lessonNumber - b.lessonNumber));
      onStepsSync?.();
      setNewTitle("");
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
      <p className="text-sm text-muted-foreground">
        Each lesson is one step for students: read notes, then pass micro-quizzes (unlimited retries).
      </p>

      {sorted.length === 0 && !creating && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-10 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No lessons yet.</p>
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
                  placeholder="e.g. Skimming strategies"
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
