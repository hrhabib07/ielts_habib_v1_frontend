"use client";

import { LevelLayout } from "./LevelLayout";
import type { LevelDetailForStudent } from "@/src/lib/api/readingStrictProgression";
import type { ReadingLevel, VersionDetail } from "@/src/lib/api/adminReadingVersions";
import { isReadingFoundationL0 } from "@/src/lib/readingLevelOrder";

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
): LevelDetailForStudent & {
  previewGroupTestsCount?: number;
  previewIsL0SentenceLocatorFinals?: boolean;
} {
  const steps = detail.steps.map((s) => ({
    _id: s._id,
    stepType: s.stepType,
    title: s.title,
    order: s.order,
    contentId: s.contentId ?? undefined,
    practiceTestId: s.practiceTestId ?? undefined,
    isFinalQuiz: s.isFinalQuiz,
    passType: s.passType,
    passValue: s.passValue,
    attemptPolicy: s.attemptPolicy,
    maxAttempts: s.maxAttempts,
  }));

  const hasFinalEvalStep = steps.some((s) => s.stepType === "FINAL_EVALUATION");
  const evalType = detail.version.evaluationConfig?.finalEvaluationType ?? "GROUP_TEST";
  const isSkillWithGroupTests =
    level.levelType === "SKILL" &&
    (detail.groupTests?.length ?? 0) >= 1 &&
    (evalType === "GROUP_TEST" || evalType === "SEQUENTIAL_FINALS");
  const isFoundationL0BandFinals =
    isReadingFoundationL0(level) &&
    (detail.finalTest?.contentFormat === "SENTENCE_LOCATOR" ||
      (evalType === "GROUP_TEST" || evalType === "SEQUENTIAL_FINALS"));

  let finalSteps = steps;
  let currentStepIndex = steps.length;
  let completedStepIds = steps.map((s) => s._id);

  if (!hasFinalEvalStep && (isSkillWithGroupTests || isFoundationL0BandFinals)) {
    const syntheticId = `preview-final-${detail.version._id}`;
    finalSteps = [
      ...steps,
      {
        _id: syntheticId,
        stepType: "FINAL_EVALUATION",
        title: isFoundationL0BandFinals
          ? "Final evaluation (three passage finals)"
          : "Final evaluation (group tests)",
        order: steps.length + 1,
        contentId: undefined,
        practiceTestId: undefined,
        isFinalQuiz: false,
        passType: undefined,
        passValue: undefined,
        attemptPolicy: undefined,
        maxAttempts: undefined,
      },
    ];
    if (initialStepIndex == null) {
      currentStepIndex = finalSteps.length - 1;
      completedStepIds = finalSteps.slice(0, -1).map((s) => s._id);
    }
  }

  if (initialStepIndex != null && initialStepIndex >= 0) {
    const clamped = Math.min(initialStepIndex, Math.max(0, finalSteps.length - 1));
    currentStepIndex = clamped;
    completedStepIds = finalSteps.slice(0, clamped).map((s) => s._id);
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
    previewIsL0SentenceLocatorFinals: isFoundationL0BandFinals,
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
      previewGroupTestsCount={previewDetail.previewGroupTestsCount}
      previewIsL0SentenceLocatorFinals={previewDetail.previewIsL0SentenceLocatorFinals}
    />
  );
}
