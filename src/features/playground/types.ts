import type { Bilingual } from "@/src/features/chat-lesson/types";

/** A wrong tap that deserves its own hint, e.g. tapping "rice" in "Eat your rice!". */
export type WordTrap = { index: number; hint: Bilingual };

/** Round 1: pick Who or What, then tap the Subject. `words` are tappable chunks ("My alarm"). */
export type AskFirstItem = {
  id: string;
  words: readonly string[];
  meaningBn: string;
  kind: "who" | "what";
  /** Shown when the learner picks the other question word. */
  kindWhy: Bilingual;
  question: Bilingual;
  subject: number;
  trap?: WordTrap;
};

/** Round 2: stretch the light from the first word to the end of the Subject. `words` are single words. */
export type StretchItem = {
  id: string;
  words: readonly string[];
  meaningBn: string;
  question: Bilingual;
  /** Index of the last word of the Subject (the Subject always starts at word 0). */
  subjectEnd: number;
  compound?: boolean;
  /** Shown when the learner stops too early. */
  shortHint?: Bilingual;
};

export type SpeakerKind =
  | "mom"
  | "dad"
  | "teacher"
  | "friend"
  | "sister"
  | "sign"
  | "app"
  | "coach"
  | "doctor";

/** Round 3: tap the written Subject, or the hidden You when the sentence is a command. */
export type HiddenYouItem = {
  id: string;
  speaker: SpeakerKind;
  speakerLabel: Bilingual;
  words: readonly string[];
  meaningBn: string;
  /** Chunk index of the written Subject. Omitted for commands, where the Subject is a hidden You. */
  subject?: number;
  trap?: WordTrap;
};

export type TalkAccepts = "person" | "thing" | "any";

/**
 * The sentence the learner completes: `[typed Subject] [subjectTail] [verb] [after]`.
 * The verb form is picked by the app, so learners never have to choose cook or cooks yet.
 */
export type TalkFrame = {
  subjectTail?: string;
  verb?: { one: string; many: string };
  after: string;
};

/** Round 4: answer a question about your own life by typing only the Subject. */
export type TalkItem = {
  id: string;
  question: Bilingual;
  frame: TalkFrame;
  accepts: TalkAccepts;
  /** Whether "I" (or "We") is a sensible answer. */
  allowSelf: boolean;
  selfHint?: Bilingual;
  /** Tap-to-fill answers behind "Need help?"; the first one is also the example answer. */
  cards: readonly string[];
  traps?: readonly { text: string; hint: Bilingual }[];
};

/** How a word becomes Plural; drives the hint and the "why" line. */
export type PluralRule =
  | "s"
  | "es"
  | "y-ies"
  | "y-s"
  | "special"
  | "same"
  | "f-ves"
  | "o-es"
  | "no-plural"
  | "one";

/** A typed wrong answer that deserves its own hint, e.g. "childrens". */
export type TypedTrap = { text: string; hint: Bilingual };

/** Count & Build: count the pictures, pick the number word, then the right word form. */
export type CountBuildItem = {
  id: string;
  emoji: string;
  count: number;
  numberOptions: readonly string[];
  /** The number word that matches `count`, e.g. "three". */
  numberWord: string;
  forms: readonly string[];
  answer: string;
  rule: PluralRule;
  meaningBn: string;
  /** Hint when a specific wrong form is picked, e.g. "apples" for one apple. */
  traps?: readonly TypedTrap[];
};

/** Plural Machine: type the Plural of one word. */
export type PluralMachineItem = {
  id: string;
  word: string;
  bn: string;
  answer: string;
  accepted?: readonly string[];
  rule: PluralRule;
  traps?: readonly TypedTrap[];
  group?: string;
};

/** The Bangla Trap: tap the wrong English word, then choose its fix. */
export type BanglaTrapItem = {
  id: string;
  bangla: string;
  words: readonly string[];
  wrong: number;
  fixes: readonly string[];
  fix: string;
  rule: PluralRule;
};

/** Bazar List: complete one line of Mom's shopping list by typing the right word form. */
export type BazarItem = {
  id: string;
  bangla: string;
  /** Fixed words before the blank, e.g. "three" or "one kilo of". */
  before: string;
  /** The word in its one-form, shown as a clue, e.g. "potato". */
  clue: string;
  answer: string;
  /** Other correct spellings, e.g. "mangos". */
  accepted?: readonly string[];
  rule: PluralRule;
  traps?: readonly TypedTrap[];
  group?: string;
};

export type PersonKey = "first" | "second" | "third";
export type NumberKey = "singular" | "plural";

/** Person · Group Chat: a chat message with one highlighted chunk; the learner names its Person. */
export type GroupChatItem = {
  id: string;
  sender: string;
  /** Who the message is sent to, e.g. "Mina" or "Class 7 group". */
  to: string;
  words: readonly string[];
  focus: number;
  answer: PersonKey;
  bn: string;
  why: Bilingual;
  /** Hint for the most tempting wrong answer, e.g. "your" does not make it Second Person. */
  trap?: Bilingual;
};

