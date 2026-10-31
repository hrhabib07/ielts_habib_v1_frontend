/**
 * Pre-generates lesson voice clips with Azure Speech so every learner hears the same natural voice,
 * plus word timings so the player can highlight each word as it is spoken.
 *
 *   Voice samples:  node --env-file=../backend/.env scripts/generate-lesson-audio.mts --samples
 *   All steps:      node --env-file=../backend/.env scripts/generate-lesson-audio.mts --en=<voice> --bn=<voice>
 *   One step:       add --step=<step id>
 *
 * Needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION. Clips that already exist with word timings are reused,
 * so only new or edited lines are billed.
 */
import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { INTRO_STEP } from "../src/features/chat-lesson/content/introStep.ts";
import { LEVEL1_OVERVIEW_STEP } from "../src/features/chat-lesson/content/level1OverviewStep.ts";
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
import type { Playground } from "../src/features/playground/types.ts";
import {
  clipKey,
  spokenWords,
  stepSpokenLines,
  toSpokenText,
  type SpeechLang,
} from "../src/features/chat-lesson/lib/speechText.ts";
import type { ChatLessonStep } from "../src/features/chat-lesson/types.ts";

const STEPS: ChatLessonStep[] = [
  INTRO_STEP,
  LEVEL1_OVERVIEW_STEP,
  SUBJECT_STEP,
  NUMBER_STEP,
  PERSON_STEP,
  NUMBER_PERSON_STEP,
  VERB_STEP,
  OBJECT_STEP,
  WORD_ORDER_STEP,
];

const PLAYGROUNDS: Playground[] = [
  SUBJECT_PLAYGROUND,
  NUMBER_PLAYGROUND,
  PERSON_PLAYGROUND,
  DECODE_PLAYGROUND,
  VERB_PLAYGROUND,
  OBJECT_PLAYGROUND,
  WORD_ORDER_PLAYGROUND,
];

const ROOT = path.resolve(import.meta.dirname, "..");
/** Free F0 tier allows 20 requests per 60 seconds. */
const REQUEST_GAP_MS = 3_200;
const RATE_LIMIT_WAIT_MS = 61_000;
const TICKS_PER_MS = 10_000;
const PROSODY_RATE: Record<SpeechLang, string> = { en: "-4%", bn: "-6%" };

const SAMPLE_VOICES: { id: string; label: string; lang: SpeechLang }[] = [
  { id: "en-US-AndrewMultilingualNeural", label: "Andrew · US, warm", lang: "en" },
  { id: "en-US-BrianMultilingualNeural", label: "Brian · US, friendly", lang: "en" },
  { id: "en-US-GuyNeural", label: "Guy · US, classic", lang: "en" },
  { id: "en-GB-RyanNeural", label: "Ryan · UK", lang: "en" },
  { id: "en-IN-PrabhatNeural", label: "Prabhat · Indian English", lang: "en" },
  { id: "en-US-Andrew:DragonHDLatestNeural", label: "Andrew HD · most natural", lang: "en" },
  { id: "bn-BD-PradeepNeural", label: "Pradeep · Bangladesh", lang: "bn" },
  { id: "bn-IN-BashkarNeural", label: "Bashkar · India", lang: "bn" },
];

/** [startMs, endMs, wordIndex] where wordIndex counts whitespace-separated words of the spoken text. */
type WordTiming = [number, number, number];

type StepAudioManifest = {
  stepId: string;
  voices: Record<SpeechLang, string>;
  clips: Record<string, string>;
  timings?: Record<string, WordTiming[]>;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is missing. Add it to backend/.env`);
  return value;
}

const speechKey = requireEnv("AZURE_SPEECH_KEY");
const speechRegion = requireEnv("AZURE_SPEECH_REGION");

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function voiceLocale(voice: string): string {
  return voice.split("-").slice(0, 2).join("-");
}

function buildSsml(text: string, voice: string, lang: SpeechLang): string {
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voiceLocale(voice)}">` +
    `<voice name="${voice}"><prosody rate="${PROSODY_RATE[lang]}">${escapeXml(text)}</prosody></voice>` +
    `</speak>`
  );
}

