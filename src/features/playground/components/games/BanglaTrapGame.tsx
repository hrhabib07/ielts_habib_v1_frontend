"use client";

import { useState } from "react";
import { BN_FACE, SpeakButton } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { StepPill, WordChip, type ChipTone } from "@/src/features/playground/components/PlaygroundParts";
import { isDone, type GameProps } from "@/src/features/playground/components/games/gameProps";
import { PG_UI } from "@/src/features/playground/lib/copy";
import { RULE_HINTS, RULE_NOTES } from "@/src/features/playground/lib/plural";
import { fixedSentence, fixedWord } from "@/src/features/playground/lib/speech";
import type { AnswerResult, BanglaTrapItem } from "@/src/features/playground/types";
import { playThinkAgainEvalSfx, playUiClickSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

function evaluate(item: BanglaTrapItem, fix: string): AnswerResult {
  const note = RULE_NOTES[item.rule];
  const answer: Bilingual = {
    en: `**${fixedSentence(item)}** ${note.en}`,
    bn: `**${fixedSentence(item)}** ${note.bn}`,
  };
  return fix === item.fix ? { correct: true, body: answer } : { correct: false, hint: RULE_HINTS[item.rule], reveal: answer };
}

export function BanglaTrapGame({
  item,
  itemKey,
  lang,
  status,
  attempt,
  onReady,
  onAnswer,
  onMistake,
}: GameProps<BanglaTrapItem> & { onMistake: () => void }) {
  const [found, setFound] = useState(false);
  const [missTap, setMissTap] = useState<{ index: number; tries: number } | null>(null);
  const [choice, setChoice] = useState<{ attempt: number; fix: string } | null>(null);
  const selected = choice?.attempt === attempt ? choice.fix : null;
  const done = isDone(status);
  const locked = status !== "answering";

  const tapWord = (index: number) => {
    if (found || locked) return;
    if (index === item.wrong) {
      setFound(true);
      setMissTap(null);
      void playUiClickSfx();
      return;
    }
    setMissTap((current) => ({ index, tries: (current?.tries ?? 0) + 1 }));
    onMistake();
    void playThinkAgainEvalSfx();
  };

  const chooseFix = (fix: string) => {
    if (!found || locked) return;
    setChoice({ attempt, fix });
    void playUiClickSfx();
    onReady(() => onAnswer(evaluate(item, fix)));
  };

  const wordTone = (index: number): ChipTone => {
    if (index === item.wrong) {
      if (done) return "subject";
      return found ? "wrong" : "idle";
    }
    if (missTap?.index === index && !found) return "wrong";
    return found ? "dim" : "idle";
  };

  const fixTone = (fix: string): ChipTone => {
    if (status === "retry" && fix === selected) return "wrong";
    return fix === selected ? "selected" : "idle";
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <div
        className={cn(
          "rounded-3xl border-2 border-b-[5px] bg-white p-3.5 shadow-sm transition-[border-color,box-shadow] duration-300 sm:p-6",
          !locked ? "border-sky-300 ring-4 ring-sky-100" : "border-slate-200",
        )}
      >
        <div className="flex min-h-9 items-center justify-between gap-2">
          <StepPill
            text={done ? PG_UI.stepDone : found ? PG_UI.pickFix : PG_UI.tapWrong}
            lang={lang}
            tone={done ? "done" : "now"}
          />
          {done ? (
            <SpeakButton id={`${itemKey}:s:tap`} text={fixedSentence(item)} lang="en" className="size-9" />
          ) : null}
        </div>

        <div className="mt-2.5 flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200">
          <p className={cn(BN_FACE, "min-w-0 flex-1 text-lg font-semibold text-emerald-900 sm:text-xl")}>{item.bangla}</p>
          <SpeakButton id={`${itemKey}:bn`} text={item.bangla} lang="bn" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-3 pt-1">
          {item.words.map((word, i) => (
            <WordChip
              key={`${i}-${missTap?.index === i ? missTap.tries : 0}`}
              tone={wordTone(i)}
              disabled={found || locked}
              shakeKey={missTap?.tries}
              className={cn(i === item.wrong && found && !done && "line-through decoration-2")}
              onClick={() => tapWord(i)}
            >
              {i === item.wrong && done ? fixedWord(item) : word}
            </WordChip>
          ))}
        </div>
      </div>

      {missTap && !found ? (
        <p
          className={cn(
            LANG_FACE[lang],
            "rounded-2xl bg-orange-50 px-3.5 py-2 text-sm font-semibold text-orange-800 ring-1 ring-orange-200",
          )}
        >
          {pick(PG_UI.lookAgain, lang)}
        </p>
      ) : null}

      {found && !done ? (
        <div className="flex flex-wrap justify-center gap-2.5">
          {item.fixes.map((fix) => (
            <WordChip key={fix} tone={fixTone(fix)} disabled={locked} shakeKey={attempt} onClick={() => chooseFix(fix)}>
              {fix}
            </WordChip>
          ))}
        </div>
      ) : null}
    </div>
  );
}
