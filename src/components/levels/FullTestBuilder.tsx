"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminAddLevelStep,
  adminUpdateLevelStep,
  getAddStepErrorMessage,
  type LevelStep,
  type CreateLevelStepPayload,
  type UpdateLevelStepPayload,
} from "@/src/lib/api/levels";
import {
  listAdminQuestionSets,
  type AdminQuestionSet,
} from "@/src/lib/api/admin-content";
import { getMyQuestionSets } from "@/src/lib/api/instructor";
import { Loader2, ClipboardList, AlertCircle, Plus } from "lucide-react";

const MINI_TEST_INDICES = [1, 2, 3] as const;
const MAX_FULL_TEST_GROUPS = 10;

/** Group steps by fullTestGroupIndex (1–10). Missing groupIndex treated as 1 for backward compat. */
function groupStepsByGroupIndex(steps: LevelStep[]): Map<number, LevelStep[]> {
  const map = new Map<number, LevelStep[]>();
  for (const s of steps) {
    const groupIdx = s.fullTestGroupIndex ?? 1;
    if (!map.has(groupIdx)) map.set(groupIdx, []);
    map.get(groupIdx)!.push(s);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => (a.miniTestIndex ?? 0) - (b.miniTestIndex ?? 0));
  }
  return map;
}

type AddLevelStepFn = (levelId: string, payload: CreateLevelStepPayload) => Promise<LevelStep>;
type UpdateLevelStepFn = (levelId: string, stepId: string, payload: UpdateLevelStepPayload) => Promise<LevelStep>;

interface FullTestBuilderProps {
  levelId: string;
  fullTestSteps: LevelStep[];
  isLevelPublished: boolean;
  onFullTestStepsChange: (steps: LevelStep[]) => void;
  addLevelStepFn?: AddLevelStepFn;
  updateLevelStepFn?: UpdateLevelStepFn;
}

