"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { NAMELESS_LEARNER, personalizeDeep } from "@/src/features/learner/lib/personalize";
import { LazyNotesSheet, preloadNotesSheet } from "@/src/features/notes/components/LazyNotesSheet";
import { NOTES_UI } from "@/src/features/notes/copy";
import { GameLoading } from "@/src/features/playground/components/GameLoading";
import { PlaygroundPlayer } from "@/src/features/playground/components/PlaygroundPlayer";
import { usePlaygroundEntry } from "@/src/features/playground/hooks/usePlaygroundEntry";
import { resumePoint } from "@/src/features/playground/lib/session";
import type { Playground } from "@/src/features/playground/types";
import { MISSION_BASE } from "@/src/features/learner/lib/routes";
import { getDecodedTokenClient } from "@/src/lib/auth";
import { guestRounds, saveGuestRound } from "./guestProgress";
import { DevResetButton } from "./components/DevResetButton";
import { GuestContinueCard, guestSaveExtras, WelcomeCard, type GuestPath } from "./components/GuestScreens";
import { GUEST_GAME_ID, GUEST_ROUND_LIMIT, guestPath, SHIPPED_GUEST_GAME as SHIPPED } from "./guestPath";

const RETURN_TO = MISSION_BASE;
const GUEST_LESSON_ID = SHIPPED?.afterStepId ?? null;

type Stage = "welcome" | "learn" | "game" | "saved";

const noSubscribe = () => () => undefined;
const readDone = () => JSON.stringify(guestRounds(GUEST_GAME_ID));
const NOTHING_DONE = "{}";

export function GuestPlay() {
  return (
    <>
      <GuestPlayScreen />
      <DevResetButton />
    </>
  );
}

function GuestPlayScreen() {
  const router = useRouter();
  const lang = useLessonLanguage();
  const loaded = usePlaygroundEntry(GUEST_GAME_ID);
  const doneJson = useSyncExternalStore(noSubscribe, readDone, () => NOTHING_DONE);
  const done = useMemo(() => JSON.parse(doneJson) as Record<string, { score: number; max: number }>, [doneJson]);
  const [chosen, setChosen] = useState<Stage | null>(null);

  const full = useMemo<Playground | null>(() => {
    const game = loaded?.entry?.playground ?? null;
    return game ? personalizeDeep(game, NAMELESS_LEARNER) : null;
  }, [loaded]);
  const source = full ?? SHIPPED;
  const playable = useMemo<Playground | null>(
    () => (full ? { ...full, rounds: full.rounds.slice(0, GUEST_ROUND_LIMIT) } : null),
    [full],
  );
  const lockedRounds = useMemo(
    () => (source?.rounds.slice(GUEST_ROUND_LIMIT) ?? []).map((round) => ({ id: round.id, title: round.title })),
    [source],
  );

  const freeRounds = source?.rounds.slice(0, GUEST_ROUND_LIMIT) ?? [];
  const doneCount = freeRounds.filter((round) => done[round.id]).length;
  const allFreeDone = freeRounds.length > 0 && doneCount >= freeRounds.length;
  // A returning guest who finished the free games continues from the save step. Only Dev reset clears it.
  const stage: Stage = chosen ?? (allFreeDone ? "saved" : "welcome");
  const resume = useMemo(() => (playable ? resumePoint(playable.rounds, done) : null), [playable, done]);

  const path = useMemo<GuestPath>(() => guestPath(doneCount, source), [source, doneCount]);

  useEffect(() => {
    if (getDecodedTokenClient()) router.replace(MISSION_BASE);
  }, [router]);

  useEffect(() => {
    if (stage === "welcome" && GUEST_LESSON_ID) preloadNotesSheet();
  }, [stage]);

  const handleRound = useCallback((roundId: string, score: number, max: number) => {
    saveGuestRound(GUEST_GAME_ID, roundId, score, max);
  }, []);

  const freeCount = playable?.rounds.length ?? 0;
  const roundExtras = useCallback(
    (roundsDone: number, next: () => void) =>
      roundsDone < freeCount
        ? guestSaveExtras({ lang, gamesDone: roundsDone, returnTo: RETURN_TO, onKeepPlaying: next })
        : null,
    [lang, freeCount],
  );
  const backToWelcome = useCallback(() => setChosen("welcome"), []);
  const toSaved = useCallback(() => setChosen("saved"), []);

  if (stage === "welcome") {
    return (
      <WelcomeCard
        lang={lang}
        path={path}
        onPlay={() => setChosen("game")}
        onLearn={GUEST_LESSON_ID ? () => setChosen("learn") : undefined}
      />
    );
  }

  if (stage === "learn" && GUEST_LESSON_ID) {
    return (
      <LazyNotesSheet
        stepId={GUEST_LESSON_ID}
        onClose={backToWelcome}
        action={{ label: NOTES_UI.playNow, onClick: () => setChosen("game") }}
      />
    );
  }

  if (stage === "saved") {
    return <GuestContinueCard lang={lang} path={{ ...path, done: freeRounds.length }} returnTo={RETURN_TO} />;
  }

  if (!loaded || !playable || !loaded.entry) return <GameLoading />;

  return (
    <PlaygroundPlayer
      playground={playable}
      audio={loaded.entry.audio}
      resume={resume}
      lockedRounds={lockedRounds}
      onRoundComplete={handleRound}
      roundExtras={roundExtras}
      onExit={backToWelcome}
      onContinue={toSaved}
      skipFinishScreen
      autoStart
    />
  );
}
