"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BN_FACE, EN_FACE, SpeakButton } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { StepPill, WordChip, type ChipTone } from "@/src/features/playground/components/PlaygroundParts";
import { isDone, type GameProps } from "@/src/features/playground/components/games/gameProps";
import { PG_UI } from "@/src/features/playground/lib/copy";
import { RULE_HINTS, RULE_NOTES } from "@/src/features/playground/lib/plural";
import { countPhrase } from "@/src/features/playground/lib/speech";
import type { AnswerResult, CountBuildItem } from "@/src/features/playground/types";
import { playThinkAgainEvalSfx, playUiClickSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

function evaluate(item: CountBuildItem, form: string): AnswerResult {
  const phrase = countPhrase(item);
  const note = RULE_NOTES[item.rule];
  const answer: Bilingual = {
    en: `**${phrase}**. ${note.en}`,
    bn: `**${phrase}**। ${note.bn}`,
  };
  if (form === item.answer) return { correct: true, body: answer };
  return {
    correct: false,
    hint: item.traps?.find((t) => t.text === form)?.hint ?? RULE_HINTS[item.rule],
    reveal: answer,
  };
}

export function CountBuildGame({
  item,
  itemKey,
  lang,
  status,
  attempt,
  onReady,
  onAnswer,
  onMistake,
  onStep,
  guide = false,
}: GameProps<CountBuildItem> & { onMistake: () => void }) {
  const reduceMotion = useReducedMotion();
  const [numberPicked, setNumberPicked] = useState(false);
  const [wrongNumber, setWrongNumber] = useState<{ value: string; tries: number } | null>(null);
  const [choice, setChoice] = useState<{ attempt: number; form: string } | null>(null);
  const selected = choice?.attempt === attempt ? choice.form : null;
  const done = isDone(status);
  const locked = status !== "answering";
  const guideOn = guide && !locked && selected === null;

  useEffect(() => {
    onStep?.(numberPicked ? 1 : 0);
  }, [numberPicked, onStep]);
  const phrase = countPhrase(item);

  const chooseNumber = (value: string) => {
    if (numberPicked || locked) return;
    if (value === item.numberWord) {
      setNumberPicked(true);
      setWrongNumber(null);
      void playUiClickSfx();
      return;
    }
    setWrongNumber((current) => ({ value, tries: (current?.tries ?? 0) + 1 }));
    onMistake();
    void playThinkAgainEvalSfx();
  };

  const chooseForm = (form: string) => {
    if (!numberPicked || locked) return;
    setChoice({ attempt, form });
    void playUiClickSfx();
    onReady(() => onAnswer(evaluate(item, form)));
  };

  const formTone = (form: string): ChipTone => {
    if (done) return form === item.answer ? "subject" : form === selected ? "wrong" : "dim";
    if (status === "retry" && form === selected) return "wrong";
    return form === selected ? "selected" : "idle";
  };

  const shownWord = done ? item.answer : selected;

  return (
    <div className="space-y-3 sm:space-y-5">
      <div
        className={cn(
          "rounded-3xl border-2 border-b-[5px] bg-white p-3.5 shadow-sm transition-[border-color,box-shadow] duration-300 sm:p-6",
          !locked ? "border-accent/35 ring-4 ring-accent/10" : "border-slate-200",
        )}
      >
        <div className="flex min-h-9 items-center justify-between gap-2">
          <StepPill
            text={done ? PG_UI.stepDone : numberPicked ? PG_UI.pickWord : PG_UI.howMany}
            lang={lang}
            tone={done ? "done" : "now"}
          />
          {done ? <SpeakButton id={`${itemKey}:s:tap`} text={phrase} lang="en" className="size-9" /> : null}
        </div>

        <div
          className="my-3 flex flex-wrap items-center justify-center gap-2 text-4xl sm:my-5 sm:gap-3 sm:text-6xl"
          role="img"
          aria-label={`${item.count} × ${item.emoji}`}
        >
          {Array.from({ length: item.count }, (_, i) => (
            <motion.span
              key={i}
              initial={reduceMotion ? false : { scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 16, delay: i * 0.08 }}
            >
              {item.emoji}
            </motion.span>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span
            className={cn(
              EN_FACE,
              "min-w-[4.5rem] rounded-xl border-2 border-dashed px-3 py-1.5 text-center text-lg font-bold sm:text-xl",
              numberPicked ? "border-solid border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-300 text-slate-300",
            )}
          >
            {numberPicked ? item.numberWord : "?"}
          </span>
          <span
            className={cn(
              EN_FACE,
              "min-w-[6rem] rounded-xl border-2 border-dashed px-3 py-1.5 text-center text-lg font-bold sm:text-xl",
              done
                ? "border-solid border-accent bg-accent text-white"
                : shownWord
                  ? "border-solid border-accent/35 bg-accent/5 text-accent"
                  : "border-slate-300 text-slate-300",
            )}
          >
            {shownWord ?? "?"}
          </span>
        </div>

        {done ? (
          <p className={cn(BN_FACE, "mt-2 text-center text-[15px] text-slate-500 max-sm:hidden")}>{item.meaningBn}</p>
        ) : null}
      </div>

      {numberPicked ? (
        done ? null : (
          <div className="flex flex-wrap justify-center gap-2.5">
            {item.forms.map((form, i) => (
              <WordChip
                key={form}
                tone={formTone(form)}
                disabled={locked}
                shakeKey={attempt}
                nudgeIndex={i}
                guide={guideOn && form === item.answer}
                onClick={() => chooseForm(form)}
              >
                {form}
              </WordChip>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-2.5">
          <div className="flex flex-wrap justify-center gap-2.5">
            {item.numberOptions.map((value, i) => (
              <WordChip
                key={`${value}-${wrongNumber?.value === value ? wrongNumber.tries : 0}`}
                tone={wrongNumber?.value === value ? "wrong" : "idle"}
                shakeKey={wrongNumber?.tries}
                nudgeIndex={i}
                guide={guideOn && value === item.numberWord}
                onClick={() => chooseNumber(value)}
              >
                {value}
              </WordChip>
            ))}
          </div>
          {wrongNumber ? (
            <p
              className={cn(
                LANG_FACE[lang],
                "rounded-2xl bg-orange-50 px-3.5 py-2 text-center text-sm font-semibold text-orange-800 ring-1 ring-orange-200",
              )}
            >
              {pick(PG_UI.countAgain, lang)}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
