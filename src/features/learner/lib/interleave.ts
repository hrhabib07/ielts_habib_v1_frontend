/**
 * Mission 1 note → game pairing.
 * After a note chunk, the learner plays the matching round, then returns to the next note.
 * Rule: only pair when the game practices what that note just taught.
 */

export type InterleaveLink = {
  readonly chunkId: string;
  readonly playgroundId: string;
  readonly roundId: string;
};

/** Subject: find Subject → Who/What; commands → hidden You; full Subject → stretch; review → talk. */
const SUBJECT_LINKS: readonly InterleaveLink[] = [
  {
    chunkId: "what-is-subject",
    playgroundId: "level-1-playground-subject",
    roundId: "ask-first",
  },
  {
    chunkId: "command-subject",
    playgroundId: "level-1-playground-subject",
    roundId: "hidden-you",
  },
  {
    chunkId: "complete-subject",
    playgroundId: "level-1-playground-subject",
    roundId: "stretch",
  },
  {
    chunkId: "final-review",
    playgroundId: "level-1-playground-subject",
    roundId: "talk",
  },
];

/**
 * Number: count one→many → Count & Build; number+plural Bangla trap → Bangla Trap;
 * plural forms (-s/-es, -y, special) → Plural Machine; no-plural / uncountable → Bazar List.
 */
const NUMBER_LINKS: readonly InterleaveLink[] = [
  {
    chunkId: "one-to-many",
    playgroundId: "level-1-playground-number",
    roundId: "count-build",
  },
  {
    chunkId: "numbers-need-plurals",
    playgroundId: "level-1-playground-number",
    roundId: "bangla-trap",
  },
  {
    chunkId: "words-ending-y",
    playgroundId: "level-1-playground-number",
    roundId: "plural-machine",
  },
  {
    chunkId: "no-plural",
    playgroundId: "level-1-playground-number",
    roundId: "bazar-list",
  },
];

/**
 * Person: 1st/2nd/3rd → Group Chat; He/She/It/They → Name Swap;
 * আপনি/তুমি/তুই → Respect Trap; mixed Subjects → Team Up.
 */
const PERSON_LINKS: readonly InterleaveLink[] = [
  {
    chunkId: "three-persons",
    playgroundId: "level-1-playground-person",
    roundId: "group-chat",
  },
  {
    chunkId: "he-she-it-they",
    playgroundId: "level-1-playground-person",
    roundId: "name-swap",
  },
  {
    chunkId: "you-for-all",
    playgroundId: "level-1-playground-person",
    roundId: "respect-trap",
  },
  {
    chunkId: "mixed-subjects",
    playgroundId: "level-1-playground-person",
    roundId: "team-up",
  },
];

/**
 * Verb: find the Verb → Spotlight; am/is/are bridge → Fix the Bridge;
 * করা ≠ do → Bin the Extra; name the action → Action Camera.
 */
const VERB_LINKS: readonly InterleaveLink[] = [
  {
    chunkId: "find-the-verb",
    playgroundId: "level-1-playground-verb",
    roundId: "verb-spotlight",
  },
  {
    chunkId: "being-verbs",
    playgroundId: "level-1-playground-verb",
    roundId: "fix-bridge",
  },
  {
    chunkId: "one-word-kora",
    playgroundId: "level-1-playground-verb",
    roundId: "bin-extra",
  },
  {
    chunkId: "verb-review",
    playgroundId: "level-1-playground-verb",
    roundId: "action-camera",
  },
];

/**
 * Object: find Object → Pass the Ball; Object vs place → Object or Place?;
 * me/him/her… → Mirror Words; needs Object or not → Complete or Not?
 */
const OBJECT_LINKS: readonly InterleaveLink[] = [
  {
    chunkId: "find-the-object",
    playgroundId: "level-1-playground-object",
    roundId: "pass-ball",
  },
  {
    chunkId: "object-or-place",
    playgroundId: "level-1-playground-object",
    roundId: "object-place",
  },
  {
    chunkId: "object-pronouns",
    playgroundId: "level-1-playground-object",
    roundId: "mirror-words",
  },
  {
    chunkId: "no-object",
    playgroundId: "level-1-playground-object",
    roundId: "complete-or-not",
  },
];

/**
 * Word Order: Bangla→English order → Bangla Flip; place/time → Grow the Sentence;
 * fix broken sentences → Sentence Doctor; build your day → My Day Diary.
 */
const WORD_ORDER_LINKS: readonly InterleaveLink[] = [
  {
    chunkId: "basic-formulas",
    playgroundId: "level-1-playground-word-order",
    roundId: "bangla-flip",
  },
  {
    chunkId: "place-and-time",
    playgroundId: "level-1-playground-word-order",
    roundId: "grow-sentence",
  },
  {
    chunkId: "formula-master",
    playgroundId: "level-1-playground-word-order",
    roundId: "sentence-doctor",
  },
  {
    chunkId: "type-it-yourself",
    playgroundId: "level-1-playground-word-order",
    roundId: "my-diary",
  },
];

const BY_STEP: Readonly<Record<string, readonly InterleaveLink[]>> = {
  "level-1-step-3-subject": SUBJECT_LINKS,
  "level-1-step-4-number": NUMBER_LINKS,
  "level-1-step-5-person": PERSON_LINKS,
  "level-1-step-7-verb": VERB_LINKS,
  "level-1-step-8-object": OBJECT_LINKS,
  "level-1-step-9-word-order": WORD_ORDER_LINKS,
};

export function interleaveLinksForStep(stepId: string): readonly InterleaveLink[] {
  return BY_STEP[stepId] ?? [];
}

export function interleaveAfterChunk(
  stepId: string,
  chunkId: string,
): InterleaveLink | null {
  return interleaveLinksForStep(stepId).find((link) => link.chunkId === chunkId) ?? null;
}

/**
 * How many notes until the next practice game (0 = game after this note).
 * Null when this lesson has no upcoming paired game.
 */
export function notesUntilNextGame(
  stepId: string,
  chunkIds: readonly string[],
  currentChunkIndex: number,
): number | null {
  const linked = new Set(interleaveLinksForStep(stepId).map((link) => link.chunkId));
  if (linked.size === 0) return null;
  for (let i = currentChunkIndex; i < chunkIds.length; i += 1) {
    const id = chunkIds[i];
    if (id && linked.has(id)) return i - currentChunkIndex;
  }
  return null;
}

export function allInterleaveRoundsDone(
  stepId: string,
  doneRounds: ReadonlySet<string> | readonly string[],
): boolean {
  const links = interleaveLinksForStep(stepId);
  if (links.length === 0) return false;
  const done = doneRounds instanceof Set ? doneRounds : new Set(doneRounds);
  return links.every((link) => done.has(link.roundId));
}

export function interleavePlayHref(link: InterleaveLink, lessonStepId: string): string {
  const params = new URLSearchParams({
    interleave: "1",
    round: link.roundId,
    returnStep: lessonStepId,
    returnChunk: link.chunkId,
  });
  return `/player/mission-1/${encodeURIComponent(link.playgroundId)}?${params.toString()}`;
}
