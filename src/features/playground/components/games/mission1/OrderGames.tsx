"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Keyboard, Lightbulb } from "lucide-react";
import { EN_FACE, SpeakButton } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { matchesTyped, normalizeTyped } from "@/src/features/chat-lesson/lib/typedAnswer";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import {
  ListenButtons,
  StepPill,
  TypedField,
  WordChip,
  type ChipTone,
} from "@/src/features/playground/components/PlaygroundParts";
import { isDone, type GameProps } from "@/src/features/playground/components/games/gameProps";
import {
  BanglaStrip,
  BigChoice,
  GameFrame,
  optionTone,
  shuffled,
  SlipNote,
  useAttemptChoice,
} from "@/src/features/playground/components/games/mission1/kit";
import { PG_UI } from "@/src/features/playground/lib/copy";
import { DIAGNOSIS_KEYS, DIAGNOSIS_LABEL, M1_UI } from "@/src/features/playground/lib/mission1Copy";
import { flipSentence, growBase, growSentence } from "@/src/features/playground/lib/speech";
import type {
  AnswerResult,
  Diagnosis,
  DiaryItem,
  DoctorItem,
  FlipItem,
  GrowItem,
} from "@/src/features/playground/types";
import { playThinkAgainEvalSfx, playUiClickSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

const DONE_PILL: Bilingual = { en: "Done!", bn: "হয়ে গেছে!" };

type Role = "s" | "o" | "v";

const ROLE_TAG: Record<Role, string> = { s: M1_UI.roleSubject, v: M1_UI.roleVerb, o: M1_UI.roleObject };
const ROLE_TONE: Record<Role, string> = {
  s: "border-accent/70 border-b-accent bg-accent/5 text-accent",
  v: "border-emerald-400 border-b-emerald-500 bg-emerald-50 text-emerald-900",
  o: "border-orange-300 border-b-orange-400 bg-orange-50 text-orange-900",
};
const ENGLISH_ORDER: readonly Role[] = ["s", "v", "o"];

export function BanglaFlipGame({ item, itemKey, lang, status, onReady, onAnswer }: GameProps<FlipItem>) {
  const reduceMotion = useReducedMotion();
  const [order, setOrder] = useState<Role[]>(["s", "o", "v"]);
  const [lifted, setLifted] = useState<Role | null>(null);
  const done = isDone(status);
  const locked = status !== "answering";
  const text: Record<Role, string> = { s: item.subject, o: item.object, v: item.verb };
  const shown = done ? [...ENGLISH_ORDER] : order;

  const lift = (role: Role) => {
    if (locked) return;
    void playUiClickSfx();
    setLifted((current) => (current === role ? null : role));
  };

  const drop = (position: number) => {
    if (!lifted || locked) return;
    void playUiClickSfx();
    const without = order.filter((role) => role !== lifted);
    const from = order.indexOf(lifted);
    const at = position > from ? position - 1 : position;
    const next = [...without.slice(0, at), lifted, ...without.slice(at)];
    setOrder(next);
    setLifted(null);
    const sentence = flipSentence(item);
    const body: Bilingual = {
      en: `**${sentence}** Subject + Verb + Object.`,
      bn: `**${sentence}** Subject + Verb + Object।`,
    };
    const correct = next.every((role, i) => role === ENGLISH_ORDER[i]);
    onReady(() => onAnswer(correct ? { correct: true, body } : { correct: false, hint: M1_UI.flipHint, reveal: body }));
  };

  const gap = (position: number) => {
    if (!lifted) return null;
    const from = order.indexOf(lifted);
    if (position === from || position === from + 1) return null;
    return (
      <button
        key={`gap-${position}`}
        type="button"
        onClick={() => drop(position)}
        aria-label={`Drop here ${position + 1}`}
        className="h-12 w-8 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50 text-lg font-black text-emerald-600 animate-pulse"
      >
        +
      </button>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <GameFrame
        tone="emerald"
        active={!locked}
        header={
          <BanglaStrip text={item.bangla}>
            <SpeakButton id={`${itemKey}:bn`} text={item.bangla} lang="bn" />
          </BanglaStrip>
        }
      >
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {shown.map((role, i) => (
            <span key={role} className="flex items-center gap-2">
              {done ? null : gap(i)}
              <motion.button
                layout={!reduceMotion}
                type="button"
                disabled={locked}
                onClick={() => lift(role)}
                className={cn(
                  EN_FACE,
                  "relative rounded-2xl border-2 border-b-4 px-3 py-2 text-lg font-black transition-colors sm:px-4 sm:text-2xl",
                  done ? "border-accent border-b-primary bg-accent text-white" : ROLE_TONE[role],
                  lifted === role && "-translate-y-2 ring-4 ring-emerald-200",
                )}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  {ROLE_TAG[role]}
                </span>
                {text[role]}
              </motion.button>
            </span>
          ))}
          {done ? null : gap(order.length)}
        </div>
        {done ? (
          <div className="mt-3 flex justify-end">
            <ListenButtons idPrefix={`${itemKey}:s:`} text={flipSentence(item)} lang={lang} />
          </div>
        ) : (
          <p className={cn(LANG_FACE[lang], "mt-3 text-center text-xs font-semibold text-slate-500")}>
            {pick(M1_UI.flipHelp, lang)}
          </p>
        )}
      </GameFrame>
    </div>
  );
}

export function GrowSentenceGame({ item, itemKey, lang, status, onReady, onAnswer }: GameProps<GrowItem>) {
  const reduceMotion = useReducedMotion();
  const [placeFirst] = useState(() => Math.random() < 0.5);
  const [slots, setSlots] = useState<[string | null, string | null]>([null, null]);
  const done = isDone(status);
  const locked = status !== "answering";
  const tiles = placeFirst ? [item.place, item.time] : [item.time, item.place];
  const shown: [string | null, string | null] = done ? [item.place, item.time] : slots;

  const settle = (next: [string | null, string | null]) => {
    setSlots(next);
    if (!next[0] || !next[1]) {
      onReady(null);
      return;
    }
    const sentence = growSentence(item);
    const body: Bilingual = { en: `**${sentence}** Place first, then time.`, bn: `**${sentence}** আগে স্থান, তারপর সময়।` };
    const correct = next[0] === item.place && next[1] === item.time;
    onReady(() => onAnswer(correct ? { correct: true, body } : { correct: false, hint: M1_UI.growHint, reveal: body }));
  };

  const place = (tile: string) => {
    if (locked || slots.includes(tile)) return;
    void playUiClickSfx();
    settle(slots[0] === null ? [tile, slots[1]] : [slots[0], tile]);
  };

  const clear = (index: 0 | 1) => {
    if (locked || !slots[index]) return;
    void playUiClickSfx();
    settle(index === 0 ? [null, slots[1]] : [slots[0], null]);
  };

  const slotTone: ChipTone = done ? "subject" : status === "retry" ? "wrong" : "selected";
  const grown = done && status === "correct";

  return (
    <div className="space-y-3 sm:space-y-5">
      <GameFrame
        tone="lime"
        active={!locked}
        header={
          <>
            <BanglaStrip text={item.bangla}>
              <SpeakButton id={`${itemKey}:bn`} text={item.bangla} lang="bn" />
            </BanglaStrip>
            <ListenButtons idPrefix={`${itemKey}:s:`} text={done ? growSentence(item) : growBase(item)} lang={lang} />
          </>
        }
      >
        <div className="flex items-end gap-3">
          <motion.span
            key={grown ? "flower" : "sprout"}
            className="text-5xl sm:text-6xl"
            initial={grown && !reduceMotion ? { scale: 0.3, y: 20 } : false}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            aria-hidden
          >
            {grown ? "🌻" : "🪴"}
          </motion.span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 pb-1">
            <span className={cn(EN_FACE, "text-lg font-black text-slate-900 sm:text-2xl")}>{item.base}</span>
            {([0, 1] as const).map((index) => (
              <WordChip
                key={index}
                tone={shown[index] ? slotTone : "idle"}
                disabled={locked || !shown[index]}
                onClick={() => clear(index)}
                className={cn(!shown[index] && "border-dashed text-slate-300")}
              >
                {shown[index] ?? "?"}
              </WordChip>
            ))}
            <span className={cn(EN_FACE, "text-2xl font-black text-slate-900")}>.</span>
          </div>
        </div>
      </GameFrame>

      {done ? null : (
        <>
          <p className={cn(LANG_FACE[lang], "text-center text-sm font-bold text-slate-500")}>{pick(M1_UI.growHelp, lang)}</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {tiles.map((tile) => (
              <WordChip key={tile} tone={slots.includes(tile) ? "dim" : "idle"} disabled={locked || slots.includes(tile)} onClick={() => place(tile)}>
                {tile}
              </WordChip>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function SentenceDoctorGame({
  item,
  itemKey,
  lang,
  status,
  attempt,
  onReady,
  onAnswer,
  onMistake,
}: GameProps<DoctorItem> & { onMistake: () => void }) {
  const [diagnosed, setDiagnosed] = useState(false);
  const [miss, setMiss] = useState<{ choice: Diagnosis; tries: number } | null>(null);
  const [selected, setSelected] = useAttemptChoice<string>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";

  const diagnose = (choice: Diagnosis) => {
    if (diagnosed || locked) return;
    if (choice !== item.diagnosis) {
      setMiss((current) => ({ choice, tries: (current?.tries ?? 0) + 1 }));
      onMistake();
      void playThinkAgainEvalSfx();
      return;
    }
    setDiagnosed(true);
    setMiss(null);
    void playUiClickSfx();
  };

  const cure = (option: string) => {
    if (!diagnosed || locked) return;
    setSelected(option);
    void playUiClickSfx();
    const label = DIAGNOSIS_LABEL[item.diagnosis];
    const body: Bilingual = {
      en: `**${item.cure}** ${label.en}: ${item.why.en}`,
      bn: `**${item.cure}** ${label.bn}: ${item.why.bn}`,
    };
    onReady(() =>
      onAnswer(option === item.cure ? { correct: true, body } : { correct: false, hint: M1_UI.doctorCureHint, reveal: body }),
    );
  };

  const diagnosisTone = (choice: Diagnosis): ChipTone => {
    if (diagnosed) return choice === item.diagnosis ? "subject" : "dim";
    return miss?.choice === choice ? "wrong" : "idle";
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <GameFrame
        tone="rose"
        active={!locked}
        header={
          <>
            <StepPill
              text={done ? DONE_PILL : diagnosed ? M1_UI.doctorStepCure : M1_UI.doctorStepDiagnose}
              lang={lang}
              tone={done ? "done" : "now"}
            />
            {done ? <ListenButtons idPrefix={`${itemKey}:s:`} text={item.cure} lang={lang} /> : null}
          </>
        }
      >
        <div className="flex items-start gap-3">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-rose-100" aria-hidden>
            {done && status === "correct" ? "😊" : "🤒"}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <p className={cn(LANG_FACE[lang], "text-[11px] font-black uppercase tracking-wider text-rose-600")}>{pick(M1_UI.patient, lang)}</p>
            <p
              className={cn(
                EN_FACE,
                "text-xl font-black leading-snug sm:text-2xl",
                done ? "text-accent" : "text-slate-900 underline decoration-rose-400 decoration-wavy decoration-2 underline-offset-4",
              )}
            >
              {done ? item.cure : item.sick}
            </p>
            <BanglaStrip text={item.bangla}>
              <SpeakButton id={`${itemKey}:bn`} text={item.bangla} lang="bn" />
            </BanglaStrip>
          </div>
        </div>
      </GameFrame>

      {miss && !diagnosed ? <SlipNote text={M1_UI.doctorDiagnoseHint} lang={lang} /> : null}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {DIAGNOSIS_KEYS.map((key) => (
          <BigChoice
            key={key}
            label={pick(DIAGNOSIS_LABEL[key], lang)}
            tone={diagnosisTone(key)}
            disabled={diagnosed || locked}
            lang={lang}
            shakeKey={miss?.tries}
            onClick={() => diagnose(key)}
          />
        ))}
      </div>

      {diagnosed && !done ? (
        <div className="space-y-2">
          {item.cures.map((option) => (
            <WordChip
              key={option}
              tone={optionTone(option, selected, status, item.cure)}
              disabled={locked}
              shakeKey={attempt}
              onClick={() => cure(option)}
              className="w-full text-left"
            >
              {option}
            </WordChip>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function evaluateDiary(item: DiaryItem, typed: string, helped: boolean): AnswerResult {
  const model = item.accepted.find((answer) => normalizeTyped(answer) === normalizeTyped(typed)) ?? item.accepted[0] ?? "";
  const body: Bilingual = { en: `**${model}**`, bn: `**${model}** (${item.bangla})` };
  if (matchesTyped(typed, item.accepted)) {
    return { correct: true, body, brave: !helped, collect: { highlight: model } };
  }
  return { correct: false, hint: item.hint, reveal: { en: `**${item.accepted[0] ?? ""}**`, bn: `**${item.accepted[0] ?? ""}**` } };
}

export function MyDiaryGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<DiaryItem>) {
  const [text, setText] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [tiles] = useState(() => shuffled((item.accepted[0] ?? "").replace(/[.!?]$/, "").split(" ")));
  const inputRef = useRef<HTMLInputElement>(null);
  const done = isDone(status);
  const locked = status !== "answering";

  useEffect(() => {
    if (status !== "answering") return;
    if (window.matchMedia("(pointer: fine)").matches || attempt > 0) inputRef.current?.focus();
  }, [status, attempt]);

  const update = (value: string, helped = helpOpen) => {
    setText(value);
    const trimmed = value.trim();
    onReady(trimmed ? () => onAnswer(evaluateDiary(item, trimmed, helped)) : null);
  };

  const openHelp = () => {
    void playUiClickSfx();
    setHelpOpen(true);
    update(text, true);
  };

  const addTile = (word: string) => {
    if (locked) return;
    void playUiClickSfx();
    update(text.trim() ? `${text.trim()} ${word}` : word, true);
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <div
        className={cn(
          "rounded-3xl border-2 border-b-[5px] border-amber-300 bg-[repeating-linear-gradient(to_bottom,#fffbeb_0px,#fffbeb_34px,#fde68a_35px)] p-4 shadow-sm sm:p-6",
          !locked && "ring-4 ring-amber-100",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className={cn(LANG_FACE[lang], "rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-white")}>
            {pick(M1_UI.myDay, lang)} · {pick(item.time, lang)}
          </span>
          {done ? <ListenButtons idPrefix={`${itemKey}:s:`} text={item.accepted[0] ?? ""} lang={lang} /> : null}
        </div>
        <div className="mt-3">
          <BanglaStrip text={item.bangla}>
            <SpeakButton id={`${itemKey}:bn`} text={item.bangla} lang="bn" />
          </BanglaStrip>
        </div>
        <div className="mt-4">
          {done ? (
            <p className={cn(EN_FACE, "rounded-2xl bg-accent px-4 py-2.5 text-lg font-black text-white sm:text-2xl")}>
              {status === "correct" ? (item.accepted.find((a) => normalizeTyped(a) === normalizeTyped(text)) ?? item.accepted[0]) : item.accepted[0]}
            </p>
          ) : (
            <TypedField
              ref={inputRef}
              value={text}
              placeholder={pick(M1_UI.diaryType, lang)}
              disabled={locked}
              retry={status === "retry"}
              onChange={(value) => update(value)}
              label={pick(M1_UI.diaryType, lang)}
              maxLength={90}
              className="w-full [field-sizing:fixed]"
            />
          )}
        </div>
      </div>

      {done ? null : (
        <div className="space-y-2.5">
          <p className={cn(LANG_FACE[lang], "flex items-center gap-1.5 text-xs font-semibold text-slate-500")}>
            <Keyboard className="size-3.5 shrink-0" aria-hidden />
            {pick(PG_UI.typeExact, lang)}
          </p>
          {helpOpen ? (
            <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
              <div className="mb-2 flex items-center justify-between">
                <p className={cn(LANG_FACE[lang], "text-xs font-black text-slate-500")}>{pick(M1_UI.diaryTiles, lang)}</p>
                <button
                  type="button"
                  onClick={() => update("", true)}
                  className={cn(LANG_FACE[lang], "rounded-full px-2.5 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50")}
                >
                  {pick(M1_UI.diaryClear, lang)}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tiles.map((word, i) => (
                  <WordChip key={`${word}-${i}`} tone="idle" disabled={locked} onClick={() => addTile(word)} className="text-sm sm:text-base">
                    {word}
                  </WordChip>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={openHelp}
              className={cn(
                LANG_FACE[lang],
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200 hover:bg-amber-50",
              )}
            >
              <Lightbulb className="size-3.5" aria-hidden />
              {pick(PG_UI.needHelp, lang)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