type Boundary = { text: string; offsetMs: number };
type Synthesis = { audio: Buffer; boundaries: Boundary[]; durationMs: number };

function synthesizeOnce(text: string, voice: string, lang: SpeechLang): Promise<Synthesis> {
  const config = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  config.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3;
  const synthesizer = new sdk.SpeechSynthesizer(config, null);
  const boundaries: Boundary[] = [];
  synthesizer.wordBoundary = (_sender, event) => {
    boundaries.push({ text: event.text, offsetMs: event.audioOffset / TICKS_PER_MS });
  };

  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      buildSsml(text, voice, lang),
      (result) => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve({
            audio: Buffer.from(result.audioData),
            boundaries,
            durationMs: result.audioDuration / TICKS_PER_MS,
          });
        } else {
          reject(new Error(result.errorDetails || "Synthesis was cancelled"));
        }
      },
      (error) => {
        synthesizer.close();
        reject(new Error(error));
      },
    );
  });
}

let lastRequestAt = 0;
let billedCharacters = 0;

async function synthesize(text: string, voice: string, lang: SpeechLang): Promise<Synthesis> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const wait = lastRequestAt + REQUEST_GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
    try {
      const result = await synthesizeOnce(text, voice, lang);
      billedCharacters += text.length;
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/429|too many/i.test(message) && attempt < 3) {
        console.log(`  rate limited, waiting ${RATE_LIMIT_WAIT_MS / 1000}s`);
        await sleep(RATE_LIMIT_WAIT_MS);
        continue;
      }
      throw new Error(`Azure TTS failed for ${voice}: ${message.slice(0, 200)}`);
    }
  }
  throw new Error(`Azure TTS gave up on ${voice}`);
}

const normalize = (word: string) => word.toLowerCase().replace(/[^\p{L}\p{N}\p{M}]/gu, "");
const LOOKAHEAD = 4;

/**
 * Maps Azure word boundaries onto the spoken text's word indices. One displayed word can receive
 * several boundaries (e.g. Bangla "21টি" arrives as "21" + "টি"); punctuation boundaries are skipped.
 */
