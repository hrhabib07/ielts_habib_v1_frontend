/**
 * Maps level order index (0–18, where 0 = L0) to the correct question type for
 * single-type levels. Used by Practice Test Manager and Group Test Manager bulk create.
 *
 * Level titles (from instructor dashboard):
 * L0: IELTS Reading Basics (quiz = MCQ) | L1: True/False/Not Given | L2: Fill in the Blanks
 * L3: Short Answer | L4: Passage 1 (multi: TFNG + Sentence Completion + Short Answer, 2–3 types)
 * L5: Vocabulary (foundation/quiz = MCQ) | L6: Summary Completion (no clues)
 * L7: Summary Completion (with clues) | L8: Yes/No/Not Given | L9: MCQ
 * L10: Double MCQ | L11: Matching Sentence Endings | L12: Matching Features/Names
 * L13: Matching Information | L14: Matching Headings | L15–L18: Multi-type (Passage 2/3/Full/Master)
 */
import type { ReadingQuestionType } from "@/src/lib/api/instructor";

export const SINGLE_TYPE_QUESTION_TYPE_BY_LEVEL: Record<number, ReadingQuestionType> = {
  0: "MCQ_SINGLE", // L0 bulk templates: legacy MCQ; Level 0 reading practice may use Sentence locator (separate authoring path)
  1: "TRUE_FALSE_NOT_GIVEN", // L1: Mastering True/False/Not Given
  2: "SENTENCE_COMPLETION", // L2: Fill in the Blanks — only Sentence Completion, 8 questions per passage
  3: "SHORT_ANSWER", // L3: Short Answer Questions
  // 4: multi-type (Passage 1 = TFNG + Sentence Completion + Short Answer, 2–3 groups)
  5: "MCQ_SINGLE", // L5: Vocabulary (foundation/quiz, multiple choice)
  6: "SUMMARY_COMPLETION", // L6: Summary Completion Without Clues
  7: "SUMMARY_COMPLETION_WITH_CLUES", // L7: Summary Completion (with clues)
  8: "YES_NO_NOT_GIVEN", // L8: Yes/No/Not Given
  9: "MCQ_SINGLE", // L9: Multiple Choice Questions
  10: "MCQ_MULTIPLE", // L10: Double MCQ
  11: "MATCHING_SENTENCE_ENDINGS", // L11: Matching Sentence Endings
  12: "MATCHING_FEATURES", // L12: Matching Features/Names
  13: "MATCHING_INFORMATION", // L13: Matching Information
  14: "MATCHING_HEADINGS", // L14: Matching Headings
};

export function getDefaultMetaForLevel(levelOrder: number): Record<string, unknown> {
  const qt = SINGLE_TYPE_QUESTION_TYPE_BY_LEVEL[levelOrder];
  if (!qt) return { options: ["A", "B", "C", "D"], selectCount: 1 };

  switch (qt) {
    case "MCQ_SINGLE":
      return { options: ["A", "B", "C", "D"], selectCount: 1 };
    case "MCQ_MULTIPLE":
      return { options: ["A", "B", "C", "D", "E"], selectCount: 2 };
    case "TRUE_FALSE_NOT_GIVEN":
    case "YES_NO_NOT_GIVEN":
      return { labels: qt === "TRUE_FALSE_NOT_GIVEN" ? ["TRUE", "FALSE", "NOT GIVEN"] : ["YES", "NO", "NOT GIVEN"] };
    case "MATCHING_HEADINGS":
      return { headings: ["Heading i", "Heading ii"], allowReuse: false };
    case "MATCHING_INFORMATION":
      return { paragraphCount: 4 };
    case "MATCHING_FEATURES":
      return { features: ["Feature A", "Feature B"] };
    case "MATCHING_SENTENCE_ENDINGS":
      return { endings: ["Ending A", "Ending B"] };
    case "SENTENCE_COMPLETION":
    case "SUMMARY_COMPLETION":
    case "NOTE_COMPLETION":
    case "TABLE_COMPLETION":
    case "FLOW_CHART_COMPLETION":
      return { wordLimit: 3 };
    case "SUMMARY_COMPLETION_WITH_CLUES":
      return {
        options: [
          "technology",
          "trade",
          "policy",
          "labour",
          "climate",
          "innovation",
          "barrier",
          "support",
        ],
        wordLimit: 1,
      };
    case "SHORT_ANSWER":
      return { wordLimit: 3 };
    case "DIAGRAM_LABEL_COMPLETION":
      return { labels: ["Label A", "Label B"] };
    default:
      return { options: ["A", "B", "C", "D"], selectCount: 1 };
  }
}

/** L2 uses 8 questions per passage; other single-type levels use 7 by default. */
export const EXPECTED_QUESTIONS_BY_LEVEL: Record<number, number> = {
  2: 8,
};
export const DEFAULT_SINGLE_TYPE_QUESTIONS = 7;

