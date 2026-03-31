import type {
  Passage,
  PassageDifficulty,
  PassageParagraphInput,
  ReadingQuestionType,
  QuestionBody,
  QuestionBlank,
  QuestionSetMeta,
  PassageQuestionSet,
  BulkQuestionItem,
} from "@/src/lib/api/instructor";

import {
  createBulkQuestions,
  createPassageQuestionSet,
  createQuestionSet,
} from "@/src/lib/api/instructor";
import { QUESTION_TYPE_CONFIG } from "@/src/lib/questionTypeConfig";

export type BulkPassageInput = {
  title: string;
  subTitle?: string;
  contentParagraphs: PassageParagraphInput[];
};

export type BulkQuestionGroupInput = {
  order?: number;
  startQuestionNumber: number;
  endQuestionNumber: number;
  questionType: ReadingQuestionType;
  instruction?: string;
  meta: QuestionSetMeta;
  questions: Array<
    Omit<BulkQuestionItem, "questionBody"> & {
      questionBody: QuestionBody;
      blanks?: QuestionBlank[];
    }
  >;
};

export type BulkPassageQuestionSetInput = {
  difficulty: PassageDifficulty;
  expectedTotalQuestions: number;
  recommendedTimeMinutes: number;
  questionGroups: BulkQuestionGroupInput[];
};

/**
 * Completion groups may encode multiple answer slots in one question body via blanks[].
 * SUMMARY_COMPLETION_WITH_CLUES: see summaryWithCluesBulk.ts (IELTS multi-sentence blocks + word bank).
 */
const GAP_COUNT_BY_BLANKS_TYPES: ReadonlySet<ReadingQuestionType> = new Set([
  "SENTENCE_COMPLETION",
  "SUMMARY_COMPLETION",
  "SUMMARY_COMPLETION_WITH_CLUES",
  "NOTE_COMPLETION",
  "TABLE_COMPLETION",
  "FLOW_CHART_COMPLETION",
  "DIAGRAM_LABEL_COMPLETION",
]);

function countQuestionsRepresentedByGroup(
  questionType: ReadingQuestionType,
  questions: BulkQuestionGroupInput["questions"],
): number {
  if (!GAP_COUNT_BY_BLANKS_TYPES.has(questionType)) {
    return questions.length;
  }

  return questions.reduce((sum, q) => {
    const blankCount = Array.isArray(q.blanks) ? q.blanks.length : 0;
    return sum + (blankCount > 0 ? blankCount : 1);
  }, 0);
}

function formatPassageCodeId(p: Passage): string {
  if (typeof p.passageCode === "string") return p.passageCode;
  return (p.passageCode as { _id: string })._id;
}

function shouldShowParagraphLabels(questionGroups: BulkQuestionGroupInput[]): boolean {
  // Matching information uses paragraph labels (A, B, C...) in the UI.
  return questionGroups.some((g) => g.questionType === "MATCHING_INFORMATION");
}

/** Ensure every question has questionBody so POST /api/reading/question/bulk does not fail. MCQ/other often use "content" or "text" at top level. */
function normalizeQuestionBody(q: BulkQuestionGroupInput["questions"][number]): QuestionBody {
  const body = (q as { questionBody?: QuestionBody }).questionBody;
  if (body && typeof body === "object" && body.layout && body.content !== undefined) {
    return body;
  }
  const raw = q as { content?: string; text?: string; question?: string };
  const text =
    typeof raw.content === "string"
      ? raw.content
      : typeof raw.text === "string"
        ? raw.text
        : typeof raw.question === "string"
          ? raw.question
          : "Question";
  return { layout: "TEXT", content: text };
}

function validateGroupCoverage(input: BulkPassageQuestionSetInput): { min: number; max: number } {
  const totalFromGroups = input.questionGroups.reduce(
    (sum, g) => sum + (g.endQuestionNumber - g.startQuestionNumber + 1),
    0,
  );

  if (totalFromGroups !== input.expectedTotalQuestions) {
    throw new Error(
      `Question count mismatch: expectedTotalQuestions=${input.expectedTotalQuestions}, but groups total=${totalFromGroups}`,
    );
  }

  // Backend also validates continuity, but we do a fast client-side check for clearer errors.
  const nums: number[] = [];
  for (const g of input.questionGroups) {
    for (let q = g.startQuestionNumber; q <= g.endQuestionNumber; q++) nums.push(q);
  }
  const uniq = new Set(nums);
  if (uniq.size !== nums.length) {
    throw new Error("Overlapping question numbers detected in questionGroups");
  }
  const sorted = [...uniq].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const nxt = sorted[i + 1];
    if (cur === undefined || nxt === undefined) continue;
    if (nxt !== cur + 1) {
      throw new Error("Question numbers must be continuous without gaps in questionGroups");
    }
  }

  return { min: sorted[0] ?? 1, max: sorted[sorted.length - 1] ?? 1 };
}

