"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Cog, Keyboard } from "lucide-react";
import { BN_FACE, EN_FACE, SpeakButton } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { ListenButtons, TypedField } from "@/src/features/playground/components/PlaygroundParts";
import { isDone, type GameProps } from "@/src/features/playground/components/games/gameProps";
import { PG_UI } from "@/src/features/playground/lib/copy";
import { checkTypedPlural, RULE_NOTES } from "@/src/features/playground/lib/plural";
import { pluralPair } from "@/src/features/playground/lib/speech";
import type { AnswerResult, PluralMachineItem } from "@/src/features/playground/types";
import { cn } from "@/lib/utils";

function evaluate(item: PluralMachineItem, typed: string): AnswerResult {
  const note = RULE_NOTES[item.rule];
  const answer: Bilingual = {
    en: `one ${item.word}, two **${item.answer}**. ${note.en}`,
    bn: `one ${item.word}, two **${item.answer}**। ${note.bn}`,
  };
  const verdict = checkTypedPlural({
    typed,
    answers: [item.answer, ...(item.accepted ?? [])],
    singular: item.word,
    rule: item.rule,
    traps: item.traps,
  });
  return verdict.correct ? { correct: true, body: answer } : { correct: false, hint: verdict.hint, reveal: answer };
}

function Card({ label, word, tone }: { label: string; word: string; tone: "in" | "out" }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border-2 border-b-4 px-5 py-2 sm:px-7 sm:py-3",
        tone === "in" ? "border-amber-300 bg-amber-50" : "border-sky-600 bg-sky-500 text-white",
      )}
    >
      <span
        className={cn(
          "text-[10px] font-black uppercase tracking-[0.14em]",
          tone === "in" ? "text-amber-700" : "text-sky-100",
        )}
      >
        {label}
      </span>
      <span className={cn(EN_FACE, "text-2xl font-black sm:text-3xl", tone === "in" && "text-slate-900")}>{word}</span>
    </div>
  );
}

export function PluralMachineGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<PluralMachineItem>) {
  const reduceMotion = useReducedMotion();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const done = isDone(status);
  const locked = status !== "answering";
  const spinning = !reduceMotion && (status === "correct" || status === "checking");

  useEffect(() => {
    if (status !== "answering") return;
    if (window.matchMedia("(pointer: fine)").matches || attempt > 0) inputRef.current?.focus();
    if (attempt > 0) inputRef.current?.select();
  }, [status, attempt]);

  const update = (value: string) => {
    setText(value);
    const trimmed = value.trim();
    onReady(trimmed ? () => onAnswer(evaluate(item, trimmed)) : null);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div
        className={cn(
          "rounded-3xl border-2 border-b-[5px] bg-gradient-to-b from-slate-50 to-white p-3.5 shadow-sm sm:p-6",
          !locked ? "border-sky-300 ring-4 ring-sky-100" : "border-slate-200",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-1">
            <Card label={pick(PG_UI.machineIn, lang)} word={item.word} tone="in" />
            <span className={cn(BN_FACE, "pl-1 text-sm text-slate-500")}>{item.bn}</span>
          </div>
          <ListenButtons idPrefix={`${itemKey}:s:`} text={item.word} lang={lang} />
        </div>

        <div className="my-2 flex items-center justify-center gap-2 text-slate-400 sm:my-3">
          <ArrowDown className="size-5" aria-hidden />
          <span className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-white shadow-inner">
            <motion.span
              animate={spinning ? { rotate: 360 } : { rotate: 0 }}
              transition={spinning ? { repeat: Infinity, duration: 1.2, ease: "linear" } : { duration: 0.3 }}
              className="flex"
            >
              <Cog className="size-5 text-amber-300" aria-hidden />
            </motion.span>
            <span className="text-[11px] font-black uppercase tracking-[0.14em]">Plural</span>
            <motion.span
              animate={spinning ? { rotate: -360 } : { rotate: 0 }}
              transition={spinning ? { repeat: Infinity, duration: 1.2, ease: "linear" } : { duration: 0.3 }}
              className="flex"
            >
              <Cog className="size-4 text-sky-300" aria-hidden />
            </motion.span>
          </span>
          <ArrowDown className="size-5" aria-hidden />
        </div>

        <div className="flex min-h-14 flex-wrap items-center justify-center gap-2">
          {done ? (
            <motion.div
              initial={reduceMotion ? false : { y: -16, scale: 0.6, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 16 }}
              className="flex items-center gap-2"
            >
              <Card label={pick(PG_UI.machineOut, lang)} word={item.answer} tone="out" />
              <SpeakButton id={`${itemKey}:s:out`} text={pluralPair(item)} lang="en" className="size-9" />
            </motion.div>
          ) : (
            <TypedField
              ref={inputRef}
              value={text}
              placeholder={pick(PG_UI.typePlural, lang)}
              disabled={locked}
              retry={status === "retry"}
              onChange={update}
              label={pick(PG_UI.typePlural, lang)}
            />
          )}
        </div>
      </div>

      {done ? null : (
        <p className={cn(LANG_FACE[lang], "flex items-center gap-1.5 text-xs font-semibold text-slate-500")}>
          <Keyboard className="size-3.5 shrink-0" aria-hidden />
          {pick(PG_UI.typeExact, lang)}
        </p>
      )}
    </div>
  );
}
