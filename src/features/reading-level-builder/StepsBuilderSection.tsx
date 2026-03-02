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
        <CardHeader className="p-0 pb-6">
          <CardTitle className="text-lg font-semibold">Steps</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <StepBuilder
            versionId={versionId}
            steps={steps}
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
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-lg font-semibold">Group tests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