export function FullTestBuilder({
  levelId,
  fullTestSteps,
  isLevelPublished,
  onFullTestStepsChange,
  addLevelStepFn,
  updateLevelStepFn,
}: FullTestBuilderProps) {
  const addStep = addLevelStepFn ?? adminAddLevelStep;
  const updateStep = updateLevelStepFn ?? adminUpdateLevelStep;
  const [questionSets, setQuestionSets] = useState<AdminQuestionSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const groupsMap = groupStepsByGroupIndex(fullTestSteps);
  const groupIndicesFromSteps = Array.from(groupsMap.keys()).sort((a, b) => a - b);
  const nextGroupIndex =
    groupIndicesFromSteps.length > 0
      ? Math.max(...groupIndicesFromSteps) + 1
      : 1;

  const [fullTestGroups, setFullTestGroups] = useState<number[]>(() => [1]);

  useEffect(() => {
    const fromSteps = groupIndicesFromSteps;
    setFullTestGroups((prev) => {
      const merged = [...new Set([...prev, ...fromSteps])].sort((a, b) => a - b);
      return merged.length > 0 ? merged : [1];
    });
  }, [groupIndicesFromSteps.join(",")]);

  const displayGroupIndices = fullTestGroups.slice(0, MAX_FULL_TEST_GROUPS);
  const canAddGroup =
    !isLevelPublished &&
    fullTestGroups.length < MAX_FULL_TEST_GROUPS &&
    nextGroupIndex <= MAX_FULL_TEST_GROUPS;

  const handleAddGroup = () => {
    if (!canAddGroup) return;
    setError(null);
    setFullTestGroups((prev) => {
      const next = nextGroupIndex;
      if (prev.includes(next)) return prev;
      return [...prev, next].sort((a, b) => a - b).slice(0, MAX_FULL_TEST_GROUPS);
    });
  };

  useEffect(() => {
    setLoading(true);
    listAdminQuestionSets()
      .then(setQuestionSets)
      .catch(() =>
        getMyQuestionSets()
          .then((sets) =>
            setQuestionSets(
              sets.map((s) => ({
                _id: s._id,
                instruction: s.instruction,
                startQuestionNumber: s.startQuestionNumber,
                endQuestionNumber: s.endQuestionNumber,
                passageId: "",
                questionType: "",
              })),
            ),
          )
          .catch(() => setQuestionSets([])),
      )
      .finally(() => setLoading(false));
  }, []);

  const getMaxOrder = () => {
    const allOrders = fullTestSteps.map((s) => s.order);
    return allOrders.length > 0 ? Math.max(...allOrders) : 0;
  };

  const handleAssign = async (
    fullTestGroupIndex: number,
    miniTestIndex: 1 | 2 | 3,
    questionSetId: string,
    title: string,
  ) => {
    setError(null);
    const key = `${fullTestGroupIndex}-${miniTestIndex}`;
    setSavingKey(key);
    const groupSteps = groupsMap.get(fullTestGroupIndex) ?? [];
    const existing = groupSteps.find((s) => s.miniTestIndex === miniTestIndex);

    try {
      if (existing) {
        if (isLevelPublished) {
          setError("Cannot edit Full Test after level is published.");
          return;
        }
        await updateStep(levelId, existing._id, {
          contentId: questionSetId,
          title: title.trim() || `Group ${fullTestGroupIndex} Mini Test ${miniTestIndex}`,
        });
        onFullTestStepsChange(
          fullTestSteps.map((s) =>
            s._id === existing._id
              ? {
                  ...s,
                  contentId: questionSetId,
                  title: title.trim() || `Group ${fullTestGroupIndex} Mini Test ${miniTestIndex}`,
                }
              : s,
          ),
        );
      } else {
        const baseOrder = getMaxOrder() + 1;
        const payload: CreateLevelStepPayload = {
          contentId: questionSetId,
          contentType: "FULL_TEST",
          title: title.trim() || `Group ${fullTestGroupIndex} Mini Test ${miniTestIndex}`,
          order: baseOrder + (fullTestGroupIndex - 1) * 3 + miniTestIndex - 1,
          isMandatory: true,
          miniTestIndex,
          fullTestGroupIndex,
        };
        const step = await addStep(levelId, payload);
        onFullTestStepsChange(
          [...fullTestSteps, step].sort((a, b) => {
            const ga = a.fullTestGroupIndex ?? 1;
            const gb = b.fullTestGroupIndex ?? 1;
            if (ga !== gb) return ga - gb;
            return (a.miniTestIndex ?? 0) - (b.miniTestIndex ?? 0);
          }),
        );
      }
    } catch (err: unknown) {
      setError(getAddStepErrorMessage(err));
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Full Test Flow
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Up to {MAX_FULL_TEST_GROUPS} groups. Each group has exactly 3 mini tests. Determines level completion.
        </p>
        {isLevelPublished && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-3.5 w-3.5" />
            Level is published. Full test cannot be edited.
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {displayGroupIndices.map((groupIndex) => {
        const groupSteps = groupsMap.get(groupIndex) ?? [];
        const stepsByMini = new Map<number, LevelStep>();
        groupSteps.forEach((s) => {
          if (s.miniTestIndex === 1 || s.miniTestIndex === 2 || s.miniTestIndex === 3) {
            stepsByMini.set(s.miniTestIndex, s);
          }
        });
        const isNewEmptyGroup =
          groupSteps.length === 0 && groupIndex >= nextGroupIndex;

        return (
          <Card key={groupIndex} className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Full Test Group {groupIndex}
              </p>
              {isNewEmptyGroup && (
                <span className="text-xs text-muted-foreground">New — assign all 3 mini tests</span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {MINI_TEST_INDICES.map((miniIdx) => (
                <MiniTestSlot
                  key={`${groupIndex}-${miniIdx}`}
                  fullTestGroupIndex={groupIndex}
                  miniTestIndex={miniIdx}
                  step={stepsByMini.get(miniIdx)}
                  questionSets={questionSets}
                  loading={loading}
                  saving={savingKey === `${groupIndex}-${miniIdx}`}
                  disabled={isLevelPublished}
                  onAssign={handleAssign}
                />
              ))}
            </div>
          </Card>
        );
      })}

      {canAddGroup && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-2 border-dashed"
          onClick={handleAddGroup}
        >
          <Plus className="h-4 w-4" />
          Add Full Test Group
        </Button>
      )}
      {fullTestGroups.length >= MAX_FULL_TEST_GROUPS && (
        <p className="text-xs text-muted-foreground">
          Maximum {MAX_FULL_TEST_GROUPS} groups per level.
        </p>
      )}
    </section>
  );
}

interface MiniTestSlotProps {
  fullTestGroupIndex: number;
  miniTestIndex: 1 | 2 | 3;
  step: LevelStep | undefined;
  questionSets: AdminQuestionSet[];
  loading: boolean;
  saving: boolean;
  disabled: boolean;
  onAssign: (
    fullTestGroupIndex: number,
    miniTestIndex: 1 | 2 | 3,
    questionSetId: string,
    title: string,
  ) => Promise<void>;
}

function MiniTestSlot({
  fullTestGroupIndex,
  miniTestIndex,
  step,
  questionSets,
  loading,
  saving,
  disabled,
  onAssign,
}: MiniTestSlotProps) {
  const [questionSetId, setQuestionSetId] = useState(step?.contentId ?? "");
  const [title, setTitle] = useState(
    step?.title ?? `Group ${fullTestGroupIndex} Mini Test ${miniTestIndex}`,
  );

  useEffect(() => {
    if (step) {
      setQuestionSetId(step.contentId);
      setTitle(step.title);
    } else {
      setQuestionSetId("");
      setTitle(`Group ${fullTestGroupIndex} Mini Test ${miniTestIndex}`);
    }
  }, [step, fullTestGroupIndex, miniTestIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionSetId) return;
    onAssign(fullTestGroupIndex, miniTestIndex, questionSetId, title);
  };

  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Mini Test {miniTestIndex}
      </p>
      {step ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground truncate" title={step.title}>
            {step.title}
          </p>
          <p className="font-mono text-xs text-muted-foreground truncate" title={step.contentId}>
            QSet: {String(step.contentId).slice(-8)}
          </p>
          {!disabled && (
            <form onSubmit={handleSubmit} className="mt-3 space-y-2">
              <select
                value={questionSetId}
                onChange={(e) => setQuestionSetId(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={saving}
              >
                <option value="">Change question set</option>
                {questionSets.map((qs) => (
                  <option key={qs._id} value={qs._id}>
                    {qs.instruction?.slice(0, 40) ?? qs._id} (Q{qs.startQuestionNumber}–{qs.endQuestionNumber})
                  </option>
                ))}
              </select>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={saving}
              />
              <Button type="submit" size="sm" disabled={saving || !questionSetId}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Update
              </Button>
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <select
            value={questionSetId}
            onChange={(e) => setQuestionSetId(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
            disabled={loading || saving}
          >
            <option value="">Select question set</option>
            {questionSets.map((qs) => (
              <option key={qs._id} value={qs._id}>
                {qs.instruction?.slice(0, 40) ?? qs._id} (Q{qs.startQuestionNumber}–{qs.endQuestionNumber})
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={saving}
          />
          <Button type="submit" size="sm" disabled={loading || saving || !questionSetId}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Assign
          </Button>
        </form>
      )}
    </div>
  );
}
