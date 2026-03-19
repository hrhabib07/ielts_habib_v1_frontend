import type { ReadingQuestionType, QuestionSetMeta } from "@/src/lib/api/instructor";
import { QUESTION_TYPE_CONFIG } from "@/src/lib/questionTypeConfig";
import type { BulkPassageQuestionSetInput } from "./strictReadingBulkUtils";

/** UI order index: L15 = Passage 2 practice, L16 = P3, L17 = full test, L18 = master, L19+ = same multi-type rules */
export const MULTI_TYPE_LEVEL_ORDERS = new Set([15, 16, 17, 18, 19]);

const ALL_QUESTION_TYPES: ReadingQuestionType[] = [
  "MCQ_SINGLE",
  "MCQ_MULTIPLE",
  "TRUE_FALSE_NOT_GIVEN",
  "YES_NO_NOT_GIVEN",
  "MATCHING_HEADINGS",
  "MATCHING_INFORMATION",
  "MATCHING_FEATURES",
  "MATCHING_SENTENCE_ENDINGS",
  "SENTENCE_COMPLETION",
  "SUMMARY_COMPLETION",
  "SUMMARY_COMPLETION_WITH_CLUES",
  "NOTE_COMPLETION",
  "TABLE_COMPLETION",
  "FLOW_CHART_COMPLETION",
  "SHORT_ANSWER",
  "DIAGRAM_LABEL_COMPLETION",
];

const INSTRUCTIONS_PRACTICE = `MULTI-TYPE LEVELS (L15–L19): Passage 2 / Passage 3 / full test / master-style practice.

HOW TO BUILD A VALID passageQuestionSet
1) Choose ANY number of questionGroups >= 2 (e.g. 2, 3, 4, 5…). There is no fixed mix.
2) Question numbers must be continuous from 1 to N with no gaps or overlaps across groups.
3) Sum of all questions = N must equal expectedTotalQuestions (13 or 14). Typical IELTS: 13 for one passage set, 14 for another — pick what matches your content.
4) Copy meta + question shape from __questionTypeCatalog for each type you use. Replace stems, answers, and meta lists with real data.
5) API questionType strings are EXACT: use MCQ_SINGLE / MCQ_MULTIPLE — never MULTIPLE_CHOICE.

REFERENCE CATALOG
__questionTypeCatalog lists every allowed ReadingQuestionType with one minimal sampleQuestion. It is NOT a real questionGroup block — do not paste it as-is into questionGroups.`;

const INSTRUCTIONS_GROUP = `MULTI-TYPE LEVELS (L15–L19): Group test = 3 mini tests (passage 1 / 2 / 3).

Each miniTests[i].passageQuestionSet follows the same rules as practice bulk:
- At least 2 questionGroups per mini test
- expectedTotalQuestions is 13 or 14 per mini test
- Use __questionTypeCatalog only as a reference; build real groups that sum to 13 or 14 questions each.`;

export function stripPracticeBulkWrapper(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const { __instructions: _a, __questionTypeCatalog: _b, ...rest } = raw as Record<string, unknown>;
  return rest;
}

export function stripGroupBulkWrapper(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const { __instructions: _a, __questionTypeCatalog: _b, ...rest } = raw as Record<string, unknown>;
  return rest;
}

