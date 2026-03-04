"use client";

import { LevelLayout } from "./LevelLayout";
import type { LevelDetailForStudent } from "@/src/lib/api/readingStrictProgression";
import type { ReadingLevel, VersionDetail } from "@/src/lib/api/adminReadingVersions";

export interface LevelRendererPreviewProps {
  level: ReadingLevel;
  detail: VersionDetail;
}

function buildPreviewDetail(level: ReadingLevel, detail: VersionDetail): LevelDetailForStudent & { previewGroupTestsCount?: number } {
  const steps = detail.steps.map((s) => ({
    _id: s._id,
    stepType: s.stepType,
    title: s.title,
    order: s.order,
    contentId: s.contentId ?? undefined,
    isFinalQuiz: s.isFinalQuiz,
    passType: s.passType,
    passValue: s.passValue,
    attemptPolicy: s.attemptPolicy,
    maxAttempts: s.maxAttempts,
  }));

  const hasFinalEvalStep = steps.some((s) => s.stepType === "FINAL_EVALUATION");
  const isSkillWithGroupTests =
    level.levelType === "SKILL" &&
    (detail.groupTests?.length ?? 0) >= 1 &&
    (detail.version.evaluationConfig?.finalEvaluationType ?? "GROUP_TEST") === "GROUP_TEST";

  let finalSteps = steps;
  let currentStepIndex = steps.length;
  let completedStepIds = steps.map((s) => s._id);

  if (!hasFinalEvalStep && isSkillWithGroupTests) {
    const syntheticId = `preview-final-${detail.version._id}`;
    finalSteps = [
      ...steps,
      {
        _id: syntheticId,
        stepType: "FINAL_EVALUATION",
        title: "Final evaluation (group tests)",
        order: steps.length + 1,
        contentId: undefined,
        isFinalQuiz: false,
        passType: undefined,
        passValue: undefined,
        attemptPolicy: undefined,
        maxAttempts: undefined,
      },
    ];
    currentStepIndex = steps.length;
    completedStepIds = steps.map((s) => s._id);
  }

  return {
    level: {
      _id: level._id,
      title: level.title,
      slug: level.slug,
      order: level.order,
      levelType: level.levelType,
    },
    progress: {
      _id: "preview",
      levelId: level._id,
      versionId: detail.version._id,
      currentStepIndex,
      completedStepIds,
      passStatus: "NOT_STARTED",
      evaluationMode: "PROGRESSION",
    },
    steps: finalSteps,
    previewGroupTestsCount: isSkillWithGroupTests ? (detail.groupTests?.length ?? 0) : undefined,
  };
}

export function LevelRenderer({ level, detail }: LevelRendererPreviewProps) {
  const previewDetail = buildPreviewDetail(level, detail);
  return (
    <LevelLayout
      detail={previewDetail}
      loading={false}
      completingStepId={null}
      onComplete={() => {}}
      onLevelPassed={() => {}}
      onProgressUpdate={() => {}}
      isPreview
      previewGroupTestsCount={(previewDetail as { previewGroupTestsCount?: number }).previewGroupTestsCount}
    />
  );
}
