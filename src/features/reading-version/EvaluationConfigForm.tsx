"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateEvaluationConfig,
  type ReadingLevelVersion,
  type ReadingLevelType,
  type UpdateEvaluationConfigPayload,
} from "@/src/lib/api/adminReadingVersions";
import { Loader2 } from "lucide-react";

interface EvaluationConfigFormProps {
  version: ReadingLevelVersion;
  levelType: ReadingLevelType;
  disabled: boolean;
  onVersionChange: (v: ReadingLevelVersion) => void;
}

export function EvaluationConfigForm({
  version,
  levelType,
  disabled,
  onVersionChange,
}: EvaluationConfigFormProps) {
  const config = version.evaluationConfig ?? {};
  const isSkill = levelType === "SKILL";
  const [maxAttempts, setMaxAttempts] = useState<string>(
    config.maxAttempts != null ? String(config.maxAttempts) : "",
  );
  const [finalEvaluationType, setFinalEvaluationType] = useState<string>(
    isSkill
      ? "SEQUENTIAL_FINALS"
      : config.finalEvaluationType && config.finalEvaluationType !== ""
        ? config.finalEvaluationType
        : "FINAL_QUIZ",
  );
  const [passMarkPercent, setPassMarkPercent] = useState<string>(
    config.passMarkPercent != null ? String(config.passMarkPercent) : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const c = version.evaluationConfig ?? {};
    setMaxAttempts(c.maxAttempts != null ? String(c.maxAttempts) : "");
    if (isSkill) {
      setFinalEvaluationType("SEQUENTIAL_FINALS");
    } else {
      setFinalEvaluationType(
        c.finalEvaluationType && c.finalEvaluationType !== ""
          ? c.finalEvaluationType
          : "FINAL_QUIZ",
      );
    }
    setPassMarkPercent(c.passMarkPercent != null ? String(c.passMarkPercent) : "");
  }, [version.evaluationConfig, isSkill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const payload: UpdateEvaluationConfigPayload = {};
    if (maxAttempts.trim() !== "") {
      const n = Number(maxAttempts);
      if (Number.isFinite(n) && n >= 1) payload.maxAttempts = n;
    }
    if (isSkill) {
      payload.finalEvaluationType = "SEQUENTIAL_FINALS";
    } else {
      payload.finalEvaluationType = finalEvaluationType || "FINAL_QUIZ";
      if (passMarkPercent.trim() !== "") {
        const n = Number(passMarkPercent);
        if (Number.isFinite(n) && n >= 0 && n <= 100) payload.passMarkPercent = n;
      }
    }
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
            <Label>Max attempts (legacy group pool)</Label>
            <Input
              type="number"
              min={1}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              placeholder="Optional"
              disabled={disabled}
            />
          </div>
          {isSkill ? (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <strong className="text-foreground">Final evaluation:</strong> three sequential final
              tests (one passage each). Configure passages in <strong>Final tests</strong> below.
              Students pass when they reach their target band on any final (mastery).
            </div>
          ) : (
            <div>
              <Label>Pass mark % for final quiz (0–100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={passMarkPercent}
                onChange={(e) => setPassMarkPercent(e.target.value)}
                placeholder="e.g. 60"
                disabled={disabled}
              />
            </div>
          )}
          {!disabled && (
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
