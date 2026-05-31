"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getPracticeTestPreviewContent,
  type PracticeTestContentForPreview,
  type GroupTestQuestionGroupForPreview,
  type GroupTestQuestionForPreview,
  isSentenceLocatorPreviewContent,
  isFullMockPreviewContent,
} from "@/src/lib/api/adminReadingVersions";
import {
  updatePassage,
  updateQuestion,
  deleteQuestion,
  updateQuestionSet,
  updatePassageQuestionSet,
  type PassageParagraphInput,
  type QuestionBody,
} from "@/src/lib/api/instructor";
import {
  Loader2,
  X,
  FileText,
  ListChecks,
  FileJson,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  RefreshCw,
  Check,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SentenceLocatorContentEditor } from "./SentenceLocatorContentEditor";

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
  SUMMARY_COMPLETION_WITH_CLUES: "Summary completion (with clues)",
  NOTE_COMPLETION: "Note completion",
  TABLE_COMPLETION: "Table completion",
  FLOW_CHART_COMPLETION: "Flow chart completion",
  DIAGRAM_LABEL_COMPLETION: "Diagram label completion",
  SHORT_ANSWER: "Short answer",
};

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

function formatPassageContent(content: unknown): string {
  if (content == null) return "";
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return (content as { paragraphIndex: number; text: string }[])
    .map((p) => p.text)
    .join("\n\n");
}

function parseContentToParagraphs(text: string): PassageParagraphInput[] | null {
  if (!text.trim()) return null;
  const parts = text.split(/\n\s*\n/).filter((p) => p.trim());
  if (parts.length === 0) return null;
  return parts.map((t, i) => ({ paragraphIndex: i, text: t.trim() }));
}

interface PracticeTestContentEditorProps {
  versionId: string;
  practiceTestId: string;
  practiceTestTitle: string;
  onClose: () => void;
  onSaved?: () => void;
}

type TabId = "passage" | "questions" | "json";

