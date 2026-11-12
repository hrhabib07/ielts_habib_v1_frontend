import type { PlaygroundRoundKind } from "@/src/features/playground/types";

/** Plain names for every field the games use, shown in the editor instead of code names. */
export const FIELD_LABELS: Readonly<Record<string, string>> = {
  id: "Question id",
  words: "Sentence tiles",
  meaningBn: "Bangla meaning",
  kind: "Question word",
  kindWhy: "Why (wrong question word)",
  question: "Question",
  subject: "Subject (answer tile)",
  subjectEnd: "Last tile of the Subject",
  trap: "Trap (common wrong tap)",
  traps: "Traps (common wrong answers)",
  index: "Trap tile",
  hint: "Hint",
  compound: "Joined with and",
  shortHint: "Hint when stopped too early",
  speaker: "Speaker type",
  speakerLabel: "Speaker name",
  frame: "Sentence frame",
  subjectTail: "Words after the typed Subject",
  verb: "Verb",
  one: "Verb for one",
  many: "Verb for many",
  after: "Words after the gap",
  before: "Words before the gap",
  accepts: "Accepts",
  allowSelf: "Allow I or We",
  selfHint: "Hint when typing I",
  cards: "Help cards",
  emoji: "Picture (emoji)",
  count: "How many in the picture",
  numberOptions: "Number choices",
  numberWord: "Correct number word",
  forms: "Word choices",
  answer: "Correct answer",
  accepted: "Accepted answers",
  rule: "Rule (round: rule card shown before it starts · question: plural rule type)",
  group: "Group (for balanced picks)",
  word: "Word",
  bn: "Bangla",
  bangla: "Bangla sentence",
  wrong: "Wrong tile",
  fixes: "Fix choices",
  fix: "Correct fix",
  clue: "Clue word",
  sender: "Sender",
  to: "Sent to",
  focus: "Highlighted tile",
  why: "Why (shown after answering)",
  options: "Choices",
  en: "Full English sentence",
  members: "Team members",
  person: "Person",
  pronoun: "One word for the team",
  card: "Card",
  context: "Context",
  number: "Number",
  codes: "Codes (one per card)",
  odd: "Odd card",
  tiles: "Tiles",
  extra: "Extra tile",
  fixed: "Corrected sentence",
  object: "Object tile",
  ask: "Ask",
  side: "Before or after the Verb",
  start: "Sentence start",
  complete: "Already complete",
  base: "Sentence start",
  place: "Place tile",
  time: "Time tile",
  sick: "Wrong sentence",
  diagnosis: "Problem",
  cures: "Sentence choices",
  cure: "Correct sentence",
  pick: "Questions per play",
  ordered: "Keep bank order",
  mix: "Balanced picks",
  title: "Title",
  goal: "Goal (round intro)",
  instruction: "Instruction (above every question)",
  steps: "Step titles (one at a time, for two-step games)",
  text: "Text",
  example: "Example (English)",
  mark: "Underlined part of the example",
  learned: "What you learned (finish screen)",
  realLifeTip: "Real-life tip",
  passMark: "Pass mark (0.1 to 1)",
  collection: "Collection heading",
  sub: "Subtitle",
};

const PERSON = ["first", "second", "third"];
const NUMBER = ["singular", "plural"];
const RULES = ["s", "es", "y-ies", "y-s", "special", "same", "f-ves", "o-es", "no-plural", "one"];

/** Fields that must be one of a fixed set of values, everywhere they appear. */
const COMMON_ENUMS: Readonly<Record<string, readonly string[]>> = {
  rule: RULES,
  person: PERSON,
  number: NUMBER,
  side: ["subject", "object"],
  diagnosis: ["order", "verb", "form", "extra"],
  pronoun: ["We", "You", "They"],
  accepts: ["person", "thing", "any"],
  speaker: ["mom", "dad", "teacher", "friend", "sister", "sign", "app", "coach", "doctor"],
};

