"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { GamlishProfileCard, LessonFeedbackSheet } from "@/src/features/chat-lesson/components/LessonFeedbackSheets";
import { LessonFlagsProvider, useLessonFlags } from "@/src/features/chat-lesson/hooks/useLessonFlags";
import type { LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { RotateCcw } from "lucide-react";
import { SpeakButton } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import {
  LessonSpeechProvider,
  useLessonSpeech,
  type StepAudio,
} from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import { AskFirstGame } from "@/src/features/playground/components/games/AskFirstGame";
import { BanglaTrapGame } from "@/src/features/playground/components/games/BanglaTrapGame";
import { BazarListGame } from "@/src/features/playground/components/games/BazarListGame";
import { CountBuildGame } from "@/src/features/playground/components/games/CountBuildGame";
import { PluralMachineGame } from "@/src/features/playground/components/games/PluralMachineGame";
import { HiddenYouGame } from "@/src/features/playground/components/games/HiddenYouGame";
import { StretchGame } from "@/src/features/playground/components/games/StretchGame";
import { TalkGame } from "@/src/features/playground/components/games/TalkGame";
import {
  BuildOrderGame,
  CodeLockGame,
  OddOneOutGame,
  SixBoxGame,
} from "@/src/features/playground/components/games/mission1/DecodeGames";
import {
  CompleteOrNotGame,
  MirrorWordsGame,
  ObjectPlaceGame,
  PassBallGame,
} from "@/src/features/playground/components/games/mission1/ObjectGames";
import {
  BanglaFlipGame,
  GrowSentenceGame,
  MyDiaryGame,
  SentenceDoctorGame,
} from "@/src/features/playground/components/games/mission1/OrderGames";
import {
  GroupChatGame,
  NameSwapGame,
  RespectTrapGame,
  TeamUpGame,
} from "@/src/features/playground/components/games/mission1/PersonGames";
import {
  ActionCameraGame,
  BinExtraGame,
  FixBridgeGame,
  VerbSpotlightGame,
} from "@/src/features/playground/components/games/mission1/VerbGames";
import {
  PlaygroundFooter,
  PlaygroundHeader,
} from "@/src/features/playground/components/PlaygroundChrome";
import {
  PlaygroundComplete,
  PlaygroundStart,
} from "@/src/features/playground/components/PlaygroundScreens";
import { GamlishMascot, type MascotMood } from "@/src/features/playground/components/GamlishMascot";
import { GameStage } from "@/src/features/playground/components/GameStage";
import { RoundIntro, type PlanStep } from "@/src/features/playground/components/RoundIntro";
import { RoundWinCard, type RoundWinExtras } from "@/src/features/playground/components/RoundWinCard";
import { useAutoVoice } from "@/src/features/playground/hooks/useAutoVoice";
import { NudgeProvider } from "@/src/features/playground/hooks/useNudge";
import {
  finishedRoundSummary,
  roundScore,
  usePlaygroundSession,
  type Feedback,
  type SessionStart,
} from "@/src/features/playground/hooks/usePlaygroundSession";
import { useMissionStore } from "@/src/features/chat-lesson/hooks/useMissionStore";
import { LazyNotesSheet, preloadNotesSheet } from "@/src/features/notes/components/LazyNotesSheet";
import { NOTES_UI } from "@/src/features/notes/copy";
import { PG_UI } from "@/src/features/playground/lib/copy";
import {
  buildSession,
  estimatedMinutes,
} from "@/src/features/playground/lib/session";
import { afterLine, startLine } from "@/src/features/playground/lib/speech";
import type { AnswerEvent } from "@/src/features/playground/lib/answerTracker";
import type {
  AnswerResult,
  Playground,
  SessionItem,
} from "@/src/features/playground/types";
import {
  playCelebrateSfx,
  playCorrectEvalSfx,
  playThinkAgainEvalSfx,
  playUiClickSfx,
  playWrongEvalSfx,
  primeEvalSfx,
} from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

const NO_TEXT: Bilingual = { en: "", bn: "" };

const SOFT_EASE = [0.22, 1, 0.36, 1] as const;
/** Next question: the old card settles away, the new one rises into place, its parts a beat apart. */
const QUESTION_CARD: Variants = {
  enter: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.2, staggerChildren: 0.06 } },
  leave: { opacity: 0, scale: 0.98, y: -6, transition: { duration: 0.18, ease: "easeIn" } },
};
const QUESTION_PART: Variants = {
  enter: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.35, ease: SOFT_EASE } },
};
const QUESTION_FADE: Variants = {
  enter: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.2 } },
  leave: { opacity: 0, transition: { duration: 0.12 } },
};
/** Wrong tries in a row before the answer panel offers the topic notes. */
const STUCK_AFTER_MISSES = 3;
/** After the next question has risen into place. */
const AUTO_VOICE_DELAY_MS = 650;
const AFTER_VOICE_DELAY_MS = 750;
const PRELOAD_AHEAD = 2;

