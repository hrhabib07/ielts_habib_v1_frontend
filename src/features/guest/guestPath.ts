import { useSyncExternalStore } from "react";
import { LESSON_STEPS, LEVEL_1 } from "@/src/features/chat-lesson/content/level1";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { ALL_PLAYGROUNDS, PLAYGROUNDS } from "@/src/features/playground/content";
import type { Playground } from "@/src/features/playground/types";
import type { GuestPath } from "./components/GuestScreens";
import { guestRounds } from "./guestProgress";

export const GUEST_GAME_ID = "level-1-playground-subject";
/** Guests play the first rounds; the typing round about their own life needs an account. */
export const GUEST_ROUND_LIMIT = 3;
export const SHIPPED_GUEST_GAME: Playground | null = PLAYGROUNDS[GUEST_GAME_ID]?.playground ?? null;

const FALLBACK_TOPIC: Bilingual = { en: "Subject", bn: "Subject" };

/** Level 1's topics in map order, named by their playground (Subject, Number, Person, Verb, Object, Word Order). */
export const LEVEL_TOPICS: readonly Bilingual[] = LEVEL_1.nodes.flatMap((node) => {
  if (!node.stepId || node.icon === "welcome" || node.icon === "playground" || !LESSON_STEPS[node.stepId]) return [];
  return [ALL_PLAYGROUNDS.find((game) => game.afterStepId === node.stepId)?.topic ?? node.title];
});

const noSubscribe = () => () => undefined;
const freeWins = () => {
  const done = guestRounds(GUEST_GAME_ID);
  return (SHIPPED_GUEST_GAME?.rounds.slice(0, GUEST_ROUND_LIMIT) ?? []).filter((round) => done[round.id]).length;
};

/** Free games this browser has won as a guest (0 on the server and for new visitors). */
export function useGuestWins(): number {
  return useSyncExternalStore(noSubscribe, freeWins, () => 0);
}

/** The guest's view of Level 1 for `game` (the loaded one, or the shipped Subject playground) with `done` games won. */
export function guestPath(done: number, game: Playground | null = SHIPPED_GUEST_GAME): GuestPath {
  const games = game?.rounds.length ?? GUEST_ROUND_LIMIT;
  return {
    levelTitle: LEVEL_1.title,
    topics: LEVEL_TOPICS,
    topic: game?.topic ?? FALLBACK_TOPIC,
    games,
    freeGames: Math.min(GUEST_ROUND_LIMIT, games),
    done,
    lockedTitle: game?.rounds[GUEST_ROUND_LIMIT]?.title ?? null,
    nextTopic: LEVEL_TOPICS[1] ?? { en: "Number", bn: "Number" },
  };
}
