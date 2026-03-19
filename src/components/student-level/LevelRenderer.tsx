"use client";

import { LevelLayout } from "./LevelLayout";
import type { LevelDetailForStudent } from "@/src/lib/api/readingStrictProgression";
import type { ReadingLevel, VersionDetail } from "@/src/lib/api/adminReadingVersions";

export interface LevelRendererPreviewProps {
  level: ReadingLevel;
  detail: VersionDetail;
  /** 0-based step index to show as current (student view). Omit to show all steps completed. */
  initialStepIndex?: number;
}

function buildPreviewDetail(
  level: ReadingLevel,
  detail: VersionDetail,
  initialStepIndex?: number,
): LevelDetailForStudent & { previewGroupTestsCount?: number } {
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

  if (initialStepIndex != null && initialStepIndex >= 0) {
    const clamped = Math.min(initialStepIndex, steps.length);
    currentStepIndex = clamped;
    completedStepIds = steps.slice(0, clamped).map((s) => s._id);
  }

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
    if (initialStepIndex == null) {
      currentStepIndex = steps.length;
      completedStepIds = steps.map((s) => s._id);
    }
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

export function LevelRenderer({ level, detail, initialStepIndex }: LevelRendererPreviewProps) {
  const previewDetail = buildPreviewDetail(level, detail, initialStepIndex);
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