function catalogHowToCustomize(qt: ReadingQuestionType): string {
  const common =
    "Copy this block’s meta + sampleQuestion into a real questionGroup: set order, startQuestionNumber, endQuestionNumber, instruction, and one questions[] entry per question in that range.";
  const byType: Partial<Record<ReadingQuestionType, string>> = {
    MCQ_SINGLE:
      `${common} Per question: options on each question item; correctAnswer is one letter string matching an option key.`,
    MCQ_MULTIPLE:
      `${common} Group meta needs options (>=2) and selectCount: 2. Each question correctAnswer is string[] (e.g. two letters).`,
    TRUE_FALSE_NOT_GIVEN: `${common} correctAnswer is TRUE | FALSE | NOT GIVEN. meta.labels must be the three literals in order.`,
    YES_NO_NOT_GIVEN: `${common} correctAnswer is YES | NO | NOT GIVEN.`,
    MATCHING_HEADINGS:
      `${common} One question per paragraph/section; correctAnswer matches a heading key (e.g. roman numeral). meta.headings >= 2.`,
    MATCHING_INFORMATION:
      `${common} correctAnswer is paragraph letter (A,B,…). meta.paragraphCount = number of labelled paragraphs in the passage.`,
    MATCHING_FEATURES: `${common} correctAnswer is the feature letter (A,B,…). meta.features >= 2.`,
    MATCHING_SENTENCE_ENDINGS: `${common} correctAnswer is ending letter. meta.endings >= 2.`,
    SENTENCE_COMPLETION:
      `${common} Either TEXT stem + correctAnswer, OR TEXT with {{gap1}} + blanks[]. meta.wordLimit or options per backend Completion rules.`,
    SUMMARY_COMPLETION: `${common} Same pattern as sentence completion; often TEXT + correctAnswer for bulk JSON.`,
    SUMMARY_COMPLETION_WITH_CLUES:
      `${common} meta.options is the word bank (>=2). Often use {{gap1}} in content + blanks[{ id:1, correctAnswer: \"exact bank phrase\" }].`,
    NOTE_COMPLETION: `${common} Prefer layout NOTE with sections/lines containing {{gapN}} + matching blanks[].`,
    TABLE_COMPLETION: `${common} layout TABLE, string[][] cells; put {{gapN}} inside cell strings + blanks[].`,
    FLOW_CHART_COMPLETION:
      `${common} For bulk, simplest is TEXT stem with {{gap1}} + blanks[] (flow-chart layout is optional in advanced UIs).`,
    SHORT_ANSWER: `${common} meta.wordLimit required (1–5). correctAnswer is short text from passage.`,
    DIAGRAM_LABEL_COMPLETION: `${common} meta.labels (>=1). Question may use layout DIAGRAM or TEXT + correctAnswer for bulk.`,
  };
  return byType[qt] ?? common;
}

function sampleQuestionForType(qt: ReadingQuestionType): Record<string, unknown> {
  const explanation = "Replace with a real explanation (min 5 characters).";
  const base = { explanation, difficulty: "MEDIUM" as const };

  switch (qt) {
    case "MCQ_SINGLE":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "11. Sample MCQ stem?" },
        options: ["A. First", "B. Second", "C. Third", "D. Fourth"],
        correctAnswer: "B",
      };
    case "MCQ_MULTIPLE":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "12–13. Which TWO statements…?" },
        options: ["A. …", "B. …", "C. …", "D. …", "E. …"],
        correctAnswer: ["A", "D"],
      };
    case "TRUE_FALSE_NOT_GIVEN":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "Sample statement about the passage." },
        correctAnswer: "NOT GIVEN",
      };
    case "YES_NO_NOT_GIVEN":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "Sample statement about the writer’s views." },
        correctAnswer: "YES",
      };
    case "MATCHING_HEADINGS":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "Paragraph 2" },
        correctAnswer: "ii",
      };
    case "MATCHING_INFORMATION":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "Which paragraph mentions …?" },
        correctAnswer: "C",
      };
    case "MATCHING_FEATURES":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "Sample statement to match to a feature." },
        correctAnswer: "B",
      };
    case "MATCHING_SENTENCE_ENDINGS":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "The earliest research suggested that" },
        correctAnswer: "A",
      };
    case "SENTENCE_COMPLETION":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "The main finding was {{gap1}}." },
        blanks: [{ id: 1, correctAnswer: "unexpected", wordLimit: 2 }],
      };
    case "SUMMARY_COMPLETION":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "The process relies on {{gap1}} energy." },
        blanks: [{ id: 1, correctAnswer: "solar", wordLimit: 1 }],
      };
    case "SUMMARY_COMPLETION_WITH_CLUES":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "Results were {{gap1}} compared to the control." },
        blanks: [{ id: 1, correctAnswer: "stronger", wordLimit: 2 }],
      };
    case "NOTE_COMPLETION":
      return {
        ...base,
        questionBody: {
          layout: "NOTE",
          content: {
            heading: "Effects",
            sections: [{ subheading: "Early phase", lines: ["• Key effect: {{gap1}}"] }],
          },
        },
        blanks: [{ id: 1, correctAnswer: "fatigue", wordLimit: 1 }],
      };
    case "TABLE_COMPLETION":
      return {
        ...base,
        questionBody: {
          layout: "TABLE",
          content: [
            ["Factor", "Detail"],
            ["Cost", "{{gap1}}"],
          ],
        },
        blanks: [{ id: 1, correctAnswer: "high", wordLimit: 1 }],
      };
    case "FLOW_CHART_COMPLETION":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "Stage 2 is called {{gap1}}." },
        blanks: [{ id: 1, correctAnswer: "processing", wordLimit: 1 }],
      };
    case "SHORT_ANSWER":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "What term does the writer use for …?" },
        correctAnswer: "neuroarchitecture",
      };
    case "DIAGRAM_LABEL_COMPLETION":
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "Label 1 on the diagram refers to {{gap1}}." },
        blanks: [{ id: 1, correctAnswer: "rotor", wordLimit: 1 }],
      };
    default:
      return {
        ...base,
        questionBody: { layout: "TEXT", content: "Sample." },
        correctAnswer: "A",
      };
  }
}