export function PracticeTestContentEditor({
  versionId,
  practiceTestId,
  practiceTestTitle,
  onClose,
  onSaved,
}: PracticeTestContentEditorProps) {
  const [content, setContent] = useState<PracticeTestContentForPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("passage");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPracticeTestPreviewContent(versionId, practiceTestId);
      setContent(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [versionId, practiceTestId]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  if (loading && !content) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-8 dark:bg-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-stone-500" />
          <span className="text-sm text-stone-600 dark:text-stone-400">Loading content…</span>
        </div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="flex max-w-md flex-col gap-4 rounded-xl bg-white p-6 dark:bg-slate-900">
          <p className="text-sm text-destructive">{error}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadContent} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (content && isSentenceLocatorPreviewContent(content)) {
    return (
      <SentenceLocatorContentEditor
        versionId={versionId}
        practiceTestId={practiceTestId}
        practiceTestTitle={practiceTestTitle}
        onClose={onClose}
        onSaved={onSaved}
      />
    );
  }

  if (content && isFullMockPreviewContent(content)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="flex max-w-md flex-col gap-4 rounded-xl bg-white p-6 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Full mock practice test
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            This test has three passages (~60 minutes). Use the preview button to review all
            passages. To change content, edit the bulk JSON and re-import via the Full Mock portal,
            or update passages and question sets in the Reading library.
          </p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="flex flex-col gap-4 rounded-xl bg-white p-6 dark:bg-slate-900">
          <p className="text-sm text-stone-600 dark:text-stone-400">No content to display.</p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  const passage = content.miniTest.passage;
  const questionGroups = content.miniTest.questionGroups ?? [];
  const pqsId = content.miniTest.passageQuestionSetId;
  const flatQuestions = content.miniTest.questions ?? [];

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "passage", label: "Passage", icon: <FileText className="h-4 w-4" /> },
    { id: "questions", label: "Questions", icon: <ListChecks className="h-4 w-4" /> },
    { id: "json", label: "JSON", icon: <FileJson className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 px-6 py-4 dark:border-stone-800">
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Edit practice test content
            </h2>
            <p className="mt-0.5 truncate text-sm text-stone-500 dark:text-stone-400">
              {practiceTestTitle}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 gap-1 border-b border-stone-200 px-6 dark:border-stone-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {saveError && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {saveError}
            </div>
          )}
          {activeTab === "passage" && passage && (
            <PassageTab
              passage={passage}
              onSave={async (data) => {
                setSaving(true);
                setSaveError(null);
                try {
                  await updatePassage(passage._id, data);
                  onSaved?.();
                  await loadContent();
                } catch (e) {
                  setSaveError(e instanceof Error ? e.message : "Failed to update passage");
                } finally {
                  setSaving(false);
                }
              }}
              saving={saving}
            />
          )}
          {activeTab === "questions" && (
            <QuestionsTab
              questionGroups={questionGroups}
              pqsId={pqsId}
              onQuestionUpdate={async (questionId, data) => {
                setSaving(true);
                setSaveError(null);
                try {
                  await updateQuestion(questionId, data);
                  onSaved?.();
                  await loadContent();
                } catch (e) {
                  setSaveError(e instanceof Error ? e.message : "Failed to update question");
                } finally {
                  setSaving(false);
                }
              }}
              onQuestionDelete={async (questionId) => {
                setSaving(true);
                setSaveError(null);
                try {
                  await deleteQuestion(questionId);
                  onSaved?.();
                  await loadContent();
                } catch (e) {
                  setSaveError(e instanceof Error ? e.message : "Failed to delete question");
                } finally {
                  setSaving(false);
                }
              }}
              onGroupUpdate={async (groupId, data) => {
                setSaving(true);
                setSaveError(null);
                try {
                  await updateQuestionSet(groupId, data);
                  onSaved?.();
                  await loadContent();
                } catch (e) {
                  setSaveError(e instanceof Error ? e.message : "Failed to update question group");
                } finally {
                  setSaving(false);
                }
              }}
              onReorderQuestions={async (groupId, questionIds, startQuestionNumber) => {
                setSaving(true);
                setSaveError(null);
                try {
                  const start = startQuestionNumber ?? 1;
                  for (let i = 0; i < questionIds.length; i++) {
                    const qid = questionIds[i];
                    if (!qid) continue;
                    await updateQuestion(qid, { questionNumber: start + i });
                  }
                  onSaved?.();
                  await loadContent();
                } catch (e) {
                  setSaveError(e instanceof Error ? e.message : "Failed to reorder questions");
                } finally {
                  setSaving(false);
                }
              }}
              onPqsUpdate={async (data) => {
                if (!pqsId) return;
                setSaving(true);
                setSaveError(null);
                try {
                  await updatePassageQuestionSet(pqsId, data);
                  onSaved?.();
                  await loadContent();
                } catch (e) {
                  setSaveError(e instanceof Error ? e.message : "Failed to update question set");
                } finally {
                  setSaving(false);
                }
              }}
              saving={saving}
            />
          )}
          {activeTab === "json" && content && (
            <JsonTab content={content} onReload={loadContent} />
          )}
        </div>
      </div>
    </div>
  );
}

function PassageTab({
  passage,
  onSave,
  saving,
}: {
  passage: { _id: string; title: string; subTitle?: string; content: unknown };
  onSave: (data: { title?: string; content?: PassageParagraphInput[] }) => Promise<void>;
  saving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(passage.title);
  const [contentText, setContentText] = useState(formatPassageContent(passage.content));

  const handleSave = async () => {
    const paragraphs = parseContentToParagraphs(contentText);
    if (!paragraphs || paragraphs.length === 0) return;
    await onSave({ title, content: paragraphs });
    setEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-stone-900 dark:text-stone-100">Passage content</h3>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/instructor/passages?edit=${passage._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <ExternalLink className="h-4 w-4" />
            Full editor
          </Link>
          {editing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1.5">
              <Pencil className="h-4 w-4" />
              Quick edit
            </Button>
          )}
        </div>
      </div>
      {editing ? (
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              disabled={saving}
            />
          </div>
          <div>
            <Label>Content (one paragraph per line, separate paragraphs with a blank line)</Label>
            <Textarea
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              rows={16}
              className="mt-1 font-mono text-sm"
              disabled={saving}
              placeholder="Paragraph 1 text...&#10;&#10;Paragraph 2 text..."
            />
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden rounded-xl border-stone-200 p-4 dark:border-stone-800">
          <h4 className="font-medium text-stone-900 dark:text-stone-100">{passage.title}</h4>
          {passage.subTitle && (
            <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{passage.subTitle}</p>
          )}
          <div className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
            {formatPassageContent(passage.content) || "No content."}
          </div>
        </Card>
      )}
    </div>
  );
}

