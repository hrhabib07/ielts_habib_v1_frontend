export const STATEMENT_FEEDBACK_REASONS = [
  {
    value: "WRONG_QUESTION",
    label: "Wrong or misleading question",
    description: "The statement does not match what was taught or what the passage says.",
  },
  {
    value: "DID_NOT_FOLLOW_SERIAL",
    label: "Did not follow serial / order",
    description: "This question breaks the step-by-step Gamlish sequence.",
  },
  {
    value: "AGAINST_GAMLISH_RULES",
    label: "Against Gamlish rules",
    description: "Anchors, radar, or locator rules were not applied fairly.",
  },
  {
    value: "TOO_DIFFICULT",
    label: "Too difficult / tricky",
    description: "Unfairly hard compared to earlier statements in this test.",
  },
  {
    value: "UNCLEAR_ANCHORS",
    label: "Unclear anchor keywords",
    description: "Hard to know which words to highlight in the statement.",
  },
  {
    value: "PASSAGE_SENTENCE_ISSUE",
    label: "Passage sentence issue",
    description: "The target sentence in the passage is wrong or confusing.",
  },
  {
    value: "OTHER",
    label: "Other",
    description: "Something else — add a short note below.",
  },
] as const;

export type StatementFeedbackReasonValue =
  (typeof STATEMENT_FEEDBACK_REASONS)[number]["value"];