/** Person · Name Swap: replace the highlighted chunk with one pronoun. */
export type NameSwapItem = {
  id: string;
  words: readonly string[];
  focus: number;
  options: readonly string[];
  answer: string;
  bn: string;
  why: Bilingual;
  trap?: Bilingual;
};

/** Person · Respect Trap: a Bangla line (আপনি, তুমি, তুই, সে, তিনি...) becomes one English Subject. */
export type RespectItem = {
  id: string;
  emoji: string;
  speaker: Bilingual;
  bangla: string;
  options: readonly string[];
  answer: string;
  /** The full English sentence, shown and read after answering. */
  en: string;
  why: Bilingual;
  trap?: { pick: string; hint: Bilingual };
};

/** Person · Team Up: a mixed Subject; pick its Person, then the one word for it. */
export type TeamUpItem = {
  id: string;
  members: readonly string[];
  person: PersonKey;
  pronoun: "We" | "You" | "They";
  bn: string;
  why: Bilingual;
};

/** Decode · Six-Box Sort: drop the Subject card into its Number × Person box. */
export type SixBoxItem = {
  id: string;
  card: string;
  /** Who "You" is said to, so the learner can tell one from many. */
  context?: Bilingual;
  number: NumberKey;
  person: PersonKey;
  bn: string;
  why: Bilingual;
};

/** Decode · Code Lock: select the complete Subject, then set the Number and Person wheels. */
export type CodeLockItem = {
  id: string;
  words: readonly string[];
  /** Chunk indices that make the complete Subject. */
  subject: readonly number[];
  context?: Bilingual;
  number: NumberKey;
  person: PersonKey;
  bn: string;
  why: Bilingual;
};

/** Decode · Odd One Out: three cards share a code, one does not. */
export type OddOneOutItem = {
  id: string;
  cards: readonly string[];
  /** The decoded code of each card, shown after answering, e.g. "Singular · Third". */
  codes: readonly string[];
  odd: number;
  why: Bilingual;
};

/** Decode · Build to Order: build a Subject from tiles that matches a Number and Person code. */
export type BuildOrderItem = {
  id: string;
  number: NumberKey;
  person: PersonKey;
  context?: Bilingual;
  tiles: readonly string[];
  accepted: readonly string[];
  hint: Bilingual;
};

/** Verb · Verb Spotlight: tap the Verb; `traps` explain tempting words like "cook" the person. */
export type SpotlightItem = {
  id: string;
  words: readonly string[];
  verb: number;
  bn: string;
  why: Bilingual;
  traps?: readonly WordTrap[];
};

export type BeVerb = "am" | "is" | "are";

/** Verb · Fix the Bridge: the missing being Verb. */
export type BridgeItem = {
  id: string;
  bangla: string;
  before: string;
  after: string;
  answer: BeVerb;
  why: Bilingual;
  trap?: { pick: BeVerb; hint: Bilingual };
};

/** Verb · Bin the Extra: throw away the extra "do"/"make", or say the sentence is already correct. */
export type BinExtraItem = {
  id: string;
  bangla: string;
  words: readonly string[];
  /** Index of the extra word, or null when the sentence is already correct. */
  extra: number | null;
  fixed: string;
  why: Bilingual;
};

/** Verb · Action Camera: type the Verb the picture shows. Subjects never need an -s. */
export type CameraItem = {
  id: string;
  emoji: string;
  bangla: string;
  before: string;
  after: string;
  answer: string;
  accepted?: readonly string[];
};

/** Object · Pass the Ball: ask What or Whom, then tap the Object (or "No catcher"). */
export type PassBallItem = {
  id: string;
  words: readonly string[];
  subject: number;
  verb: number;
  /** Chunk index of the Object, or null when the sentence has none. */
  object: number | null;
  ask: "what" | "whom" | null;
  bn: string;
  why: Bilingual;
};

/** Object · Object or Place: sort the highlighted chunk. */
export type ObjectPlaceItem = {
  id: string;
  words: readonly string[];
  focus: number;
  answer: "object" | "place";
  bn: string;
  why: Bilingual;
};

/** Object · Mirror Words: I/me, he/him... chosen by the blank's place before or after the Verb. */
export type MirrorItem = {
  id: string;
  bangla: string;
  before: string;
  after: string;
  options: readonly string[];
  answer: string;
  side: "subject" | "object";
  why: Bilingual;
};

/** Object · Complete or Not: decide if the Verb needs an Object, then pick it. */
export type CompleteItem = {
  id: string;
  /** "The baby sleeps" (complete) or "I want" (needs an Object). No full stop. */
  start: string;
  complete: boolean;
  options?: readonly string[];
  answer?: string;
  bn: string;
  why: Bilingual;
};

/** Word Order · Bangla Flip: the English tiles arrive in Bangla order; move the Verb. */
export type FlipItem = {
  id: string;
  bangla: string;
  subject: string;
  object: string;
  verb: string;
};

/** Word Order · Grow the Sentence: add the place, then the time. */
export type GrowItem = {
  id: string;
  bangla: string;
  base: string;
  place: string;
  time: string;
};

export type Diagnosis = "order" | "verb" | "form" | "extra";

