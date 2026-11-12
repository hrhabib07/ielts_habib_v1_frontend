import type { StepAudio } from "@/src/features/chat-lesson/hooks/useLessonSpeech";

type AudioLoader = () => Promise<StepAudio>;

/** Loaded on demand: the recorded clips are large and only needed once the notes are open. */
const LOADERS: Readonly<Record<string, AudioLoader>> = {
  "level-1-step-3-subject": () =>
    import("@/src/features/chat-lesson/content/audio/level-1-step-3-subject.json").then((m) => m.default as StepAudio),
  "level-1-step-4-number": () =>
    import("@/src/features/chat-lesson/content/audio/level-1-step-4-number.json").then((m) => m.default as StepAudio),
  "level-1-step-5-person": () =>
    import("@/src/features/chat-lesson/content/audio/level-1-step-5-person.json").then((m) => m.default as StepAudio),
  "level-1-step-7-verb": () =>
    import("@/src/features/chat-lesson/content/audio/level-1-step-7-verb.json").then((m) => m.default as StepAudio),
  "level-1-step-8-object": () =>
    import("@/src/features/chat-lesson/content/audio/level-1-step-8-object.json").then((m) => m.default as StepAudio),
  "level-1-step-9-word-order": () =>
    import("@/src/features/chat-lesson/content/audio/level-1-step-9-word-order.json").then(
      (m) => m.default as StepAudio,
    ),
};

/** Clips for the given lessons merged into one; lessons without recordings are skipped. */
export async function loadNoteAudio(stepIds: readonly string[]): Promise<StepAudio> {
  const parts = await Promise.all(
    stepIds.map((id) => LOADERS[id]?.().catch((): StepAudio => ({ clips: {} })) ?? Promise.resolve<StepAudio>({ clips: {} })),
  );
  return {
    clips: Object.assign({}, ...parts.map((part) => part.clips)),
    timings: Object.assign({}, ...parts.map((part) => part.timings ?? {})),
  };
}
