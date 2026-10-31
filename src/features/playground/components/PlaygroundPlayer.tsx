"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
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
import { RoundIntro } from "@/src/features/playground/components/RoundIntro";
import { useAutoVoice } from "@/src/features/playground/hooks/useAutoVoice";
import { usePlaygroundSession } from "@/src/features/playground/hooks/usePlaygroundSession";
import { PG_UI } from "@/src/features/playground/lib/copy";
import {
  buildSession,
  estimatedMinutes,
} from "@/src/features/playground/lib/session";
import { afterLine, startLine } from "@/src/features/playground/lib/speech";
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

const AUTO_VOICE_DELAY_MS = 450;
const AFTER_VOICE_DELAY_MS = 750;

type Props = {
  playground: Playground;
  /** Level map. After finishing, Continue returns here with `?completed=<playground id>`. */
  backHref?: string;
  onComplete?: (score: number, max: number) => void;
};

/** Only recorded (Azure) clips play here: lines without a clip stay silent rather than use a robotic voice. */
export function PlaygroundPlayer({
  audio,
  ...props
}: Props & { audio?: StepAudio }) {
  return (
    <LessonSpeechProvider audio={audio} clipsOnly>
      <PlaygroundScreen {...props} />
    </LessonSpeechProvider>
  );
}

function PlaygroundScreen({ playground, backHref, onComplete }: Props) {
  const router = useRouter();
  const lang = useLessonLanguage();
  const autoVoice = useAutoVoice();
  const reduceMotion = useReducedMotion();
  const { speak, stop, unlock } = useLessonSpeech();
  const { state, item, actions, score, maxScore } = usePlaygroundSession();
  const checkRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);

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
    if (feedbackTone === "correct") void playCorrectEvalSfx();
    else if (feedbackTone === "retry") void playThinkAgainEvalSfx();
    else if (feedbackTone === "revealed") void playWrongEvalSfx();
  }, [feedbackTone]);

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

  const start = () => {
    unlock();
    void primeEvalSfx();
    clearReady();
    actions.start(buildSession(playground));
  };

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

  useEffect(() => {
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
  }, [playing, state.status, ready, finished, check, retry, next]);

  const finish = () => {
    if (!backHref) return start();
    router.push(passed ? `${backHref}?completed=${encodeURIComponent(playground.id)}` : backHref);
  };

  const praise =
    PG_UI.praises[(state.round * 7 + state.index) % PG_UI.praises.length] ??
    PG_UI.praises[0];
  const scoredRounds = state.rounds.filter((r) => r.kind !== "review").length;

  const renderGame = (current: SessionItem) => {
    const common = {
      itemKey: current.key,
      lang,
      status: state.status,
      attempt: state.attempt,
      onReady,
      onAnswer: handleAnswer,
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
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-50 bg-gradient-to-b from-violet-50 via-slate-50 to-slate-50">
      {state.screen === "start" ? null : (
        <PlaygroundHeader
          backHref={backHref}
          rounds={state.rounds}
          roundIndex={state.round}
          answeredInRound={
            state.screen === "play" ? state.index + (finished ? 1 : 0) : 0
          }
          roundTitle={round?.title ?? null}
          streak={state.streak}
          xp={state.xp}
          autoVoice={autoVoice}
          lang={lang}
        />
      )}

      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        {state.screen === "intro" && round ? (
          <RoundIntro
            key={round.id}
            round={round}
            number={Math.min(state.round + 1, scoredRounds)}
            total={scoredRounds}
            lang={lang}
            onStart={beginRound}
          />
        ) : null}

        {playing ? (
          <motion.div
            key={item.key}
            className="mx-auto w-full max-w-3xl px-3 pb-3 pt-3 sm:px-6 sm:pb-10 sm:pt-10"
            initial={reduceMotion ? false : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
              <div className={cn("mb-3 flex items-start gap-2 sm:mb-7", state.feedback && "max-sm:hidden")}>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    LANG_FACE[lang],
                    "flex items-center gap-2 text-[11px] font-black text-slate-400 sm:text-xs",
                  )}
                >
                  {item.review ? (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                      <RotateCcw className="size-3" aria-hidden />
                      {pick(PG_UI.reviewTitle, lang)}
                    </span>
                  ) : null}
                  <span>
                    {state.index + 1} / {round?.items.length ?? 0}
                  </span>
                </p>
                <h1
                    className={cn(
                      LANG_FACE[lang],
                      "mt-0.5 text-base font-black leading-snug text-slate-800 sm:mt-1 sm:text-2xl",
                    )}
                >
                  {pick(item.instruction, lang)}
                </h1>
              </div>
              <SpeakButton
                id={`${item.key}:instruction:${lang}`}
                text={item.instruction[lang]}
                lang={lang}
                className="mt-3 size-8 sm:mt-5 sm:size-9"
              />
            </div>
            {renderGame(item)}
          </motion.div>
        ) : null}
      </main>

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
        />
      ) : null}

      {state.screen === "start" ? (
        <PlaygroundStart
          playground={playground}
          minutes={estimatedMinutes(playground)}
          autoVoice={autoVoice}
          lang={lang}
          backHref={backHref}
          onStart={start}
        />
      ) : null}

      {isComplete ? (
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
          onReplay={start}
        />
      ) : null}
    </div>
  );
}
