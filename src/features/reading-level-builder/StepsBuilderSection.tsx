"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ReadingLevelStep,
  type GroupTest,
  type VersionDetail,
} from "@/src/lib/api/adminReadingVersions";
import { GroupTestBuilder } from "@/src/features/reading-version";
import { StepBuilder } from "@/src/features/reading-version/StepBuilder";
import { EvaluationConfigForm } from "@/src/features/reading-version/EvaluationConfigForm";
import { FinalQuizSettingsCard } from "@/src/features/reading-version/FinalQuizSettingsCard";

interface StepsBuilderSectionProps {
  levelId: string;
  versionId: string;
  versionStatus: string;
  steps: ReadingLevelStep[];
  groupTests: GroupTest[];
  onDetailChange: (detail: VersionDetail) => void;
  currentDetail: VersionDetail;
}

export function StepsBuilderSection({
  levelId,
  versionId,
  versionStatus,
  steps,
  groupTests,
  onDetailChange,
  currentDetail,
}: StepsBuilderSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const disabled = versionStatus === "PUBLISHED";
  const finalEvalType = currentDetail.version?.evaluationConfig?.finalEvaluationType ?? "";
  const showGroupTests = finalEvalType !== "FINAL_QUIZ";

  const handleStepsChange = useCallback(
    (newSteps: ReadingLevelStep[]) => {
      onDetailChange({ ...currentDetail, steps: newSteps });
    },
    [onDetailChange, currentDetail],
  );

  const handleGroupTestsChange = useCallback(
    (newGroupTests: GroupTest[]) => {
      onDetailChange({ ...currentDetail, groupTests: newGroupTests });
    },
    [onDetailChange, currentDetail],
  );

  return (
    <div className="space-y-8">
      <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-lg font-semibold">Steps</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Add learning steps (optional). For <strong>Skill levels with Group test</strong>, the final evaluation is the group tests you add below — no separate step needed.
          </p>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <StepBuilder
            versionId={versionId}
            steps={steps}
            practiceTests={currentDetail.practiceTests ?? []}
            disabled={disabled}
            onStepsChange={handleStepsChange}
          />
        </CardContent>
      </Card>

      <EvaluationConfigForm
        version={currentDetail.version}
        disabled={disabled}
        onVersionChange={(v) => onDetailChange({ ...currentDetail, version: v })}
      />

      <FinalQuizSettingsCard steps={steps} />

      {showGroupTests && (
        <Card className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-lg font-semibold">Group tests (final evaluation)</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Each group test = 3 passage question sets (3 mini tests). Students attempt them in order. Add at least one group test to publish this level.
            </p>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <GroupTestBuilder
              versionId={versionId}
              groupTests={groupTests}
              disabled={disabled}
              onGroupTestsChange={handleGroupTestsChange}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