type Props = {
  playground: Playground;
  /** Level map. After finishing, Continue returns here with `?completed=<playground id>`. */
  backHref?: string;
  onComplete?: (score: number, max: number) => void;
  /** Every checked answer (first-try correct, wrong try, revealed), for the learner's weakness tracker. */
  onAnswerEvent?: (event: AnswerEvent) => void;
  /** Extra note and buttons on the win card between games (e.g. the guest's "save your progress"). */
  roundExtras?: (roundsDone: number, next: () => void) => RoundWinExtras | null;
  /** Replaces the finish screen's Continue (the default returns to `backHref`). */
  onContinue?: (passed: boolean) => void;
  /** Skip the start screen (the page before already had a Play button). */
  autoStart?: boolean;
  /** Games finished earlier: play starts at `from`, and their score counts toward the pass mark. */
  resume?: SessionStart | null;
  /** Games of this topic that need an account: shown locked in the progress bar and the game path. */
  lockedRounds?: readonly { id: string; title: Bilingual }[];
  /** Each finished game's first-try score, e.g. to keep a guest's games before sign-up. */
  onRoundComplete?: (roundId: string, score: number, max: number) => void;
  /** Close button where leaving is a screen change rather than `backHref`. */
  onExit?: () => void;
  /** Go straight to `onContinue` instead of the finish screen (the guest's games end on their own card). */
  skipFinishScreen?: boolean;
};

const LEVEL_PATTERN = /level-(\d+)/;

/** Session keys are `round:item`, or `review:round:item` for the second-chance round. */
function parseItemKey(key: string): { roundId: string; itemId: string } {
  const plain = key.startsWith("review:") ? key.slice("review:".length) : key;
  const split = plain.indexOf(":");
  return { roundId: plain.slice(0, split), itemId: plain.slice(split + 1) };
}

/** Only recorded (Azure) clips play here: lines without a clip stay silent rather than use a robotic voice. */
export function PlaygroundPlayer({
  audio,
  ...props
}: Props & { audio?: StepAudio }) {
  return (
    <LessonSpeechProvider audio={audio} clipsOnly>
      <LessonFlagsProvider>
        <PlaygroundScreen {...props} />
      </LessonFlagsProvider>
    </LessonSpeechProvider>
  );
}

/** The same Gamlish help card as the lessons: learners can send a note or report a problem. */
function GameHelpSheets({ playground, lang }: { playground: Playground; lang: LessonLanguage }) {
  const flags = useLessonFlags();
  return (
    <AnimatePresence>
      {flags?.sheet === "profile" ? <GamlishProfileCard key="profile" lang={lang} allowFlagging={false} /> : null}
      {flags?.sheet === "feedback" ? (
        <LessonFeedbackSheet key="feedback" lang={lang} stepId={playground.id} stepTitle={playground.title.en} level="Level 1" />
      ) : null}
    </AnimatePresence>
  );
}

