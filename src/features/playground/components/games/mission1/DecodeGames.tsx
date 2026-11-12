"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, LockOpen } from "lucide-react";
import { EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { normalizeTyped } from "@/src/features/chat-lesson/lib/typedAnswer";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import {
  BanglaLine,
  ListenButtons,
  SentenceCard,
  StepPill,
  WordChip,
  type ChipTone,
} from "@/src/features/playground/components/PlaygroundParts";
import { isDone, type GameProps } from "@/src/features/playground/components/games/gameProps";
import {
  BigChoice,
  GameFrame,
  optionTone,
  SlipNote,
  useAttemptChoice,
} from "@/src/features/playground/components/games/mission1/kit";
import {
  codeLabel,
  M1_UI,
  NUMBER_KEYS,
  NUMBER_LABEL,
  NUMBER_SUB,
  PERSON_KEYS,
  PERSON_LABEL,
  PERSON_SHORT,
} from "@/src/features/playground/lib/mission1Copy";
import { buildLine } from "@/src/features/playground/lib/speech";
import type {
  BuildOrderItem,
  CodeLockItem,
  NumberKey,
  OddOneOutItem,
  PersonKey,
  SixBoxItem,
} from "@/src/features/playground/types";
import { playThinkAgainEvalSfx, playUiClickSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

const DONE_PILL: Bilingual = { en: "Done!", bn: "হয়ে গেছে!" };

function decodeBody(subject: string, number: NumberKey, person: PersonKey, why: Bilingual): Bilingual {
  const code = codeLabel(number, person);
  return { en: `**${subject}**: ${code}. ${why.en}`, bn: `**${subject}**: ${code}। ${why.bn}` };
}

function ContextTag({ text, lang }: { text: Bilingual; lang: "en" | "bn" }) {
  return (
    <span className={cn(LANG_FACE[lang], "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800")}>
      {pick(text, lang)}
    </span>
  );
}

type Box = `${NumberKey}:${PersonKey}`;

export function SixBoxGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<SixBoxItem>) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useAttemptChoice<Box>(attempt);
  const locked = status !== "answering";
  const answer: Box = `${item.number}:${item.person}`;

  const choose = (box: Box) => {
    if (locked) return;
    setSelected(box);
    void playUiClickSfx();
    const body = decodeBody(item.card, item.number, item.person, item.why);
    onReady(() =>
      onAnswer(box === answer ? { correct: true, body } : { correct: false, hint: M1_UI.sixBoxHint, reveal: body }),
    );
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <GameFrame
        tone="indigo"
        active={!locked}
        header={
          <>
            {item.context ? <ContextTag text={item.context} lang={lang} /> : <span />}
            <ListenButtons idPrefix={`${itemKey}:s:`} text={item.card} lang={lang} />
          </>
        }
      >
        <motion.div
          className="flex justify-center"
          initial={reduceMotion ? false : { x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <span className={cn(EN_FACE, "rounded-2xl border-2 border-b-[5px] border-accent/35 bg-white px-5 py-2.5 text-2xl font-black text-slate-900 shadow-sm sm:text-3xl")}>
            {item.card}
          </span>
        </motion.div>
        <div className="text-center">
          <BanglaLine id={`${itemKey}:bn`} text={item.bn} lang={lang} />
        </div>
      </GameFrame>

      <div className="grid grid-cols-[auto_1fr_1fr_1fr] items-stretch gap-1.5 sm:gap-2.5">
        <span />
        {PERSON_KEYS.map((person) => (
          <span key={person} className={cn(EN_FACE, "text-center text-[11px] font-black uppercase tracking-wider text-slate-400 sm:text-xs")}>
            {PERSON_SHORT[person]}
          </span>
        ))}
        {NUMBER_KEYS.map((number) => (
          <div key={number} className="contents">
            <span className="flex flex-col items-end justify-center pr-1">
              <span className={cn(EN_FACE, "text-xs font-black text-slate-600 sm:text-sm")}>{NUMBER_LABEL[number]}</span>
              <span className={cn(LANG_FACE[lang], "text-[10.5px] font-semibold text-slate-400")}>{pick(NUMBER_SUB[number], lang)}</span>
            </span>
            {PERSON_KEYS.map((person) => {
              const box: Box = `${number}:${person}`;
              return (
                <BigChoice
                  key={box}
                  label={PERSON_SHORT[person]}
                  sub={{ en: NUMBER_LABEL[number], bn: NUMBER_LABEL[number] }}
                  tone={optionTone(box, selected, status, answer)}
                  disabled={locked}
                  lang={lang}
                  shakeKey={attempt}
                  onClick={() => choose(box)}
                  className="min-h-16 px-1 text-sm"
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function sameSet(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((value) => b.includes(value));
}

export function CodeLockGame({
  item,
  itemKey,
  lang,
  status,
  attempt,
  onReady,
  onAnswer,
  onMistake,
}: GameProps<CodeLockItem> & { onMistake: () => void }) {
  const [picked, setPicked] = useState<number[]>([]);
  const [found, setFound] = useState(false);
  const [slip, setSlip] = useState<{ text: Bilingual; tries: number } | null>(null);
  const [wheels, setWheels] = useState<{ attempt: number; number: NumberKey | null; person: PersonKey | null }>({
    attempt,
    number: null,
    person: null,
  });
  const done = isDone(status);
  const locked = status !== "answering";
  const current = wheels.attempt === attempt ? wheels : { attempt, number: null, person: null };
  const sentence = item.words.join(" ");
  const subjectText = item.subject.map((i) => item.words[i] ?? "").join(" ").replace(/[.,!?]+$/, "");

  const toggle = (index: number) => {
    if (found || locked) return;
    void playUiClickSfx();
    setPicked((list) => (list.includes(index) ? list.filter((i) => i !== index) : [...list, index]));
  };

  const confirm = () => {
    if (found || locked || picked.length === 0) return;
    if (sameSet(picked, item.subject)) {
      setFound(true);
      setSlip(null);
      void playUiClickSfx();
      return;
    }
    const inside = picked.every((i) => item.subject.includes(i));
    const covers = item.subject.every((i) => picked.includes(i));
    const text = inside ? M1_UI.lockTooShort : covers ? M1_UI.lockTooLong : M1_UI.lockWrongPart;
    setSlip((s) => ({ text, tries: (s?.tries ?? 0) + 1 }));
    onMistake();
    void playThinkAgainEvalSfx();
  };

  const setWheel = (next: { number?: NumberKey; person?: PersonKey }) => {
    if (!found || locked) return;
    void playUiClickSfx();
    const merged = { attempt, number: next.number ?? current.number, person: next.person ?? current.person };
    setWheels(merged);
    if (merged.number && merged.person) {
      const { number, person } = merged;
      const body = decodeBody(subjectText, item.number, item.person, item.why);
      onReady(() =>
        onAnswer(
          number === item.number && person === item.person
            ? { correct: true, body }
            : { correct: false, hint: M1_UI.sixBoxHint, reveal: body },
        ),
      );
    }
  };

  const chunkTone = (index: number): ChipTone => {
    const inSubject = item.subject.includes(index);
    if (found) return inSubject ? "subject" : "dim";
    return picked.includes(index) ? "selected" : "idle";
  };

  const wheelTone = <T,>(value: T, chosen: T | null, answer: T): ChipTone => {
    if (done) return value === answer ? "subject" : "dim";
    if (status === "retry" && value === chosen) return "wrong";
    return value === chosen ? "selected" : "idle";
  };

  const LockIcon = done && status === "correct" ? LockOpen : Lock;

  return (
    <div className="space-y-3 sm:space-y-5">
      <SentenceCard
        itemKey={itemKey}
        sentence={sentence}
        bangla={item.bn}
        lang={lang}
        active={!locked}
        settled={done}
        header={
          <span className="flex items-center gap-2">
            <span className={cn("flex size-8 items-center justify-center rounded-xl", done ? "bg-amber-400 text-white" : "bg-slate-800 text-amber-300")}>
              <LockIcon className="size-4" aria-hidden />
            </span>
            <StepPill text={done ? DONE_PILL : found ? M1_UI.lockStepWheels : M1_UI.lockStepSubject} lang={lang} tone={done ? "done" : "now"} />
          </span>
        }
        banner={item.context ? <div className="mt-2"><ContextTag text={item.context} lang={lang} /></div> : undefined}
      >
        {item.words.map((word, i) => (
          <WordChip
            key={i}
            tone={chunkTone(i)}
            disabled={found || locked}
            shakeKey={slip?.tries}
            onClick={() => toggle(i)}
          >
            {word}
          </WordChip>
        ))}
      </SentenceCard>

      {slip && !found ? <SlipNote text={slip.text} lang={lang} /> : null}

      {!found ? (
        <button
          type="button"
          onClick={confirm}
          disabled={picked.length === 0 || locked}
          className={cn(
            LANG_FACE[lang],
            "mx-auto flex h-11 items-center justify-center rounded-2xl border-b-4 border-slate-900 bg-slate-800 px-5 text-sm font-extrabold text-white transition-all enabled:active:translate-y-0.5 enabled:active:border-b-2 disabled:opacity-40",
          )}
        >
          {pick(M1_UI.lockConfirm, lang)}
        </button>
      ) : (
        <div className="space-y-2.5 rounded-3xl bg-slate-800 p-3 sm:p-4">
          <div className="grid grid-cols-[4.5rem_1fr_1fr] items-center gap-2">
            <span className={cn(LANG_FACE[lang], "text-xs font-black uppercase tracking-wider text-amber-300")}>
              {pick(M1_UI.numberWheel, lang)}
            </span>
            {NUMBER_KEYS.map((number) => (
              <WordChip
                key={number}
                tone={wheelTone(number, current.number, item.number)}
                disabled={locked}
                onClick={() => setWheel({ number })}
                className="justify-center text-sm sm:text-base"
              >
                {NUMBER_LABEL[number]}
              </WordChip>
            ))}
          </div>
          <div className="grid grid-cols-[4.5rem_1fr_1fr_1fr] items-center gap-2">
            <span className={cn(LANG_FACE[lang], "text-xs font-black uppercase tracking-wider text-amber-300")}>
              {pick(M1_UI.personWheel, lang)}
            </span>
            {PERSON_KEYS.map((person) => (
              <WordChip
                key={person}
                tone={wheelTone(person, current.person, item.person)}
                disabled={locked}
                onClick={() => setWheel({ person })}
                className="justify-center text-sm sm:text-base"
              >
                {PERSON_SHORT[person]}
              </WordChip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function OddOneOutGame({ item, lang, status, attempt, onReady, onAnswer }: GameProps<OddOneOutItem>) {
  const [selected, setSelected] = useAttemptChoice<number>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";
  const odd = item.cards[item.odd] ?? "";

  const choose = (index: number) => {
    if (locked) return;
    setSelected(index);
    void playUiClickSfx();
    const body: Bilingual = { en: `**${odd}** ${item.why.en}`, bn: `**${odd}** ${item.why.bn}` };
    onReady(() =>
      onAnswer(index === item.odd ? { correct: true, body } : { correct: false, hint: M1_UI.oddHint, reveal: body }),
    );
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <GameFrame tone="teal" active={!locked}>
        <p className={cn(LANG_FACE[lang], "mb-3 text-center text-sm font-bold text-teal-800")}>{pick(M1_UI.oddPick, lang)}</p>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {item.cards.map((card, i) => {
            const code = item.codes[i] ?? "";
            return (
              <BigChoice
                key={card}
                label={card}
                sub={done ? { en: code, bn: code } : undefined}
                tone={optionTone(i, selected, status, item.odd)}
                disabled={locked}
                lang={lang}
                shakeKey={attempt}
                onClick={() => choose(i)}
                className="min-h-20"
              />
            );
          })}
        </div>
      </GameFrame>
    </div>
  );
}

export function BuildOrderGame({ item, itemKey, lang, status, onReady, onAnswer }: GameProps<BuildOrderItem>) {
  const [built, setBuilt] = useState<number[]>([]);
  const done = isDone(status);
  const locked = status !== "answering";
  const code = `${NUMBER_LABEL[item.number]} · ${PERSON_LABEL[item.person].en}`;
  const builtText = (list: number[]) => list.map((i) => item.tiles[i] ?? "").join(" ");

  const update = (next: number[]) => {
    if (locked) return;
    void playUiClickSfx();
    setBuilt(next);
    if (next.length === 0) {
      onReady(null);
      return;
    }
    const text = builtText(next);
    const correct = item.accepted.some((answer) => normalizeTyped(answer) === normalizeTyped(text));
    const answer = correct ? text : (item.accepted[0] ?? "");
    const body: Bilingual = { en: `**${answer}** is ${code}.`, bn: `**${answer}** হলো ${code}।` };
    onReady(() => onAnswer(correct ? { correct: true, body } : { correct: false, hint: item.hint, reveal: body }));
  };

  const shown = done && status === "revealed" ? (item.accepted[0] ?? "") : builtText(built);

  return (
    <div className="space-y-3 sm:space-y-5">
      <GameFrame
        tone="amber"
        active={!locked}
        header={
          <>
            <span className={cn(EN_FACE, "rounded-xl bg-slate-800 px-3 py-1.5 text-sm font-black text-amber-300 sm:text-base")}>{code}</span>
            {done ? <ListenButtons idPrefix={`${itemKey}:s:`} text={buildLine(item)} lang={lang} /> : null}
          </>
        }
      >
        {item.context ? (
          <div className="mb-2">
            <ContextTag text={item.context} lang={lang} />
          </div>
        ) : null}
        <div className="flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-amber-300 bg-white/70 p-2.5">
          {built.length === 0 && !done ? (
            <span className={cn(LANG_FACE[lang], "px-1 text-sm font-semibold text-slate-400")}>{pick(M1_UI.buildEmpty, lang)}</span>
          ) : done ? (
            <span className={cn(EN_FACE, "rounded-xl bg-accent px-3 py-1.5 text-xl font-black text-white")}>{shown}</span>
          ) : (
            built.map((tileIndex, position) => (
              <WordChip
                key={`${tileIndex}-${position}`}
                tone={status === "retry" ? "wrong" : "selected"}
                disabled={locked}
                onClick={() => update(built.filter((_, p) => p !== position))}
              >
                {item.tiles[tileIndex]}
              </WordChip>
            ))
          )}
          <span className={cn(EN_FACE, "text-lg font-bold text-slate-500 sm:text-xl")}>{M1_UI.canHelp}</span>
        </div>
      </GameFrame>

      {done ? null : (
        <div className="flex flex-wrap justify-center gap-2.5">
          {item.tiles.map((tile, i) => (
            <WordChip key={i} tone={built.includes(i) ? "dim" : "idle"} disabled={locked || built.includes(i)} onClick={() => update([...built, i])}>
              {tile}
            </WordChip>
          ))}
        </div>
      )}
    </div>
  );
}
