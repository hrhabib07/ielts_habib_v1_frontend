"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Keyboard, Trash2 } from "lucide-react";
import { EN_FACE, SpeakButton } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { matchesTyped, normalizeTyped } from "@/src/features/chat-lesson/lib/typedAnswer";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import {
  BanglaLine,
  ListenButtons,
  TypedField,
  WordChip,
  type ChipTone,
} from "@/src/features/playground/components/PlaygroundParts";
import { isDone, type GameProps } from "@/src/features/playground/components/games/gameProps";
import {
  BanglaStrip,
  BigChoice,
  BlankSlot,
  GameFrame,
  optionTone,
  PlainWords,
  useAttemptChoice,
} from "@/src/features/playground/components/games/mission1/kit";
import { PG_UI } from "@/src/features/playground/lib/copy";
import { M1_UI } from "@/src/features/playground/lib/mission1Copy";
import { bridgeSentence, cameraSentence } from "@/src/features/playground/lib/speech";
import type {
  AnswerResult,
  BeVerb,
  BinExtraItem,
  BridgeItem,
  CameraItem,
  SpotlightItem,
} from "@/src/features/playground/types";
import { playUiClickSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

const bare = (word: string) => word.replace(/[.,!?]+$/, "");

export function VerbSpotlightGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<SpotlightItem>) {
  const [selected, setSelected] = useAttemptChoice<number>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";
  const sentence = item.words.join(" ");
  const verb = bare(item.words[item.verb] ?? "");

  const choose = (index: number) => {
    if (locked) return;
    setSelected(index);
    void playUiClickSfx();
    const body: Bilingual = {
      en: `**${verb}** is the Verb. ${item.why.en}`,
      bn: `**${verb}** হলো Verb। ${item.why.bn}`,
    };
    const hint = item.traps?.find((trap) => trap.index === index)?.hint ?? M1_UI.spotlightHint;
    onReady(() => onAnswer(index === item.verb ? { correct: true, body } : { correct: false, hint, reveal: body }));
  };

  const tone = (index: number): ChipTone => {
    if (done) return index === item.verb ? "lit" : "dim";
    if (status === "retry" && index === selected) return "wrong";
    return index === selected ? "lit" : "idle";
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border-2 border-b-[5px] border-slate-900 bg-slate-900 p-4 shadow-lg sm:p-6",
          !locked && "ring-4 ring-amber-200/60",
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto size-64 rounded-full bg-amber-200/10 blur-3xl" aria-hidden />
        <div className="relative flex items-center justify-end">
          <ListenButtons idPrefix={`${itemKey}:s:`} text={sentence} lang={lang} />
        </div>
        <div className="relative mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-4 pb-2">
          {item.words.map((word, i) => (
            <WordChip
              key={i}
              tone={tone(i)}
              disabled={locked}
              shakeKey={attempt}
              onClick={() => choose(i)}
              className={cn(tone(i) === "lit" && "shadow-[0_0_28px_6px_rgba(253,230,138,0.55)]")}
            >
              {word}
            </WordChip>
          ))}
        </div>
      </div>
      <BanglaLine id={`${itemKey}:bn`} text={item.bn} lang={lang} />
    </div>
  );
}

const BE_VERBS: readonly BeVerb[] = ["am", "is", "are"];

