"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { SUBJECT_STEP } from "@/src/features/chat-lesson/content/subjectStep";
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
import { logConversionFunnelEvent } from "@/src/lib/api/conversionFunnel";
import { trackCustomOnce } from "@/src/lib/meta-pixel";
import {
  guestFunnel,
  guestRounds,
  markGuestNoteDone,
  markGuestQuizDone,
  saveGuestRound,
} from "./guestProgress";
import { DevResetButton } from "./components/DevResetButton";
import { GuestJourneyStrip } from "./components/GuestJourneyStrip";
import { GuestCheckQuiz, GuestValueCard, WelcomeCard, type GuestPath } from "./components/GuestScreens";
import { GUEST_GAME_ID, GUEST_NOTE_CHUNK_ID, GUEST_ROUND_LIMIT, guestPath, SHIPPED_GUEST_GAME as SHIPPED } from "./guestPath";

const RETURN_TO = MISSION_BASE;
const GUEST_LESSON_ID = SHIPPED?.afterStepId ?? SUBJECT_STEP.id;

type Stage = "welcome" | "note" | "quiz" | "game" | "value";

const noSubscribe = () => () => undefined;
const readDone = () => JSON.stringify(guestRounds(GUEST_GAME_ID));
const readFunnel = () => JSON.stringify(guestFunnel());
const NOTHING_DONE = "{}";
const EMPTY_FUNNEL = JSON.stringify({ noteDone: false, quizDone: false, updatedAt: 0 });

const CHECK_QUESTIONS = (SUBJECT_STEP.chunks.find((chunk) => chunk.id === GUEST_NOTE_CHUNK_ID)?.questions ?? [])
  .slice(0, 2)
  .map((question) => ({
    id: question.id,
    prompt: question.prompt,
    sentence: question.sentence,
    options: question.options.map((option) => ({ id: option.id, text: option.text })),
    correctOptionId: question.correctOptionId,
    hint: question.hint,
    englishOptions: question.englishOptions,
  }));

function defaultStage(allFreeDone: boolean, noteDone: boolean, quizDone: boolean): Stage {
  if (allFreeDone) return "value";
  if (quizDone) return "game";
  if (noteDone) return "quiz";
  return "welcome";
}

function funnelOnce(eventName: Parameters<typeof logConversionFunnelEvent>[0]["eventName"]): void {
  void logConversionFunnelEvent({ eventName });
}

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
  const funnelJson = useSyncExternalStore(noSubscribe, readFunnel, () => EMPTY_FUNNEL);
  const done = useMemo(() => JSON.parse(doneJson) as Record<string, { score: number; max: number }>, [doneJson]);
  const funnel = useMemo(
    () => JSON.parse(funnelJson) as { noteDone: boolean; quizDone: boolean },
    [funnelJson],
  );
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
  const stage: Stage = chosen ?? defaultStage(allFreeDone, funnel.noteDone, funnel.quizDone);
  const resume = useMemo(() => (playable ? resumePoint(playable.rounds, done) : null), [playable, done]);

  const path = useMemo<GuestPath>(() => guestPath(doneCount, source), [source, doneCount]);

  useEffect(() => {
    if (getDecodedTokenClient()) router.replace(MISSION_BASE);
  }, [router]);

  useEffect(() => {
    funnelOnce("play_start");
  }, []);

  useEffect(() => {
    if (stage === "welcome" || stage === "note") preloadNotesSheet();
  }, [stage]);

  useEffect(() => {
    if (stage !== "note") return;
    trackCustomOnce("start-trial", "StartTrial", { content_name: "Subject Note 1" });
    funnelOnce("note_opened");
  }, [stage]);

  useEffect(() => {
    if (stage !== "value") return;
    trackCustomOnce("view-signup-prompt", "ViewSignupPrompt", { content_name: "Guest Value Screen" });
    funnelOnce("signup_prompt_view");
  }, [stage]);

  const handleRound = useCallback((roundId: string, score: number, max: number) => {
    saveGuestRound(GUEST_GAME_ID, roundId, score, max);
    trackCustomOnce("first-game-complete", "FirstGameComplete", { content_name: "Subject Ask First" });
    funnelOnce("game_finished");
  }, []);

  const toWelcome = useCallback(() => setChosen("welcome"), []);
  const toNote = useCallback(() => setChosen("note"), []);
  const toQuiz = useCallback(() => {
    markGuestNoteDone();
    funnelOnce("note_finished");
    setChosen("quiz");
  }, []);
  const toGame = useCallback(() => {
    markGuestQuizDone();
    funnelOnce("quiz_finished");
    setChosen("game");
  }, []);
  const toValue = useCallback(() => setChosen("value"), []);

  if (stage === "welcome") {
    return (
      <WelcomeCard
        lang={lang}
        path={path}
        continuing={funnel.noteDone || funnel.quizDone || doneCount > 0}
        onStart={() => {
          if (allFreeDone) {
            toValue();
            return;
          }
          if (funnel.quizDone) {
            toGame();
            return;
          }
          if (funnel.noteDone) {
            setChosen("quiz");
            return;
          }
          toNote();
        }}
      />
    );
  }

  if (stage === "note" && GUEST_LESSON_ID) {
    return (
      <LazyNotesSheet
        stepId={GUEST_LESSON_ID}
        chunkIds={[GUEST_NOTE_CHUNK_ID]}
        includeIntro={false}
        chatReveal
        readTimeLabel={NOTES_UI.guestReadTime}
        onClose={toWelcome}
        action={{ label: NOTES_UI.checkNow, onClick: toQuiz }}
        journey={<GuestJourneyStrip lang={lang} current="note" />}
      />
    );
  }

  if (stage === "quiz") {
    return <GuestCheckQuiz lang={lang} questions={CHECK_QUESTIONS} onDone={toGame} />;
  }

  if (stage === "value") {
    return (
      <GuestValueCard
        lang={lang}
        path={path}
        returnTo={RETURN_TO}
        onSignupStart={() => funnelOnce("signup_started")}
      />
    );
  }

  if (!loaded || !playable || !loaded.entry) return <GameLoading />;

  return (
    <PlaygroundPlayer
      playground={playable}
      audio={loaded.entry.audio}
      resume={resume}
      lockedRounds={lockedRounds}
      onRoundComplete={handleRound}
      onExit={toWelcome}
      onContinue={toValue}
      skipFinishScreen
      autoStart
    />
  );
}
