"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getPracticeTestPreviewContent,
  isSentenceLocatorPreviewContent,
  listPracticeTestStatementFeedback,
  patchSentenceLocatorPassageSentence,
  patchSentenceLocatorStatement,
  type InstructorStatementFeedbackRow,
  type SentenceLocatorContentAuthoringPreview,
  type SentenceLocatorStatementAuthoringPreview,
} from "@/src/lib/api/adminReadingVersions";
import { STATEMENT_FEEDBACK_REASONS } from "@/src/lib/reading/statementFeedbackReasons";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BookOpen,
  Check,
  Loader2,
  MessageSquareWarning,
  RefreshCw,
  Save,
  Sparkles,
  X,
} from "lucide-react";

/** Suggested easier wording for common “chocolate / Fry / first bar” statement 4 patterns */
const EASIER_STATEMENT_PATCH = {
  statement:
    "Fry pressed his cocoa paste into a shape, creating the world's first solid chocolate bar.",
  anchorKeywords: ["Fry", "paste", "shape", "first", "solid", "chocolate", "bar"],
  difficulty: "EASY" as const,
  gamlishHack:
    "Match the sentence that mentions pressing paste into a shape and the first solid bar — not who invented chocolate in general.",
};

type TabId = "passage" | "statements" | "feedback";

interface SentenceLocatorContentEditorProps {
  versionId: string;
  practiceTestId: string;
  practiceTestTitle: string;
  onClose: () => void;
  onSaved?: () => void;
}

