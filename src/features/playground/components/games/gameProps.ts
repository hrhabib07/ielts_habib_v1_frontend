import type { LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { PlayStatus } from "@/src/features/playground/hooks/usePlaygroundSession";
import type { AnswerResult } from "@/src/features/playground/types";

export type GameProps<T> = {
  item: T;
  itemKey: string;
  lang: LessonLanguage;
  status: PlayStatus;
  attempt: number;
  /** Hands the player the function its Check button should run, or null while nothing is chosen. */
  onReady: (check: (() => void) | null) => void;
  onAnswer: (result: AnswerResult) => void;
  /** Two-step games report the step they are on, so the title shows only that step. */
  onStep?: (step: number) => void;
  /** Practice question: point the hand at what to tap next. */
  guide?: boolean;
};

export function isDone(status: PlayStatus): boolean {
  return status === "correct" || status === "revealed";
}
