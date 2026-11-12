import type { StepAudio } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import { clipKey, toSpokenText } from "@/src/features/chat-lesson/lib/speechText";
import { playgroundSpokenLines } from "@/src/features/playground/lib/speech";
import type { Playground } from "@/src/features/playground/types";
import { voiceClipSrc, type SpokenLine } from "@/src/lib/api/gameContent";

/**
 * Every line this game speaks that has no recorded clip shipped with the app.
 * The server generates each of these once and stores it; lines already shipped are never re-billed.
 */
export function gameVoiceLines(playground: Playground, shipped: StepAudio): SpokenLine[] {
  return (["en", "bn"] as const).flatMap((lang) =>
    playgroundSpokenLines(playground, lang)
      .map((line) => ({ key: clipKey(line, lang), lang, spoken: toSpokenText(line, lang) }))
      .filter((line) => line.spoken && !shipped.clips[line.key]),
  );
}

/** Shipped clips first, then clips recorded on the server (an edited line gets a new key, so no clash). */
export function mergeGameAudio(shipped: StepAudio, clipFiles: Readonly<Record<string, string>>): StepAudio {
  const recorded = Object.fromEntries(Object.entries(clipFiles).map(([key, fileKey]) => [key, voiceClipSrc(fileKey)]));
  return { clips: { ...shipped.clips, ...recorded }, timings: shipped.timings };
}
