import type {
  BanglaTrapItem,
  BazarItem,
  BridgeItem,
  BuildOrderItem,
  CameraItem,
  CompleteItem,
  CountBuildItem,
  FlipItem,
  GrowItem,
  MirrorItem,
  NameSwapItem,
  Playground,
  PlayItem,
  PluralMachineItem,
  TeamUpItem,
} from "@/src/features/playground/types";

type Lang = "en" | "bn";

/**
 * Every line the playground can speak. Kept free of value imports so the audio generator script
 * (run directly by Node) and the browser agree on exactly which clips exist.
 * Only correct English is ever spoken: wrong forms and learner typing never are.
 */

export const countPhrase = (item: CountBuildItem): string => `${item.numberWord} ${item.answer}`;

/** "one baby, two babies": the pair the machine says once the plural is typed. */
export const pluralPair = (item: PluralMachineItem): string => `one ${item.word}, two ${item.answer}`;

/** The wrong word swapped for its fix, keeping its punctuation ("sister." becomes "sisters."). */
export const fixedWord = (item: BanglaTrapItem): string =>
  `${item.fix}${/[.!?,]+$/.exec(item.words[item.wrong] ?? "")?.[0] ?? ""}`;

export const fixedSentence = (item: BanglaTrapItem): string =>
  item.words.map((word, i) => (i === item.wrong ? fixedWord(item) : word)).join(" ");

export const bazarLine = (item: BazarItem): string => `${item.before} ${item.answer}`;

const joinWords = (...parts: string[]): string =>
  parts
    .filter(Boolean)
    .join(" ")
    .replace(/\s+([.,!?])/g, "$1");

/** "Rahim is my cousin." becomes "He is my cousin." */
export const swappedSentence = (item: NameSwapItem): string =>
  item.words.map((word, i) => (i === item.focus ? item.answer : word)).join(" ");

export const teamPhrase = (item: TeamUpItem): string => {
  const { members } = item;
  if (members.length < 3) return members.join(" and ");
  return `${members.slice(0, -1).join(", ")} and ${members[members.length - 1] ?? ""}`;
};

export const teamLine = (item: TeamUpItem): string => `${teamPhrase(item)}. ${item.pronoun}.`;

export const buildLine = (item: BuildOrderItem): string => `${item.accepted[0] ?? ""} can help.`;

export const bridgeSentence = (item: BridgeItem): string => joinWords(item.before, item.answer, item.after);

export const cameraSentence = (item: CameraItem): string => joinWords(item.before, item.answer, item.after);

export const mirrorSentence = (item: MirrorItem): string => joinWords(item.before, item.answer, item.after);

export const completeSentence = (item: CompleteItem): string =>
  item.complete || !item.answer ? `${item.start}.` : `${item.start} ${item.answer}.`;

export const flipSentence = (item: FlipItem): string => `${item.subject} ${item.verb} ${item.object}.`;

export const growBase = (item: GrowItem): string => `${item.base}.`;

export const growSentence = (item: GrowItem): string => `${item.base} ${item.place} ${item.time}.`;

/** English line read automatically when an item appears; null when it would give the answer away. */
export function startLine(play: PlayItem): string | null {
  switch (play.kind) {
    case "ask-first":
    case "stretch":
    case "hidden-you":
    case "group-chat":
    case "name-swap":
    case "code-lock":
    case "verb-spotlight":
    case "pass-ball":
    case "object-place":
      return play.item.words.join(" ");
    case "talk":
      return play.item.question.en;
    case "plural-machine":
      return play.item.word;
    case "team-up":
      return teamPhrase(play.item);
    case "six-box":
      return play.item.card;
    case "grow-sentence":
      return growBase(play.item);
    default:
      return null;
  }
}

/** English read after the answer (never the learner's own typing). */
export function afterLine(play: PlayItem): string | null {
  switch (play.kind) {
    case "ask-first":
    case "stretch":
    case "hidden-you":
    case "group-chat":
    case "code-lock":
    case "verb-spotlight":
    case "pass-ball":
    case "object-place":
      return play.item.words.join(" ");
    case "talk":
    case "odd-one-out":
      return null;
    case "count-build":
      return countPhrase(play.item);
    case "plural-machine":
      return pluralPair(play.item);
    case "bangla-trap":
      return fixedSentence(play.item);
    case "bazar-list":
      return bazarLine(play.item);
    case "name-swap":
      return swappedSentence(play.item);
    case "respect-trap":
      return play.item.en;
    case "team-up":
      return teamLine(play.item);
    case "six-box":
      return play.item.card;
    case "build-order":
      return buildLine(play.item);
    case "fix-bridge":
      return bridgeSentence(play.item);
    case "bin-extra":
      return play.item.fixed;
    case "action-camera":
      return cameraSentence(play.item);
    case "mirror-words":
      return mirrorSentence(play.item);
    case "complete-or-not":
      return completeSentence(play.item);
    case "bangla-flip":
      return flipSentence(play.item);
    case "grow-sentence":
      return growSentence(play.item);
    case "sentence-doctor":
      return play.item.cure;
    case "my-diary":
      return play.item.accepted[0] ?? null;
  }
}

/** Bangla line behind the Bangla speaker button. */
export function banglaLine(play: PlayItem): string | null {
  switch (play.kind) {
    case "talk":
      return play.item.question.bn;
    case "plural-machine":
      return play.item.bn;
    case "bangla-trap":
    case "bazar-list":
    case "respect-trap":
    case "fix-bridge":
    case "bin-extra":
    case "action-camera":
    case "mirror-words":
    case "bangla-flip":
    case "grow-sentence":
    case "sentence-doctor":
    case "my-diary":
      return play.item.bangla;
    case "ask-first":
    case "stretch":
    case "hidden-you":
    case "count-build":
      return play.item.meaningBn;
    case "odd-one-out":
    case "build-order":
      return null;
    default:
      return play.item.bn;
  }
}

function itemLines(play: PlayItem, lang: Lang): string[] {
  const lines =
    lang === "bn"
      ? [banglaLine(play), play.kind === "ask-first" ? play.item.question.bn : null]
      : [startLine(play), afterLine(play), play.kind === "ask-first" ? play.item.question.en : null];
  return lines.filter((line): line is string => line !== null);
}

function roundPlays(round: Playground["rounds"][number]): PlayItem[] {
  return round.items.map((item) => ({ kind: round.kind, item }) as PlayItem);
}

export function playgroundSpokenLines(playground: Playground, lang: Lang): string[] {
  const lines = playground.rounds.flatMap((round) => [
    round.instruction[lang],
    ...(round.steps ?? []).map((step) => step[lang]),
    ...(round.rule ? [round.rule.text[lang]] : []),
    ...roundPlays(round).flatMap((play) => itemLines(play, lang)),
  ]);
  // Lines with the learner's name are filled in per learner, so they never get a recorded clip.
  return [...new Set(lines)].filter((line) => !line.includes("{name}"));
}