export function FixBridgeGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<BridgeItem>) {
  const [selected, setSelected] = useAttemptChoice<BeVerb>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";

  const choose = (verb: BeVerb) => {
    if (locked) return;
    setSelected(verb);
    void playUiClickSfx();
    const body: Bilingual = {
      en: `**${bridgeSentence(item)}** ${item.why.en}`,
      bn: `**${bridgeSentence(item)}** ${item.why.bn}`,
    };
    const hint = item.trap?.pick === verb ? item.trap.hint : M1_UI.bridgeHint;
    onReady(() => onAnswer(verb === item.answer ? { correct: true, body } : { correct: false, hint, reveal: body }));
  };

  const slotValue = done ? item.answer : selected;
  const slotTone: ChipTone = done ? "subject" : status === "retry" ? "wrong" : "selected";

  return (
    <div className="space-y-3 sm:space-y-5">
      <GameFrame
        tone="sky"
        active={!locked}
        header={
          <>
            <BanglaStrip text={item.bangla}>
              <SpeakButton id={`${itemKey}:bn`} text={item.bangla} lang="bn" />
            </BanglaStrip>
            {done ? <ListenButtons idPrefix={`${itemKey}:s:`} text={bridgeSentence(item)} lang={lang} /> : null}
          </>
        }
      >
        <div className="relative pt-9">
          <span
            className={cn(
              "absolute top-0 text-3xl transition-[left] duration-[1400ms] ease-in-out motion-reduce:transition-none",
              done && status === "correct" ? "left-[calc(100%-2.25rem)]" : "left-0",
            )}
            aria-hidden
          >
            🚶
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-b-8 border-amber-700 bg-amber-100 px-3 py-3">
            <PlainWords text={item.before} />
            <BlankSlot value={slotValue} tone={slotTone} />
            <PlainWords text={item.after} />
          </div>
          <div className="mt-1 h-4 rounded-full bg-gradient-to-r from-sky-300 via-sky-400 to-sky-300 opacity-70" aria-hidden />
        </div>
      </GameFrame>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {BE_VERBS.map((verb) => (
          <BigChoice
            key={verb}
            label={verb}
            tone={optionTone(verb, selected, status, item.answer)}
            disabled={locked}
            lang={lang}
            shakeKey={attempt}
            onClick={() => choose(verb)}
            className="min-h-16 bg-amber-50"
          />
        ))}
      </div>
    </div>
  );
}

type BinPick = number | "ok";

export function BinExtraGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<BinExtraItem>) {
  const [selected, setSelected] = useAttemptChoice<BinPick>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";
  const answer: BinPick = item.extra ?? "ok";

  const choose = (choice: BinPick) => {
    if (locked) return;
    setSelected(choice);
    void playUiClickSfx();
    const body: Bilingual = { en: `**${item.fixed}** ${item.why.en}`, bn: `**${item.fixed}** ${item.why.bn}` };
    const hint =
      item.extra === null ? M1_UI.binIsCorrect : choice === "ok" ? M1_UI.binHasExtra : M1_UI.binNotExtra;
    onReady(() => onAnswer(choice === answer ? { correct: true, body } : { correct: false, hint, reveal: body }));
  };

  const wordTone = (index: number): ChipTone => {
    if (done) return index === item.extra ? "wrong" : "idle";
    if (status === "retry" && selected === index) return "wrong";
    return selected === index ? "selected" : "idle";
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <GameFrame
        tone="slate"
        active={!locked}
        header={
          <BanglaStrip text={item.bangla}>
            <SpeakButton id={`${itemKey}:bn`} text={item.bangla} lang="bn" />
          </BanglaStrip>
        }
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
          {item.words.map((word, i) => (
            <WordChip
              key={i}
              tone={wordTone(i)}
              disabled={locked}
              shakeKey={attempt}
              onClick={() => choose(i)}
              className={cn((done && i === item.extra) || (selected === i && !done) ? "line-through decoration-2" : undefined)}
            >
              {word}
            </WordChip>
          ))}
          <span
            className={cn(
              "ml-auto flex size-12 items-center justify-center rounded-2xl border-2 border-b-4",
              typeof selected === "number" || (done && item.extra !== null)
                ? "border-rose-400 bg-rose-100 text-rose-600"
                : "border-slate-200 bg-white text-slate-400",
            )}
            aria-hidden
          >
            <Trash2 className="size-6" />
          </span>
        </div>
        {done ? (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-sky-500 px-3.5 py-2.5 text-white">
            <p className={cn(EN_FACE, "min-w-0 flex-1 text-lg font-black sm:text-xl")}>{item.fixed}</p>
            <ListenButtons idPrefix={`${itemKey}:s:`} text={item.fixed} lang={lang} />
          </div>
        ) : null}
      </GameFrame>

      <p className={cn(LANG_FACE[lang], "text-center text-sm font-bold text-slate-500")}>{pick(M1_UI.binTap, lang)}</p>
      <div className="flex justify-center">
        <BigChoice
          label={pick(M1_UI.looksCorrect, lang)}
          tone={optionTone<BinPick>("ok", selected, status, answer)}
          disabled={locked}
          lang={lang}
          shakeKey={attempt}
          onClick={() => choose("ok")}
          className="min-w-48"
        />
      </div>
    </div>
  );
}