/** Word Order · Sentence Doctor: name the problem, then pick the cure. */
export type DoctorItem = {
  id: string;
  bangla: string;
  sick: string;
  diagnosis: Diagnosis;
  cures: readonly string[];
  cure: string;
  why: Bilingual;
};

/** Word Order · My Day Diary: type the English sentence for one moment of the day. */
export type DiaryItem = {
  id: string;
  time: Bilingual;
  bangla: string;
  accepted: readonly string[];
  hint: Bilingual;
};

type RoundBase = {
  id: string;
  title: Bilingual;
  goal: Bilingual;
  instruction: Bilingual;
  /** How many items one play draws from the bank. */
  pick: number;
  /** Balanced draw: this many items from each `group` (the rest of `pick` is drawn freely). */
  mix?: readonly { group: string; count: number }[];
  /** Keep the drawn items in bank order (e.g. a diary that runs from morning to night). */
  ordered?: boolean;
};

export type PlaygroundRound =
  | (RoundBase & { kind: "ask-first"; items: readonly AskFirstItem[] })
  | (RoundBase & { kind: "stretch"; items: readonly StretchItem[] })
  | (RoundBase & { kind: "hidden-you"; items: readonly HiddenYouItem[] })
  | (RoundBase & { kind: "talk"; items: readonly TalkItem[] })
  | (RoundBase & { kind: "count-build"; items: readonly CountBuildItem[] })
  | (RoundBase & { kind: "plural-machine"; items: readonly PluralMachineItem[] })
  | (RoundBase & { kind: "bangla-trap"; items: readonly BanglaTrapItem[] })
  | (RoundBase & { kind: "bazar-list"; items: readonly BazarItem[] })
  | (RoundBase & { kind: "group-chat"; items: readonly GroupChatItem[] })
  | (RoundBase & { kind: "name-swap"; items: readonly NameSwapItem[] })
  | (RoundBase & { kind: "respect-trap"; items: readonly RespectItem[] })
  | (RoundBase & { kind: "team-up"; items: readonly TeamUpItem[] })
  | (RoundBase & { kind: "six-box"; items: readonly SixBoxItem[] })
  | (RoundBase & { kind: "code-lock"; items: readonly CodeLockItem[] })
  | (RoundBase & { kind: "odd-one-out"; items: readonly OddOneOutItem[] })
  | (RoundBase & { kind: "build-order"; items: readonly BuildOrderItem[] })
  | (RoundBase & { kind: "verb-spotlight"; items: readonly SpotlightItem[] })
  | (RoundBase & { kind: "fix-bridge"; items: readonly BridgeItem[] })
  | (RoundBase & { kind: "bin-extra"; items: readonly BinExtraItem[] })
  | (RoundBase & { kind: "action-camera"; items: readonly CameraItem[] })
  | (RoundBase & { kind: "pass-ball"; items: readonly PassBallItem[] })
  | (RoundBase & { kind: "object-place"; items: readonly ObjectPlaceItem[] })
  | (RoundBase & { kind: "mirror-words"; items: readonly MirrorItem[] })
  | (RoundBase & { kind: "complete-or-not"; items: readonly CompleteItem[] })
  | (RoundBase & { kind: "bangla-flip"; items: readonly FlipItem[] })
  | (RoundBase & { kind: "grow-sentence"; items: readonly GrowItem[] })
  | (RoundBase & { kind: "sentence-doctor"; items: readonly DoctorItem[] })
  | (RoundBase & { kind: "my-diary"; items: readonly DiaryItem[] });

export type PlaygroundRoundKind = PlaygroundRound["kind"];

export type Playground = {
  id: string;
  /** The lesson step this playground practises; it appears right after it on the level map. */
  afterStepId: string;
  title: Bilingual;
  rounds: readonly PlaygroundRound[];
  learned: readonly Bilingual[];
  realLifeTip: Bilingual;
  /** Share of first-try points needed to pass, e.g. 0.8. Only a pass completes the playground. */
  passMark: number;
  /** Heading for the lines the learner builds (My Sentences, My Bazar List). */
  collection: { title: Bilingual; sub: Bilingual };
};

/** One item of any round, tagged with its round kind. */
export type PlayItem = {
  [R in PlaygroundRound as R["kind"]]: { kind: R["kind"]; item: R["items"][number] };
}[PlaygroundRoundKind];

export type SessionItem = PlayItem & {
  key: string;
  instruction: Bilingual;
  /** Second chance at a missed item: no points, just practice. */
  review: boolean;
};

export type SessionRound = {
  id: string;
  kind: PlaygroundRoundKind | "review";
  title: Bilingual;
  goal: Bilingual;
  items: SessionItem[];
};

export type BuiltSentence = { subject: string; rest: string };

/** A line the learner built, shown on the end screen with `highlight` in blue. */
export type CollectedLine = { before?: string; highlight: string; after?: string };

export type AnswerResult =
  | {
      correct: true;
      body: Bilingual;
      note?: Bilingual;
      /** Typed without opening the help cards. */
      brave?: boolean;
      collect?: CollectedLine;
    }
  | { correct: false; hint: Bilingual; reveal: Bilingual };
