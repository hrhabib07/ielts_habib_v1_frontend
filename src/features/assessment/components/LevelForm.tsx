"use client";

import * as React from "react";
import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isActivationLevel } from "../lib/rules";
import type {
  AssessmentModule,
  UnlockCondition,
  LevelType,
  EvaluationConfig,
} from "@/src/lib/api/assessment";

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SIMPLE_LEVEL_TYPES: LevelType[] = ["activation", "vocabulary"];
const STRICT_LEVEL_TYPES: LevelType[] = ["skill", "passage", "combined"];

export interface LevelFormValues {
  title: string;
  slug: string;
  description: string;
  order: number;
  isFree: boolean;
  isActive: boolean;
  unlockCondition: UnlockCondition;
  levelType?: LevelType;
  passingScore?: number;
  evaluationConfig?: EvaluationConfig;
}

const defaultValues: LevelFormValues = {
  title: "",
  slug: "",
  description: "",
  order: 0,
  isFree: false,
  isActive: true,
  unlockCondition: { type: "none" },
  levelType: "activation",
};

export function levelFormValuesFromModule(m: AssessmentModule): LevelFormValues {
  return {
    title: m.title,
    slug: m.slug,
    description: m.description ?? "",
    order: m.order,
    isFree: m.isFree,
    isActive: m.isActive ?? true,
    unlockCondition: m.unlockCondition ?? { type: "none" },
    levelType: m.levelType ?? "activation",
    passingScore: m.passingScore,
    evaluationConfig: m.evaluationConfig,
  };
}

interface LevelFormProps {
  initialValues?: LevelFormValues;
  existingModules: AssessmentModule[];
  currentModuleId?: string;
  onSubmit: (values: LevelFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  title?: string;
}

export function LevelForm({
  initialValues,
  existingModules,
  currentModuleId,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  title = "Level",
}: LevelFormProps) {
  const [values, setValues] = React.useState<LevelFormValues>(
    initialValues ?? defaultValues,
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isActivation = values.order === 0;
  const titleId = useId();
  const slugId = useId();
  const descId = useId();
  const orderId = useId();
  const unlockId = useId();
  const moduleIdId = useId();

  const handleTitleChange = (title: string) => {
    setValues((prev) => ({
      ...prev,
      title,
      slug: isActivation ? prev.slug : slugFromTitle(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = { ...values };
      if (isActivation) {
        payload.unlockCondition = { type: "none" };
      }
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const unlockTypeDisabled = isActivation;
  const levelType = values.levelType ?? "activation";
  const showPassingScore = SIMPLE_LEVEL_TYPES.includes(levelType);
  const showStrictConfig = STRICT_LEVEL_TYPES.includes(levelType);

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isActivation && (
            <div className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              Activation Level — unlock condition is set to &quot;none&quot;.
            </div>
          )}

          <div className="space-y-2">
            <Label>Level type</Label>
            <select
              value={levelType}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  levelType: e.target.value as LevelType,
                }))
              }
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="activation">Activation</option>
              <option value="vocabulary">Vocabulary</option>
              <option value="skill">Skill</option>
              <option value="passage">Passage</option>
              <option value="combined">Combined</option>
            </select>
          </div>

          {showPassingScore && (
            <div className="space-y-2">
              <Label htmlFor="passingScore">Passing score (min %)</Label>
              <Input
                id="passingScore"
                type="number"
                min={0}
                max={100}
                value={values.passingScore ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    passingScore: e.target.value
                      ? parseInt(e.target.value, 10)
                      : undefined,
                  }))
                }
                placeholder="e.g. 60"
              />
            </div>
          )}

          {showStrictConfig && (
            <div className="space-y-2 rounded-md border border-border p-3">
              <Label className="text-muted-foreground">Strict evaluation</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <Label className="text-xs">Max attempts</Label>
                  <Input
                    type="number"
                    min={1}
                    value={values.evaluationConfig?.maxAttempts ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        evaluationConfig: {
                          maxAttempts: parseInt(e.target.value, 10) || 1,
                          miniTestsPerSet: prev.evaluationConfig?.miniTestsPerSet,
                          strictMode: prev.evaluationConfig?.strictMode ?? true,
                        },
                      }))
                    }
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label className="text-xs">Mini tests per set</Label>
                  <Input
                    type="number"
                    min={1}
                    value={values.evaluationConfig?.miniTestsPerSet ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        evaluationConfig: {
                          maxAttempts: prev.evaluationConfig?.maxAttempts ?? 10,
                          miniTestsPerSet: e.target.value
                            ? parseInt(e.target.value, 10)
                            : undefined,
                          strictMode: prev.evaluationConfig?.strictMode ?? true,
                        },
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={values.evaluationConfig?.strictMode ?? true}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          evaluationConfig: {
                            maxAttempts: prev.evaluationConfig?.maxAttempts ?? 10,
                            miniTestsPerSet: prev.evaluationConfig?.miniTestsPerSet,
                            strictMode: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 rounded border-input"
                    />
                    Strict mode
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={titleId}>Title *</Label>
              <Input
                id={titleId}
                value={values.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Level 0 – Onboarding"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={slugId}>Slug *</Label>
              <Input
                id={slugId}
                value={values.slug}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  }))
                }
                placeholder="level-0-onboarding"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={descId}>Description</Label>
            <textarea
              id={descId}
              value={values.description}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief description"
              rows={2}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={orderId}>Order *</Label>
              <Input
                id={orderId}
                type="number"
                min={0}
                value={values.order}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value, 10) || 0,
                  }))
                }
                required
              />
              {values.order === 0 && (
                <p className="text-xs text-muted-foreground">
                  Order 0 = Activation level (unlock condition forced to &quot;none&quot;).
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Access</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={values.isFree ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValues((prev) => ({ ...prev, isFree: true }))}
                >
                  Free
                </Button>
                <Button
                  type="button"
                  variant={!values.isFree ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValues((prev) => ({ ...prev, isFree: false }))}
                >
                  Paid
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={unlockId}>Unlock condition</Label>
            <select
              id={unlockId}
              disabled={unlockTypeDisabled}
              value={values.unlockCondition.type}
              onChange={(e) => {
                const type = e.target.value as "none" | "module_passed";
                setValues((prev) => ({
                  ...prev,
                  unlockCondition: {
                    type,
                    moduleId: type === "module_passed" ? prev.unlockCondition.moduleId : undefined,
                  },
                }));
              }}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60"
            >
              <option value="none">None (first level)</option>
              <option value="module_passed">After previous module passed</option>
            </select>
            {values.unlockCondition.type === "module_passed" && (
              <div className="mt-2 space-y-1">
                <Label htmlFor={moduleIdId}>Previous module</Label>
                <select
                  id={moduleIdId}
                  value={values.unlockCondition.moduleId ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      unlockCondition: {
                        ...prev.unlockCondition,
                        type: "module_passed",
                        moduleId: e.target.value || undefined,
                      },
                    }))
                  }
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="">Select module</option>
                  {existingModules
                    .filter((m) => !currentModuleId || m._id !== currentModuleId)
                    .sort((a, b) => a.order - b.order)
                    .map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.order}. {m.title}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={values.isActive}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : submitLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