function alignTimings(spoken: string, synthesis: Synthesis): WordTiming[] {
  const words = spokenWords(spoken).map(normalize);
  const starts: [number, number][] = [];
  let cursor = 0;
  let lastWasExact = false;

  for (const boundary of synthesis.boundaries) {
    const target = normalize(boundary.text);
    if (!target) continue;
    const end = Math.min(words.length, cursor + LOOKAHEAD + 1);
    const exactFrom: number = lastWasExact ? cursor + 1 : cursor;
    let found = -1;
    for (let k = exactFrom; k < end; k += 1) {
      if (words[k] === target) {
        found = k;
        lastWasExact = true;
        break;
      }
    }
    if (found === -1) {
      for (let k: number = cursor; k < end; k += 1) {
        const word = words[k] ?? "";
        if (word && (word.includes(target) || target.includes(word))) {
          found = k;
          lastWasExact = word === target;
          break;
        }
      }
    }
    if (found === -1) continue;
    if (starts.at(-1)?.[1] !== found) starts.push([Math.round(boundary.offsetMs), found]);
    cursor = found;
  }

  return starts.map(([start, index], i) => {
    const next = starts[i + 1];
    return [start, Math.round(next ? next[0] : synthesis.durationMs), index];
  });
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function readManifest(file: string): Promise<StepAudioManifest | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as StepAudioManifest;
  } catch {
    return null;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function slug(voice: string): string {
  return voice.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function generateSamples(step: ChatLessonStep): Promise<void> {
  const lines = (step.chunks[1]?.messages ?? []).slice(0, 2);
  if (lines.length === 0) throw new Error("No sample lines found in the step");

  const publicDir = path.join(ROOT, "public", "audio", "lab", "voice-samples");
  await mkdir(publicDir, { recursive: true });

  const voices = [];
  for (const voice of SAMPLE_VOICES) {
    console.log(`Voice ${voice.label}`);
    try {
      const clips: string[] = [];
      for (const [index, line] of lines.entries()) {
        const fileName = `${slug(voice.id)}-${index + 1}.mp3`;
        const file = path.join(publicDir, fileName);
        if (!(await exists(file))) {
          const result = await synthesize(toSpokenText(line[voice.lang], voice.lang), voice.id, voice.lang);
          await writeFile(file, result.audio);
        }
        clips.push(`/audio/lab/voice-samples/${fileName}`);
      }
      voices.push({ ...voice, clips });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  skipped: ${message}`);
      voices.push({ ...voice, error: message });
    }
  }

  await writeJson(path.join(ROOT, "src", "features", "chat-lesson", "content", "voiceSamples.json"), {
    lines,
    voices,
  });
}

async function generateClips(
  id: string,
  linesFor: (lang: SpeechLang) => string[],
  voices: Record<SpeechLang, string>,
): Promise<void> {
  console.log(`\nStep ${id}`);
  const publicDir = path.join(ROOT, "public", "audio", "chat-lesson", id);
  const manifestFile = path.join(ROOT, "src", "features", "chat-lesson", "content", "audio", `${id}.json`);
  await mkdir(publicDir, { recursive: true });

  const previous = await readManifest(manifestFile);
  const clips: Record<string, string> = {};
  const timings: Record<string, WordTiming[]> = {};
  let created = 0;

  for (const lang of ["en", "bn"] as const) {
    for (const line of linesFor(lang)) {
      const key = clipKey(line, lang);
      if (clips[key]) continue;
      const spoken = toSpokenText(line, lang);
      const hash = createHash("sha1").update(`${voices[lang]}|${spoken}`).digest("hex").slice(0, 16);
      const fileName = `${hash}.mp3`;
      const src = `/audio/chat-lesson/${id}/${fileName}`;
      const file = path.join(publicDir, fileName);
      const reusable =
        previous?.clips[key] === src && previous.timings?.[key] !== undefined && (await exists(file));

      if (reusable && previous?.timings?.[key]) {
        timings[key] = previous.timings[key];
      } else {
        console.log(`[${lang}] ${spoken.slice(0, 60)}`);
        const result = await synthesize(spoken, voices[lang], lang);
        await writeFile(file, result.audio);
        timings[key] = alignTimings(spoken, result);
        created += 1;
      }
      clips[key] = src;
    }
  }

  await writeJson(manifestFile, { stepId: id, voices, clips, timings } satisfies StepAudioManifest);
  console.log(`${created} new clips, ${Object.keys(clips).length} total`);
}

function generateStep(step: ChatLessonStep, voices: Record<SpeechLang, string>): Promise<void> {
  return generateClips(step.id, (lang) => stepSpokenLines(step, lang), voices);
}

function generatePlayground(playground: Playground, voices: Record<SpeechLang, string>): Promise<void> {
  return generateClips(playground.id, (lang) => playgroundSpokenLines(playground, lang), voices);
}

function argValue(name: string): string | undefined {
  return process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
}

async function main(): Promise<void> {
  if (process.argv.includes("--samples")) {
    await generateSamples(INTRO_STEP);
  } else {
    const en = argValue("en");
    const bn = argValue("bn");
    if (!en || !bn) throw new Error("Pass --samples, or both --en=<voice> and --bn=<voice>");
    const only = argValue("step");
    const steps = only ? STEPS.filter((s) => s.id === only) : STEPS;
    const playgrounds = only ? PLAYGROUNDS.filter((p) => p.id === only) : PLAYGROUNDS;
    if (steps.length === 0 && playgrounds.length === 0) throw new Error(`Unknown step: ${only}`);
    for (const step of steps) await generateStep(step, { en, bn });
    for (const playground of playgrounds) await generatePlayground(playground, { en, bn });
  }
  console.log(`Characters billed this run: ${billedCharacters}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