function evaluateCamera(item: CameraItem, typed: string): AnswerResult {
  const accepted = [item.answer, ...(item.accepted ?? [])];
  const sentence = cameraSentence(item);
  const body: Bilingual = { en: `**${sentence}**`, bn: `**${sentence}** (${item.bangla})` };
  if (matchesTyped(typed, accepted)) return { correct: true, body };
  const value = normalizeTyped(typed);
  const hint = value.startsWith("do ")
    ? M1_UI.cameraOneWord
    : accepted.some((answer) => value === `${answer}s` || value === `${answer}es`)
      ? M1_UI.cameraNoS
      : M1_UI.cameraLook;
  return { correct: false, hint, reveal: body };
}

export function ActionCameraGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<CameraItem>) {
  const reduceMotion = useReducedMotion();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const done = isDone(status);
  const locked = status !== "answering";

  useEffect(() => {
    if (status !== "answering") return;
    if (window.matchMedia("(pointer: fine)").matches || attempt > 0) inputRef.current?.focus();
  }, [status, attempt]);

  const update = (value: string) => {
    setText(value);
    const trimmed = value.trim();
    onReady(trimmed ? () => onAnswer(evaluateCamera(item, trimmed)) : null);
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <div className={cn("rounded-3xl border-2 border-b-[5px] border-slate-800 bg-slate-800 p-3 shadow-lg sm:p-4", !locked && "ring-4 ring-sky-100")}>
        <div className="relative flex h-36 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 sm:h-44">
          {["left-2 top-2 border-l-4 border-t-4", "right-2 top-2 border-r-4 border-t-4", "bottom-2 left-2 border-b-4 border-l-4", "bottom-2 right-2 border-b-4 border-r-4"].map(
            (corner) => (
              <span key={corner} className={cn("absolute size-6 rounded-sm border-white/70", corner)} aria-hidden />
            ),
          )}
          <span className="absolute left-4 top-3 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-rose-300">
            <span className="size-2 animate-pulse rounded-full bg-rose-500" aria-hidden />
            Rec
          </span>
          <motion.span
            className="text-7xl sm:text-8xl"
            initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            aria-hidden
          >
            {item.emoji}
          </motion.span>
        </div>
        <div className="mt-3">
          <BanglaStrip text={item.bangla}>
            <SpeakButton id={`${itemKey}:bn`} text={item.bangla} lang="bn" />
          </BanglaStrip>
        </div>
      </div>

      <GameFrame
        tone="sky"
        active={!locked}
        header={done ? <><span /><ListenButtons idPrefix={`${itemKey}:s:`} text={cameraSentence(item)} lang={lang} /></> : undefined}
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <PlainWords text={item.before} />
          {done ? (
            <span className={cn(EN_FACE, "rounded-xl bg-sky-500 px-3 py-1 text-lg font-black text-white sm:text-2xl")}>{item.answer}</span>
          ) : (
            <TypedField
              ref={inputRef}
              value={text}
              placeholder={pick(M1_UI.typeVerb, lang)}
              disabled={locked}
              retry={status === "retry"}
              onChange={update}
              label={pick(M1_UI.typeVerb, lang)}
              maxLength={24}
            />
          )}
          <PlainWords text={item.after} />
        </div>
      </GameFrame>

      {done ? null : (
        <p className={cn(LANG_FACE[lang], "flex items-center gap-1.5 text-xs font-semibold text-slate-500")}>
          <Keyboard className="size-3.5 shrink-0" aria-hidden />
          {pick(PG_UI.typeExact, lang)}
        </p>
      )}
    </div>
  );
}