function QuestionsTab({
  questionGroups,
  pqsId,
  onQuestionUpdate,
  onQuestionDelete,
  onGroupUpdate,
  onReorderQuestions,
  onPqsUpdate,
  saving,
}: {
  questionGroups: GroupTestQuestionGroupForPreview[];
  pqsId?: string;
  onQuestionUpdate: (id: string, data: Partial<{ questionBody: QuestionBody; options: string[]; correctAnswer: string | string[] }>) => Promise<void>;
  onQuestionDelete: (id: string) => Promise<void>;
  onGroupUpdate: (groupId: string, data: { instruction?: string }) => Promise<void>;
  onReorderQuestions: (groupId: string, questionIds: string[], startQuestionNumber?: number) => Promise<void>;
  onPqsUpdate: (data: { questionGroupIds?: string[] }) => Promise<void>;
  saving: boolean;
}) {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Edit, remove, or reorder questions. Changes save immediately.
      </p>
      {questionGroups.map((grp) => (
        <div key={grp._id ?? `${grp.startQuestionNumber}-${grp.endQuestionNumber}`}>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-medium text-stone-900 dark:text-stone-100">
              Questions {grp.startQuestionNumber}–{grp.endQuestionNumber}:{" "}
              {QUESTION_TYPE_LABEL[grp.questionType] ?? grp.questionType}
            </span>
            {grp._id && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  const newInst = window.prompt("Instruction:", grp.instruction ?? "");
                  if (newInst !== null && newInst !== grp.instruction) {
                    onGroupUpdate(grp._id!, { instruction: newInst });
                  }
                }}
                disabled={saving}
                className="h-6 text-xs"
              >
                Edit instruction
              </Button>
            )}
          </div>
          {grp.instruction && (
            <p className="mb-3 text-xs italic text-stone-500 dark:text-stone-400">{grp.instruction}</p>
          )}
          <div className="space-y-2">
            {grp.questions.map((q, idx) => (
              <QuestionRow
                key={q._id}
                question={q}
                index={idx}
                total={grp.questions.length}
                onMoveUp={
                  idx > 0 && grp._id
                    ? () => {
                        const gid = grp._id;
                        if (!gid) return;
                        const ids = grp.questions.map((x) => x._id);
                        const a = ids[idx - 1];
                        const b = ids[idx];
                        if (!a || !b) return;
                        ids[idx - 1] = b;
                        ids[idx] = a;
                        onReorderQuestions(gid, ids, grp.startQuestionNumber);
                      }
                    : undefined
                }
                onMoveDown={
                  idx < grp.questions.length - 1 && grp._id
                    ? () => {
                        const gid = grp._id;
                        if (!gid) return;
                        const ids = grp.questions.map((x) => x._id);
                        const a = ids[idx];
                        const b = ids[idx + 1];
                        if (!a || !b) return;
                        ids[idx] = b;
                        ids[idx + 1] = a;
                        onReorderQuestions(gid, ids, grp.startQuestionNumber);
                      }
                    : undefined
                }
                onEdit={() => setEditingQuestionId((id) => (id === q._id ? null : q._id))}
                onDelete={() => setDeleteConfirmId((id) => (id === q._id ? null : q._id))}
                isEditing={editingQuestionId === q._id}
                isDeleteConfirm={deleteConfirmId === q._id}
                onSave={async (data) => {
                  await onQuestionUpdate(q._id, data);
                  setEditingQuestionId(null);
                }}
                onCancelEdit={() => setEditingQuestionId(null)}
                onConfirmDelete={async () => {
                  await onQuestionDelete(q._id);
                  setDeleteConfirmId(null);
                }}
                onCancelDelete={() => setDeleteConfirmId(null)}
                saving={saving}
              />
            ))}
          </div>
        </div>
      ))}
      {pqsId && (
        <p className="text-xs text-stone-500 dark:text-stone-400">
          To change which question groups are in this test, use the{" "}
          <Link href="/dashboard/instructor/passage-question-sets" className="underline">
            Passage Question Sets
          </Link>{" "}
          page.
        </p>
      )}
    </div>
  );
}

