"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Keyboard, ShoppingBasket } from "lucide-react";
import { BN_FACE, EN_FACE, SpeakButton } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { TypedField } from "@/src/features/playground/components/PlaygroundParts";
import { isDone, type GameProps } from "@/src/features/playground/components/games/gameProps";
import { GuideHand } from "@/src/features/playground/components/GuideHand";
import { PG_UI } from "@/src/features/playground/lib/copy";
import { checkTypedPlural, RULE_NOTES } from "@/src/features/playground/lib/plural";
import { bazarLine } from "@/src/features/playground/lib/speech";
import type { AnswerResult, BazarItem, CollectedLine } from "@/src/features/playground/types";
import { cn } from "@/lib/utils";

function evaluate(item: BazarItem, typed: string): AnswerResult {
  const note = RULE_NOTES[item.rule];
  const answer: Bilingual = {
    en: `**${bazarLine(item)}**. ${note.en}`,
    bn: `**${bazarLine(item)}**। ${note.bn}`,
  };
  const verdict = checkTypedPlural({
    typed,
    answers: [item.answer, ...(item.accepted ?? [])],
    singular: item.clue,
    rule: item.rule,
    traps: item.traps,
  });
  return verdict.correct
    ? { correct: true, body: answer, collect: { before: item.before, highlight: item.answer } }
    : { correct: false, hint: verdict.hint, reveal: answer };
}

export function BazarListGame({
  item,
  itemKey,
  lang,
  status,
  attempt,
  onReady,
  onAnswer,
  listSoFar,
  guide = false,
}: GameProps<BazarItem> & { listSoFar: readonly CollectedLine[] }) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const done = isDone(status);
  const locked = status !== "answering";
  const earlier = listSoFar.slice(-3);

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
          "overflow-hidden rounded-3xl border-2 border-b-[5px] bg-amber-50/60 shadow-sm",
          !locked ? "border-amber-300 ring-4 ring-amber-100" : "border-amber-200",
        )}
      >
        <div className="flex items-center gap-2 border-b-2 border-dashed border-amber-200 bg-amber-100/70 px-3.5 py-2 sm:px-5">
          <ShoppingBasket className="size-5 text-amber-700" aria-hidden />
          <p className={cn(LANG_FACE[lang], "text-sm font-black text-amber-800")}>{pick(PG_UI.momsList, lang)}</p>
        </div>

        <ul className="divide-y divide-amber-100 px-3.5 sm:px-5">
          {earlier.map((line, i) => (
            <li key={i} className={cn(EN_FACE, "flex items-center gap-2 py-1.5 text-sm font-semibold text-slate-400 max-sm:hidden")}>
              <CheckCircle2 className="size-4 text-emerald-500" aria-hidden />
              {line.before} {line.highlight}
            </li>
          ))}
          <li className="py-3 sm:py-4">
            <div className="flex items-center gap-2">
              <p className={cn(BN_FACE, "text-xl font-bold text-slate-900 sm:text-2xl")}>{item.bangla}</p>
              <SpeakButton id={`${itemKey}:bn`} text={item.bangla} lang="bn" />
            </div>
            <p className={cn(LANG_FACE[lang], "mt-2 text-[11px] font-black uppercase tracking-wider text-slate-400")}>
              {pick(PG_UI.inEnglish, lang)}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-2">
              <span className={cn(EN_FACE, "text-lg font-bold text-slate-800 sm:text-2xl")}>{item.before}</span>
              {done ? (
                <span
                  className={cn(
                    EN_FACE,
                    "rounded-xl border-2 border-b-4 border-accent bg-accent px-3 py-1 text-lg font-bold text-white sm:text-2xl",
                  )}
                >
                  {item.answer}
                </span>
              ) : (
                <span className="relative inline-flex">
                  <TypedField
                    ref={inputRef}
                    value={text}
                    placeholder={guide ? item.answer : pick(PG_UI.typeWord, lang)}
                    disabled={locked}
                    retry={status === "retry"}
                    onChange={update}
                    label={`${item.before} (${item.clue})`}
                  />
                  {guide && !text && !locked ? <GuideHand /> : null}
                </span>
              )}
              {done ? (
                <SpeakButton id={`${itemKey}:s:tap`} text={bazarLine(item)} lang="en" className="size-9" />
              ) : (
                <span className={cn(EN_FACE, "rounded-full bg-white px-2.5 py-1 text-sm font-bold text-slate-500 ring-1 ring-slate-200")}>
                  ({item.clue})
                </span>
              )}
            </div>
          </li>
        </ul>
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
