"use client";

import { LevelLayout } from "./LevelLayout";
import type { LevelDetailForStudent } from "@/src/lib/api/readingStrictProgression";
import type { ReadingLevel, VersionDetail } from "@/src/lib/api/adminReadingVersions";

export interface LevelRendererPreviewProps {
  level: ReadingLevel;
  detail: VersionDetail;
}

function buildPreviewDetail(level: ReadingLevel, detail: VersionDetail): LevelDetailForStudent {
  const stepIds = detail.steps.map((s) => s._id);
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
      currentStepIndex: detail.steps.length,
      completedStepIds: stepIds,
      passStatus: "NOT_STARTED",
      evaluationMode: "PROGRESSION",
    },
    steps: detail.steps.map((s) => ({
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
    })),
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
    />
  );
}