function QuestionRow({
  question,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  isEditing,
  isDeleteConfirm,
  onSave,
  onCancelEdit,
  onConfirmDelete,
  onCancelDelete,
  saving,
}: {
  question: GroupTestQuestionForPreview;
  index: number;
  total: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
  isDeleteConfirm: boolean;
  onSave: (data: Partial<{ questionBody: QuestionBody; options: string[]; correctAnswer: string | string[] }>) => Promise<void>;
  onCancelEdit: () => void;
  onConfirmDelete: () => Promise<void>;
  onCancelDelete: () => void;
  saving: boolean;
}) {
  const [bodyJson, setBodyJson] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(
    Array.isArray(question.correctAnswer)
      ? question.correctAnswer.join(", ")
      : (question.correctAnswer ?? ""),
  );
  const [optionsText, setOptionsText] = useState(
    (question.options ?? []).join("\n"),
  );

  const handleEditOpen = () => {
    setBodyJson(JSON.stringify(question.questionBody, null, 2));
    setCorrectAnswer(
      Array.isArray(question.correctAnswer)
        ? question.correctAnswer.join(", ")
        : (question.correctAnswer ?? ""),
    );
    setOptionsText((question.options ?? []).join("\n"));
    onEdit();
  };

  const handleSave = async () => {
    let body: QuestionBody;
    try {
      body = JSON.parse(bodyJson) as QuestionBody;
    } catch {
      return;
    }
    const opts = optionsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const correct = correctAnswer.includes(",")
      ? correctAnswer.split(",").map((s) => s.trim()).filter(Boolean)
      : correctAnswer.trim();
    await onSave({
      questionBody: body,
      ...(opts.length > 0 && { options: opts }),
      correctAnswer: Array.isArray(correct) ? correct : correct,
    });
  };

  const summary = extractQuestionText(question.questionBody).slice(0, 80);
  const correctDisplay = Array.isArray(question.correctAnswer)
    ? question.correctAnswer.join(", ")
    : (question.correctAnswer ?? "—");

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-xl border-stone-200 dark:border-stone-800",
        isEditing && "ring-2 ring-primary/30",
      )}
    >
      <div className="flex items-start gap-2 p-4">
        <div className="flex shrink-0 flex-col gap-0.5">
          {onMoveUp && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoveUp}
              disabled={saving}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
          <span className="text-center text-xs font-medium text-stone-500">
            {question.questionNumber}
          </span>
          {onMoveDown && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onMoveDown}
              disabled={saving}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Question body (JSON)</Label>
                <Textarea
                  value={bodyJson}
                  onChange={(e) => setBodyJson(e.target.value)}
                  rows={6}
                  className="mt-1 font-mono text-xs"
                  disabled={saving}
                />
              </div>
              {(question.options?.length ?? 0) > 0 && (
                <div>
                  <Label className="text-xs">Options (one per line)</Label>
                  <Textarea
                    value={optionsText}
                    onChange={(e) => setOptionsText(e.target.value)}
                    rows={3}
                    className="mt-1 font-mono text-xs"
                    disabled={saving}
                  />
                </div>
              )}
              <div>
                <Label className="text-xs">Correct answer (comma-separated for multiple)</Label>
                <Input
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="mt-1"
                  disabled={saving}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={onCancelEdit} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[15px] text-stone-800 dark:text-stone-200">
                {summary}
                {summary.length >= 80 ? "…" : ""}
              </p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Answer: {correctDisplay}
              </p>
              <div className="mt-2 flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleEditOpen} disabled={saving} className="gap-1.5 h-8">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                {isDeleteConfirm ? (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onConfirmDelete}
                      disabled={saving}
                      className="gap-1.5 h-8"
                    >
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      Confirm delete
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onCancelDelete} disabled={saving} className="h-8">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDelete}
                    disabled={saving}
                    className="gap-1.5 text-destructive hover:bg-destructive/10 h-8"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function JsonTab({
  content,
  onReload,
}: {
  content: PracticeTestContentForPreview;
  onReload: () => void;
}) {
  const jsonText = isSentenceLocatorPreviewContent(content)
    ? JSON.stringify({ sentenceLocator: content.sentenceLocator }, null, 2)
    : JSON.stringify(
        {
          passage: content.miniTest.passage,
          questionGroups: content.miniTest.questionGroups,
          questions: content.miniTest.questions,
        },
        null,
        2,
      );
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        {isSentenceLocatorPreviewContent(content)
          ? "Read-only export of sentence locator authoring data. To change content, use Practice tests → edit (JSON) on the level version."
          : "Export the full content as JSON. Use this to inspect structure or prepare bulk edits. To apply changes, edit the passage or questions in their tabs."}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          {copyFeedback ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <FileJson className="h-4 w-4" />
          )}
          {copyFeedback ? "Copied!" : "Copy JSON"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onReload} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <Textarea
        value={jsonText}
        readOnly
        rows={24}
        className="font-mono text-xs"
      />
    </div>
  );
}