/** For SENTENCE_COMPLETION (L2), returns blanks + questionBody with {{gap1}}; otherwise uses getQuestionItemShapeForLevel. */
export function getBulkQuestionTemplateForLevel(
  levelOrder: number,
  questionIndex: number,
): {
  questionBody: { layout: "TEXT"; content: string };
  blanks?: Array<{ id: number; correctAnswer: string; wordLimit: number }>;
  options?: string[];
  correctAnswer?: string | string[];
} {
  const qt = SINGLE_TYPE_QUESTION_TYPE_BY_LEVEL[levelOrder];
  if (qt === "SENTENCE_COMPLETION") {
    return {
      questionBody: { layout: "TEXT", content: `Complete the sentence: The passage states that {{gap1}}.` },
      blanks: [{ id: 1, correctAnswer: "example", wordLimit: 2 }],
    };
  }
  if (qt === "SUMMARY_COMPLETION_WITH_CLUES") {
    return {
      questionBody: {
        layout: "TEXT",
        content:
          "Opening sentence of your summary (no gap).\n\nThe writer shows that {{gap1}} shaped early debate, while {{gap2}} grew in importance later.\n\nIn conclusion, {{gap3}} best matches the passage.",
      },
      blanks: [
        { id: 1, correctAnswer: "technology", wordLimit: 1 },
        { id: 2, correctAnswer: "trade", wordLimit: 1 },
        { id: 3, correctAnswer: "policy", wordLimit: 1 },
      ],
    };
  }
  return {
    questionBody: { layout: "TEXT", content: `Question ${questionIndex + 1} stem text here.` },
    ...getQuestionItemShapeForLevel(levelOrder, questionIndex),
  };
}

export function getQuestionItemShapeForLevel(
  levelOrder: number,
  questionIndex: number,
): { options?: string[]; correctAnswer?: string | string[] } {
  const qt = SINGLE_TYPE_QUESTION_TYPE_BY_LEVEL[levelOrder];
  if (!qt) return { options: ["A", "B", "C", "D"], correctAnswer: "A" };

  switch (qt) {
    case "MCQ_SINGLE":
      return { options: ["A", "B", "C", "D"], correctAnswer: "A" };
    case "MCQ_MULTIPLE":
      return { options: ["A", "B", "C", "D"], correctAnswer: ["A", "B"] };
    case "TRUE_FALSE_NOT_GIVEN":
    case "YES_NO_NOT_GIVEN":
      return { correctAnswer: qt === "TRUE_FALSE_NOT_GIVEN" ? "TRUE" : "YES" };
    case "MATCHING_HEADINGS":
      return { correctAnswer: "i" };
    case "MATCHING_INFORMATION":
    case "MATCHING_FEATURES":
      return { correctAnswer: "A" };
    case "MATCHING_SENTENCE_ENDINGS":
      return { correctAnswer: "A" };
    case "SENTENCE_COMPLETION":
    case "SUMMARY_COMPLETION":
    case "NOTE_COMPLETION":
    case "TABLE_COMPLETION":
    case "FLOW_CHART_COMPLETION":
    case "SUMMARY_COMPLETION_WITH_CLUES":
    case "SHORT_ANSWER":
      return { correctAnswer: "Answer from passage" };
    case "DIAGRAM_LABEL_COMPLETION":
      return { correctAnswer: "Label A" };
    default:
      return { options: ["A", "B", "C", "D"], correctAnswer: "A" };
  }
}

export function resolveLevelTemplateIndex(params: {
  order: number;
  title: string;
  slug?: string | null;
}): number {
  const { order, title, slug } = params;
  const clamp = (n: number): number => Math.max(0, Math.min(18, n));

  // Prefer parsing from title (what instructors see as "L8"/"Level 8").
  // Covers common formats:
  // - "L8: Yes/No/Not Given"
  // - "Level 8 – Yes/No/Not Given"
  const titleL = title.match(/\bL\s*(\d+)\b/i)?.[1];
  if (titleL != null) return clamp(Number(titleL));

  const titleLevel = title.match(/\bLevel\s*(\d+)\b/i)?.[1];
  if (titleLevel != null) return clamp(Number(titleLevel));

  // Fallback: slug sometimes includes order as "level-{order}-...".
  const slugOrder = slug?.match(/^level-(\d+)(?:-|$)/i)?.[1];
  if (slugOrder != null) {
    // In existing data: order is 1-based relative to L# (title uses order-1).
    const idx = Number(slugOrder) - 1;
    if (Number.isFinite(idx)) return clamp(idx);
  }

  // Last resort: original behavior (order is typically 1-based).
  return clamp(order - 1);
}
