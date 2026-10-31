import type { StepSummary } from "@/src/features/chat-lesson/components/LevelMap";
import { STEP_AUDIO } from "@/src/features/chat-lesson/content/audio";
import { LESSON_STEPS, stepHref } from "@/src/features/chat-lesson/content/level1";
import type { StepAudio } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import { builtInLevel, withPlaygrounds } from "@/src/features/chat-lesson/lib/levelData";
import type { ChatLessonLevel, ChatLessonStep } from "@/src/features/chat-lesson/types";
import { getServerApiBaseUrl } from "@/src/lib/api-base-url";

const REVALIDATE_SECONDS = 60;
const TIMEOUT_MS = 2500;

/** Where the content came from: the v2 database, or the copy bundled with the app. */
export type ContentSource = "database" | "built-in";

async function fetchApi<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${getServerApiBaseUrl()}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: T };
    return body.data ?? null;
  } catch {
    return null;
  }
}

export async function loadLevel(levelKey: string): Promise<{
  level: ChatLessonLevel;
  summaries: Record<string, StepSummary>;
  source: ContentSource;
}> {
  const data = await fetchApi<{
    level: ChatLessonLevel;
    steps: { id: string; stepLabel: string; parts: number; questions: number }[];
  }>(`/chat-lessons/levels/${encodeURIComponent(levelKey)}`);

  if (!data) return { ...builtInLevel(stepHref), source: "built-in" };

  const summaries = Object.fromEntries(
    data.steps.map((step) => [
      step.id,
      { href: stepHref(step.id), stepLabel: step.stepLabel, parts: step.parts, questions: step.questions },
    ]),
  );
  return { ...withPlaygrounds(data.level, summaries, stepHref), source: "database" };
}

export async function loadStep(stepKey: string): Promise<{
  step: ChatLessonStep;
  audio?: StepAudio;
  source: ContentSource;
} | null> {
  const data = await fetchApi<{ step: ChatLessonStep; audio: StepAudio }>(
    `/chat-lessons/steps/${encodeURIComponent(stepKey)}`,
  );
  if (data) return { step: data.step, audio: data.audio, source: "database" };

  const step = LESSON_STEPS[stepKey];
  return step ? { step, audio: STEP_AUDIO[step.id], source: "built-in" } : null;
}
