export type Bilingual = {
  en: string;
  bn: string;
};

export type LessonListItem = {
  term: string;
  termBn?: string;
  en: string;
  bn: string;
};

/**
 * Bangla meaning of an English word or phrase as used in one sentence ("play" can be খেলি or খেলে).
 * `text` is matched case-insensitively, ignoring punctuation; phrases win over single words.
 */
export type WordGloss = {
  text: string;
  bn: string;
};

/**
 * One chat bubble. `**word**` marks a highlighted key phrase and `\n` starts a new line.
 * `example` shows a sentence card, `remember` a key-rule card, `items` a term list.
 * `glosses` makes the English words of an example tappable for their Bangla meaning.
 */
/** A cell is plain text shown in both languages, or language-specific text. */
export type LessonTableCell = string | Bilingual;

/** Small word table inside a bubble, e.g. Singular → Plural pairs or a Verb list. */
export type LessonTable = {
  columns: Bilingual[];
  rows: LessonTableCell[][];
  /** Columns of wrong forms ("two brother"): shown crossed out and never read aloud. */
  wrongColumns?: number[];
};

export type LessonMessage = Bilingual & {
  variant?: "example" | "remember";
  items?: LessonListItem[];
  table?: LessonTable;
  glosses?: WordGloss[];
};

export type LessonOption = {
  id: string;
  label: string;
  text: Bilingual;
};

/**
 * `choice`: pick one option. `arrange`: tap every option (a sentence piece) in order; the answer is
 * the option ids in that order, joined by a space (see `ARRANGE_SEPARATOR`).
 * `type`: the learner types the answer; every option is an accepted answer and `correctOptionId`
 * points at the one shown as the model answer.
 */
export type LessonQuestionKind = "choice" | "arrange" | "type";

export type LessonQuestion = {
  id: string;
  /** Defaults to `choice`. */
  kind?: LessonQuestionKind;
  /** Short game-style heading shown above the prompt, e.g. "Meet Rafi!". */
  title?: Bilingual;
  prompt: Bilingual;
  /** Bangla sentence to turn into English, shown once above the options in both languages. */
  sourceBn?: string;
  /** English sentence the question is about, shown as a highlighted card. */
  sentence?: string;
  sentenceGlosses?: WordGloss[];
  /** For `arrange`, the pieces in the (shuffled) order they are shown. */
  options: LessonOption[];
  /** Options are English words or sentences being studied: always shown in English. */
  englishOptions?: boolean;
  /** For `arrange`, the option ids in the correct order, e.g. "b d a c". */
  correctOptionId: string;
  /** Shown with the warning after the first wrong answer. Must not reveal the answer outright. */
  hint: Bilingual;
  /** Why the correct answer is correct. Shown after any final outcome. */
  explanation: Bilingual;
  /** Optional praise word for a correct answer, e.g. "Great!". Defaults to "Correct!". */
  praise?: Bilingual;
};

export type LessonChunk = {
  id: string;
  title: Bilingual;
  messages: LessonMessage[];
  questions: LessonQuestion[];
};

export type ChatLessonStep = {
  id: string;
  missionLabel: string;
  stepLabel: string;
  title: Bilingual;
  guideName: string;
  chunks: LessonChunk[];
  /** Drafts are stored but not playable (e.g. lessons still waiting for questions). */
  status?: "draft" | "published";
  /** Internal guidance for the team; never shown to learners. */
  teacherNote?: string;
};

export type LevelNodeIcon =
  | "welcome"
  | "map"
  | "subject"
  | "number"
  | "person"
  | "practice"
  | "verb"
  | "object"
  | "order"
  | "formula"
  | "test"
  | "playground";

export type LevelNode = {
  id: string;
  title: Bilingual;
  icon: LevelNodeIcon;
  /** Set when the step is playable; nodes without a step show as coming soon. */
  stepId?: string;
  /** Encouraged but never blocks the next step (e.g. a playground). */
  optional?: boolean;
  /** Unlocks only when every earlier node, playgrounds included, is done (e.g. the Final Test). */
  requiresAll?: boolean;
};

export type ChatLessonLevel = {
  id: string;
  label: string;
  title: Bilingual;
  nodes: LevelNode[];
};

export type AnswerPoints = 0 | 0.5 | 1;

export type FeedbackResult =
  | "correct"
  | "correct-after-warning"
  | "warning"
  | "revealed";
