import type {
  IntegratedLesson,
  IntegratedLessonBlock,
} from "@/src/lib/api/adminReadingVersions";
import type { IntegratedLessonStepContent } from "@/src/lib/api/readingStrictProgression";
import { normalizeLocalizedText } from "@/src/lib/localizedText";

function mapBlockForStudentView(block: IntegratedLessonBlock): IntegratedLessonStepContent["blocks"][number] {
  if (block.type === "NOTE") {
    return {
      type: "NOTE",
      order: block.order,
      body: normalizeLocalizedText(block.body),
    };
  }

  const quizTitle = normalizeLocalizedText(block.quizTitle);
  if (!quizTitle.en.trim() && !quizTitle.bn.trim()) {
    quizTitle.en = "Micro Quiz";
    quizTitle.bn = "Micro Quiz";
  }

  return {
    type: "MICRO_QUIZ",
    order: block.order,
    quizTitle,
    questions: (block.questions ?? []).map((q) => ({
      _id: q._id,
      type: q.type,
      questionText: normalizeLocalizedText(q.questionText),
      options: (q.options ?? []).map((o) =>
        typeof o === "string" ? normalizeLocalizedText({ en: o, bn: o }) : normalizeLocalizedText(o),
      ),
      marks: q.marks ?? 1,
      explanation: q.explanation
        ? normalizeLocalizedText(q.explanation)
        : undefined,
    })),
  };
}

export interface IntegratedLessonPreviewPayload {
  content: IntegratedLessonStepContent;
  instructorGradingBlocks: IntegratedLessonBlock[];
}

export function buildIntegratedLessonPreviewPayload(
  lesson: Pick<IntegratedLesson, "_id" | "title" | "lessonCode" | "lessonNumber">,
  blocks: IntegratedLessonBlock[],
): IntegratedLessonPreviewPayload {
  const sorted = [...blocks]
    .map((b, i) => ({ ...b, order: b.order ?? i }))
    .sort((a, b) => a.order - b.order);

  const content: IntegratedLessonStepContent = {
    lessonId: lesson._id,
    title: lesson.title,
    lessonNumber: lesson.lessonNumber,
    lessonCode: lesson.lessonCode,
    blocks: sorted.map(mapBlockForStudentView),
    instructorGradingBlocks: sorted,
  };

  return {
    content,
    instructorGradingBlocks: sorted,
  };
}