function PlaygroundScreen({
  playground,
  backHref,
  onComplete,
  onAnswerEvent,
  roundExtras,
  onContinue,
  autoStart,
  resume = null,
  lockedRounds,
  onRoundComplete,
  onExit,
  skipFinishScreen = false,
}: Props) {
  const [celebratedFor, setCelebratedFor] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const lang = useLessonLanguage();
  const autoVoice = useAutoVoice();
  const reduceMotion = useReducedMotion();
  const { speak, stop, unlock, preload } = useLessonSpeech();
  const flags = useLessonFlags();
  const { state, item, actions, score, maxScore } = usePlaygroundSession();
  const checkRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const { isPaywalled } = useMissionStore();
  const notesStepId = playground.afterStepId && !isPaywalled(playground.afterStepId) ? playground.afterStepId : null;
  const [notesFrom, setNotesFrom] = useState<"game" | "results" | null>(null);

  const [missTrack, setMissTrack] = useState<{ feedback: Feedback | null; misses: number }>({ feedback: null, misses: 0 });
  if (state.feedback !== missTrack.feedback) {
    const misses = !state.feedback ? missTrack.misses : state.feedback.tone === "correct" ? 0 : missTrack.misses + 1;
    setMissTrack({ feedback: state.feedback, misses });
  }
  const stuck = notesStepId !== null && missTrack.misses >= STUCK_AFTER_MISSES;

  const round = state.rounds[state.round] ?? null;
  const playing = state.screen === "play" && item !== null;
  const itemKey = playing ? item.key : null;
  const finished = state.status === "correct" || state.status === "revealed";
  const opening = playing ? startLine(item) : null;
  const closing = playing ? afterLine(item) : null;
  const feedbackTone = state.feedback?.tone ?? null;

  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  useEffect(() => {
    if (!itemKey || !opening || !autoVoice) return;
    const timer = window.setTimeout(
      () => speakRef.current(`${itemKey}:s:auto`, opening, "en"),
      AUTO_VOICE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [itemKey, opening, autoVoice]);

  useEffect(() => {
    if (!finished || !itemKey || !closing || !autoVoice) return;
    const timer = window.setTimeout(
      () => speakRef.current(`${itemKey}:s:after`, closing, "en"),
      AFTER_VOICE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [finished, itemKey, closing, autoVoice]);

  useEffect(() => {
    if (!feedbackTone) return;
    if (feedbackTone === "correct") void playCorrectEvalSfx();
    else if (feedbackTone === "retry") void playThinkAgainEvalSfx();
    else void playWrongEvalSfx();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(feedbackTone === "correct" ? 18 : [28, 60, 28]);
    }
  }, [feedbackTone]);

  // The feedback panel is taller than the Check bar: keep the answered question in view above it.
  useEffect(() => {
    if (!feedbackTone) return;
    const frame = window.requestAnimationFrame(() => {
      const main = mainRef.current;
      if (main) main.scrollTo({ top: main.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [feedbackTone, reduceMotion]);

  const [stepFor, setStepFor] = useState<{ key: string | null; step: number }>({ key: null, step: 0 });
  const step = stepFor.key === itemKey ? stepFor.step : 0;
  const setStep = useCallback((next: number) => setStepFor({ key: itemKey, step: next }), [itemKey]);
  const heading: Bilingual = item?.steps?.[step] ?? item?.instruction ?? NO_TEXT;
  const scoredInRound = round ? round.items.filter((i) => !i.practice).length : 0;
  const scoredIndex = round ? round.items.slice(0, state.index + 1).filter((i) => !i.practice).length : 0;

  const upcomingLines = useMemo(
    () =>
      (round?.items.slice(state.index + 1, state.index + 1 + PRELOAD_AHEAD) ?? []).flatMap((next) =>
        [next.instruction.en, startLine(next), afterLine(next)]
          .filter((text): text is string => Boolean(text))
          .map((text) => ({ text, lang: "en" as const })),
      ),
    [round, state.index],
  );
  useEffect(() => {
    if (upcomingLines.length) preload(upcomingLines);
  }, [upcomingLines, preload]);

  const itemShownAt = useRef(0);
  useEffect(() => {
    itemShownAt.current = Date.now();
  }, [itemKey]);

  const onAnswerEventRef = useRef(onAnswerEvent);
  useEffect(() => {
    onAnswerEventRef.current = onAnswerEvent;
  }, [onAnswerEvent]);

  const feedbackRef = useRef(state.feedback);
  useEffect(() => {
    const previous = feedbackRef.current;
    feedbackRef.current = state.feedback;
    if (!state.feedback || state.feedback === previous || !item) return;
    const { tone } = state.feedback;
    const attempt =
      tone === "correct" ? state.mistakes + 1 + (state.mistakes === 0 && state.slips > 0 ? 1 : 0) : state.mistakes;
    onAnswerEventRef.current?.({
      gameKey: playground.id,
      ...parseItemKey(item.key),
      outcome: tone === "retry" ? "wrong" : tone,
      attempt: Math.min(Math.max(attempt, 1), 5),
      ms: Math.min(Date.now() - itemShownAt.current, 30 * 60 * 1000),
      review: item.review || item.practice === true,
      at: Date.now(),
    });
  }, [state.feedback, state.mistakes, state.slips, item, playground.id]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const isComplete = state.screen === "complete";
  const passed = maxScore > 0 && score / maxScore >= playground.passMark;
  useEffect(() => {
    if (!isComplete) return;
    if (passed) {
      onCompleteRef.current?.(score, maxScore);
      void playCelebrateSfx();
    } else {
      void playThinkAgainEvalSfx();
    }
  }, [isComplete, passed, score, maxScore]);

  const onReady = useCallback((check: (() => void) | null) => {
    checkRef.current = check;
    setReady(check !== null);
  }, []);

  const clearReady = useCallback(() => {
    checkRef.current = null;
    setReady(false);
  }, []);

  const handleAnswer = useCallback(
    (result: AnswerResult) => actions.answer(result),
    [actions],
  );

  const reportedRound = useRef(-1);
  const begin = (from: SessionStart | null) => {
    unlock();
    void primeEvalSfx();
    clearReady();
    setCelebratedFor(0);
    reportedRound.current = -1;
    actions.start(buildSession(playground), from);
  };
  /** The start screen continues where the learner stopped; a replay after the finish starts from Game 1. */
  const start = () => begin(resume);
  const replay = () => begin(null);

  const autoStarted = useRef(false);
  useEffect(() => {
    if (!autoStart || autoStarted.current) return;
    autoStarted.current = true;
    actions.start(buildSession(playground), resume);
  }, [autoStart, actions, playground, resume]);

  const onRoundCompleteRef = useRef(onRoundComplete);
  useEffect(() => {
    onRoundCompleteRef.current = onRoundComplete;
  }, [onRoundComplete]);

  useEffect(() => {
    const lastDone = state.screen === "complete" ? state.round : state.screen === "intro" ? state.round - 1 : -1;
    for (let i = Math.max(reportedRound.current + 1, state.firstRound); i <= lastDone; i += 1) {
      const done = state.rounds[i];
      if (!done || done.kind === "review") continue;
      const { score: roundPoints, max: roundMax } = roundScore(state, i);
      onRoundCompleteRef.current?.(done.id, roundPoints, roundMax);
    }
    reportedRound.current = Math.max(reportedRound.current, lastDone);
  }, [state]);

  const beginRound = () => {
    unlock();
    void playUiClickSfx();
    clearReady();
    actions.beginRound();
  };

  const retry = useCallback(() => {
    clearReady();
    actions.retry();
  }, [actions, clearReady]);

  const next = useCallback(() => {
    stop();
    clearReady();
    actions.next();
  }, [actions, clearReady, stop]);

  const check = useCallback(() => checkRef.current?.(), []);

  const openNotes = (from: "game" | "results") => {
    stop();
    void playUiClickSfx();
    setMissTrack((track) => ({ ...track, misses: 0 }));
    setNotesFrom(from);
  };
  const closeNotes = useCallback(() => setNotesFrom(null), []);

  useEffect(() => {
    if (notesStepId && (stuck || (isComplete && !passed))) preloadNotesSheet();
  }, [notesStepId, stuck, isComplete, passed]);

  useEffect(() => {
    if (notesFrom) return;
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key !== "Enter" ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (
        event.target instanceof HTMLButtonElement ||
        event.target instanceof HTMLAnchorElement
      )
        return;
      if (!playing) return;
      if (state.status === "answering" && ready) {
        event.preventDefault();
        check();
      } else if (state.status === "retry") {
        event.preventDefault();
        retry();
      } else if (finished) {
        event.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notesFrom, playing, state.status, ready, finished, check, retry, next]);

  const finish = () => {
    if (onContinue) return onContinue(passed);
    if (!backHref) return replay();
    router.push(passed ? `${backHref}?completed=${encodeURIComponent(playground.id)}` : backHref);
  };

  const onContinueRef = useRef(onContinue);
  useEffect(() => {
    onContinueRef.current = onContinue;
  }, [onContinue]);
  useEffect(() => {
    if (isComplete && skipFinishScreen) onContinueRef.current?.(passed);
  }, [isComplete, skipFinishScreen, passed]);

  const roundSummary = state.round > celebratedFor ? finishedRoundSummary(state) : null;
  const closeWinCard = () => {
    void playUiClickSfx();
    setCelebratedFor(state.round);
  };
  const mascotMood: MascotMood =
    feedbackTone === "correct" ? "happy" : feedbackTone === "retry" || feedbackTone === "revealed" ? "oops" : "idle";

  const praise =
    PG_UI.praises[(state.round * 7 + state.index) % PG_UI.praises.length] ??
    PG_UI.praises[0];
  const games = state.rounds.filter((r) => r.kind !== "review");
  const lockedCount = lockedRounds?.length ?? 0;
  const scoredRounds = games.length + lockedCount;
  const level = Number(LEVEL_PATTERN.exec(playground.id)?.[1] ?? 1);
  const plan: PlanStep[] = [
    ...games.map((game, i): PlanStep => ({
      id: game.id,
      title: game.title,
      status: i < state.round ? "done" : i === state.round ? "now" : "next",
    })),
    ...(lockedRounds ?? []).map((game): PlanStep => ({ id: game.id, title: game.title, status: "locked" })),
  ];
  const openGameNotes = notesStepId ? () => openNotes("game") : undefined;

  const renderGame = (current: SessionItem) => {
    const common = {
      itemKey: current.key,
      lang,
      status: state.status,
      attempt: state.attempt,
      onReady,
      onAnswer: handleAnswer,
      onStep: setStep,
      guide: current.practice === true,
    };
    switch (current.kind) {
      case "ask-first":
        return (
          <AskFirstGame
            key={current.key}
            item={current.item}
            {...common}
            onMistake={actions.mistake}
          />
        );
      case "stretch":
        return (
          <StretchGame key={current.key} item={current.item} {...common} />
        );
      case "hidden-you":
        return (
          <HiddenYouGame key={current.key} item={current.item} {...common} />
        );
      case "talk":
        return (
          <TalkGame
            key={current.key}
            item={current.item}
            {...common}
            onChecking={actions.checking}
            playgroundId={playground.id}
          />
        );
      case "count-build":
        return <CountBuildGame key={current.key} item={current.item} {...common} onMistake={actions.mistake} />;
      case "plural-machine":
        return <PluralMachineGame key={current.key} item={current.item} {...common} />;
      case "bangla-trap":
        return <BanglaTrapGame key={current.key} item={current.item} {...common} onMistake={actions.mistake} />;
      case "bazar-list":
        return <BazarListGame key={current.key} item={current.item} {...common} listSoFar={state.collected} />;
      case "group-chat":
        return <GroupChatGame key={current.key} item={current.item} {...common} />;
      case "name-swap":
        return <NameSwapGame key={current.key} item={current.item} {...common} />;
      case "respect-trap":
        return <RespectTrapGame key={current.key} item={current.item} {...common} />;
      case "team-up":
        return <TeamUpGame key={current.key} item={current.item} {...common} onMistake={actions.mistake} />;
      case "six-box":
        return <SixBoxGame key={current.key} item={current.item} {...common} />;
      case "code-lock":
        return <CodeLockGame key={current.key} item={current.item} {...common} onMistake={actions.mistake} />;
      case "odd-one-out":
        return <OddOneOutGame key={current.key} item={current.item} {...common} />;
      case "build-order":
        return <BuildOrderGame key={current.key} item={current.item} {...common} />;
      case "verb-spotlight":
        return <VerbSpotlightGame key={current.key} item={current.item} {...common} />;
      case "fix-bridge":
        return <FixBridgeGame key={current.key} item={current.item} {...common} />;
      case "bin-extra":
        return <BinExtraGame key={current.key} item={current.item} {...common} />;
      case "action-camera":
        return <ActionCameraGame key={current.key} item={current.item} {...common} />;
      case "pass-ball":
        return <PassBallGame key={current.key} item={current.item} {...common} onMistake={actions.mistake} />;
      case "object-place":
        return <ObjectPlaceGame key={current.key} item={current.item} {...common} />;
      case "mirror-words":
        return <MirrorWordsGame key={current.key} item={current.item} {...common} />;
      case "complete-or-not":
        return <CompleteOrNotGame key={current.key} item={current.item} {...common} onMistake={actions.mistake} />;
      case "bangla-flip":
        return <BanglaFlipGame key={current.key} item={current.item} {...common} />;
      case "grow-sentence":
        return <GrowSentenceGame key={current.key} item={current.item} {...common} />;
      case "sentence-doctor":
        return <SentenceDoctorGame key={current.key} item={current.item} {...common} onMistake={actions.mistake} />;
      case "my-diary":
        return <MyDiaryGame key={current.key} item={current.item} {...common} />;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background">
      {state.screen === "start" ? null : (
        <PlaygroundHeader
          backHref={backHref}
          onExit={onExit}
          rounds={state.rounds}
          lockedRounds={lockedCount}
          roundIndex={state.round}
          answeredInRound={
            state.screen === "play" ? state.index + (finished ? 1 : 0) : 0
          }
          streak={state.streak}
          xp={state.xp}
          autoVoice={autoVoice}
          lang={lang}
          onHelp={flags?.openProfile}
          onNotes={openGameNotes}
        />
      )}
      <GameHelpSheets playground={playground} lang={lang} />

      <main
        ref={mainRef}
        className="relative isolate flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain bg-gradient-to-b from-accent/[0.06] via-background to-background"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_1px_1px,rgba(30,58,138,0.09)_1px,transparent_0)] bg-[length:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        {state.screen === "intro" && round && !roundSummary ? (
          <RoundIntro
            key={round.id}
            round={round}
            number={Math.min(state.round + 1, scoredRounds)}
            total={scoredRounds}
            lang={lang}
            topic={playground.topic}
            level={level}
            plan={plan}
            onStart={beginRound}
          />
        ) : null}

        {playing && round ? (
          <GameStage
            round={round}
            number={Math.min(state.round + 1, scoredRounds)}
            total={scoredRounds}
            index={state.index}
            points={state.points}
            lang={lang}
            onNotes={openGameNotes}
          />
        ) : null}

        <NudgeProvider active={playing && state.status === "answering" && !ready && notesFrom === null} resetKey={itemKey ? `${itemKey}:${step}:${state.attempt}` : null}>
          <AnimatePresence mode="wait" initial={false}>
            {playing ? (
              <motion.div
                key={item.key}
                className="relative mx-auto mt-auto w-full max-w-3xl px-3 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-8"
                variants={reduceMotion ? QUESTION_FADE : QUESTION_CARD}
                initial="enter"
                animate="shown"
                exit="leave"
              >
                <motion.div variants={reduceMotion ? undefined : QUESTION_PART} className="mb-3 flex items-end gap-2.5 sm:mb-6 sm:gap-3">
                  <GamlishMascot mood={mascotMood} moodKey={`${state.attempt}:${state.mistakes}`} />
                  <div className="relative min-w-0 flex-1 rounded-2xl rounded-bl-md border-2 border-b-4 border-slate-200 bg-white px-3.5 py-2.5 shadow-sm sm:px-4 sm:py-3">
                    <span
                      aria-hidden
                      className="absolute -left-[9px] bottom-2 size-4 rotate-45 border-b-2 border-l-2 border-slate-200 bg-white"
                    />
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className={cn(LANG_FACE[lang], "flex flex-wrap items-center gap-1.5 text-[11px] font-black text-slate-400 sm:text-xs")}>
                          {item.review ? (
                            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                              <RotateCcw className="size-3" aria-hidden />
                              {pick(PG_UI.reviewTitle, lang)}
                            </span>
                          ) : null}
                          {item.practice ? (
                            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent">{pick(PG_UI.practice, lang)}</span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                              {scoredIndex} / {scoredInRound}
                            </span>
                          )}
                        </p>
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.h1
                            key={`${step}:${lang}`}
                            className={cn(LANG_FACE[lang], "mt-1 text-base font-black leading-snug text-slate-900 sm:text-xl")}
                            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18 }}
                          >
                            {pick(heading, lang)}
                          </motion.h1>
                        </AnimatePresence>
                      </div>
                      <SpeakButton
                        id={`${item.key}:instruction:${lang}:${step}`}
                        text={heading[lang]}
                        lang={lang}
                        className="size-8 sm:size-9"
                      />
                    </div>
                  </div>
                </motion.div>
                <motion.div variants={reduceMotion ? undefined : QUESTION_PART}>{renderGame(item)}</motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </NudgeProvider>
      </main>

      {roundSummary ? (
        <RoundWinCard
          summary={roundSummary}
          number={state.round}
          lang={lang}
          extras={roundExtras?.(state.round, closeWinCard) ?? null}
          nextTitle={state.rounds[state.round]?.title ?? null}
          onNext={closeWinCard}
        />
      ) : null}

      {playing ? (
        <PlaygroundFooter
          status={state.status}
          ready={ready}
          feedback={state.feedback}
          praise={praise}
          lang={lang}
          onCheck={check}
          onRetry={retry}
          onNext={next}
          practice={item?.practice === true}
          lastInGame={round ? state.index === round.items.length - 1 : false}
          onNotes={stuck ? () => openNotes("game") : undefined}
        />
      ) : null}

      {state.screen === "start" && !autoStart ? (
        <PlaygroundStart
          playground={playground}
          minutes={estimatedMinutes(playground)}
          autoVoice={autoVoice}
          lang={lang}
          backHref={backHref}
          resumeFrom={resume?.from ?? 0}
          onNotes={notesStepId ? () => openNotes("game") : undefined}
          onStart={start}
        />
      ) : null}

      {isComplete && !skipFinishScreen ? (
        <PlaygroundComplete
          playground={playground}
          score={score}
          max={maxScore}
          xp={state.xp}
          bestStreak={state.bestStreak}
          seconds={
            state.startedAt !== null && state.finishedAt !== null
              ? Math.max(
                  1,
                  Math.round((state.finishedAt - state.startedAt) / 1000),
                )
              : 0
          }
          lines={state.collected}
          passed={passed}
          lang={lang}
          onContinue={finish}
          onReplay={replay}
          onNotes={notesStepId ? () => openNotes("results") : undefined}
        />
      ) : null}

      {notesFrom && notesStepId ? (
        <LazyNotesSheet
          stepId={notesStepId}
          onClose={closeNotes}
          action={
            notesFrom === "results"
              ? {
                  label: NOTES_UI.tryAgain,
                  onClick: () => {
                    closeNotes();
                    replay();
                  },
                }
              : { label: NOTES_UI.backToGame, onClick: closeNotes }
          }
        />
      ) : null}
    </div>
  );
}
