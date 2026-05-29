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
import { isReadingFoundationL0 } from "@/src/lib/readingLevelOrder";

interface EvaluationConfigFormProps {
  version: ReadingLevelVersion;
  levelType: ReadingLevelType;
  /** Curriculum order; 0 = IELTS Reading Basics (Foundation band-finals option). */
  levelOrder?: number | null;
  disabled: boolean;
  onVersionChange: (v: ReadingLevelVersion) => void;
}

function isFoundationBandFinalType(t: string | undefined): boolean {
  return t === "GROUP_TEST" || t === "SEQUENTIAL_FINALS";
}

export function EvaluationConfigForm({
  version,
  levelType,
  levelOrder,
  disabled,
  onVersionChange,
}: EvaluationConfigFormProps) {
  const config = version.evaluationConfig ?? {};
  const isSkill = levelType === "SKILL";
  const isFoundationL0 =
    !isSkill &&
    isReadingFoundationL0({ levelType, order: levelOrder ?? -1 });
  const [maxAttempts, setMaxAttempts] = useState<string>(
    config.maxAttempts != null ? String(config.maxAttempts) : "",
  );
  const [finalEvaluationType, setFinalEvaluationType] = useState<string>(
    isSkill
      ? "SEQUENTIAL_FINALS"
      : isFoundationL0
        ? isFoundationBandFinalType(config.finalEvaluationType)
          ? "SEQUENTIAL_FINALS"
          : "FINAL_QUIZ"
        : isFoundationBandFinalType(config.finalEvaluationType)
          ? config.finalEvaluationType
          : "GROUP_TEST",
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
    } else if (isFoundationL0) {
      setFinalEvaluationType(
        isFoundationBandFinalType(c.finalEvaluationType) ? "SEQUENTIAL_FINALS" : "FINAL_QUIZ",
      );
    } else {
      setFinalEvaluationType(
        isFoundationBandFinalType(c.finalEvaluationType)
          ? c.finalEvaluationType
          : "GROUP_TEST",
      );
    }
    setPassMarkPercent(c.passMarkPercent != null ? String(c.passMarkPercent) : "");
  }, [version.evaluationConfig, isSkill, isFoundationL0]);

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
    } else if (isFoundationL0) {
      const fe = finalEvaluationType === "FINAL_QUIZ" ? "FINAL_QUIZ" : "SEQUENTIAL_FINALS";
      payload.finalEvaluationType = fe;
      if (fe === "FINAL_QUIZ" && passMarkPercent.trim() !== "") {
        const n = Number(passMarkPercent);
        if (Number.isFinite(n) && n >= 0 && n <= 100) payload.passMarkPercent = n;
      }
    } else {
      payload.finalEvaluationType = isFoundationBandFinalType(finalEvaluationType)
        ? finalEvaluationType
        : "GROUP_TEST";
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
          ) : isFoundationL0 ? (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <strong className="text-foreground">Level 0:</strong> use the{" "}
              <strong className="text-foreground">Final tests</strong> section in the level builder
              (three passage + statement tests). Final quiz mode is not used for this level.
            </div>
          ) : (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <strong className="text-foreground">Final evaluation:</strong> group test with three
              passages (section 2). Final quiz steps are no longer used.
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