/** Completion-style types: backend Zod requires either wordLimit or options. */
const COMPLETION_META_REFINE_TYPES: ReadingQuestionType[] = [
  "SENTENCE_COMPLETION",
  "SUMMARY_COMPLETION",
  "NOTE_COMPLETION",
  "TABLE_COMPLETION",
  "FLOW_CHART_COMPLETION",
];

/**
 * Merge type defaults with bulk JSON meta and patch gaps so POST /api/reading/questionSet passes Zod
 * (e.g. MATCHING_INFORMATION.paragraphCount, completion wordLimit/options, MATCHING_HEADINGS.headings).
 */
function normalizeMetaForQuestionSet(
  questionType: ReadingQuestionType,
  meta: QuestionSetMeta | undefined,
  questions: BulkQuestionGroupInput["questions"],
  passageParagraphCount?: number,
): QuestionSetMeta {
  const defaults = QUESTION_TYPE_CONFIG[questionType]?.defaultMeta ?? {};
  const merged: QuestionSetMeta = { ...defaults, ...(meta ?? {}) };

  if (questionType === "MCQ_SINGLE" || questionType === "MCQ_MULTIPLE") {
    const options =
      Array.isArray(merged.options) && merged.options.length >= 2
        ? merged.options
        : (() => {
            const set = new Set<string>();
            for (const q of questions) {
              const opts = (q as { options?: string[] }).options;
              if (Array.isArray(opts)) for (const o of opts) if (typeof o === "string" && o.trim()) set.add(o.trim());
            }
            const arr = [...set];
            return arr.length >= 2
              ? arr
              : arr.length === 1
                ? [arr[0] ?? "A", "Other"]
                : ["A", "B"];
          })();
    const selectCount =
      merged.selectCount === 1 || merged.selectCount === 2
        ? merged.selectCount
        : questionType === "MCQ_MULTIPLE"
          ? 2
          : 1;
    return { ...merged, options, selectCount };
  }

  if (questionType === "MATCHING_INFORMATION") {
    const pc = merged.paragraphCount;
    const valid = typeof pc === "number" && Number.isFinite(pc) && pc >= 1;
    if (valid) return merged;
    const fromPassage =
      typeof passageParagraphCount === "number" && passageParagraphCount >= 1
        ? passageParagraphCount
        : undefined;
    return {
      ...merged,
      paragraphCount: fromPassage ?? defaults.paragraphCount ?? 4,
    };
  }

  if (questionType === "MATCHING_HEADINGS") {
    const headings =
      Array.isArray(merged.headings) && merged.headings.length >= 2
        ? merged.headings
        : defaults.headings ?? ["Heading i", "Heading ii"];
    const allowReuse = typeof merged.allowReuse === "boolean" ? merged.allowReuse : (defaults.allowReuse ?? false);
    return { ...merged, headings, allowReuse };
  }

  if (questionType === "MATCHING_FEATURES") {
    const features =
      Array.isArray(merged.features) && merged.features.length >= 2
        ? merged.features
        : defaults.features ?? ["Feature A", "Feature B"];
    return { ...merged, features };
  }

  if (questionType === "MATCHING_SENTENCE_ENDINGS") {
    const endings =
      Array.isArray(merged.endings) && merged.endings.length >= 2
        ? merged.endings
        : defaults.endings ?? ["Ending A", "Ending B"];
    return { ...merged, endings };
  }

  if (questionType === "TRUE_FALSE_NOT_GIVEN" || questionType === "YES_NO_NOT_GIVEN") {
    const labels =
      Array.isArray(merged.labels) && merged.labels.length === 3
        ? merged.labels
        : defaults.labels ?? (questionType === "TRUE_FALSE_NOT_GIVEN"
            ? ["TRUE", "FALSE", "NOT GIVEN"]
            : ["YES", "NO", "NOT GIVEN"]);
    return { ...merged, labels };
  }

  if (questionType === "DIAGRAM_LABEL_COMPLETION") {
    const labels =
      Array.isArray(merged.labels) && merged.labels.length >= 1
        ? merged.labels
        : defaults.labels ?? ["Label 1"];
    return { ...merged, labels };
  }

  if (questionType === "SHORT_ANSWER") {
    const wl = merged.wordLimit;
    if (typeof wl === "number" && wl >= 1 && wl <= 5) return merged;
    return { ...merged, wordLimit: defaults.wordLimit ?? 3 };
  }

  if (questionType === "SUMMARY_COMPLETION_WITH_CLUES") {
    const options =
      Array.isArray(merged.options) && merged.options.length >= 2
        ? merged.options
        : defaults.options ?? ["option A", "option B", "option C", "option D"];
    return { ...merged, options };
  }

  if (COMPLETION_META_REFINE_TYPES.includes(questionType)) {
    const hasWord = typeof merged.wordLimit === "number" && merged.wordLimit >= 1;
    const hasOpts = Array.isArray(merged.options) && merged.options.length > 0;
    if (hasWord || hasOpts) return merged;
    return { ...merged, wordLimit: defaults.wordLimit ?? 1 };
  }

  return merged;
}

