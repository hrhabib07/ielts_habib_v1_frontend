import { questionSummary } from "@/src/features/admin/game-content/lib/questionSummary";
import { PLAYGROUNDS } from "@/src/features/playground/content";
import type { PlayItem } from "@/src/features/playground/types";

export type QuestionInfo = { game: string; round: string; sees: string; answer: string };

/** Names a tracked question from the app's built-in games (ids stay the same when admins edit text). */
export function lookupQuestion(gameKey: string, roundId: string, itemId: string): QuestionInfo {
  const playground = PLAYGROUNDS[gameKey]?.playground;
  const round = playground?.rounds.find((r) => r.id === roundId);
  const item = round?.items.find((i) => i.id === itemId);
  const summary = round && item ? questionSummary({ kind: round.kind, item } as PlayItem) : null;
  return {
    game: playground?.title.en ?? gameKey,
    round: round?.title.en ?? roundId,
    sees: summary?.sees ?? itemId,
    answer: summary?.answer ?? "",
  };
}

export function roundName(gameKey: string, roundId: string): { game: string; round: string } {
  const playground = PLAYGROUNDS[gameKey]?.playground;
  return {
    game: playground?.title.en ?? gameKey,
    round: playground?.rounds.find((r) => r.id === roundId)?.title.en ?? roundId,
  };
}