/** Fixed sets that only apply in one game type (the same field name means something else elsewhere). */
const KIND_ENUMS: Partial<Record<PlaygroundRoundKind, Readonly<Record<string, readonly string[]>>>> = {
  "ask-first": { kind: ["who", "what"] },
  "group-chat": { answer: PERSON },
  "object-place": { answer: ["object", "place"] },
  "fix-bridge": { answer: ["am", "is", "are"], pick: ["am", "is", "are"] },
  "pass-ball": { ask: ["what", "whom"] },
};

export function enumFor(kind: PlaygroundRoundKind | null, key: string): readonly string[] | null {
  return (kind ? KIND_ENUMS[kind]?.[key] : undefined) ?? COMMON_ENUMS[key] ?? null;
}

/** An answer that must be one of its sibling choices, e.g. `answer` from `options`. */
const CHOICE_SOURCES: Readonly<Record<string, readonly string[]>> = {
  answer: ["options", "forms"],
  fix: ["fixes"],
  cure: ["cures"],
  numberWord: ["numberOptions"],
};

export function choiceSource(key: string, siblings: Record<string, unknown>): readonly string[] | null {
  for (const source of CHOICE_SOURCES[key] ?? []) {
    const list = siblings[source];
    if (Array.isArray(list) && list.every((v) => typeof v === "string")) return list as string[];
  }
  return null;
}

/** Numbers that point at a tile: shown as a dropdown of the tiles, not a raw number. */
const TILE_INDEX_SOURCES: Readonly<Record<string, string>> = {
  subject: "words",
  subjectEnd: "words",
  focus: "words",
  wrong: "words",
  verb: "words",
  object: "words",
  extra: "words",
  index: "words",
  odd: "cards",
};

export function tileSource(key: string): string | null {
  return TILE_INDEX_SOURCES[key] ?? null;
}

/** Index fields that may be empty ("no Object", "sentence is already correct"). */
export const NULLABLE_INDEX: ReadonlySet<string> = new Set(["object", "extra"]);
export const NULLABLE_ENUM: ReadonlySet<string> = new Set(["ask"]);

export const ROUND_KIND_LABELS: Readonly<Record<PlaygroundRoundKind, string>> = {
  "ask-first": "Ask First · pick Who/What, tap the Subject",
  stretch: "Stretch It · stretch over the whole Subject",
  "hidden-you": "Hidden You · tap the Subject or the hidden You",
  talk: "Talk About Me · type the Subject",
  "count-build": "Count & Build · pick number, then word",
  "plural-machine": "Plural Machine · type the Plural",
  "bangla-trap": "Bangla Trap · tap the wrong word, pick the fix",
  "bazar-list": "Bazar List · type the word",
  "group-chat": "Group Chat · name the Person",
  "name-swap": "Name Swap · pick one word",
  "respect-trap": "Respect Trap · pick the English Subject",
  "team-up": "Team Up · Person, then We/You/They",
  "six-box": "Six-Box Sort · Number × Person box",
  "code-lock": "Code Lock · tap the Subject, set the code",
  "odd-one-out": "Odd One Out · tap the different card",
  "build-order": "Build to Order · build a Subject from tiles",
  "verb-spotlight": "Verb Spotlight · tap the Verb",
  "fix-bridge": "Fix the Bridge · am, is or are",
  "bin-extra": "Bin the Extra · tap the extra word",
  "action-camera": "Action Camera · type the Verb",
  "pass-ball": "Pass the Ball · What/Whom, tap the Object",
  "object-place": "Object or Place",
  "mirror-words": "Mirror Words · pick the pronoun",
  "complete-or-not": "Complete or Not · add the Object",
  "bangla-flip": "Bangla Flip · move tiles into English order",
  "grow-sentence": "Grow the Sentence · place, then time",
  "sentence-doctor": "Sentence Doctor · name the problem, pick the cure",
  "my-diary": "My Day Diary · type the sentence",
};

export function labelFor(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
