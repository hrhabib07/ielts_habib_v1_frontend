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
  type ReadingLevelStep,
  type ReadingStepType,
  type CreateStepPayload,
  type UpdateStepPayload,
  type StepQuizPassType,
  type StepQuizAttemptPolicy,
} from "@/src/lib/api/adminReadingVersions";
import {
  listLearningContents,
  type LearningContent,
} from "@/src/lib/api/learningContents";
import { listQuizContent, type ReadingQuizContent } from "@/src/lib/api/quizContent";
import { Pencil, Trash2, Plus, Loader2, X, Check } from "lucide-react";

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
  disabled: boolean;
  onStepsChange: (steps: ReadingLevelStep[]) => void;
}

export function StepBuilder({
  versionId,
  steps,
  disabled,
  onStepsChange,
}: StepBuilderProps) {
  const [contents, setContents] = useState<LearningContent[]>([]);
  const [quizContents, setQuizContents] = useState<ReadingQuizContent[]>([]);
  const [contentsLoaded, setContentsLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
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

  const handleCreate = async (payload: CreateStepPayload) => {
    setError(null);
    try {
      const created = await createStep(versionId, payload);
      onStepsChange([...steps, created].sort((a, b) => a.order - b.order));
      setAdding(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create step");
    }
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
      await deleteStep(stepId);
      onStepsChange(steps.filter((s) => s._id !== stepId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete step");
    } finally {
      setBusyId(null);
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
            nextOrder={steps.length > 0 ? Math.max(...steps.map((s) => s.order)) + 1 : 1}
            contents={contents}
            quizContents={quizContents}
            onSave={handleCreate}
            onCancel={() => setAdding(false)}
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
                    onSave={(p) => handleUpdate(step._id, p)}
                    onCancel={() => setEditingId(null)}
                    onLoadContents={loadContents}
                    busy={busyId === step._id}
                  />
                ) : (
                  <>
                    <span className="text-muted-foreground w-8">#{step.order}</span>
                    <span className="font-medium flex-1">
                      {step.stepType === "QUIZ" && step.isFinalQuiz === true ? (
                        <span className="mr-2 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          FINAL_QUIZ
                        </span>
                      ) : null}
                      {STEP_TYPE_LABELS[step.stepType] ?? step.stepType} — {step.title}
                    </span>
                    {!disabled && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
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
  const groups = q.groups?.length ?? 0;
  const questions = q.groups?.reduce((s, g) => s + (g.questions?.length ?? 0), 0) ?? 0;
  return `${q.title} — ${groups} group(s), ${questions} question(s)`;
}

interface StepFormProps {
  nextOrder: number;
  contents: LearningContent[];
  quizContents: ReadingQuizContent[];
  onSave: (p: CreateStepPayload) => Promise<void>;
  onCancel: () => void;
  onRetryQuizzes?: () => Promise<void>;
  disabled: boolean;
}

const QUIZ_STEP_TYPES: ReadingStepType[] = ["QUIZ", "VOCABULARY_TEST"];

function StepForm({
  nextOrder,
  contents,
  quizContents,
  onSave,
  onCancel,
  onRetryQuizzes,
  disabled,
}: StepFormProps) {
  const [typeSelectValue, setTypeSelectValue] = useState<StepTypeOption>("INSTRUCTION");
  const stepType = optionToStepType(typeSelectValue);
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(nextOrder);
  const [contentId, setContentId] = useState("");
  const [isFinalQuiz, setIsFinalQuiz] = useState(false);
  const [passType, setPassType] = useState<StepQuizPassType>("PERCENTAGE");
  const [passValue, setPassValue] = useState(60);
  const [attemptPolicy, setAttemptPolicy] = useState<StepQuizAttemptPolicy>("UNLIMITED");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const showQuizConfig = QUIZ_STEP_TYPES.includes(stepType);
  const isFinalQuizPresetSelected = typeSelectValue === FINAL_QUIZ_PRESET;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (showQuizConfig && !contentId.trim()) return;
    setSubmitting(true);
    try {
      await onSave({
        stepType,
        title: title.trim(),
        order,
        contentId: contentId || null,
        ...(showQuizConfig && {
          isFinalQuiz,
          passType,
          passValue,
          attemptPolicy,
          maxAttempts: attemptPolicy === "LIMITED" ? maxAttempts : undefined,
        }),
      });
    } finally {
      setSubmitting(false);
    }
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
              if (!QUIZ_STEP_TYPES.includes(nextStepType)) {
                setContentId("");
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
          <Label>Order</Label>
          <Input
            type="number"
            min={1}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value) || 1)}
            disabled={disabled}
          />
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
      {showQuizConfig ? (
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
          {quizContents.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>No quizzes loaded.</span>
              {onRetryQuizzes ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRetryQuizzes()}
                  disabled={disabled}
                >
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
                {c.title}
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
        <Button type="submit" size="sm" disabled={submitting || disabled}>
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
  onSave: (p: UpdateStepPayload) => Promise<void>;
  onCancel: () => void;
  onLoadContents: () => void;
  busy: boolean;
}

function StepEditForm({
  step,
  contents,
  quizContents,
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
  const [isFinalQuiz, setIsFinalQuiz] = useState(step.isFinalQuiz ?? false);
  const [passType, setPassType] = useState<StepQuizPassType>(step.passType ?? "PERCENTAGE");
  const [passValue, setPassValue] = useState(step.passValue ?? 60);
  const [attemptPolicy, setAttemptPolicy] = useState<StepQuizAttemptPolicy>(step.attemptPolicy ?? "UNLIMITED");
  const [maxAttempts, setMaxAttempts] = useState(step.maxAttempts ?? 1);
  const [submitting, setSubmitting] = useState(false);

  const showQuizConfig = QUIZ_STEP_TYPES.includes(stepType);
  const isFinalQuizPresetSelected = typeSelectValue === FINAL_QUIZ_PRESET;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (showQuizConfig && !contentId.trim()) return;
    setSubmitting(true);
    try {
      await onSave({
        stepType,
        title: title.trim(),
        order,
        contentId: contentId || null,
        ...(showQuizConfig && {
          isFinalQuiz,
          passType,
          passValue,
          attemptPolicy,
          maxAttempts: attemptPolicy === "LIMITED" ? maxAttempts : undefined,
        }),
      });
    } finally {
      setSubmitting(false);
    }
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
            if (!QUIZ_STEP_TYPES.includes(nextStepType)) {
              setContentId("");
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
        {showQuizConfig ? (
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
                {c.title}
              </option>
            ))}
          </select>
        )}
        <Button type="submit" size="sm" disabled={submitting || busy}>
          {submitting || busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </form>
      {showQuizConfig && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border/50 bg-muted/30 p-2 text-sm">
          {isFinalQuizPresetSelected && (
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              FINAL_QUIZ preset
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <input
              type="checkbox"
              id={`isFinalQuiz-${step._id}`}
              checked={isFinalQuiz}
              onChange={(e) => setIsFinalQuiz(e.target.checked)}
              disabled={busy}
              className="rounded border-input"
            />
            <label htmlFor={`isFinalQuiz-${step._id}`}>Final quiz</label>
          </div>
          <select
            className="h-8 rounded-md border border-input bg-transparent px-2 text-xs w-28"
            value={passType}
            onChange={(e) => setPassType(e.target.value as StepQuizPassType)}
            disabled={busy}
          >
            <option value="PERCENTAGE">%</option>
            <option value="BAND">Band</option>
          </select>
          <Input
            type="number"
            min={0}
            max={passType === "PERCENTAGE" ? 100 : 9}
            value={passValue}
            onChange={(e) => setPassValue(Number(e.target.value) ?? 0)}
            disabled={busy}
            className="h-8 w-16"
          />
          <select
            className="h-8 rounded-md border border-input bg-transparent px-2 text-xs w-24"
            value={attemptPolicy}
            onChange={(e) => setAttemptPolicy(e.target.value as StepQuizAttemptPolicy)}
            disabled={busy}
          >
            <option value="SINGLE">Single</option>
            <option value="UNLIMITED">Unlimited</option>
            <option value="LIMITED">Limited</option>
          </select>
          {attemptPolicy === "LIMITED" && (
            <Input
              type="number"
              min={1}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value) || 1)}
              disabled={busy}
              className="h-8 w-14"
              placeholder="Max"
            />
          )}
        </div>
      )}
    </div>
  );
}
