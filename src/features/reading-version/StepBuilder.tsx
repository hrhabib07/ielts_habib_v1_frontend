"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createStep,
  updateStep,
  deleteStep,
  insertStepAt,
  reorderSteps,
  type ReadingLevelStep,
  type ReadingStepType,
  type CreateStepPayload,
  type UpdateStepPayload,
  type StepQuizPassType,
  type StepQuizAttemptPolicy,
  type PracticeTest,
} from "@/src/lib/api/adminReadingVersions";
import {
  listLearningContents,
  type LearningContent,
} from "@/src/lib/api/learningContents";
import { listQuizContent, type ReadingQuizContent } from "@/src/lib/api/quizContent";
import { Pencil, Trash2, Plus, Loader2, X, Check, ChevronUp, ChevronDown } from "lucide-react";

const STEP_TYPE_LABELS: Record<ReadingStepType, string> = {
  INSTRUCTION: "Instruction",
  VIDEO: "Video",
  PRACTICE_TEST: "Practice Test",
  QUIZ: "Quiz",
  VOCABULARY_TEST: "Vocabulary Test",
  PASSAGE_QUESTION_SET: "Passage Q Set",
  FINAL_EVALUATION: "Final Evaluation",
};

const FINAL_QUIZ_PRESET = "FINAL_QUIZ" as const;
type StepTypeOption = ReadingStepType | typeof FINAL_QUIZ_PRESET;

function optionToStepType(option: StepTypeOption): ReadingStepType {
  return option === FINAL_QUIZ_PRESET ? "QUIZ" : option;
}

interface StepBuilderProps {
  versionId: string;
  steps: ReadingLevelStep[];
  practiceTests?: PracticeTest[];
  disabled: boolean;
  onStepsChange: (steps: ReadingLevelStep[]) => void;
}

