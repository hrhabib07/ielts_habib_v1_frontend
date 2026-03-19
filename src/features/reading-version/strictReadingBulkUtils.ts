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

function formatPassageCodeId(p: Passage): string {
  if (typeof p.passageCode === "string") return p.passageCode;
  return (p.passageCode as { _id: string })._id;
}

function shouldShowParagraphLabels(questionGroups: BulkQuestionGroupInput[]): boolean {
  // Matching information uses paragraph labels (A, B, C...) in the UI.
  return questionGroups.some((g) => g.questionType === "MATCHING_INFORMATION");
}

/** Ensure every question has questionBody so POST /api/reading/question/bulk does not fail. MCQ/other often use "content" or "text" at top level. */
function normalizeQuestionBody(
  q: BulkQuestionGroupInput["questions"][number],
): { layout: "TEXT" | "PASSAGE" | "TABLE" | "FLOWCHART" | "DIAGRAM" | "NOTE"; content: string | string[][] | unknown } {
  const body = (q as { questionBody?: QuestionBody }).questionBody;
  if (body && typeof body === "object" && body.layout && body.content !== undefined) {
    return {
      layout: body.layout as "TEXT" | "PASSAGE" | "TABLE" | "FLOWCHART" | "DIAGRAM" | "NOTE",
      content: body.content,
    };
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
    if (sorted[i + 1] !== sorted[i] + 1) {
      throw new Error("Question numbers must be continuous without gaps in questionGroups");
    }
  }

  return { min: sorted[0] ?? 1, max: sorted[sorted.length - 1] ?? 1 };
}

/** Backend requires meta.options (array, min 2) and meta.selectCount (1 | 2) for MCQ. Normalize so POST /api/reading/questionSet does not ZodError. */
function normalizeMetaForQuestionSet(
  questionType: ReadingQuestionType,
  meta: QuestionSetMeta | undefined,
  questions: BulkQuestionGroupInput["questions"],
): QuestionSetMeta {
  if (questionType !== "MCQ_SINGLE" && questionType !== "MCQ_MULTIPLE") {
    return meta ?? {};
  }
  const options =
    Array.isArray(meta?.options) && meta.options.length >= 2
      ? meta.options
      : (() => {
          const set = new Set<string>();
          for (const q of questions) {
            const opts = (q as { options?: string[] }).options;
            if (Array.isArray(opts)) for (const o of opts) if (typeof o === "string" && o.trim()) set.add(o.trim());
          }
          const arr = [...set];
          return arr.length >= 2 ? arr : arr.length === 1 ? [arr[0], "Other"] : ["A", "B"];
        })();
  const selectCount =
    meta?.selectCount === 1 || meta?.selectCount === 2
      ? meta.selectCount
      : questionType === "MCQ_MULTIPLE"
        ? 2
        : 1;
  return { ...meta, options, selectCount };
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

  const questionGroupIds: string[] = [];

  for (let idx = 0; idx < questionSetInput.questionGroups.length; idx++) {
    const g = questionSetInput.questionGroups[idx];
    const expectedGroupCount = g.endQuestionNumber - g.startQuestionNumber + 1;

    if (!Array.isArray(g.questions) || g.questions.length !== expectedGroupCount) {
      throw new Error(
        `Question group ${idx + 1} length mismatch: expected ${expectedGroupCount} questions, got ${g.questions?.length ?? 0}`,
      );
    }

    const meta = normalizeMetaForQuestionSet(g.questionType, g.meta, g.questions);
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

