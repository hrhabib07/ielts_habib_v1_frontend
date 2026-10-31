import type { ChatLessonState } from "@/src/features/chat-lesson/lib/chatLessonReducer";
import type { ChatLessonStep } from "@/src/features/chat-lesson/types";
import { getDecodedTokenClient } from "@/src/lib/auth";

const PREFIX = "gamlish-lesson-v1";
const MAX_AGE_MS = 21 * 24 * 60 * 60 * 1000;

type Saved = { signature: string; savedAt: number; state: ChatLessonState };

/** Changes whenever parts, messages or questions are added or removed, so old positions are dropped. */
function signatureOf(step: ChatLessonStep): string {
  const shape = step.chunks
    .map((chunk) => `${chunk.id}:${chunk.messages.length}:${chunk.questions.map((q) => q.id).join(",")}`)
    .join("|");
  let hash = 5381;
  for (let i = 0; i < shape.length; i += 1) hash = ((hash << 5) + hash + shape.charCodeAt(i)) | 0;
  return `${step.chunks.length}-${(hash >>> 0).toString(36)}`;
}

function keyFor(stepId: string): string {
  return `${PREFIX}:${getDecodedTokenClient()?.userId ?? "guest"}:${stepId}`;
}

/** A mid-answer check cannot be resumed; the learner sees the same question with their choice kept. */
function settle(state: ChatLessonState): ChatLessonState {
  const { phase } = state;
  if (phase.name !== "evaluating") return state;
  return {
    ...state,
    entries: state.entries.slice(0, -1),
    phase: { name: "answering", draft: phase.draft, selectedOptionId: phase.selectedOptionId },
  };
}

export function loadLessonPosition(step: ChatLessonStep): ChatLessonState | null {
  try {
    const raw = window.localStorage.getItem(keyFor(step.id));
    if (!raw) return null;
    const saved = JSON.parse(raw) as Saved;
    const usable =
      saved.signature === signatureOf(step) &&
      Date.now() - saved.savedAt < MAX_AGE_MS &&
      saved.state.startedAt !== null &&
      saved.state.phase.name !== "complete" &&
      saved.state.chunkIndex < step.chunks.length;
    return usable ? settle(saved.state) : null;
  } catch {
    return null;
  }
}

export function saveLessonPosition(step: ChatLessonStep, state: ChatLessonState): void {
  try {
    const key = keyFor(step.id);
    if (state.startedAt === null) return;
    if (state.phase.name === "complete") {
      window.localStorage.removeItem(key);
      return;
    }
    const saved: Saved = { signature: signatureOf(step), savedAt: Date.now(), state };
    window.localStorage.setItem(key, JSON.stringify(saved));
  } catch {
    // Storage blocked or full: the lesson still works, it just cannot resume.
  }
}