export function StepBuilder({
  versionId,
  steps,
  practiceTests = [],
  disabled,
  onStepsChange,
}: StepBuilderProps) {
  const [contents, setContents] = useState<LearningContent[]>([]);
  const [quizContents, setQuizContents] = useState<ReadingQuizContent[]>([]);
  const [contentsLoaded, setContentsLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [insertAfterOrder, setInsertAfterOrder] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadContents = async (force = false) => {
    if (!force && contentsLoaded) return;
    setError(null);
    try {
      const [list, quizzes] = await Promise.all([
        listLearningContents(),
        listQuizContent({ isActive: true }),
      ]);
      setContents(Array.isArray(list) ? list : []);
      setQuizContents(Array.isArray(quizzes) ? quizzes : []);
      setContentsLoaded(true);
    } catch (e: unknown) {
      setContents([]);
      setQuizContents([]);
      setContentsLoaded(true);
      setError(e instanceof Error ? e.message : "Failed to load contents");
    }
  };

  const loadQuizzesOnly = async () => {
    setError(null);
    try {
      const quizzes = await listQuizContent({ isActive: true });
      setQuizContents(Array.isArray(quizzes) ? quizzes : []);
    } catch {
      setQuizContents([]);
    }
  };

  const handleAdd = async () => {
    setError(null);
    setContentsLoaded(false);
    await loadContents(true);
    setAdding(true);
  };

  const handleUpdate = async (stepId: string, payload: UpdateStepPayload) => {
    setError(null);
    setBusyId(stepId);
    try {
      const updated = await updateStep(stepId, payload);
      onStepsChange(
        steps.map((s) => (s._id === stepId ? updated : s)).sort((a, b) => a.order - b.order),
      );
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update step");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (stepId: string) => {
    setError(null);
    setBusyId(stepId);
    try {
      const updatedSteps = await deleteStep(stepId);
      onStepsChange(updatedSteps.length > 0 ? updatedSteps : steps.filter((s) => s._id !== stepId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete step");
    } finally {
      setBusyId(null);
    }
  };

  const sortedStepIds = [...steps].sort((a, b) => a.order - b.order).map((s) => s._id);

  const handleMoveUp = async (stepId: string) => {
    const idx = sortedStepIds.indexOf(stepId);
    if (idx <= 0) return;
    setError(null);
    setBusyId(stepId);
    try {
      const reordered = [...sortedStepIds];
      [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
      const updated = await reorderSteps(versionId, reordered);
      onStepsChange(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reorder");
    } finally {
      setBusyId(null);
    }
  };

  const handleMoveDown = async (stepId: string) => {
    const idx = sortedStepIds.indexOf(stepId);
    if (idx < 0 || idx >= sortedStepIds.length - 1) return;
    setError(null);
    setBusyId(stepId);
    try {
      const reordered = [...sortedStepIds];
      [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
      const updated = await reorderSteps(versionId, reordered);
      onStepsChange(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reorder");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (payload: CreateStepPayload, opts?: { insertAtPosition?: number }) => {
    setError(null);
    try {
      if (opts?.insertAtPosition != null) {
        const { order: _o, ...rest } = payload;
        const updatedSteps = await insertStepAt(versionId, opts.insertAtPosition, rest);
        onStepsChange(updatedSteps.length > 0 ? updatedSteps : [...steps]);
      } else {
        const created = await createStep(versionId, payload);
        onStepsChange([...steps, created].sort((a, b) => a.order - b.order));
      }
      setAdding(false);
      setInsertAfterOrder(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create step");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Steps</CardTitle>
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={adding}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add step
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {adding && (
          <StepForm
            steps={steps}
            nextOrder={steps.length > 0 ? Math.max(...steps.map((s) => s.order)) + 1 : 1}
            insertAtPositionDefault={insertAfterOrder != null ? insertAfterOrder + 1 : undefined}
            contents={contents}
            quizContents={quizContents}
            practiceTests={practiceTests}
            onSave={handleCreate}
            onCancel={() => {
              setAdding(false);
              setInsertAfterOrder(null);
            }}
            onRetryQuizzes={loadQuizzesOnly}
            disabled={disabled}
          />
        )}
        <ul className="space-y-2">
          {steps
            .sort((a, b) => a.order - b.order)
            .map((step) => (
              <li key={step._id} className="flex items-center gap-2 rounded-md border p-3">
                {editingId === step._id ? (
                  <StepEditForm
                    step={step}
                    contents={contents}
                    quizContents={quizContents}
                    practiceTests={practiceTests}
                    onSave={(p) => handleUpdate(step._id, p)}
                    onCancel={() => setEditingId(null)}
                    onLoadContents={loadContents}
                    busy={busyId === step._id}
                  />
                ) : (
                  <>
                    <span className="text-muted-foreground w-8">#{step.order}</span>
                    <span className="font-medium flex-1 min-w-0">
                      {step.stepType === "QUIZ" && step.isFinalQuiz === true ? (
                        <span className="mr-2 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          FINAL_QUIZ
                        </span>
                      ) : null}
                      {STEP_TYPE_LABELS[step.stepType] ?? step.stepType} — {step.title}
                    </span>
                    {!disabled && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => {
                            setInsertAfterOrder(step.order);
                            setAdding(true);
                            loadContents(true);
                          }}
                        >
                          Insert after
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Move up"
                          onClick={() => handleMoveUp(step._id)}
                          disabled={busyId === step._id || sortedStepIds.indexOf(step._id) <= 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Move down"
                          onClick={() => handleMoveDown(step._id)}
                          disabled={
                            busyId === step._id ||
                            sortedStepIds.indexOf(step._id) >= sortedStepIds.length - 1
                          }
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Edit"
                          onClick={async () => {
                            await loadContents(true);
                            setEditingId(step._id);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          title="Delete"
                          onClick={() => handleDelete(step._id)}
                          disabled={busyId === step._id}
                        >
                          {busyId === step._id ? (
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
      </CardContent>
    </Card>
  );
}

function quizSummary(q: ReadingQuizContent): string {
  const code = q.contentCode ? `[${q.contentCode}] ` : "";
  const groups = q.groups?.length ?? 0;
  const questions = q.groups?.reduce((s, g) => s + (g.questions?.length ?? 0), 0) ?? 0;
  return `${code}${q.title} — ${groups} group(s), ${questions} question(s)`;
}

interface StepFormProps {
  steps: ReadingLevelStep[];
  nextOrder: number;
  /** When set, position dropdown defaults to "After step N" (insert at this 1-based position). */
  insertAtPositionDefault?: number;
  contents: LearningContent[];
  quizContents: ReadingQuizContent[];
  practiceTests: PracticeTest[];
  onSave: (p: CreateStepPayload, opts?: { insertAtPosition?: number }) => Promise<void>;
  onCancel: () => void;
  onRetryQuizzes?: () => Promise<void>;
  disabled: boolean;
}

const QUIZ_STEP_TYPES: ReadingStepType[] = ["QUIZ", "VOCABULARY_TEST"];

const POS_AT_END = 0;

function StepForm({
  steps,
  nextOrder,
  insertAtPositionDefault,
  contents,
  quizContents,
  practiceTests,
  onSave,
  onCancel,
  onRetryQuizzes,
  disabled,
}: StepFormProps) {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const positionOptions: { label: string; value: number }[] = [
    { label: "At end", value: POS_AT_END },
    ...sortedSteps.map((s) => ({
      label: `After step ${s.order}`,
      value: s.order + 1,
    })),
  ];
  const [typeSelectValue, setTypeSelectValue] = useState<StepTypeOption>("INSTRUCTION");
  const stepType = optionToStepType(typeSelectValue);
  const [title, setTitle] = useState("");
  const [insertPosition, setInsertPosition] = useState<number>(
    insertAtPositionDefault ?? POS_AT_END,
  );
  const order = insertPosition === POS_AT_END ? nextOrder : insertPosition;
  const [contentId, setContentId] = useState("");
  const [practiceTestId, setPracticeTestId] = useState("");
  const [useQuizPool, setUseQuizPool] = useState(false);
  const [contentIds, setContentIds] = useState<string[]>([]);
  const [advanceOnMaxAttemptsExhausted, setAdvanceOnMaxAttemptsExhausted] = useState(false);
  const [isFinalQuiz, setIsFinalQuiz] = useState(false);
  const [passType, setPassType] = useState<StepQuizPassType>("PERCENTAGE");
  const [passValue, setPassValue] = useState(60);
  const [attemptPolicy, setAttemptPolicy] = useState<StepQuizAttemptPolicy>("UNLIMITED");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const showQuizConfig = QUIZ_STEP_TYPES.includes(stepType);
  const showPracticeTestConfig = stepType === "PRACTICE_TEST";
  const isFinalQuizPresetSelected = typeSelectValue === FINAL_QUIZ_PRESET;
  const quizPoolValid = !useQuizPool || contentIds.length >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (showQuizConfig && !useQuizPool && !contentId.trim()) return;
    if (showQuizConfig && useQuizPool && contentIds.length < 1) return;
    if (showPracticeTestConfig && !practiceTestId.trim()) return;
    setSubmitting(true);
    try {
      await onSave(
        {
          stepType,
          title: title.trim(),
          order,
          contentId: showPracticeTestConfig ? null : (useQuizPool ? null : (contentId || null)),
          contentIds: useQuizPool && contentIds.length > 0 ? contentIds : null,
          practiceTestId: showPracticeTestConfig ? (practiceTestId || null) : null,
          ...(showQuizConfig && {
            isFinalQuiz,
            passType,
            passValue,
            attemptPolicy: useQuizPool ? "LIMITED" : attemptPolicy,
            maxAttempts: useQuizPool ? contentIds.length : (attemptPolicy === "LIMITED" ? maxAttempts : undefined),
            advanceOnMaxAttemptsExhausted: useQuizPool ? advanceOnMaxAttemptsExhausted : undefined,
          }),
        },
        insertPosition > 0 ? { insertAtPosition: insertPosition } : undefined,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const addQuizToPool = () => {
    const firstId = quizContents[0]?._id;
    if (firstId) setContentIds((prev) => [...prev, firstId]);
  };
  const removeFromPool = (index: number) => {
    setContentIds((prev) => prev.filter((_, i) => i !== index));
  };
  const setPoolQuizAt = (index: number, quizId: string) => {
    setContentIds((prev) => {
      const next = [...prev];
      next[index] = quizId;
      return next;
    });
  };
  const movePoolQuiz = (index: number, dir: 1 | -1) => {
    const next = index + dir;
    if (next < 0 || next >= contentIds.length) return;
    setContentIds((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-md border p-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Type</Label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={typeSelectValue}
            onChange={(e) => {
              const v = e.target.value as StepTypeOption;
              setTypeSelectValue(v);

              if (v === FINAL_QUIZ_PRESET) {
                setContentId("");
                setIsFinalQuiz(true);
                setPassType("PERCENTAGE");
                setPassValue(60);
                setAttemptPolicy("UNLIMITED");
                setMaxAttempts(1);
                return;
              }

              const nextStepType = optionToStepType(v);
              if (nextStepType === "PRACTICE_TEST") {
                setContentId("");
                setPracticeTestId("");
                setIsFinalQuiz(false);
              } else if (!QUIZ_STEP_TYPES.includes(nextStepType)) {
                setContentId("");
                setPracticeTestId("");
                setIsFinalQuiz(false);
              }
            }}
            disabled={disabled}
          >
            <option value={FINAL_QUIZ_PRESET}>Final Quiz</option>
            {(Object.keys(STEP_TYPE_LABELS) as ReadingStepType[]).map((t) => (
              <option key={t} value={t}>
                {STEP_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Position</Label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={insertPosition}
            onChange={(e) => setInsertPosition(Number(e.target.value))}
            disabled={disabled}
          >
            {positionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {insertPosition === POS_AT_END ? "New step will be added at the end." : `New step will be inserted at position ${insertPosition}.`}
          </p>
        </div>
      </div>
      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Step title"
          disabled={disabled}
        />
      </div>
      {showPracticeTestConfig ? (
        <div className="space-y-1">
          <Label>Practice Test (required)</Label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={practiceTestId}
            onChange={(e) => setPracticeTestId(e.target.value)}
            disabled={disabled}
            required
          >
            <option value="">— Select practice test —</option>
            {practiceTests.map((pt) => (
              <option key={pt._id} value={pt._id}>
                {pt.contentCode ? `[${pt.contentCode}] ` : ""}{pt.title} ({pt.timeLimitMinutes} min · pass {pt.passType === "PERCENTAGE" ? `${pt.passValue}%` : `band ${pt.passValue}`})
              </option>
            ))}
          </select>
          {practiceTests.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No practice tests for this version. Create them in Dashboard → Practice Tests first.
            </p>
          )}
        </div>
      ) : showQuizConfig ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="quiz-mode-single"
                checked={!useQuizPool}
                onChange={() => setUseQuizPool(false)}
                disabled={disabled}
                className="rounded border-input"
              />
              <label htmlFor="quiz-mode-single" className="text-sm">Single quiz</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="quiz-mode-pool"
                checked={useQuizPool}
                onChange={() => setUseQuizPool(true)}
                disabled={disabled}
                className="rounded border-input"
              />
              <label htmlFor="quiz-mode-pool" className="text-sm">Quiz pool (different quiz per attempt, final test)</label>
            </div>
          </div>
          {!useQuizPool ? (
            <div className="space-y-1">
              <Label>Quiz Content (required)</Label>
              <select
                className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                disabled={disabled}
                required
              >
                <option value="">— Select quiz —</option>
                {quizContents.map((q) => (
                  <option key={q._id} value={q._id}>
                    {quizSummary(q)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Quiz pool (attempt 1 → first, attempt 2 → second, …)</Label>
              <p className="text-xs text-muted-foreground">
                Add 5–10 quizzes; student gets one per attempt. Pass any to advance. If you enable &quot;Advance with average&quot;, they advance after all attempts with average score.
              </p>
              {contentIds.map((id, idx) => (
                <div key={`${id}-${idx}`} className="flex items-center gap-2">
                  <span className="w-6 text-sm font-medium text-muted-foreground">{idx + 1}.</span>
                  <select
                    className="h-9 flex-1 rounded-md border border-input bg-transparent px-2 text-sm"
                    value={id}
                    onChange={(e) => setPoolQuizAt(idx, e.target.value)}
                    disabled={disabled}
                  >
                    <option value="">— Select quiz —</option>
                    {quizContents.map((q) => (
                      <option key={q._id} value={q._id}>
                        {quizSummary(q)}
                      </option>
                    ))}
                  </select>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => movePoolQuiz(idx, -1)} disabled={idx === 0 || disabled}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => movePoolQuiz(idx, 1)} disabled={idx === contentIds.length - 1 || disabled}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFromPool(idx)} disabled={contentIds.length <= 1 || disabled}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addQuizToPool} disabled={quizContents.length === 0 || contentIds.length >= 20 || disabled}>
                <Plus className="h-4 w-4 mr-1" />
                Add quiz to pool
              </Button>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="advance-on-exhausted-new"
                  checked={advanceOnMaxAttemptsExhausted}
                  onChange={(e) => setAdvanceOnMaxAttemptsExhausted(e.target.checked)}
                  disabled={disabled}
                  className="rounded border-input"
                />
                <label htmlFor="advance-on-exhausted-new" className="text-sm">Advance with average score when all attempts used (without passing)</label>
              </div>
            </div>
          )}
          {quizContents.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>No quizzes loaded.</span>
              {onRetryQuizzes ? (
                <Button type="button" variant="outline" size="sm" onClick={() => onRetryQuizzes()} disabled={disabled}>
                  Retry
                </Button>
              ) : null}
              <span>Create one in Dashboard → Quiz Content if needed.</span>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Label>Content (optional)</Label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            disabled={disabled}
          >
            <option value="">— None —</option>
            {contents.map((c) => (
              <option key={c._id} value={c._id}>
                {c.contentCode ? `[${c.contentCode}] ` : ""}{c.title}
              </option>
            ))}
          </select>
        </div>
      )}
      {showQuizConfig && (
        <div className="space-y-3 rounded-md border border-border/50 bg-muted/30 p-3">
          <Label className="text-sm font-medium">Final quiz & pass settings</Label>
          {isFinalQuizPresetSelected && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
              <span className="font-semibold text-primary">FINAL_QUIZ preset</span>
              <span className="text-muted-foreground">
                Pass mark: 60% · Attempts: Unlimited
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFinalQuiz-new"
              checked={isFinalQuiz}
              onChange={(e) => setIsFinalQuiz(e.target.checked)}
              disabled={disabled}
              className="rounded border-input"
            />
            <label htmlFor="isFinalQuiz-new" className="text-sm">Is Final Quiz (pass unlocks level)</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Pass type</Label>
              <select
                className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                value={passType}
                onChange={(e) => setPassType(e.target.value as StepQuizPassType)}
                disabled={disabled}
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="BAND">Band score</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Pass value</Label>
              <Input
                type="number"
                min={0}
                max={passType === "PERCENTAGE" ? 100 : 9}
                value={passValue}
                onChange={(e) => setPassValue(Number(e.target.value) ?? 0)}
                disabled={disabled}
                className="h-9"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Attempt policy</Label>
              <select
                className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
                value={attemptPolicy}
                onChange={(e) => setAttemptPolicy(e.target.value as StepQuizAttemptPolicy)}
                disabled={disabled}
              >
                <option value="SINGLE">Single</option>
                <option value="UNLIMITED">Unlimited</option>
                <option value="LIMITED">Limited</option>
              </select>
            </div>
            {attemptPolicy === "LIMITED" && (
              <div>
                <Label className="text-xs">Max attempts</Label>
                <Input
                  type="number"
                  min={1}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value) || 1)}
                  disabled={disabled}
                  className="h-9"
                />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting || disabled || (showQuizConfig && !quizPoolValid) || (showPracticeTestConfig && !practiceTestId.trim())}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" /> Cancel
        </Button>
      </div>
    </form>
  );
}

interface StepEditFormProps {
  step: ReadingLevelStep;
  contents: LearningContent[];
  quizContents: ReadingQuizContent[];
  practiceTests: PracticeTest[];
  onSave: (p: UpdateStepPayload) => Promise<void>;
  onCancel: () => void;
  onLoadContents: () => void;
  busy: boolean;
}

function StepEditForm({
  step,
  contents,
  quizContents,
  practiceTests,
  onSave,
  onCancel,
  onLoadContents,
  busy,
}: StepEditFormProps) {
  const [typeSelectValue, setTypeSelectValue] = useState<StepTypeOption>(
    step.stepType === "QUIZ" && step.isFinalQuiz === true ? FINAL_QUIZ_PRESET : step.stepType,
  );
  const stepType = optionToStepType(typeSelectValue);
  const [title, setTitle] = useState(step.title);
  const [order, setOrder] = useState(step.order);
  const [contentId, setContentId] = useState(step.contentId ?? "");
  const [practiceTestId, setPracticeTestId] = useState(step.practiceTestId ?? "");
  const [useQuizPool, setUseQuizPool] = useState((step.contentIds?.length ?? 0) > 0);
  const [contentIds, setContentIds] = useState<string[]>(step.contentIds ?? []);
  const [advanceOnMaxAttemptsExhausted, setAdvanceOnMaxAttemptsExhausted] = useState(step.advanceOnMaxAttemptsExhausted ?? false);
  const [isFinalQuiz, setIsFinalQuiz] = useState(step.isFinalQuiz ?? false);
  const [passType, setPassType] = useState<StepQuizPassType>(step.passType ?? "PERCENTAGE");
  const [passValue, setPassValue] = useState(step.passValue ?? 60);
  const [attemptPolicy, setAttemptPolicy] = useState<StepQuizAttemptPolicy>(step.attemptPolicy ?? "UNLIMITED");
  const [maxAttempts, setMaxAttempts] = useState(step.maxAttempts ?? 1);
  const [submitting, setSubmitting] = useState(false);

  const showQuizConfig = QUIZ_STEP_TYPES.includes(stepType);
  const showPracticeTestConfig = stepType === "PRACTICE_TEST";
  const isFinalQuizPresetSelected = typeSelectValue === FINAL_QUIZ_PRESET;
  const quizPoolValid = !useQuizPool || contentIds.length >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (showQuizConfig && !useQuizPool && !contentId.trim()) return;
    if (showQuizConfig && useQuizPool && contentIds.length < 1) return;
    if (showPracticeTestConfig && !practiceTestId.trim()) return;
    setSubmitting(true);
    try {
      await onSave({
        stepType,
        title: title.trim(),
        order,
        contentId: showPracticeTestConfig ? null : (useQuizPool ? null : (contentId || null)),
        contentIds: useQuizPool && contentIds.length > 0 ? contentIds : null,
        practiceTestId: showPracticeTestConfig ? (practiceTestId || null) : null,
        ...(showQuizConfig && {
          isFinalQuiz,
          passType,
          passValue,
          attemptPolicy: useQuizPool ? "LIMITED" : attemptPolicy,
          maxAttempts: useQuizPool ? contentIds.length : (attemptPolicy === "LIMITED" ? maxAttempts : undefined),
          advanceOnMaxAttemptsExhausted: useQuizPool ? advanceOnMaxAttemptsExhausted : undefined,
        }),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addQuizToPoolEdit = () => {
    const firstId = quizContents[0]?._id;
    if (firstId) setContentIds((prev) => [...prev, firstId]);
  };
  const removeFromPoolEdit = (index: number) => {
    setContentIds((prev) => prev.filter((_, i) => i !== index));
  };
  const setPoolQuizAtEdit = (index: number, quizId: string) => {
    setContentIds((prev) => {
      const next = [...prev];
      next[index] = quizId;
      return next;
    });
  };
  const movePoolQuizEdit = (index: number, dir: 1 | -1) => {
    const next = index + dir;
    if (next < 0 || next >= contentIds.length) return;
    setContentIds((prev) => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 w-full">
        <select
          className="h-9 rounded-md border border-input bg-transparent px-2 text-sm w-40"
          value={typeSelectValue}
          onChange={(e) => {
            const v = e.target.value as StepTypeOption;
            setTypeSelectValue(v);

            if (v === FINAL_QUIZ_PRESET) {
              setContentId("");
              setIsFinalQuiz(true);
              setPassType("PERCENTAGE");
              setPassValue(60);
              setAttemptPolicy("UNLIMITED");
              setMaxAttempts(1);
              return;
            }

            const nextStepType = optionToStepType(v);
            if (nextStepType === "PRACTICE_TEST") {
              setContentId("");
              setPracticeTestId("");
              setIsFinalQuiz(false);
            } else if (!QUIZ_STEP_TYPES.includes(nextStepType)) {
              setContentId("");
              setPracticeTestId("");
              setIsFinalQuiz(false);
            }
          }}
          disabled={busy}
        >
          <option value={FINAL_QUIZ_PRESET}>Final Quiz</option>
          {(Object.keys(STEP_TYPE_LABELS) as ReadingStepType[]).map((t) => (
            <option key={t} value={t}>
              {STEP_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        {showPracticeTestConfig ? (
          <select
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm min-w-[200px]"
            value={practiceTestId}
            onChange={(e) => setPracticeTestId(e.target.value)}
            disabled={busy}
          >
            <option value="">— Practice test —</option>
            {practiceTests.map((pt) => (
              <option key={pt._id} value={pt._id}>
                {pt.contentCode ? `[${pt.contentCode}] ` : ""}{pt.title}
              </option>
            ))}
          </select>
        ) : null}
        <Input
          className="flex-1 min-w-32"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          disabled={busy}
        />
        <Input
          type="number"
          min={1}
          className="w-20"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value) || 1)}
          disabled={busy}
        />
        {showPracticeTestConfig ? null : showQuizConfig ? (
          useQuizPool ? (
            <span className="text-xs text-muted-foreground min-w-[120px]">
              Pool: {contentIds.length} quiz{contentIds.length !== 1 ? "zes" : ""}
            </span>
          ) : (
            <select
              className="h-9 rounded-md border border-input bg-transparent px-2 text-sm min-w-[220px]"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              onFocus={onLoadContents}
              disabled={busy}
              title="Quiz Content (required)"
            >
              <option value="">— Select quiz —</option>
              {quizContents.map((q) => (
                <option key={q._id} value={q._id}>
                  {quizSummary(q)}
                </option>
              ))}
            </select>
          )
        ) : (
          <select
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm w-44"
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            onFocus={onLoadContents}
            disabled={busy}
          >
            <option value="">— None —</option>
            {contents.map((c) => (
              <option key={c._id} value={c._id}>
                {c.contentCode ? `[${c.contentCode}] ` : ""}{c.title}
              </option>
            ))}
          </select>
        )}
        <Button type="submit" size="sm" disabled={submitting || busy || (showQuizConfig && !quizPoolValid) || (showPracticeTestConfig && !practiceTestId.trim())}>
          {submitting || busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </form>
      {showQuizConfig && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-border/50 bg-muted/30 p-2 text-sm">
            {isFinalQuizPresetSelected && (
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                FINAL_QUIZ preset
              </span>
            )}
            <div className="flex items-center gap-2">
              <input type="radio" id={`quiz-edit-single-${step._id}`} checked={!useQuizPool} onChange={() => setUseQuizPool(false)} disabled={busy} className="rounded border-input" />
              <label htmlFor={`quiz-edit-single-${step._id}`}>Single</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="radio" id={`quiz-edit-pool-${step._id}`} checked={useQuizPool} onChange={() => setUseQuizPool(true)} disabled={busy} className="rounded border-input" />
              <label htmlFor={`quiz-edit-pool-${step._id}`}>Pool</label>
            </div>
            <div className="flex items-center gap-1.5">
              <input type="checkbox" id={`isFinalQuiz-${step._id}`} checked={isFinalQuiz} onChange={(e) => setIsFinalQuiz(e.target.checked)} disabled={busy} className="rounded border-input" />
              <label htmlFor={`isFinalQuiz-${step._id}`}>Final quiz</label>
            </div>
            <select className="h-8 rounded-md border border-input bg-transparent px-2 text-xs w-28" value={passType} onChange={(e) => setPassType(e.target.value as StepQuizPassType)} disabled={busy}>
              <option value="PERCENTAGE">%</option>
              <option value="BAND">Band</option>
            </select>
            <Input type="number" min={0} max={passType === "PERCENTAGE" ? 100 : 9} value={passValue} onChange={(e) => setPassValue(Number(e.target.value) ?? 0)} disabled={busy} className="h-8 w-16" />
            {!useQuizPool && (
              <>
                <select className="h-8 rounded-md border border-input bg-transparent px-2 text-xs w-24" value={attemptPolicy} onChange={(e) => setAttemptPolicy(e.target.value as StepQuizAttemptPolicy)} disabled={busy}>
                  <option value="SINGLE">Single</option>
                  <option value="UNLIMITED">Unlimited</option>
                  <option value="LIMITED">Limited</option>
                </select>
                {attemptPolicy === "LIMITED" && (
                  <Input type="number" min={1} value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value) || 1)} disabled={busy} className="h-8 w-14" placeholder="Max" />
                )}
              </>
            )}
            {useQuizPool && (
              <div className="flex items-center gap-1.5">
                <input type="checkbox" id={`advance-exhausted-${step._id}`} checked={advanceOnMaxAttemptsExhausted} onChange={(e) => setAdvanceOnMaxAttemptsExhausted(e.target.checked)} disabled={busy} className="rounded border-input" />
                <label htmlFor={`advance-exhausted-${step._id}`}>Advance with avg when exhausted</label>
              </div>
            )}
          </div>
          {useQuizPool && (
            <div className="rounded-md border border-border/50 bg-muted/20 p-2 space-y-2">
              <span className="text-xs font-medium">Quiz pool (order = attempt order)</span>
              {contentIds.map((id, idx) => (
                <div key={`${step._id}-${idx}-${id}`} className="flex items-center gap-2">
                  <span className="w-5 text-xs text-muted-foreground">{idx + 1}.</span>
                  <select className="h-8 flex-1 rounded-md border border-input bg-transparent px-2 text-xs" value={id} onChange={(e) => setPoolQuizAtEdit(idx, e.target.value)} disabled={busy}>
                    <option value="">— Select —</option>
                    {quizContents.map((q) => (
                      <option key={q._id} value={q._id}>{quizSummary(q)}</option>
                    ))}
                  </select>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => movePoolQuizEdit(idx, -1)} disabled={idx === 0 || busy}><ChevronUp className="h-3.5 w-3.5" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => movePoolQuizEdit(idx, 1)} disabled={idx === contentIds.length - 1 || busy}><ChevronDown className="h-3.5 w-3.5" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromPoolEdit(idx)} disabled={contentIds.length <= 1 || busy}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addQuizToPoolEdit} disabled={quizContents.length === 0 || contentIds.length >= 20 || busy}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add to pool
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