export async function createPassageQuestionSetFromBulkInput(params: {
  passage: Passage;
  passageNumber: 1 | 2 | 3;
  questionSetInput: BulkPassageQuestionSetInput;
}): Promise<PassageQuestionSet> {
  const { passage, passageNumber, questionSetInput } = params;

  validateGroupCoverage(questionSetInput);

  const passageCodeId = formatPassageCodeId(passage);
  const hasParagraphIndexing = shouldShowParagraphLabels(questionSetInput.questionGroups);
  const passageParagraphCount = Array.isArray(passage.content) ? passage.content.length : undefined;

  const questionGroupIds: string[] = [];

  for (let idx = 0; idx < questionSetInput.questionGroups.length; idx++) {
    const g = questionSetInput.questionGroups[idx];
    if (!g) continue;
    const expectedGroupCount = g.endQuestionNumber - g.startQuestionNumber + 1;
    const representedCount = countQuestionsRepresentedByGroup(
      g.questionType,
      g.questions,
    );

    if (!Array.isArray(g.questions) || representedCount !== expectedGroupCount) {
      throw new Error(
        `Question group ${idx + 1} count mismatch: expected ${expectedGroupCount} question numbers, got ${representedCount} from ${g.questions?.length ?? 0} question bodies.`,
      );
    }

    const meta = normalizeMetaForQuestionSet(
      g.questionType,
      g.meta,
      g.questions,
      passageParagraphCount,
    );
    const createdGroup = await createQuestionSet({
      passageId: passage._id,
      passageNumber,
      order: g.order ?? idx + 1,
      instruction: g.instruction ?? "",
      startQuestionNumber: g.startQuestionNumber,
      endQuestionNumber: g.endQuestionNumber,
      questionType: g.questionType,
      meta,
    });

    await createBulkQuestions({
      passageId: passage._id,
      questionSetId: createdGroup._id,
      difficulty: questionSetInput.difficulty,
      questions: g.questions.map((q) => ({
        questionBody: normalizeQuestionBody(q),
        explanation: (q as { explanation?: string }).explanation ?? "Explanation.",
        options: (q as { options?: string[] }).options,
        correctAnswer: (q as { correctAnswer?: string | string[] }).correctAnswer,
        blanks: (q as { blanks?: QuestionBlank[] }).blanks,
        weaknessTags: (q as { weaknessTags?: string[] }).weaknessTags,
      })),
    });

    questionGroupIds.push(createdGroup._id);
  }

  return createPassageQuestionSet({
    passageId: passage._id,
    passageCode: passageCodeId,
    passageNumber,
    title: `${passage.title} · P${passageNumber}`,
    difficulty: questionSetInput.difficulty,
    hasParagraphIndexing,
    questionGroupIds,
    expectedTotalQuestions: questionSetInput.expectedTotalQuestions,
    recommendedTime: questionSetInput.recommendedTimeMinutes,
  });
}

