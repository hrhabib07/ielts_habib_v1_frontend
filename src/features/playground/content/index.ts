import numberAudio from "@/src/features/chat-lesson/content/audio/level-1-playground-number.json";
import subjectAudio from "@/src/features/chat-lesson/content/audio/level-1-playground-subject.json";
import type { StepAudio } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import type { Playground } from "@/src/features/playground/types";
import { DECODE_PLAYGROUND } from "./decodePlayground.ts";
import { NUMBER_PLAYGROUND } from "./numberPlayground.ts";
import { OBJECT_PLAYGROUND } from "./objectPlayground.ts";
import { PERSON_PLAYGROUND } from "./personPlayground.ts";
import { SUBJECT_PLAYGROUND } from "./subjectPlayground.ts";
import { VERB_PLAYGROUND } from "./verbPlayground.ts";
import { WORD_ORDER_PLAYGROUND } from "./wordOrderPlayground.ts";

export type PlaygroundEntry = { playground: Playground; audio: StepAudio };

/** Playgrounds whose recorded clips are not generated yet stay silent (the player only plays recorded clips). */
const NO_AUDIO: StepAudio = { clips: {} };

export const PLAYGROUNDS: Readonly<Record<string, PlaygroundEntry>> = {
  [SUBJECT_PLAYGROUND.id]: { playground: SUBJECT_PLAYGROUND, audio: subjectAudio as StepAudio },
  [NUMBER_PLAYGROUND.id]: { playground: NUMBER_PLAYGROUND, audio: numberAudio as StepAudio },
  [PERSON_PLAYGROUND.id]: { playground: PERSON_PLAYGROUND, audio: NO_AUDIO },
  [DECODE_PLAYGROUND.id]: { playground: DECODE_PLAYGROUND, audio: NO_AUDIO },
  [VERB_PLAYGROUND.id]: { playground: VERB_PLAYGROUND, audio: NO_AUDIO },
  [OBJECT_PLAYGROUND.id]: { playground: OBJECT_PLAYGROUND, audio: NO_AUDIO },
  [WORD_ORDER_PLAYGROUND.id]: { playground: WORD_ORDER_PLAYGROUND, audio: NO_AUDIO },
};

export const ALL_PLAYGROUNDS: readonly Playground[] = Object.values(PLAYGROUNDS).map((entry) => entry.playground);
