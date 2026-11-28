export type ErrorTag =
  | "missed_ending"
  | "double_letter"
  | "silent_letter"
  | "phonetic_guess"
  | "vowel_cluster"
  | "skipped_letter"
  | "extra_letter"
  | "wrong_letter"
  | "hold_failure"
  | "letter_confusion"
  | "number_confusion"
  | "homophone"
  | "format"
  | "slip"
  | "other";

export type WordPack = "days" | "home" | "money" | "uni" | "jobs" | "health";

export type SpellingWord = {
  id: string;
  lemma: string;
  pack: WordPack;
  d: 1 | 2 | 3;
  accept?: string[];
  wrong: Array<[string, ErrorTag]>;
  tipEn: string;
  tipBn: string;
  /** Simple English gloss · shown after the learner answers. */
  meaningEn?: string;
  /** Bangla gloss · shown after answer when locale is bn. */
  meaningBn?: string;
  ctx?: string;
  form?: string;
  audio?: string;
  reviewed: boolean;
};

export type SpellAloudType = "name" | "postcode" | "number" | "price";

export type SpellAloudItem = {
  id: string;
  type: SpellAloudType;
  answer: string;
  spoken: string;
  accept?: string[];
};

export type SessionMode = "practice" | "exam";
export type PackChoice = "mixed" | WordPack | "spellaloud";
export type ItemKind = "dictation" | "context" | "spellaloud";

export type SessionItem = {
  id: string;
  kind: ItemKind;
  lemma: string;
  accept: string[];
  tipEn: string;
  tipBn: string;
  meaningEn?: string;
  meaningBn?: string;
  packLabel: string;
  wrong: Array<[string, ErrorTag]>;
  ctx?: string;
  form?: string;
  audio?: string;
  spoken?: string;
  spellType?: SpellAloudType;
  difficulty: 1 | 2 | 3;
};

export type WordProgress = {
  box: 0 | 1 | 2 | 3;
  nextDue: number;
  attempts: number;
  correctCount: number;
  lastErrorTag?: ErrorTag;
  errorCounts: Partial<Record<ErrorTag, number>>;
  lastSeen: number;
};

export type ProgressStore = {
  version: number;
  words: Record<string, WordProgress>;
};

export type AnswerResult = {
  correct: boolean;
  tag?: ErrorTag;
  firstMismatch: number;
  normalizedAnswer: string;
  normalizedTarget: string;
  displayTarget: string;
};
