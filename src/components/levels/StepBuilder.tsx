"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminAddLevelStep,
  adminUpdateLevelStep,
  adminDeleteLevelStep,
  getAddStepErrorMessage,
  type LevelStep,
  type LevelStepContentType,
  type CreateLevelStepPayload,
  type UpdateLevelStepPayload,
} from "@/src/lib/api/levels";
import { listAdminQuestionSets, type AdminQuestionSet } from "@/src/lib/api/admin-content";
import { getMyQuestionSets } from "@/src/lib/api/instructor";
import {
  LEVEL_STEP_TYPES,
  LEVEL_STEP_TYPE_LABELS,
  stepTypeToContentType,
  contentTypeToStepType,
  CONTENT_STEP_TYPES,
  type LevelStepType,
} from "@/src/lib/stepTypes";
import { listLearningContents, type LearningContent } from "@/src/lib/api/learningContents";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  Video,
  FileText,
  List,
  ClipboardList,
  BarChart2,
  BookOpen,
  Lightbulb,
} from "lucide-react";

const STEP_TYPE_ICONS: Record<LevelStepType, React.ReactNode> = {
  INTRO_TEXT: <FileText className="h-4 w-4" />,
  VIDEO: <Video className="h-4 w-4" />,
  QUIZ: <List className="h-4 w-4" />,
  NOTE: <Lightbulb className="h-4 w-4" />,
  PRACTICE: <BookOpen className="h-4 w-4" />,
  FULL_TEST: <ClipboardList className="h-4 w-4" />,
  ANALYTICS: <BarChart2 className="h-4 w-4" />,
};

/* ─── Add Step Form (dynamic content by type) ─── */
type AddLevelStepFn = (levelId: string, payload: CreateLevelStepPayload) => Promise<LevelStep>;

interface StepBuilderAddFormProps {
  levelId: string;
  existingSteps: LevelStep[];
  /** All steps in the level (learning + practice + fullTest) for unique order. Avoids 400 from duplicate (levelId, order). */
  allStepsForOrder?: LevelStep[];
  questionSets: AdminQuestionSet[];
  learningContents: LearningContent[];
  onSave: (step: LevelStep) => void;
  onCancel: () => void;
  allowedStepTypes: LevelStepType[];
  /** When provided (e.g. instructor dashboard), use this instead of admin API. */
  addLevelStepFn?: AddLevelStepFn;
}

