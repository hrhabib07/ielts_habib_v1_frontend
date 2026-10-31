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
};

export function isDone(status: PlayStatus): boolean {
  return status === "correct" || status === "revealed";
}