export function buildQuestionTypeCatalog(): Record<
  string,
  { __howToCustomize: string; meta: QuestionSetMeta; sampleQuestion: Record<string, unknown> }
> {
  const out: Record<
    string,
    { __howToCustomize: string; meta: QuestionSetMeta; sampleQuestion: Record<string, unknown> }
  > = {};
  for (const qt of ALL_QUESTION_TYPES) {
    out[qt] = {
      __howToCustomize: catalogHowToCustomize(qt),
      meta: { ...QUESTION_TYPE_CONFIG[qt].defaultMeta },
      sampleQuestion: sampleQuestionForType(qt),
    };
  }
  return out;
}

function repeatQuestions(
  count: number,
  startNum: number,
  factory: (i: number) => Record<string, unknown>,
): Record<string, unknown>[] {
  return Array.from({ length: count }, (_, j) => factory(startNum + j));
}

/** 13 questions: 4 + 5 + 4 */
function passageQuestionSet13(): BulkPassageQuestionSetInput {
  return {
    difficulty: "MEDIUM",
    expectedTotalQuestions: 13,
    recommendedTimeMinutes: 20,
    questionGroups: [
      {
        order: 1,
        startQuestionNumber: 1,
        endQuestionNumber: 4,
        questionType: "MATCHING_INFORMATION",
        instruction: "Which paragraph contains the following information?",
        meta: { paragraphCount: 4 },
        questions: repeatQuestions(4, 1, (n) => ({
          questionBody: { layout: "TEXT", content: `Question ${n} — which paragraph (A–D)?` },
          correctAnswer: "A",
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
      {
        order: 2,
        startQuestionNumber: 5,
        endQuestionNumber: 9,
        questionType: "SENTENCE_COMPLETION",
        instruction: "Complete the sentences. NO MORE THAN TWO WORDS from the passage.",
        meta: { wordLimit: 2 },
        questions: repeatQuestions(5, 5, (n) => ({
          questionBody: { layout: "TEXT", content: `The study showed {{gap1}} in segment ${n}.` },
          blanks: [{ id: 1, correctAnswer: "improvement", wordLimit: 2 }],
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
      {
        order: 3,
        startQuestionNumber: 10,
        endQuestionNumber: 13,
        questionType: "MCQ_SINGLE",
        instruction: "Choose the correct letter, A, B, C or D.",
        meta: { options: ["A", "B", "C", "D"], selectCount: 1 },
        questions: repeatQuestions(4, 10, (n) => ({
          questionBody: { layout: "TEXT", content: `Question ${n} — choose one answer.` },
          options: ["A. …", "B. …", "C. …", "D. …"],
          correctAnswer: "B",
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
    ],
  };
}

/** 14 questions: 5 + 5 + 4 */
function passageQuestionSet14(): BulkPassageQuestionSetInput {
  return {
    difficulty: "MEDIUM",
    expectedTotalQuestions: 14,
    recommendedTimeMinutes: 20,
    questionGroups: [
      {
        order: 1,
        startQuestionNumber: 1,
        endQuestionNumber: 5,
        questionType: "MATCHING_HEADINGS",
        instruction: "Choose the correct heading for each paragraph.",
        meta: {
          headings: ["i. One", "ii. Two", "iii. Three", "iv. Four", "v. Five", "vi. Extra"],
          allowReuse: false,
        },
        questions: repeatQuestions(5, 1, (n) => ({
          questionBody: { layout: "TEXT", content: `Paragraph ${n}` },
          correctAnswer: "i",
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
      {
        order: 2,
        startQuestionNumber: 6,
        endQuestionNumber: 10,
        questionType: "TRUE_FALSE_NOT_GIVEN",
        instruction: "Do the following statements agree with the information?",
        meta: { labels: ["TRUE", "FALSE", "NOT GIVEN"] },
        questions: repeatQuestions(5, 6, (n) => ({
          questionBody: { layout: "TEXT", content: `Statement ${n}.` },
          correctAnswer: "FALSE",
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
      {
        order: 3,
        startQuestionNumber: 11,
        endQuestionNumber: 14,
        questionType: "MCQ_MULTIPLE",
        instruction: "Choose TWO letters for each question.",
        meta: { options: ["A", "B", "C", "D", "E"], selectCount: 2 },
        questions: repeatQuestions(4, 11, (n) => ({
          questionBody: { layout: "TEXT", content: `Questions ${n} — choose TWO options.` },
          options: ["A. …", "B. …", "C. …", "D. …", "E. …"],
          correctAnswer: ["A", "C"],
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
    ],
  };
}

function placeholderPassage(titleSuffix: string): {
  title: string;
  subTitle: string;
  contentParagraphs: Array<{ paragraphIndex: number; text: string }>;
} {
  return {
    title: `Sample passage ${titleSuffix}`,
    subTitle: "Replace with real subtitle",
    contentParagraphs: [
      { paragraphIndex: 1, text: "Paragraph A — replace with real passage text." },
      { paragraphIndex: 2, text: "Paragraph B — replace with real passage text." },
      { paragraphIndex: 3, text: "Paragraph C — replace with real passage text." },
      { paragraphIndex: 4, text: "Paragraph D — replace with real passage text." },
    ],
  };
}

export function buildMultiTypePracticeSamplePayload(levelOrder: number): Record<string, unknown> {
  return {
    __instructions: `${INSTRUCTIONS_PRACTICE}\n\nCurrent template level order: L${levelOrder}.`,
    __questionTypeCatalog: buildQuestionTypeCatalog(),
    practiceTests: [
      {
        title: `Practice Test 1 · (L${levelOrder}) — 13 questions (typical Passage 2 style)`,
        passage: placeholderPassage("PT1"),
        passageQuestionSet: passageQuestionSet13(),
        timeLimitMinutes: 20,
      },
      {
        title: `Practice Test 2 · (L${levelOrder}) — 14 questions (typical Passage 3 style)`,
        passage: placeholderPassage("PT2"),
        passageQuestionSet: passageQuestionSet14(),
        timeLimitMinutes: 20,
      },
      {
        title: `Practice Test 3 · (L${levelOrder}) — 13 questions`,
        passage: placeholderPassage("PT3"),
        passageQuestionSet: passageQuestionSet13(),
        timeLimitMinutes: 20,
      },
    ],
  };
}

export function buildMultiTypeGroupSamplePayload(levelOrder: number): Record<string, unknown> {
  return {
    __instructions: `${INSTRUCTIONS_GROUP}\n\nCurrent template level order: L${levelOrder}. Mini 1 = 13 Q, Mini 2 = 14 Q, Mini 3 = 13 Q (adjust to 13/14 as needed).`,
    __questionTypeCatalog: buildQuestionTypeCatalog(),
    groupTest: {
      miniTests: [
        {
          passage: placeholderPassage("mini P1"),
          passageQuestionSet: passageQuestionSet13(),
          recommendedTimeMinutes: 20,
        },
        {
          passage: placeholderPassage("mini P2"),
          passageQuestionSet: passageQuestionSet14(),
          recommendedTimeMinutes: 20,
        },
        {
          passage: placeholderPassage("mini P3"),
          passageQuestionSet: passageQuestionSet13(),
          recommendedTimeMinutes: 20,
        },
      ],
    },
  };
}
