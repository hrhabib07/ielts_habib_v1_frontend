"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateEvaluationConfig,
  type ReadingLevelVersion,
  type UpdateEvaluationConfigPayload,
} from "@/src/lib/api/adminReadingVersions";
import { Loader2 } from "lucide-react";

interface EvaluationConfigFormProps {
  version: ReadingLevelVersion;
  disabled: boolean;
  onVersionChange: (v: ReadingLevelVersion) => void;
}

const FINAL_EVAL_OPTIONS = [
  { value: "GROUP_TEST", label: "Group test" },
  { value: "FINAL_QUIZ", label: "Final quiz" },
];

export function EvaluationConfigForm({
  version,
  disabled,
  onVersionChange,
}: EvaluationConfigFormProps) {
  const config = version.evaluationConfig ?? {};
  const [maxAttempts, setMaxAttempts] = useState<string>(
    config.maxAttempts != null ? String(config.maxAttempts) : "",
  );
  const [finalEvaluationType, setFinalEvaluationType] = useState<string>(
    config.finalEvaluationType && config.finalEvaluationType !== ""
      ? config.finalEvaluationType
      : "GROUP_TEST",
  );
  const [passMarkPercent, setPassMarkPercent] = useState<string>(
    config.passMarkPercent != null ? String(config.passMarkPercent) : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isGroupTest = (finalEvaluationType || "GROUP_TEST") === "GROUP_TEST";

  useEffect(() => {
    const c = version.evaluationConfig ?? {};
    setMaxAttempts(c.maxAttempts != null ? String(c.maxAttempts) : "");
    setFinalEvaluationType(
      c.finalEvaluationType && c.finalEvaluationType !== ""
        ? c.finalEvaluationType
        : "GROUP_TEST",
    );
    setPassMarkPercent(c.passMarkPercent != null ? String(c.passMarkPercent) : "");
  }, [version.evaluationConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload: UpdateEvaluationConfigPayload = {};
    if (maxAttempts.trim() !== "") {
      const n = Number(maxAttempts);
      if (Number.isFinite(n) && n >= 1) payload.maxAttempts = n;
    }
    payload.finalEvaluationType = finalEvaluationType || "GROUP_TEST";
    // Pass mark % only applies to Final quiz; group tests pass by student's target band.
    if (!isGroupTest && passMarkPercent.trim() !== "") {
      const n = Number(passMarkPercent);
      if (Number.isFinite(n) && n >= 0 && n <= 100) payload.passMarkPercent = n;
    }
    if (isGroupTest) payload.passMarkPercent = undefined;
    try {
      const updated = await updateEvaluationConfig(version._id, payload);
      onVersionChange(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update config");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation config</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div>
            <Label>Max attempts</Label>
            <Input
              type="number"
              min={1}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              placeholder="e.g. 3"
              disabled={disabled}
            />
          </div>
          <div>
            <Label>Final evaluation type</Label>
            <select
              className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={finalEvaluationType || "GROUP_TEST"}
              onChange={(e) => setFinalEvaluationType(e.target.value)}
              disabled={disabled}
            >
              {FINAL_EVAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {finalEvaluationType === "GROUP_TEST" && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Add at least one Group test below (each with 3 passage question sets). Steps above are optional.
              </p>
            )}
            {finalEvaluationType === "GROUP_TEST" && (
              <p className="mt-1.5 rounded-md bg-primary/5 px-2 py-1.5 text-xs text-primary">
                Group tests are <strong>band-based</strong>: students pass when their score meets their target band (e.g. 5.5). No percentage pass mark.
              </p>
            )}
          </div>
          {!isGroupTest && (
            <div>
              <Label>Pass mark % (0–100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={passMarkPercent}
                onChange={(e) => setPassMarkPercent(e.target.value)}
                placeholder="e.g. 60"
                disabled={disabled}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Used for Final quiz steps (percentage to pass).
              </p>
            </div>
          )}
          {!disabled && (
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
