/** Dry run for generate-lesson-audio: which lines have no recorded clip yet. Calls no API. */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { INTRO_STEP } from "../src/features/chat-lesson/content/introStep.ts";
import { NUMBER_PERSON_STEP } from "../src/features/chat-lesson/content/numberPersonStep.ts";
import { NUMBER_STEP } from "../src/features/chat-lesson/content/numberStep.ts";
import { OBJECT_STEP } from "../src/features/chat-lesson/content/objectStep.ts";
import { PERSON_STEP } from "../src/features/chat-lesson/content/personStep.ts";
import { SUBJECT_STEP } from "../src/features/chat-lesson/content/subjectStep.ts";
import { VERB_STEP } from "../src/features/chat-lesson/content/verbStep.ts";
import { WORD_ORDER_STEP } from "../src/features/chat-lesson/content/wordOrderStep.ts";
import { DECODE_PLAYGROUND } from "../src/features/playground/content/decodePlayground.ts";
import { NUMBER_PLAYGROUND } from "../src/features/playground/content/numberPlayground.ts";
import { OBJECT_PLAYGROUND } from "../src/features/playground/content/objectPlayground.ts";
import { PERSON_PLAYGROUND } from "../src/features/playground/content/personPlayground.ts";
import { SUBJECT_PLAYGROUND } from "../src/features/playground/content/subjectPlayground.ts";
import { VERB_PLAYGROUND } from "../src/features/playground/content/verbPlayground.ts";
import { WORD_ORDER_PLAYGROUND } from "../src/features/playground/content/wordOrderPlayground.ts";
import { playgroundSpokenLines } from "../src/features/playground/lib/speech.ts";
import { clipKey, stepSpokenLines, toSpokenText, type SpeechLang } from "../src/features/chat-lesson/lib/speechText.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const FREE = new Set([
  INTRO_STEP.id,
  SUBJECT_STEP.id,
  SUBJECT_PLAYGROUND.id,
  NUMBER_STEP.id,
  NUMBER_PLAYGROUND.id,
  PERSON_STEP.id,
  PERSON_PLAYGROUND.id,
]);

type Source = { id: string; lines: (lang: SpeechLang) => string[] };
const sources: Source[] = [
  ...[INTRO_STEP, SUBJECT_STEP, NUMBER_STEP, PERSON_STEP, NUMBER_PERSON_STEP, VERB_STEP, OBJECT_STEP, WORD_ORDER_STEP].map(
    (step) => ({ id: step.id, lines: (lang: SpeechLang) => stepSpokenLines(step, lang) }),
  ),
  ...[SUBJECT_PLAYGROUND, NUMBER_PLAYGROUND, PERSON_PLAYGROUND, DECODE_PLAYGROUND, VERB_PLAYGROUND, OBJECT_PLAYGROUND, WORD_ORDER_PLAYGROUND].map(
    (game) => ({ id: game.id, lines: (lang: SpeechLang) => playgroundSpokenLines(game, lang) }),
  ),
];

let freeLines = 0;
let freeChars = 0;
let allLines = 0;
let allChars = 0;
for (const source of sources) {
  let clips: Record<string, string> = {};
  try {
    const manifest = JSON.parse(
      await readFile(path.join(ROOT, "src", "features", "chat-lesson", "content", "audio", `${source.id}.json`), "utf8"),
    ) as { clips: Record<string, string> };
    clips = manifest.clips;
  } catch {
    clips = {};
  }
  const missing = new Map<string, string>();
  for (const lang of ["en", "bn"] as const) {
    for (const line of source.lines(lang)) {
      const key = clipKey(line, lang);
      if (!clips[key]) missing.set(key, toSpokenText(line, lang));
    }
  }
  const chars = [...missing.values()].reduce((sum, text) => sum + text.length, 0);
  allLines += missing.size;
  allChars += chars;
  if (FREE.has(source.id)) {
    freeLines += missing.size;
    freeChars += chars;
  }
  console.log(`${FREE.has(source.id) ? "FREE" : "PAID"}  ${source.id}: ${missing.size} lines, ${chars} chars`);
  if (FREE.has(source.id)) for (const text of missing.values()) console.log(`      - ${text.slice(0, 90)}`);
}
console.log(`\nFree part: ${freeLines} lines, ${freeChars} chars`);
console.log(`Everything: ${allLines} lines, ${allChars} chars`);
