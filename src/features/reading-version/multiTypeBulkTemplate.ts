import type { ReadingQuestionType, QuestionSetMeta } from "@/src/lib/api/instructor";
import { QUESTION_TYPE_CONFIG } from "@/src/lib/questionTypeConfig";
import type { BulkPassageQuestionSetInput } from "./strictReadingBulkUtils";

/** L4 = Passage 1 (2–3 types); L15–L19 = Passage 2/3/Full/Master. L2 = single-type (Sentence Completion only, 8 questions). */
export const MULTI_TYPE_LEVEL_ORDERS = new Set([4, 15, 16, 17, 18, 19]);

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

const INSTRUCTIONS_L2 = `L2 FILL IN THE BLANKS: Use exactly 3 question types in order: SENTENCE_COMPLETION, NOTE_COMPLETION, TABLE_COMPLETION.
expectedTotalQuestions: 13 or 14. Three questionGroups — one per completion type.`;

const INSTRUCTIONS_L4 = `L4 PASSAGE 1: Use 2–3 question types from: TRUE_FALSE_NOT_GIVEN, SENTENCE_COMPLETION, SHORT_ANSWER.
expectedTotalQuestions: 13 or 14. At least 2 questionGroups.`;

const INSTRUCTIONS_PRACTICE = `MULTI-TYPE LEVELS: L4 = Passage 1 (TFNG + Sentence Completion + Short Answer); L15–L19 = Passage 2 / Passage 3 / full test / master.

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
      `${common} See SUMMARY_COMPLETION_WITH_CLUES_BULK_SPEC (frontend): meta.options = full word bank; expectedTotalQuestions = sum of all blanks across questions[]; each questions[] item is a multi-sentence block (use \\n\\n between sentences); {{gapN}} in reading order with global N across the group; each blank.correctAnswer must exactly match one meta.options entry.`,
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
        questionBody: {
          layout: "TEXT",
          content:
            "Intro sentence paraphrasing the passage (no gap).\n\nThe study found that {{gap1}} increased sharply, while {{gap2}} remained stable before {{gap3}} drove the final outcome.",
        },
        blanks: [
          { id: 1, correctAnswer: "technology", wordLimit: 1 },
          { id: 2, correctAnswer: "trade", wordLimit: 1 },
          { id: 3, correctAnswer: "policy", wordLimit: 1 },
        ],
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

/** L2 Fill in the Blanks: Sentence Completion + Note Completion + Table Completion (3 types) */
function l2FillBlanksQuestionSet(): BulkPassageQuestionSetInput {
  return {
    difficulty: "MEDIUM",
    expectedTotalQuestions: 13,
    recommendedTimeMinutes: 20,
    questionGroups: [
      {
        order: 1,
        startQuestionNumber: 1,
        endQuestionNumber: 4,
        questionType: "SENTENCE_COMPLETION",
        instruction: "Complete the sentences below. NO MORE THAN TWO WORDS from the passage.",
        meta: { wordLimit: 2 },
        questions: repeatQuestions(4, 1, (n) => ({
          questionBody: { layout: "TEXT", content: `The main finding was {{gap1}} for question ${n}.` },
          blanks: [{ id: 1, correctAnswer: "unexpected", wordLimit: 2 }],
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
      {
        order: 2,
        startQuestionNumber: 5,
        endQuestionNumber: 8,
        questionType: "NOTE_COMPLETION",
        instruction: "Complete the notes below. NO MORE THAN TWO WORDS from the passage.",
        meta: { wordLimit: 2 },
        questions: repeatQuestions(4, 5, (n) => ({
          questionBody: {
            layout: "NOTE",
            content: {
              heading: "Findings",
              sections: [{ subheading: "Section", lines: [`• Key point ${n}: {{gap1}}`] }],
            },
          },
          blanks: [{ id: 1, correctAnswer: "example", wordLimit: 2 }],
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
      {
        order: 3,
        startQuestionNumber: 9,
        endQuestionNumber: 13,
        questionType: "TABLE_COMPLETION",
        instruction: "Complete the table below. NO MORE THAN TWO WORDS from the passage.",
        meta: { wordLimit: 2 },
        questions: repeatQuestions(5, 9, (n) => ({
          questionBody: {
            layout: "TABLE",
            content: [
              ["Factor", "Detail"],
              [`Item ${n}`, "{{gap1}}"],
            ],
          },
          blanks: [{ id: 1, correctAnswer: "value", wordLimit: 2 }],
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
    ],
  };
}

/** L4 Passage 1: TFNG + Sentence Completion + Short Answer (2–3 types) */
function passage1QuestionSet(): BulkPassageQuestionSetInput {
  return {
    difficulty: "MEDIUM",
    expectedTotalQuestions: 13,
    recommendedTimeMinutes: 20,
    questionGroups: [
      {
        order: 1,
        startQuestionNumber: 1,
        endQuestionNumber: 4,
        questionType: "TRUE_FALSE_NOT_GIVEN",
        instruction: "Do the following statements agree with the information in the passage?",
        meta: { labels: ["TRUE", "FALSE", "NOT GIVEN"] },
        questions: repeatQuestions(4, 1, (n) => ({
          questionBody: { layout: "TEXT", content: `Statement ${n}.` },
          correctAnswer: "TRUE",
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
          questionBody: { layout: "TEXT", content: `The passage suggests {{gap1}} for question ${n}.` },
          blanks: [{ id: 1, correctAnswer: "example", wordLimit: 2 }],
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
      {
        order: 3,
        startQuestionNumber: 10,
        endQuestionNumber: 13,
        questionType: "SHORT_ANSWER",
        instruction: "Answer the questions below. NO MORE THAN THREE WORDS from the passage.",
        meta: { wordLimit: 3 },
        questions: repeatQuestions(4, 10, (n) => ({
          questionBody: { layout: "TEXT", content: `What does the passage say about topic ${n}?` },
          correctAnswer: "Answer from passage",
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
  const isL2 = levelOrder === 2;
  const isL4 = levelOrder === 4;
  const instructions = isL2
    ? `${INSTRUCTIONS_L2}\n\n${INSTRUCTIONS_PRACTICE}`
    : isL4
      ? `${INSTRUCTIONS_L4}\n\n${INSTRUCTIONS_PRACTICE}`
      : INSTRUCTIONS_PRACTICE;
  const passage1Set = isL2 ? l2FillBlanksQuestionSet() : isL4 ? passage1QuestionSet() : passageQuestionSet13();
  const passage2Set = isL2 ? l2FillBlanksQuestionSet() : isL4 ? passage1QuestionSet() : passageQuestionSet14();

  const titleSuffix = isL2
    ? "Fill in the Blanks: Sentence + Note + Table Completion"
    : isL4
      ? "Passage 1: TFNG + Sentence Completion + Short Answer"
      : "13 questions";

  return {
    __instructions: `${instructions}\n\nCurrent template level order: L${levelOrder}.`,
    __questionTypeCatalog: buildQuestionTypeCatalog(),
    practiceTests: [
      {
        title: `Practice Test 1 · (L${levelOrder}) — ${titleSuffix}`,
        passage: placeholderPassage("PT1"),
        passageQuestionSet: passage1Set,
        timeLimitMinutes: 20,
      },
      {
        title: `Practice Test 2 · (L${levelOrder}) — ${isL2 || isL4 ? (isL2 ? "Fill in the Blanks style" : "Passage 1 style") : "14 questions"}`,
        passage: placeholderPassage("PT2"),
        passageQuestionSet: passage2Set,
        timeLimitMinutes: 20,
      },
      {
        title: `Practice Test 3 · (L${levelOrder}) — 13 questions`,
        passage: placeholderPassage("PT3"),
        passageQuestionSet: passage1Set,
        timeLimitMinutes: 20,
      },
    ],
  };
}

export function buildMultiTypeGroupSamplePayload(levelOrder: number): Record<string, unknown> {
  const isL2 = levelOrder === 2;
  const isL4 = levelOrder === 4;
  const instructions = isL2
    ? `${INSTRUCTIONS_L2}\n\n${INSTRUCTIONS_GROUP}`
    : isL4
      ? `${INSTRUCTIONS_L4}\n\n${INSTRUCTIONS_GROUP}`
      : INSTRUCTIONS_GROUP;
  const passage1Set = isL2 ? l2FillBlanksQuestionSet() : isL4 ? passage1QuestionSet() : passageQuestionSet13();
  const passage2Set = isL2 ? l2FillBlanksQuestionSet() : isL4 ? passage1QuestionSet() : passageQuestionSet14();

  return {
    __instructions: `${instructions}\n\nCurrent template level order: L${levelOrder}.`,
    __questionTypeCatalog: buildQuestionTypeCatalog(),
    groupTest: {
      miniTests: [
        {
          passage: placeholderPassage("mini P1"),
          passageQuestionSet: passage1Set,
          recommendedTimeMinutes: 20,
        },
        {
          passage: placeholderPassage("mini P2"),
          passageQuestionSet: passage2Set,
          recommendedTimeMinutes: 20,
        },
        {
          passage: placeholderPassage("mini P3"),
          passageQuestionSet: passage1Set,
          recommendedTimeMinutes: 20,
        },
      ],
    },
  };
}
