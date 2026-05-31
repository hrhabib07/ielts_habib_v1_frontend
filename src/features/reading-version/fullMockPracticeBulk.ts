import type { ReadingQuestionType } from "@/src/lib/api/instructor";
import type { BulkPassageInput, BulkPassageQuestionSetInput } from "./strictReadingBulkUtils";
import {
  buildQuestionTypeCatalog,
  stripPracticeBulkWrapper,
} from "./multiTypeBulkTemplate";

export { stripPracticeBulkWrapper as stripFullMockBulkWrapper };

export type FullMockPassageSlot = {
  recommendedTimeMinutes?: number;
  passage: BulkPassageInput;
  passageQuestionSet: BulkPassageQuestionSetInput;
};

export type FullMockPracticeTestInput = {
  title: string;
  timeLimitMinutes?: number;
  passages: [FullMockPassageSlot, FullMockPassageSlot, FullMockPassageSlot];
};

export type FullMockPracticeBulkPayload = {
  practiceTests: FullMockPracticeTestInput[];
};

const GAP_FILLING_TYPES: ReadingQuestionType[] = [
  "SENTENCE_COMPLETION",
  "SUMMARY_COMPLETION",
  "NOTE_COMPLETION",
  "TABLE_COMPLETION",
  "FLOW_CHART_COMPLETION",
];

const ID_TYPES: ReadingQuestionType[] = ["TRUE_FALSE_NOT_GIVEN", "YES_NO_NOT_GIVEN"];

const MATCHING_TYPES: ReadingQuestionType[] = [
  "MATCHING_HEADINGS",
  "MATCHING_INFORMATION",
  "MATCHING_FEATURES",
  "MATCHING_SENTENCE_ENDINGS",
];

function repeatQuestions(
  count: number,
  startNum: number,
  factory: (i: number) => Record<string, unknown>,
): Record<string, unknown>[] {
  return Array.from({ length: count }, (_, j) => factory(startNum + j));
}

