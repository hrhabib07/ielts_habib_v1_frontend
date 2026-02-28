"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { forceAssessmentType, defaultPassingScoreForActivation } from "../lib/rules";
import type { AssessmentModule, AssessmentType } from "@/src/lib/api/assessment";

export interface AssessmentFormValues {
  type: AssessmentType;
  passingScore: number;
  durationMinutes?: number;
  negativeMarkingRatio?: number;
  maxAttempts?: number | null;
}

interface AssessmentFormProps {
  module: AssessmentModule | null;
  initialValues?: AssessmentFormValues;
  onSubmit: (values: AssessmentFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

const ASSESSMENT_TYPES: { value: AssessmentType; label: string }[] = [
  { value: "activation", label: "Activation" },
  { value: "checkpoint", label: "Checkpoint" },
  { value: "evaluation", label: "Evaluation" },
];

export function AssessmentForm({
  module,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: AssessmentFormProps) {
  const forcedType = forceAssessmentType(module);
  const defaultPassing = defaultPassingScoreForActivation();
  const [values, setValues] = React.useState<AssessmentFormValues>({
    type: initialValues?.type ?? (forcedType ?? "checkpoint"),
    passingScore: initialValues?.passingScore ?? defaultPassing,
    durationMinutes: initialValues?.durationMinutes,
    negativeMarkingRatio: initialValues?.negativeMarkingRatio,
    maxAttempts: initialValues?.maxAttempts ?? null,
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const typeLocked = forcedType != null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = { ...values };
      if (forcedType) payload.type = forcedType;
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {typeLocked && (
            <div className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              Activation level — type is set to &quot;activation&quot;.
            </div>
          )}

          <div className="space-y-2">
            <Label>Type</Label>
            <select
              value={values.type}
              disabled={typeLocked}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  type: e.target.value as AssessmentType,
                }))
              }
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60"
            >
              {ASSESSMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passingScore">Passing score *</Label>
            <Input
              id="passingScore"
              type="number"
              min={0}
              value={values.passingScore}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  passingScore: parseInt(e.target.value, 10) || 0,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              id="durationMinutes"
              type="number"
              min={1}
              value={values.durationMinutes ?? ""}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  durationMinutes: e.target.value ? parseInt(e.target.value, 10) : undefined,
                }))
              }
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="negativeMarkingRatio">Negative marking ratio (0–1)</Label>
            <Input
              id="negativeMarkingRatio"
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={values.negativeMarkingRatio ?? ""}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  negativeMarkingRatio: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                }))
              }
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAttempts">Max attempts</Label>
            <Input
              id="maxAttempts"
              type="number"
              min={1}
              value={values.maxAttempts ?? ""}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  maxAttempts: e.target.value
                    ? parseInt(e.target.value, 10)
                    : null,
                }))
              }
              placeholder="Unlimited"
            />
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
