/**
 * Exports the authored Level 1 chat lessons and their generated audio into one seed file for the
 * backend (English Fundamentals v2). The backend seed script then stores it in MongoDB.
 *
 *   node --no-warnings scripts/export-chat-lessons.mts
 */
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { ALL_LEVEL_1_STEPS, LEVEL_1 } from "../src/features/chat-lesson/content/level1.ts";
import { stepClipKeys } from "../src/features/chat-lesson/lib/speechText.ts";
import type { ChatLessonStep } from "../src/features/chat-lesson/types.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const AUDIO_DIR = path.join(ROOT, "src", "features", "chat-lesson", "content", "audio");
const OUTPUT = path.resolve(ROOT, "..", "backend", "src", "modules", "chatLesson", "seed", "english-fundamentals-v2.json");

type Manifest = {
  stepId: string;
  voices: { en: string; bn: string };
  clips: Record<string, string>;
  timings?: Record<string, number[][]>;
};

async function readManifests(): Promise<Map<string, Manifest>> {
  const files = (await readdir(AUDIO_DIR)).filter((file) => file.endsWith(".json"));
  const manifests = new Map<string, Manifest>();
  for (const file of files) {
    const manifest = JSON.parse(await readFile(path.join(AUDIO_DIR, file), "utf8")) as Manifest;
    manifests.set(manifest.stepId, manifest);
  }
  return manifests;
}

function toDbStep(step: ChatLessonStep, voices: { en: string; bn: string }) {
  return {
    stepKey: step.id,
    levelKey: LEVEL_1.id,
    status: step.status ?? "published",
    missionLabel: step.missionLabel,
    stepLabel: step.stepLabel,
    title: step.title,
    ...(step.teacherNote ? { teacherNote: step.teacherNote } : {}),
    voices,
    audioKeys: stepClipKeys(step),
    chunks: step.chunks.map((chunk) => ({
      key: chunk.id,
      title: chunk.title,
      messages: chunk.messages,
      questions: chunk.questions.map(({ id, options, correctOptionId, ...question }) => ({
        ...question,
        key: id,
        options: options.map(({ id: optionId, ...option }) => ({ ...option, key: optionId })),
        correctOptionKey: correctOptionId,
      })),
    })),
  };
}

async function main(): Promise<void> {
  const manifests = await readManifests();
  const defaultVoices = [...manifests.values()][0]?.voices;
  if (!defaultVoices) throw new Error("No audio manifests found. Run generate-lesson-audio first.");

  const clips = new Map<string, { clipKey: string; lang: "en" | "bn"; voice: string; src: string; timings: number[][] }>();
  for (const manifest of manifests.values()) {
    for (const [clipKey, src] of Object.entries(manifest.clips)) {
      const lang = clipKey.startsWith("bn|") ? "bn" : "en";
      const voice = manifest.voices[lang];
      clips.set(`${voice}::${clipKey}`, { clipKey, lang, voice, src, timings: manifest.timings?.[clipKey] ?? [] });
    }
  }

  const steps = ALL_LEVEL_1_STEPS.map((step) => {
    const voices = manifests.get(step.id)?.voices ?? defaultVoices;
    const dbStep = toDbStep(step, voices);
    const missing = dbStep.audioKeys.filter((key) => !clips.has(`${voices[key.startsWith("bn|") ? "bn" : "en"]}::${key}`));
    if (missing.length) console.log(`  ${step.id}: ${missing.length} lines have no audio yet`);
    return dbStep;
  });

  const seed = {
    course: { key: "english-fundamentals", version: 2 },
    level: {
      levelKey: LEVEL_1.id,
      label: LEVEL_1.label,
      title: LEVEL_1.title,
      status: "published",
      nodes: LEVEL_1.nodes.map((node) => ({
        key: node.id,
        icon: node.icon,
        title: node.title,
        ...(node.stepId ? { stepKey: node.stepId } : {}),
      })),
    },
    steps,
    clips: [...clips.values()],
  };

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(seed)}\n`, "utf8");
  console.log(`Exported ${steps.length} steps and ${seed.clips.length} clips to ${path.relative(ROOT, OUTPUT)}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
