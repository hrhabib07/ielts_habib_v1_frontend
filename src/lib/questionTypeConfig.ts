import type { QuestionSetMeta, ReadingQuestionType } from "./api/instructor";

export type QuestionTypeKey = ReadingQuestionType;

export interface QuestionTypeConfig {
  label: string;
  defaultInstruction: string;
  defaultMeta: QuestionSetMeta;
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
      defaultInstruction:
        "Do the following statements agree with the information given in the reading passage? Write TRUE, FALSE or NOT GIVEN.",
      defaultMeta: { labels: ["TRUE", "FALSE", "NOT GIVEN"] },
    },
    YES_NO_NOT_GIVEN: {
      label: "Yes / No / Not Given",
      defaultInstruction:
        "Do the following statements agree with the claims of the writer? Write YES, NO or NOT GIVEN.",
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
        "Complete the sentences below. Write NO MORE THAN TWO WORDS from the passage for each answer.",
      defaultMeta: { wordLimit: 2 },
    },
    SUMMARY_COMPLETION: {
      label: "Summary Completion",
      defaultInstruction:
        "Complete the summary below. Write NO MORE THAN TWO WORDS from the passage for each answer.",
      defaultMeta: { wordLimit: 2 },
    },
    NOTE_COMPLETION: {
      label: "Note Completion",
      defaultInstruction:
        "Complete the notes below. Write NO MORE THAN TWO WORDS from the passage for each answer.",
      defaultMeta: { wordLimit: 2 },
    },
    TABLE_COMPLETION: {
      label: "Table Completion",
      defaultInstruction:
        "Complete the table below. Write NO MORE THAN TWO WORDS from the passage for each answer.",
      defaultMeta: { wordLimit: 2 },
    },
    FLOW_CHART_COMPLETION: {
      label: "Flow-chart Completion",
      defaultInstruction:
        "Complete the flow-chart below. Write NO MORE THAN TWO WORDS from the passage for each answer.",
      defaultMeta: { wordLimit: 2 },
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
