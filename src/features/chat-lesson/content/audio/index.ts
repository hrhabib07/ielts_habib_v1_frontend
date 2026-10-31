import introAudio from "@/src/features/chat-lesson/content/audio/mission-1-step-1-intro.json";
import overviewAudio from "@/src/features/chat-lesson/content/audio/level-1-step-2-overview.json";
import subjectAudio from "@/src/features/chat-lesson/content/audio/level-1-step-3-subject.json";
import numberAudio from "@/src/features/chat-lesson/content/audio/level-1-step-4-number.json";
import personAudio from "@/src/features/chat-lesson/content/audio/level-1-step-5-person.json";
import numberPersonAudio from "@/src/features/chat-lesson/content/audio/level-1-step-6-number-person.json";
import verbAudio from "@/src/features/chat-lesson/content/audio/level-1-step-7-verb.json";
import objectAudio from "@/src/features/chat-lesson/content/audio/level-1-step-8-object.json";
import wordOrderAudio from "@/src/features/chat-lesson/content/audio/level-1-step-9-word-order.json";
import type { StepAudio } from "@/src/features/chat-lesson/hooks/useLessonSpeech";

function mergeAudio(...parts: StepAudio[]): StepAudio {
  return {
    clips: Object.assign({}, ...parts.map((part) => part.clips)),
    timings: Object.assign({}, ...parts.map((part) => part.timings ?? {})),
  };
}

/** Clips and word timings per step, written by `scripts/generate-lesson-audio.mts`. */
export const STEP_AUDIO: Readonly<Record<string, StepAudio>> = {
  /** Start Here also plays the Level 1 map part that came from the old Overview step. */
  [introAudio.stepId]: mergeAudio(introAudio as StepAudio, overviewAudio as StepAudio),
  [overviewAudio.stepId]: overviewAudio as StepAudio,
  [subjectAudio.stepId]: subjectAudio as StepAudio,
  [numberAudio.stepId]: numberAudio as StepAudio,
  [personAudio.stepId]: personAudio as StepAudio,
  [numberPersonAudio.stepId]: numberPersonAudio as StepAudio,
  [verbAudio.stepId]: verbAudio as StepAudio,
  [objectAudio.stepId]: objectAudio as StepAudio,
  [wordOrderAudio.stepId]: wordOrderAudio as StepAudio,
};
