import type { QuestionSetMeta, ReadingQuestionType } from "./api/instructor";

export type QuestionTypeKey = ReadingQuestionType;

export interface QuestionTypeConfig {
  label: string;
  defaultInstruction: string;
  defaultMeta: QuestionSetMeta;
}

const NUMBER_TO_WORD: Record<number, string> = {
  1: "ONE",
  2: "TWO",
  3: "THREE",
  4: "FOUR",
  5: "FIVE",
};

function formatWordLimitPhrase(wordLimit: number): string {
  const word = NUMBER_TO_WORD[wordLimit] ?? String(wordLimit);
  const noun = wordLimit === 1 ? "WORD" : "WORDS";
  return `NO MORE THAN ${word} ${noun}`;
}

const COMPLETION_INSTRUCTION_PREFIXES: Record<string, string> = {
  SENTENCE_COMPLETION: "Complete the sentences below.",
  SUMMARY_COMPLETION: "Complete the summary below.",
  SUMMARY_COMPLETION_WITH_CLUES: "Complete the summary below. Choose the correct words from the box below.",
  NOTE_COMPLETION: "Complete the notes below.",
  TABLE_COMPLETION: "Complete the table below.",
  FLOW_CHART_COMPLETION: "Complete the flow-chart below.",
  DIAGRAM_LABEL_COMPLETION: "Label the diagram below.",
  SHORT_ANSWER: "Answer the questions below.",
};

const WORD_LIMIT_TYPES: QuestionTypeKey[] = [
  "SENTENCE_COMPLETION",
  "SUMMARY_COMPLETION",
  "SUMMARY_COMPLETION_WITH_CLUES",
  "NOTE_COMPLETION",
  "TABLE_COMPLETION",
  "FLOW_CHART_COMPLETION",
  "SHORT_ANSWER",
];

export function isWordLimitQuestionType(t: ReadingQuestionType): boolean {
  return (WORD_LIMIT_TYPES as string[]).includes(t);
}

export function buildInstructionFromWordLimit(
  questionType: ReadingQuestionType,
  wordLimit: number,
): string {
  const prefix = COMPLETION_INSTRUCTION_PREFIXES[questionType];
  if (!prefix) return QUESTION_TYPE_CONFIG[questionType]?.defaultInstruction ?? "";
  const fromSource =
    questionType === "SUMMARY_COMPLETION_WITH_CLUES" ? "from the box" : "from the passage";
  if (wordLimit === 1) {
    return `${prefix} Choose ONE WORD ONLY ${fromSource} for each answer.`;
  }
  const verb = questionType === "DIAGRAM_LABEL_COMPLETION" ? "Choose" : "Write";
  const phrase = formatWordLimitPhrase(wordLimit);
  return `${prefix} ${verb} ${phrase} ${fromSource} for each answer.`;
}

export const QUESTION_TYPE_CONFIG: Record<QuestionTypeKey, QuestionTypeConfig> =
  {
    MCQ_SINGLE: {
      label: "MCQ – Single Answer",
      defaultInstruction:
        "Choose the correct letter, A, B, C or D.",
      defaultMeta: { options: ["A", "B", "C", "D"], selectCount: 1 },
    },
    MCQ_MULTIPLE: {
      label: "MCQ – Multiple Answers",
      defaultInstruction:
        "Choose TWO correct letters from A–E.",
      defaultMeta: { options: ["A", "B", "C", "D", "E"], selectCount: 2 },
    },
    TRUE_FALSE_NOT_GIVEN: {
      label: "True / False / Not Given",
      defaultInstruction: `Questions {{startQuestionNumber}}-{{endQuestionNumber}}
Do the following statements agree with the information given in Reading Passage {{passageNumber}}?

In boxes {{startQuestionNumber}}-{{endQuestionNumber}} on your answer sheet, choose

TRUE	if the statement agrees with the information
FALSE	if the statement contradicts the information
NOT GIVEN	if there is no information on this`,
      defaultMeta: { labels: ["TRUE", "FALSE", "NOT GIVEN"] },
    },
    YES_NO_NOT_GIVEN: {
      label: "Yes / No / Not Given",
      defaultInstruction: `Questions {{startQuestionNumber}}-{{endQuestionNumber}}
Do the following statements agree with the views of the writer in Reading Passage {{passageNumber}}?

In boxes {{startQuestionNumber}}-{{endQuestionNumber}} on your answer sheet, choose

YES	if the statement agrees with the views of the writer
NO	if the statement contradicts the views of the writer
NOT GIVEN	if it is impossible to say what the writer thinks about this`,
      defaultMeta: { labels: ["YES", "NO", "NOT GIVEN"] },
    },
    MATCHING_HEADINGS: {
      label: "Matching Headings",
      defaultInstruction:
        "The reading passage has several sections A–H. Choose the correct heading for each section from the list of headings below.",
      defaultMeta: {
        headings: ["Heading i", "Heading ii", "Heading iii"],
        allowReuse: false,
      },
    },
    MATCHING_INFORMATION: {
      label: "Matching Information",
      defaultInstruction:
        "The reading passage has several paragraphs A–E. Which paragraph contains the following information?",
      defaultMeta: { paragraphCount: 4 },
    },
    MATCHING_FEATURES: {
      label: "Matching Features",
      defaultInstruction:
        "Match each statement with the correct category A–C from the box below.",
      defaultMeta: { features: ["Feature A", "Feature B", "Feature C"] },
    },
    MATCHING_SENTENCE_ENDINGS: {
      label: "Matching Sentence Endings",
      defaultInstruction:
        "Complete each sentence with the correct ending A–F from the box below.",
      defaultMeta: { endings: ["Ending A", "Ending B", "Ending C"] },
    },
    SENTENCE_COMPLETION: {
      label: "Sentence Completion",
      defaultInstruction:
        "Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.",
      defaultMeta: { wordLimit: 1 },
    },
    SUMMARY_COMPLETION: {
      label: "Summary Completion",
      defaultInstruction:
        "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
      defaultMeta: { wordLimit: 1 },
    },
    SUMMARY_COMPLETION_WITH_CLUES: {
      label: "Summary Completion (with clues)",
      defaultInstruction:
        "Complete the summary below. Choose NO MORE THAN TWO WORDS from the box for each answer.",
      defaultMeta: { options: ["option A", "option B", "option C", "option D", "option E"], wordLimit: 2 },
    },
    NOTE_COMPLETION: {
      label: "Note Completion",
      defaultInstruction:
        "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
      defaultMeta: { wordLimit: 1 },
    },
    TABLE_COMPLETION: {
      label: "Table Completion",
      defaultInstruction:
        "Complete the table below. Choose ONE WORD ONLY from the passage for each answer.",
      defaultMeta: { wordLimit: 1 },
    },
    FLOW_CHART_COMPLETION: {
      label: "Flow-chart Completion",
      defaultInstruction:
        "Complete the flow-chart below. Choose ONE WORD ONLY from the passage for each answer.",
      defaultMeta: { wordLimit: 1 },
    },
    DIAGRAM_LABEL_COMPLETION: {
      label: "Diagram Label Completion",
      defaultInstruction:
        "Label the diagram below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
      defaultMeta: { labels: ["Label 1", "Label 2"] },
    },
    SHORT_ANSWER: {
      label: "Short Answer",
      defaultInstruction:
        "Answer the questions below. Write NO MORE THAN THREE WORDS from the passage for each answer.",
      defaultMeta: { wordLimit: 3 },
    },
  };

export const QUESTION_TYPE_KEYS = Object.keys(
  QUESTION_TYPE_CONFIG,
) as QuestionTypeKey[];
