export type TfngAnswer = "TRUE" | "FALSE" | "NOT GIVEN";

export interface GamlishTfngParagraph {
  id: string;
  sentences: Array<{ id: string; text: string }>;
}

export interface GamlishTfngQuestion {
  id: string;
  label: string;
  order: number;
  questionStatement: string;
}

export interface GamlishTfngTestData {
  title: string;
  passageTitle: string;
  briefing: string;
  proTip: string;
  instruction: string;
  paragraphs: GamlishTfngParagraph[];
  questions: GamlishTfngQuestion[];
}

export interface PhraseClick {
  questionId: string;
  phrase: string;
  attemptNumber: number;
}

export interface GamlishTfngScoreBreakdown {
  keywordScore: number;
  timeScore: number;
  answerScore: number;
  rawScore: number;
  finalBandScore: number;
  correctAnswers: number;
  totalQuestions: number;
  anchorAttemptNumber: number;
  anchorUnlocked: boolean;
  keywordFeedback: string | null;
  timeFeedback: string | null;
}
