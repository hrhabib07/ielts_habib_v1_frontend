"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChatLessonPlayer } from "@/src/features/chat-lesson/components/ChatLessonPlayer";
import { SUBJECT_STEP } from "@/src/features/chat-lesson/content/subjectStep";
import type { StepAudio } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import type { ChatLessonStep } from "@/src/features/chat-lesson/types";
import { NAMELESS_LEARNER, personalizeDeep } from "@/src/features/learner/lib/personalize";
import { MISSION_BASE } from "@/src/features/learner/lib/routes";
import { loadNoteAudio } from "@/src/features/notes/lib/noteAudio";
import { GameLoading } from "@/src/features/playground/components/GameLoading";
import { PlaygroundPlayer } from "@/src/features/playground/components/PlaygroundPlayer";
import { usePlaygroundEntry } from "@/src/features/playground/hooks/usePlaygroundEntry";
import { resumePoint } from "@/src/features/playground/lib/session";
import type { Playground } from "@/src/features/playground/types";
import { getDecodedTokenClient } from "@/src/lib/auth";
import { logConversionFunnelEvent } from "@/src/lib/api/conversionFunnel";
import { trackCustomOnce } from "@/src/lib/meta-pixel";
import {
  guestFunnel,
  guestRounds,
  markDemoSubjectContinue,
  markGuestQuizDone,
  saveGuestRound,
} from "./guestProgress";
import { DevResetButton } from "./components/DevResetButton";
import { GuestValueCard, WelcomeCard, type GuestPath } from "./components/GuestScreens";
import { GUEST_GAME_ID, GUEST_NOTE_CHUNK_ID, GUEST_ROUND_LIMIT, guestPath, SHIPPED_GUEST_GAME as SHIPPED } from "./guestPath";

const RETURN_TO = MISSION_BASE;
const GUEST_LESSON_ID = SHIPPED?.afterStepId ?? SUBJECT_STEP.id;
/** In-page handoff from the taste lesson into the free Subject round. */
const GUEST_PLAY_HANDOFF = "guest://subject-game";

type Stage = "welcome" | "note" | "game" | "value";

const noSubscribe = () => () => undefined;
const readDone = () => JSON.stringify(guestRounds(GUEST_GAME_ID));
const readFunnel = () => JSON.stringify(guestFunnel());
const NOTHING_DONE = "{}";
const EMPTY_FUNNEL = JSON.stringify({ noteDone: false, quizDone: false, updatedAt: 0 });

/** Guest game: first round only, capped at 3 items. */
const GUEST_ROUND_PICK = 3;

/** Same chat lesson UX as the real app: first Subject part + its in-chat questions. */
function guestTasteStep(): ChatLessonStep {
  const chunk = SUBJECT_STEP.chunks.find((item) => item.id === GUEST_NOTE_CHUNK_ID);
  if (!chunk) return { ...SUBJECT_STEP, chunks: SUBJECT_STEP.chunks.slice(0, 1) };
  return {
    ...SUBJECT_STEP,
    // Separate resume key so a guest taste does not collide with the full logged-in lesson.
    id: "guest-subject-taste",
    stepLabel: "Free taste",
    intro: undefined,
    chunks: [chunk],
  };
}

function defaultStage(allFreeDone: boolean, lessonDone: boolean): Stage {
  if (allFreeDone) return "value";
  if (lessonDone) return "game";
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
  const [lessonAudio, setLessonAudio] = useState<StepAudio | undefined>(undefined);

  const full = useMemo<Playground | null>(() => {
    const game = loaded?.entry?.playground ?? null;
    return game ? personalizeDeep(game, NAMELESS_LEARNER) : null;
  }, [loaded]);
  const source = full ?? SHIPPED;
  const playable = useMemo<Playground | null>(() => {
    if (!full) return null;
    const rounds = full.rounds.slice(0, GUEST_ROUND_LIMIT).map((round) => ({
      ...round,
      pick: Math.min(GUEST_ROUND_PICK, round.pick ?? GUEST_ROUND_PICK),
    }));
    return { ...full, rounds };
  }, [full]);
  const lockedRounds = useMemo(
    () => (source?.rounds.slice(GUEST_ROUND_LIMIT) ?? []).map((round) => ({ id: round.id, title: round.title })),
    [source],
  );

  const freeRounds = source?.rounds.slice(0, GUEST_ROUND_LIMIT) ?? [];
  const doneCount = freeRounds.filter((round) => done[round.id]).length;
  const allFreeDone = freeRounds.length > 0 && doneCount >= freeRounds.length;
  const lessonDone = funnel.noteDone && funnel.quizDone;
  const stage: Stage = chosen ?? defaultStage(allFreeDone, lessonDone);
  const resume = useMemo(() => (playable ? resumePoint(playable.rounds, done) : null), [playable, done]);

  const path = useMemo<GuestPath>(() => guestPath(doneCount, source), [source, doneCount]);
  const tasteStep = useMemo(() => personalizeDeep(guestTasteStep(), NAMELESS_LEARNER), []);

  useEffect(() => {
    if (getDecodedTokenClient()) router.replace(MISSION_BASE);
  }, [router]);

  useEffect(() => {
    funnelOnce("play_start");
  }, []);

  useEffect(() => {
    if (stage !== "note") return;
    let active = true;
    void loadNoteAudio([GUEST_LESSON_ID]).then((value) => {
      if (active) setLessonAudio(value);
    });
    return () => {
      active = false;
    };
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
  const finishTasteLesson = useCallback(() => {
    markGuestQuizDone();
    markDemoSubjectContinue();
    funnelOnce("note_finished");
    funnelOnce("quiz_finished");
    setChosen("game");
  }, []);
  const toValue = useCallback(() => setChosen("value"), []);

  if (stage === "welcome") {
    return (
      <WelcomeCard
        lang={lang}
        path={path}
        continuing={lessonDone || doneCount > 0}
        onStart={() => {
          if (allFreeDone) {
            toValue();
            return;
          }
          if (lessonDone) {
            setChosen("game");
            return;
          }
          toNote();
        }}
      />
    );
  }

  if (stage === "note") {
    return (
      <ChatLessonPlayer
        step={tasteStep}
        audio={lessonAudio}
        onBack={toWelcome}
        playAfterChunk={() => GUEST_PLAY_HANDOFF}
        onOpenPlayHref={() => finishTasteLesson()}
        onContinue={finishTasteLesson}
      />
    );
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