export function StepBuilderAddForm({
  levelId,
  existingSteps,
  allStepsForOrder,
  questionSets,
  learningContents,
  onSave,
  onCancel,
  allowedStepTypes,
  addLevelStepFn,
}: StepBuilderAddFormProps) {
  const addStep = addLevelStepFn ?? adminAddLevelStep;
  const [stepType, setStepType] = useState<LevelStepType>(
    () => allowedStepTypes[0] ?? "INTRO_TEXT",
  );
  const [title, setTitle] = useState("");
  const [contentId, setContentId] = useState("");
  const [isMandatory, setIsMandatory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questionSetId, setQuestionSetId] = useState("");
  const [instructionText, setInstructionText] = useState("");

  const stepsForOrder = allStepsForOrder && allStepsForOrder.length > 0 ? allStepsForOrder : existingSteps;
  const nextOrder =
    stepsForOrder.length > 0
      ? Math.max(...stepsForOrder.map((s) => s.order)) + 1
      : 1;

  const needsQuestionSet =
    stepType === "QUIZ" || stepType === "PRACTICE" || stepType === "FULL_TEST";
  const needsLearningContent = CONTENT_STEP_TYPES.includes(stepType);
  const effectiveContentId = needsQuestionSet ? questionSetId : contentId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (needsQuestionSet && !questionSetId) {
      setError("Please select a question set.");
      return;
    }
    if (needsLearningContent && !contentId.trim()) {
      setError("Please select content from Content Management.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const contentType = stepTypeToContentType(stepType);
      const payload = {
        contentId: effectiveContentId.trim(),
        contentType,
        title: title.trim(),
        order: nextOrder,
        isMandatory,
        unlockAfterStepId: null as string | null,
      };
      const step = await addStep(levelId, payload);
      onSave(step);
      if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("STEP CREATED SUCCESSFULLY", step);
      }
      setTitle("");
      setContentId("");
      setQuestionSetId("");
      setInstructionText("");
      setError(null);
    } catch (err: unknown) {
      if (typeof process !== "undefined" && process.env.NODE_ENV === "development" && err && typeof err === "object" && "response" in err) {
        // eslint-disable-next-line no-console
        console.log("Add step error:", (err as { response?: { data?: unknown } }).response?.data);
      }
      setError(getAddStepErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4"
    >
      <h4 className="text-sm font-semibold text-foreground">➕ Add new step</h4>
      <p className="text-xs text-muted-foreground">
        For <strong>Quiz, Practice, or Full Test</strong> — select a Question Set. For <strong>Intro, Note, Video, or Analytics</strong> — select content from Content Management. Create content at{" "}
        <a href="/dashboard/instructor/contents" className="underline text-primary hover:no-underline" target="_blank" rel="noopener noreferrer">
          Dashboard → Content Management
        </a>
        .
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Step type <span className="text-destructive">*</span>
          </label>
          <select
            value={stepType}
            onChange={(e) => setStepType(e.target.value as LevelStepType)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {allowedStepTypes.map((t) => (
              <option key={t} value={t}>
                {LEVEL_STEP_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Watch intro video"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>
      </div>

      {/* Select Content (INTRO_TEXT, NOTE, VIDEO, ANALYTICS) */}
      {needsLearningContent && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Select content <span className="text-destructive">*</span>
          </label>
          <select
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select content</option>
            {learningContents.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} ({c.type})
              </option>
            ))}
          </select>
          {learningContents.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              No content yet. Create intro, note, video, or analytics content in{" "}
              <a href="/dashboard/instructor/contents" className="underline text-primary hover:no-underline" target="_blank" rel="noopener noreferrer">
                Content Management
              </a>
              .
            </p>
          )}
        </div>
      )}

      {(stepType === "QUIZ" || stepType === "PRACTICE") && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Question set <span className="text-destructive">*</span>
            </label>
            <select
              value={questionSetId}
              onChange={(e) => setQuestionSetId(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select question set</option>
              {questionSets.map((qs) => (
                <option key={qs._id} value={qs._id}>
                  {qs.instruction?.slice(0, 50) ?? qs._id} (Q{qs.startQuestionNumber}–{qs.endQuestionNumber})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Optional instruction text
            </label>
            <textarea
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              placeholder="Extra instruction for students"
              rows={2}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      )}

      {stepType === "FULL_TEST" && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Question set <span className="text-destructive">*</span>
          </label>
          <select
            value={questionSetId}
            onChange={(e) => setQuestionSetId(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select question set</option>
            {questionSets.map((qs) => (
              <option key={qs._id} value={qs._id}>
                {qs.instruction?.slice(0, 50) ?? qs._id} (Q{qs.startQuestionNumber}–{qs.endQuestionNumber})
              </option>
            ))}
          </select>
        </div>
      )}


      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isMandatory}
          onChange={(e) => setIsMandatory(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        Mandatory step
      </label>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t pt-3">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="mr-1 h-3.5 w-3.5" /> Cancel
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="mr-1 h-3.5 w-3.5" />
          )}
          Add step
        </Button>
      </div>
    </form>
  );
}

/* ─── Step card (order, type badge, title, edit, delete, move) ─── */
type UpdateLevelStepFn = (levelId: string, stepId: string, payload: UpdateLevelStepPayload) => Promise<LevelStep>;

interface StepBuilderStepRowProps {
  step: LevelStep;
  levelId: string;
  isFirst: boolean;
  isLast: boolean;
  onDelete: (stepId: string) => void;
  onMoveUp: (stepId: string) => void;
  onMoveDown: (stepId: string) => void;
  onStepUpdated: (stepId: string, updates: Partial<LevelStep>) => void;
  allowedStepTypes: LevelStepType[];
  updateLevelStepFn?: UpdateLevelStepFn;
}

export function StepBuilderStepRow({
  step,
  levelId,
  isFirst,
  isLast,
  onDelete,
  onMoveUp,
  onMoveDown,
  onStepUpdated,
  allowedStepTypes,
  updateLevelStepFn,
}: StepBuilderStepRowProps) {
  const updateStep = updateLevelStepFn ?? adminUpdateLevelStep;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(step.title);
  const [stepType, setStepType] = useState<LevelStepType>(() => {
    const t = contentTypeToStepType(step.contentType);
    return allowedStepTypes.includes(t) ? t : allowedStepTypes[0] ?? "INTRO_TEXT";
  });
  const [isMandatory, setIsMandatory] = useState(step.isMandatory);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const contentType = stepTypeToContentType(stepType);
    const prev = { title: step.title, contentType: step.contentType, isMandatory: step.isMandatory };
    onStepUpdated(step._id, { title, contentType, isMandatory });
    setEditing(false);
    setSaving(true);
    try {
      await updateStep(levelId, step._id, {
        title,
        contentType,
        isMandatory,
      });
    } catch {
      onStepUpdated(step._id, prev);
      setEditing(true);
      alert("Failed to update step.");
    } finally {
      setSaving(false);
    }
  };

  const displayType = contentTypeToStepType(step.contentType);

  return (
    <div
      id={`step-${step._id}`}
      className="flex items-start gap-3 rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md scroll-mt-24"
    >
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={() => onMoveUp(step._id)}
          disabled={isFirst}
          className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
          aria-label="Move up"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {step.order}
        </span>
        <button
          type="button"
          onClick={() => onMoveDown(step._id)}
          disabled={isLast}
          className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
          aria-label="Move down"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Step title"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={stepType}
                onChange={(e) => setStepType(e.target.value as LevelStepType)}
                className="rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {allowedStepTypes.map((t) => (
                  <option key={t} value={t}>
                    {LEVEL_STEP_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                  className="h-3.5 w-3.5 rounded"
                />
                Mandatory
              </label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-7 gap-1 text-xs" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  setTitle(step.title);
                  setStepType(contentTypeToStepType(step.contentType));
                  setIsMandatory(step.isMandatory);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="font-medium text-foreground">{step.title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {STEP_TYPE_ICONS[displayType]}
                {LEVEL_STEP_TYPE_LABELS[displayType]}
              </span>
              {step.isMandatory && (
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                  Required
                </span>
              )}
              <span className="font-mono text-xs text-muted-foreground">
                ID: {String(step.contentId).slice(-8)}
              </span>
            </div>
          </>
        )}
      </div>

      {!editing && (
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setEditing(true)}
            aria-label="Edit step"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(step._id)}
            aria-label="Delete step"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/** "learning" = LEARNING flow only (INTRO, VIDEO, NOTE, ANALYTICS). "practice" = PRACTICE_UNTIMED, PRACTICE_TIMED only (no FULL_TEST). */
export type StepBuilderFlow = "learning" | "practice";

const LEARNING_STEP_TYPES: LevelStepType[] = ["INTRO_TEXT", "VIDEO", "NOTE", "ANALYTICS"];
const PRACTICE_STEP_TYPES: LevelStepType[] = ["QUIZ", "PRACTICE"];

/* ─── Step Builder section (single flow: Learning or Practice) ─── */
interface StepBuilderProps {
  levelId: string;
  steps: LevelStep[];
  onStepsChange: (steps: LevelStep[]) => void;
  showAddForm: boolean;
  onShowAddForm: (show: boolean) => void;
  flow: StepBuilderFlow;
  sectionTitle: string;
  sectionDescription: string;
  emptyMessage: string;
  /** All steps in the level for unique order when adding (avoids duplicate order 400). */
  allStepsForOrder?: LevelStep[];
  /** Called after a step is successfully added; use to refetch level so order/steps stay in sync. */
  onStepAdded?: () => void;
  addLevelStepFn?: AddLevelStepFn;
  updateLevelStepFn?: UpdateLevelStepFn;
  deleteLevelStepFn?: (levelId: string, stepId: string) => Promise<void>;
}

export function StepBuilder({
  levelId,
  steps,
  onStepsChange,
  showAddForm,
  onShowAddForm,
  flow,
  sectionTitle,
  sectionDescription,
  emptyMessage,
  allStepsForOrder,
  onStepAdded,
  addLevelStepFn,
  updateLevelStepFn,
  deleteLevelStepFn,
}: StepBuilderProps) {
  const addStep = addLevelStepFn ?? adminAddLevelStep;
  const updateStep = updateLevelStepFn ?? adminUpdateLevelStep;
  const deleteStep = deleteLevelStepFn ?? adminDeleteLevelStep;
  const [questionSets, setQuestionSets] = useState<AdminQuestionSet[]>([]);
  const [learningContents, setLearningContents] = useState<LearningContent[]>([]);
  const [reordering, setReordering] = useState(false);

  const allowedStepTypes = flow === "learning" ? LEARNING_STEP_TYPES : PRACTICE_STEP_TYPES;

  useEffect(() => {
    if (showAddForm) {
      listAdminQuestionSets()
        .then(setQuestionSets)
        .catch(() => {
          getMyQuestionSets()
            .then((sets) =>
              setQuestionSets(
                sets.map((s) => ({
                  _id: s._id,
                  instruction: s.instruction,
                  startQuestionNumber: s.startQuestionNumber,
                  endQuestionNumber: s.endQuestionNumber,
                })),
              ),
            )
            .catch(() => setQuestionSets([]));
        });
      listLearningContents()
        .then(setLearningContents)
        .catch(() => setLearningContents([]));
    }
  }, [showAddForm]);

  const handleAddStep = (step: LevelStep) => {
    onStepsChange([...steps, step]);
    onStepAdded?.();
    // Keep form open so user can add another step; nextOrder will update from parent state/refetch
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!window.confirm("Remove this step?")) return;
    const prev = steps;
    onStepsChange(steps.filter((s) => s._id !== stepId));
    try {
      await deleteStep(levelId, stepId);
    } catch {
      onStepsChange(prev);
      alert("Failed to delete step.");
    }
  };

  const handleStepUpdated = (stepId: string, updates: Partial<LevelStep>) => {
    onStepsChange(
      steps.map((s) => (s._id === stepId ? { ...s, ...updates } : s)),
    );
  };

  const handleReorder = async (
    stepId: string,
    direction: "up" | "down",
  ) => {
    const sorted = [...steps].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((s) => s._id === stepId);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sorted.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newOrder = sorted[swapIdx].order;
    const swapOrder = sorted[idx].order;
    const prev = [...steps];
    onStepsChange(
      steps.map((s) => {
        if (s._id === stepId) return { ...s, order: newOrder };
        if (s._id === sorted[swapIdx]._id) return { ...s, order: swapOrder };
        return s;
      }),
    );
    setReordering(true);
    try {
      await updateStep(levelId, stepId, { order: newOrder });
      await updateStep(levelId, sorted[swapIdx]._id, {
        order: swapOrder,
      });
    } catch {
      onStepsChange(prev);
      alert("Failed to reorder step.");
    } finally {
      setReordering(false);
    }
  };

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {sectionTitle}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {sectionDescription}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => onShowAddForm(!showAddForm)}
          disabled={reordering}
        >
          <Plus className="h-4 w-4" />
          Add step
        </Button>
      </div>

      {showAddForm && (
        <StepBuilderAddForm
          levelId={levelId}
          existingSteps={steps}
          allStepsForOrder={allStepsForOrder}
          questionSets={questionSets}
          learningContents={learningContents}
          onSave={handleAddStep}
          onCancel={() => onShowAddForm(false)}
          allowedStepTypes={allowedStepTypes}
          addLevelStepFn={addLevelStepFn}
        />
      )}

      {sortedSteps.length === 0 && !showAddForm ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedSteps.map((step, idx) => (
            <StepBuilderStepRow
              key={step._id}
              step={step}
              levelId={levelId}
              isFirst={idx === 0}
              isLast={idx === sortedSteps.length - 1}
              onDelete={handleDeleteStep}
              onMoveUp={(stepId) => handleReorder(stepId, "up")}
              onMoveDown={(stepId) => handleReorder(stepId, "down")}
              onStepUpdated={handleStepUpdated}
              allowedStepTypes={allowedStepTypes}
              updateLevelStepFn={updateLevelStepFn}
            />
          ))}
        </div>
      )}
    </section>
  );
}