/** Passage 1 — 13 Q: TFNG + gap fill + MCQ (Cambridge-style easier passage). */
function cambridgePassage1Set(): BulkPassageQuestionSetInput {
  return {
    difficulty: "MEDIUM",
    expectedTotalQuestions: 13,
    recommendedTimeMinutes: 20,
    questionGroups: [
      {
        order: 1,
        startQuestionNumber: 1,
        endQuestionNumber: 5,
        questionType: "TRUE_FALSE_NOT_GIVEN",
        instruction: "Do the following statements agree with the information in the passage?",
        meta: { labels: ["TRUE", "FALSE", "NOT GIVEN"] },
        questions: repeatQuestions(5, 1, (n) => ({
          questionBody: { layout: "TEXT", content: `Statement ${n} about the passage.` },
          correctAnswer: n % 3 === 0 ? "NOT GIVEN" : n % 2 === 0 ? "FALSE" : "TRUE",
          explanation: `Replace with a real explanation for Q${n} (min 5 characters).`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
      {
        order: 2,
        startQuestionNumber: 6,
        endQuestionNumber: 9,
        questionType: "SENTENCE_COMPLETION",
        instruction: "Complete the sentences below. NO MORE THAN TWO WORDS from the passage for each answer.",
        meta: { wordLimit: 2 },
        questions: repeatQuestions(4, 6, (n) => ({
          questionBody: { layout: "TEXT", content: `The research indicates {{gap1}} for point ${n}.` },
          blanks: [{ id: 1, correctAnswer: "example", wordLimit: 2 }],
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
          questionBody: { layout: "TEXT", content: `Question ${n} — choose the best answer.` },
          options: ["A. Option one", "B. Option two", "C. Option three", "D. Option four"],
          correctAnswer: "B",
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
    ],
  };
}

/** Passage 2 — 14 Q: Matching Headings + Summary + TFNG. */
function cambridgePassage2Set(): BulkPassageQuestionSetInput {
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
          headings: ["i. Intro", "ii. Method", "iii. Results", "iv. Context", "v. Future", "vi. Extra"],
          allowReuse: false,
        },
        questions: repeatQuestions(5, 1, (n) => ({
          questionBody: { layout: "TEXT", content: `Paragraph ${n}` },
          correctAnswer: "ii",
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
      {
        order: 2,
        startQuestionNumber: 6,
        endQuestionNumber: 10,
        questionType: "SUMMARY_COMPLETION",
        instruction: "Complete the summary below. NO MORE THAN TWO WORDS from the passage for each answer.",
        meta: { wordLimit: 2 },
        questions: repeatQuestions(5, 6, (n) => ({
          questionBody: { layout: "TEXT", content: `The summary notes {{gap1}} in section ${n}.` },
          blanks: [{ id: 1, correctAnswer: "finding", wordLimit: 2 }],
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
      {
        order: 3,
        startQuestionNumber: 11,
        endQuestionNumber: 14,
        questionType: "TRUE_FALSE_NOT_GIVEN",
        instruction: "Do the following statements agree with the information?",
        meta: { labels: ["TRUE", "FALSE", "NOT GIVEN"] },
        questions: repeatQuestions(4, 11, (n) => ({
          questionBody: { layout: "TEXT", content: `Statement ${n}.` },
          correctAnswer: "FALSE",
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
    ],
  };
}

/** Passage 3 — 13 Q: YNNG + Matching Features + Note completion. */
function cambridgePassage3Set(): BulkPassageQuestionSetInput {
  return {
    difficulty: "HARD",
    expectedTotalQuestions: 13,
    recommendedTimeMinutes: 20,
    questionGroups: [
      {
        order: 1,
        startQuestionNumber: 1,
        endQuestionNumber: 5,
        questionType: "YES_NO_NOT_GIVEN",
        instruction: "Do the following statements agree with the views of the writer?",
        meta: { labels: ["YES", "NO", "NOT GIVEN"] },
        questions: repeatQuestions(5, 1, (n) => ({
          questionBody: { layout: "TEXT", content: `Writer's view statement ${n}.` },
          correctAnswer: n % 2 === 0 ? "NO" : "YES",
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
      {
        order: 2,
        startQuestionNumber: 6,
        endQuestionNumber: 9,
        questionType: "MATCHING_FEATURES",
        instruction: "Match each statement with the correct feature A–D.",
        meta: {
          features: ["Feature A", "Feature B", "Feature C", "Feature D"],
        },
        questions: repeatQuestions(4, 6, (n) => ({
          questionBody: { layout: "TEXT", content: `Statement to match ${n}.` },
          correctAnswer: "B",
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
      {
        order: 3,
        startQuestionNumber: 10,
        endQuestionNumber: 13,
        questionType: "NOTE_COMPLETION",
        instruction: "Complete the notes below. NO MORE THAN TWO WORDS from the passage for each answer.",
        meta: { wordLimit: 2 },
        questions: repeatQuestions(4, 10, (n) => ({
          questionBody: {
            layout: "NOTE",
            content: {
              heading: "Key points",
              sections: [{ subheading: "Section", lines: [`• Point ${n}: {{gap1}}`] }],
            },
          },
          blanks: [{ id: 1, correctAnswer: "detail", wordLimit: 2 }],
          explanation: `Explanation for Q${n}.`,
        })) as BulkPassageQuestionSetInput["questionGroups"][0]["questions"],
      },
    ],
  };
}

function placeholderPassage(label: string, questionRange: string): BulkPassageInput {
  return {
    title: `Sample passage — ${label}`,
    subTitle: `You should spend about 20 minutes on Questions ${questionRange}.`,
    contentParagraphs: [
      { paragraphIndex: 1, text: "A. Replace with real academic passage paragraph A (700–900 words total across all paragraphs)." },
      { paragraphIndex: 2, text: "B. Replace with paragraph B — paraphrase-friendly factual or discursive content." },
      { paragraphIndex: 3, text: "C. Replace with paragraph C." },
      { paragraphIndex: 4, text: "D. Replace with paragraph D." },
    ],
  };
}

function buildOneMockPracticeTest(
  levelOrder: number,
  mockNumber: 1 | 2 | 3,
): FullMockPracticeTestInput {
  return {
    title: `Level ${levelOrder} — Practice Mock ${mockNumber}`,
    timeLimitMinutes: 60,
    passages: [
      {
        recommendedTimeMinutes: 20,
        passage: placeholderPassage(`Mock ${mockNumber} Passage 1`, "1–13"),
        passageQuestionSet: cambridgePassage1Set(),
      },
      {
        recommendedTimeMinutes: 20,
        passage: placeholderPassage(`Mock ${mockNumber} Passage 2`, "1–14"),
        passageQuestionSet: cambridgePassage2Set(),
      },
      {
        recommendedTimeMinutes: 20,
        passage: placeholderPassage(`Mock ${mockNumber} Passage 3`, "1–13"),
        passageQuestionSet: cambridgePassage3Set(),
      },
    ],
  };
}

export function buildFullMockGeminiPrompt(levelOrder: number, mockNumber: 1 | 2 | 3): string {
  return `You are an expert Cambridge IELTS Academic Reading test writer for Gamlish.

TASK: Generate ONE complete IELTS Academic Reading practice mock as JSON only (no markdown, no commentary).

INPUT (edit before sending):
- levelOrder: ${levelOrder}
- mockNumber: ${mockNumber}
- passageTopics:
  1) [TOPIC for Passage 1 — factual/descriptive, ~700 words]
  2) [TOPIC for Passage 2 — explanatory/discursive, ~800 words]
  3) [TOPIC for Passage 3 — opinion/research, ~900 words]

OUTPUT: Return ONLY one object matching this shape (use the Gamlish bulk JSON structure):
{
  "title": "Level ${levelOrder} — Practice Mock ${mockNumber}",
  "timeLimitMinutes": 60,
  "passages": [
    {
      "recommendedTimeMinutes": 20,
      "passage": { "title": "...", "subTitle": "You should spend about 20 minutes on Questions 1–13.", "contentParagraphs": [{ "paragraphIndex": 1, "text": "..." }] },
      "passageQuestionSet": { "difficulty": "MEDIUM", "expectedTotalQuestions": 13, "recommendedTimeMinutes": 20, "questionGroups": [ ... ] }
    },
    { "... Passage 2 — expectedTotalQuestions: 14 ..." },
    { "... Passage 3 — expectedTotalQuestions: 13 ..." }
  ]
}

QUESTION RULES (real IELTS mix):
1) Use 6–8 distinct questionType values across the whole mock (not all 16 types).
2) MANDATORY: at least 5 questions total of TRUE_FALSE_NOT_GIVEN and/or YES_NO_NOT_GIVEN.
3) MANDATORY: at least 6 gap-filling answers (SENTENCE_COMPLETION, SUMMARY_COMPLETION, NOTE_COMPLETION, TABLE_COMPLETION, or FLOW_CHART_COMPLETION).
4) MANDATORY: at least one matching group (MATCHING_HEADINGS, MATCHING_INFORMATION, MATCHING_FEATURES, or MATCHING_SENTENCE_ENDINGS).
5) Suggested layout: P1 = TFNG + completion + MCQ; P2 = Matching Headings + Summary + TFNG; P3 = YNNG + Matching Features + Note/Sentence completion.

TECHNICAL:
- questionType enums: MCQ_SINGLE, MCQ_MULTIPLE, TRUE_FALSE_NOT_GIVEN, YES_NO_NOT_GIVEN, MATCHING_HEADINGS, MATCHING_INFORMATION, MATCHING_FEATURES, MATCHING_SENTENCE_ENDINGS, SENTENCE_COMPLETION, SUMMARY_COMPLETION, SUMMARY_COMPLETION_WITH_CLUES, NOTE_COMPLETION, TABLE_COMPLETION, FLOW_CHART_COMPLETION, SHORT_ANSWER, DIAGRAM_LABEL_COMPLETION.
- Question numbers restart at 1 per passage; continuous within each passage.
- Each question needs explanation (min 5 chars). Completion uses {{gapN}} + blanks[].
- Original passages only (no copyrighted Cambridge text). Heavy paraphrase in questions.

Return JSON only.`;
}

const INSTRUCTIONS = `FULL IELTS READING MOCK — Levels 17–20 Practice Tests

WORKFLOW:
1) Click "Load template" — get 3 complete mock shells (or 1 if you prefer).
2) Click "Copy Gemini prompt" — paste into Gemini with your three passage topics.
3) Replace each mock's passages with AI output (keep JSON keys unchanged).
4) Click "Validate" then "Create practice mocks".

RULES:
- Each practiceTests[] item = one 60-minute mock with exactly 3 passages.
- Total ~40 questions (13 + 14 + 13). Question numbers restart at 1 per passage.
- __questionTypeCatalog is reference only — do not paste it into questionGroups.
- Mandatory in every mock: TFNG/YNNG (≥5 Q), gap filling (≥6 gaps), ≥1 matching group, 6–8 question types total.`;

export function buildFullMockPracticeBulkPayload(levelOrder: number): Record<string, unknown> {
  return {
    __instructions: `${INSTRUCTIONS}\n\nLevel order: L${levelOrder}.`,
    __geminiPromptForMock1: buildFullMockGeminiPrompt(levelOrder, 1),
    __geminiPromptForMock2: buildFullMockGeminiPrompt(levelOrder, 2),
    __geminiPromptForMock3: buildFullMockGeminiPrompt(levelOrder, 3),
    __questionTypeCatalog: buildQuestionTypeCatalog(),
    practiceTests: [
      buildOneMockPracticeTest(levelOrder, 1),
      buildOneMockPracticeTest(levelOrder, 2),
      buildOneMockPracticeTest(levelOrder, 3),
    ],
  };
}

function countBlanksInMock(mock: FullMockPracticeTestInput): number {
  let gaps = 0;
  for (const slot of mock.passages) {
    for (const g of slot.passageQuestionSet.questionGroups) {
      if (GAP_FILLING_TYPES.includes(g.questionType)) {
        for (const q of g.questions) {
          gaps += Array.isArray(q.blanks) ? q.blanks.length : 1;
        }
      }
    }
  }
  return gaps;
}

function distinctTypesInMock(mock: FullMockPracticeTestInput): Set<string> {
  const types = new Set<string>();
  for (const slot of mock.passages) {
    for (const g of slot.passageQuestionSet.questionGroups) {
      types.add(g.questionType);
    }
  }
  return types;
}

function countQuestionsInMock(mock: FullMockPracticeTestInput): number {
  return mock.passages.reduce(
    (sum, slot) => sum + (slot.passageQuestionSet.expectedTotalQuestions ?? 0),
    0,
  );
}

export type FullMockValidationMessage = {
  level: "error" | "warn";
  path: string;
  message: string;
};

export function validateFullMockPracticeBulk(params: {
  payload: unknown;
  levelOrder: number;
}): { payload: FullMockPracticeBulkPayload; messages: FullMockValidationMessage[] } {
  const messages: FullMockValidationMessage[] = [];
  const { payload, levelOrder } = params;

  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be a JSON object.");
  }
  const p = payload as Partial<FullMockPracticeBulkPayload>;
  if (!Array.isArray(p.practiceTests) || p.practiceTests.length < 1 || p.practiceTests.length > 3) {
    throw new Error("practiceTests must contain 1 to 3 full mock tests.");
  }

  const out: FullMockPracticeTestInput[] = [];

  for (let ti = 0; ti < p.practiceTests.length; ti++) {
    const t = p.practiceTests[ti];
    const base = `practiceTests[${ti}]`;
    if (!t || typeof t !== "object") {
      throw new Error(`${base} must be an object.`);
    }
    if (!t.title?.trim()) {
      throw new Error(`${base}.title is required.`);
    }
    if (!Array.isArray(t.passages) || t.passages.length !== 3) {
      throw new Error(`${base}.passages must be an array of exactly 3 items.`);
    }

    for (let pi = 0; pi < 3; pi++) {
      const slot = t.passages[pi];
      const slotPath = `${base}.passages[${pi}]`;
      if (!slot?.passage?.title?.trim()) {
        throw new Error(`${slotPath}.passage.title is required.`);
      }
      if (!Array.isArray(slot.passage.contentParagraphs) || slot.passage.contentParagraphs.length < 1) {
        throw new Error(`${slotPath}.passage.contentParagraphs must be a non-empty array.`);
      }
      const groups = slot.passageQuestionSet?.questionGroups ?? [];
      if (!Array.isArray(groups) || groups.length < 2) {
        throw new Error(`${slotPath}.passageQuestionSet.questionGroups must have at least 2 groups.`);
      }
      const total = slot.passageQuestionSet?.expectedTotalQuestions;
      if (total !== 13 && total !== 14) {
        throw new Error(`${slotPath}.passageQuestionSet.expectedTotalQuestions must be 13 or 14.`);
      }
    }

    const mock = t as FullMockPracticeTestInput;
    const types = distinctTypesInMock(mock);
    const idCount = mock.passages.reduce((sum, slot) => {
      return (
        sum +
        slot.passageQuestionSet.questionGroups
          .filter((g) => ID_TYPES.includes(g.questionType))
          .reduce((gs, g) => gs + (g.endQuestionNumber - g.startQuestionNumber + 1), 0)
      );
    }, 0);
    const gapCount = countBlanksInMock(mock);
    const hasMatching = mock.passages.some((slot) =>
      slot.passageQuestionSet.questionGroups.some((g) => MATCHING_TYPES.includes(g.questionType)),
    );
    const totalQ = countQuestionsInMock(mock);

    if (idCount < 5) {
      messages.push({
        level: "warn",
        path: base,
        message: `Mock ${ti + 1}: include at least 5 TFNG/YNNG questions (found ${idCount}). Real IELTS tests almost always include identification questions.`,
      });
    }
    if (gapCount < 6) {
      messages.push({
        level: "warn",
        path: base,
        message: `Mock ${ti + 1}: include at least 6 gap-filling answers (found ${gapCount}).`,
      });
    }
    if (!hasMatching) {
      messages.push({
        level: "warn",
        path: base,
        message: `Mock ${ti + 1}: add at least one matching question group (headings, information, features, or sentence endings).`,
      });
    }
    if (types.size < 5) {
      messages.push({
        level: "warn",
        path: base,
        message: `Mock ${ti + 1}: only ${types.size} question types — aim for 6–8 for a realistic IELTS mix.`,
      });
    }
    if (totalQ < 39 || totalQ > 42) {
      messages.push({
        level: "warn",
        path: base,
        message: `Mock ${ti + 1}: total questions is ${totalQ}; Cambridge mocks usually have 39–42 (target 40).`,
      });
    }

    out.push({
      title: mock.title.trim(),
      timeLimitMinutes: mock.timeLimitMinutes ?? 60,
      passages: mock.passages,
    });
  }

  if (levelOrder < 17 || levelOrder > 20) {
    messages.push({
      level: "warn",
      path: "levelOrder",
      message: `Level ${levelOrder} is outside L17–L20; full mock bulk is intended for mock-test levels.`,
    });
  }

  return { payload: { practiceTests: out }, messages };
}