export function SentenceLocatorContentEditor({
  versionId,
  practiceTestId,
  practiceTestTitle,
  onClose,
  onSaved,
}: SentenceLocatorContentEditorProps) {
  const [content, setContent] = useState<SentenceLocatorContentAuthoringPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("statements");
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [feedbackRows, setFeedbackRows] = useState<InstructorStatementFeedbackRow[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [effectivePracticeTestId, setEffectivePracticeTestId] = useState(practiceTestId);

  useEffect(() => {
    setEffectivePracticeTestId(practiceTestId);
  }, [practiceTestId]);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPracticeTestPreviewContent(versionId, practiceTestId);
      if (!isSentenceLocatorPreviewContent(data)) {
        setError("Not a sentence locator practice test");
        return;
      }
      setEffectivePracticeTestId(data.practiceTestId);
      setContent(structuredClone(data.sentenceLocator));
      const first = [...data.sentenceLocator.statements].sort((a, b) => a.order - b.order)[0];
      setSelectedStatementId((prev) => prev ?? first?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [versionId, practiceTestId]);

  const loadFeedback = useCallback(async () => {
    setFeedbackLoading(true);
    try {
      const items = await listPracticeTestStatementFeedback(effectivePracticeTestId, 80);
      setFeedbackRows(items);
    } catch {
      setFeedbackRows([]);
    } finally {
      setFeedbackLoading(false);
    }
  }, [effectivePracticeTestId]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  useEffect(() => {
    if (effectivePracticeTestId) void loadFeedback();
  }, [loadFeedback, effectivePracticeTestId]);

  const statements = useMemo(
    () => [...(content?.statements ?? [])].sort((a, b) => a.order - b.order),
    [content?.statements],
  );

  const selected = statements.find((s) => s.id === selectedStatementId) ?? null;

  const [draft, setDraft] = useState<SentenceLocatorStatementAuthoringPreview | null>(null);

  useEffect(() => {
    if (selected) {
      setDraft({ ...selected, anchorKeywords: [...(selected.anchorKeywords ?? [])] });
    } else {
      setDraft(null);
    }
  }, [selected]);

  const updateLocalContent = (next: SentenceLocatorContentAuthoringPreview) => {
    setContent(next);
    onSaved?.();
  };

  const saveStatement = async () => {
    if (!draft || !selectedStatementId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const next = await patchSentenceLocatorStatement(effectivePracticeTestId, selectedStatementId, {
        statement: draft.statement,
        targetParagraphIndex: draft.targetParagraphIndex,
        targetSentenceIndex: draft.targetSentenceIndex,
        anchorKeywords: draft.anchorKeywords,
        gamlishHack: draft.gamlishHack,
        difficulty: draft.difficulty,
        order: draft.order,
      });
      updateLocalContent(next);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const savePassageSentence = async (
    paragraphIndex: number,
    sentenceIndex: number,
    text: string,
  ) => {
    setSaving(true);
    setSaveError(null);
    try {
      const next = await patchSentenceLocatorPassageSentence(
        effectivePracticeTestId,
        paragraphIndex,
        sentenceIndex,
        text,
      );
      updateLocalContent(next);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const applyEasierStatement4 = async () => {
    if (!selectedStatementId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const next = await patchSentenceLocatorStatement(
        effectivePracticeTestId,
        selectedStatementId,
        EASIER_STATEMENT_PATCH,
      );
      updateLocalContent(next);
      const st = next.statements.find((s) => s.id === selectedStatementId);
      if (st) setDraft({ ...st, anchorKeywords: [...(st.anchorKeywords ?? [])] });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Apply failed");
    } finally {
      setSaving(false);
    }
  };

  const feedbackByStatement = useMemo(() => {
    const map = new Map<string, InstructorStatementFeedbackRow[]>();
    for (const row of feedbackRows) {
      const list = map.get(row.statementId) ?? [];
      list.push(row);
      map.set(row.statementId, list);
    }
    return map;
  }, [feedbackRows]);

  const showEasierSuggestion =
    draft != null &&
    draft.order === 4 &&
    (draft.targetParagraphIndex === 2 || draft.targetParagraphIndex === 3) &&
    draft.targetSentenceIndex === 3;

  if (loading && !content) {
    return (
      <EditorShell title={practiceTestTitle} onClose={onClose}>
        <div className="flex flex-1 items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-stone-500" />
        </div>
      </EditorShell>
    );
  }

  if (error && !content) {
    return (
      <EditorShell title={practiceTestTitle} onClose={onClose}>
        <div className="p-8 text-center text-sm text-destructive">{error}</div>
      </EditorShell>
    );
  }

  if (!content) return null;

  return (
    <EditorShell title={practiceTestTitle} onClose={onClose}>
      <div className="flex shrink-0 gap-1 border-b border-stone-200 px-4 py-2 dark:border-stone-800">
        {(
          [
            { id: "statements" as const, label: "Statements", icon: Sparkles },
            { id: "passage" as const, label: "Passage", icon: BookOpen },
            { id: "feedback" as const, label: "Student feedback", icon: MessageSquareWarning },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[#1e3a8a] text-white dark:bg-[#3b82f6]"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.id === "feedback" && feedbackRows.length > 0 ? (
              <span className="rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                {feedbackRows.length}
              </span>
            ) : null}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => void loadFeedback()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {saveError ? (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {saveError}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {activeTab === "statements" && (
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                All statements
              </p>
              {statements.map((st) => {
                const fb = feedbackByStatement.get(st.id)?.length ?? 0;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStatementId(st.id)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                      selectedStatementId === st.id
                        ? "border-[#1e3a8a] bg-[#1e3a8a]/5 dark:border-[#3b82f6] dark:bg-[#1e3a8a]/15"
                        : "border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900",
                    )}
                  >
                    <span className="font-semibold text-foreground">#{st.order}</span>
                    <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">
                      {st.statement}
                    </span>
                    <span className="mt-1 block text-[10px] text-muted-foreground">
                      P{st.targetParagraphIndex + 1} · S{st.targetSentenceIndex + 1}
                      {fb > 0 ? ` · ${fb} feedback` : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {draft ? (
              <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <h3 className="text-base font-semibold text-foreground">
                  Edit statement {draft.order}
                </h3>

                {showEasierSuggestion ? (
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Students often find statement 4 too tricky
                    </p>
                    <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-200/80">
                      Apply a clearer statement aligned to paragraph 3, sentence 4 (first solid bar).
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="mt-3"
                      variant="outline"
                      disabled={saving}
                      onClick={() => void applyEasierStatement4()}
                    >
                      Apply suggested easier wording
                    </Button>
                  </div>
                ) : null}

                <div>
                  <Label>Statement text (use **word** for anchor highlights)</Label>
                  <Textarea
                    value={draft.statement}
                    onChange={(e) => setDraft({ ...draft, statement: e.target.value })}
                    rows={4}
                    className="mt-1 font-mono text-sm"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Target paragraph index (0-based)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.targetParagraphIndex}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          targetParagraphIndex: Number(e.target.value),
                        })
                      }
                      className="mt-1"
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      UI “Paragraph {draft.targetParagraphIndex + 1}”
                    </p>
                  </div>
                  <div>
                    <Label>Target sentence index (0-based)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.targetSentenceIndex}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          targetSentenceIndex: Number(e.target.value),
                        })
                      }
                      className="mt-1"
                    />
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      UI “Sentence {draft.targetSentenceIndex + 1}”
                    </p>
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <select
                      value={draft.difficulty ?? "MEDIUM"}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          difficulty: e.target.value as "EASY" | "MEDIUM" | "HARD",
                        })
                      }
                      className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Anchor keywords (comma-separated)</Label>
                  <Input
                    value={(draft.anchorKeywords ?? []).join(", ")}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        anchorKeywords: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Coach note (gamlishHack)</Label>
                  <Textarea
                    value={draft.gamlishHack ?? ""}
                    onChange={(e) => setDraft({ ...draft, gamlishHack: e.target.value })}
                    rows={3}
                    className="mt-1 text-sm"
                  />
                </div>

                <Button type="button" disabled={saving} onClick={() => void saveStatement()} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save statement
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a statement to edit.</p>
            )}
          </div>
        )}

        {activeTab === "passage" && (
          <div className="mx-auto max-w-3xl space-y-6">
            <div>
              <Label>Passage title</Label>
              <p className="mt-1 text-lg font-semibold">{content.passageTitle}</p>
              {content.passageSubTitle ? (
                <p className="text-sm text-muted-foreground">{content.passageSubTitle}</p>
              ) : null}
            </div>
            {content.paragraphs
              .sort((a, b) => a.paragraphIndex - b.paragraphIndex)
              .map((para) => (
                <div
                  key={para.paragraphIndex}
                  className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
                >
                  <p className="mb-3 text-sm font-semibold text-foreground">
                    Paragraph {para.paragraphIndex + 1}{" "}
                    <span className="font-normal text-muted-foreground">
                      (index {para.paragraphIndex})
                    </span>
                  </p>
                  <div className="space-y-3">
                    {para.sentences.map((sent, si) => (
                      <PassageSentenceEditor
                        key={`${para.paragraphIndex}-${si}`}
                        label={`Sentence ${si + 1}`}
                        text={sent}
                        disabled={saving}
                        onSave={(text) =>
                          void savePassageSentence(para.paragraphIndex, si, text)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="mx-auto max-w-3xl space-y-4">
            <p className="text-sm text-muted-foreground">
              Feedback appears after students submit a practice test and report issues on the review
              page. Publish an updated draft version after you fix statements.
            </p>
            {feedbackLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
            ) : feedbackRows.length === 0 ? (
              <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                No student feedback yet for this test.
              </p>
            ) : (
              feedbackRows.map((row) => {
                const reasonLabel =
                  STATEMENT_FEEDBACK_REASONS.find((r) => r.value === row.reason)?.label ??
                  row.reason;
                const st = statements.find((s) => s.id === row.statementId);
                return (
                  <div
                    key={row._id}
                    className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Statement {row.statementOrder}
                          {st ? `: ${st.statement.slice(0, 80)}…` : ""}
                        </p>
                        <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">{reasonLabel}</p>
                        {row.comment ? (
                          <p className="mt-1 text-xs text-muted-foreground">{row.comment}</p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedStatementId(row.statementId);
                          setActiveTab("statements");
                        }}
                      >
                        Edit statement
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </EditorShell>
  );
}

function PassageSentenceEditor({
  label,
  text,
  disabled,
  onSave,
}: {
  label: string;
  text: string;
  disabled: boolean;
  onSave: (text: string) => void;
}) {
  const [local, setLocal] = useState(text);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLocal(text);
    setDirty(false);
  }, [text]);

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Textarea
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          setDirty(e.target.value !== text);
        }}
        rows={2}
        className="text-sm"
      />
      {dirty ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled}
          className="gap-1"
          onClick={() => onSave(local)}
        >
          <Check className="h-3.5 w-3.5" />
          Save sentence
        </Button>
      ) : null}
    </div>
  );
}

function EditorShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 p-0 sm:p-4">
      <div className="flex h-full w-full max-w-6xl flex-col rounded-none border-0 bg-white shadow-2xl dark:bg-slate-950 sm:my-4 sm:h-[calc(100%-2rem)] sm:rounded-2xl sm:border sm:border-stone-200 dark:sm:border-stone-800">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 px-4 py-3 dark:border-stone-800 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-stone-900 dark:text-stone-100">
              Sentence locator editor
            </h2>
            <p className="truncate text-sm text-stone-500 dark:text-stone-400">{title}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
