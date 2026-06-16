export interface GamlishSentence {
  id: string;
  text: string;
}

export interface GamlishParagraph {
  id: string;
  sentences: GamlishSentence[];
}

export interface GamlishQuestion {
  id: string;
  label: string;
  questionStatement: string;
  targetKeywords: string[];
  strongLocator: string | null;
  correctSentenceId: string;
  locatorSentenceIds: string[];
}

export interface GamlishScanningTestData {
  title: string;
  passageTitle: string;
  briefing: string;
  proTip: string;
  paragraphs: GamlishParagraph[];
  questions: GamlishQuestion[];
}

export interface ClickedKeyword {
  questionId: string;
  wordIndex: number;
  token: string;
}

export interface PassageTextHighlight {
  id: string;
  start: number;
  end: number;
}

export interface PassageNote {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface AnswerPick {
  questionId: string;
  sentenceId: string;
  start: number;
  end: number;
  text: string;
}

export interface SentenceBoundary {
  id: string;
  paragraphId: string;
  orderIndex: number;
  start: number;
  end: number;
  text: string;
}

export type GamlishErrorTag =
  | "SEQUENCE_BREAK"
  | "KEYWORD_MISMATCH"
  | "PARTIAL_MATCH_TRAP";

export interface GamlishErrorFeedback {
  tag: GamlishErrorTag;
  message: string;
}

export interface GamlishScanningScoreBreakdown {
  metricA: number;
  metricB: number;
  metricC: number;
  rawScore: number;
  finalBandScore: number;
  correctAnswers: number;
  totalQuestions: number;
  feedbackMessage: string;
  errors: GamlishErrorFeedback[];
}
