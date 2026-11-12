"use client";

import { useState } from "react";
import { MapPin, Target } from "lucide-react";
import { EN_FACE, SpeakButton } from "@/src/features/chat-lesson/components/ChatPrimitives";
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
  BanglaStrip,
  BigChoice,
  BlankSlot,
  GameFrame,
  optionTone,
  PlainWords,
  SlipNote,
  useAttemptChoice,
} from "@/src/features/playground/components/games/mission1/kit";
import { M1_UI } from "@/src/features/playground/lib/mission1Copy";
import { completeSentence, mirrorSentence } from "@/src/features/playground/lib/speech";
import type { CompleteItem, MirrorItem, ObjectPlaceItem, PassBallItem } from "@/src/features/playground/types";
import { playThinkAgainEvalSfx, playUiClickSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

const DONE_PILL: Bilingual = { en: "Done!", bn: "হয়ে গেছে!" };

type Ask = "what" | "whom" | "none";

const ASK_LABEL: Record<Ask, Bilingual> = { what: M1_UI.askWhat, whom: M1_UI.askWhom, none: M1_UI.askNone };

export function PassBallGame({
  item,
  itemKey,
  lang,
  status,
  attempt,
  onReady,
  onAnswer,
  onMistake,
}: GameProps<PassBallItem> & { onMistake: () => void }) {
  const [askDone, setAskDone] = useState(false);
  const [miss, setMiss] = useState<{ ask: Ask; tries: number } | null>(null);
  const [selected, setSelected] = useAttemptChoice<number>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";
  const answerAsk: Ask = item.ask ?? "none";
  const sentence = item.words.join(" ");
  const objectText = item.object === null ? null : (item.words[item.object] ?? "").replace(/[.,!?]+$/, "");
  const body: Bilingual = objectText
    ? { en: `The Object is **${objectText}**. ${item.why.en}`, bn: `Object হলো **${objectText}**। ${item.why.bn}` }
    : { en: `**No Object.** ${item.why.en}`, bn: `**Object নেই।** ${item.why.bn}` };

  const chooseAsk = (ask: Ask) => {
    if (askDone || locked) return;
    if (ask !== answerAsk) {
      setMiss((current) => ({ ask, tries: (current?.tries ?? 0) + 1 }));
      onMistake();
      void playThinkAgainEvalSfx();
      return;
    }
    setAskDone(true);
    setMiss(null);
    void playUiClickSfx();
    if (item.object === null) onReady(() => onAnswer({ correct: true, body }));
  };

  const catchChunk = (index: number) => {
    if (!askDone || item.object === null || locked) return;
    setSelected(index);
    void playUiClickSfx();
    onReady(() =>
      onAnswer(index === item.object ? { correct: true, body } : { correct: false, hint: M1_UI.passCatchHint, reveal: body }),
    );
  };

  const chunkTone = (index: number): ChipTone => {
    if (done) return index === item.object ? "subject" : "dim";
    if (status === "retry" && index === selected) return "wrong";
    if (index === selected) return "selected";
    return askDone && item.object !== null ? "idle" : "dim";
  };

  const chunkTag = (index: number): string | undefined => {
    if (!askDone) return undefined;
    if (index === item.subject) return "Subject";
    if (index === item.verb) return "Verb";
    return done && index === item.object ? "Object" : undefined;
  };

  const askTone = (ask: Ask): ChipTone => {
    if (askDone) return ask === answerAsk ? "subject" : "dim";
    return miss?.ask === ask ? "wrong" : "idle";
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <div
        className={cn(
          "rounded-3xl border-2 border-b-[5px] border-lime-600 bg-gradient-to-b from-lime-400 to-lime-500 p-3.5 shadow-sm sm:p-6",
          !locked && "ring-4 ring-lime-100",
        )}
      >
        <div className="mb-2 flex min-h-9 items-center justify-between gap-2">
          <StepPill
            text={done ? DONE_PILL : askDone ? M1_UI.passStepCatch : M1_UI.passStepAsk}
            lang={lang}
            tone={done ? "done" : "now"}
          />
          <ListenButtons idPrefix={`${itemKey}:s:`} text={sentence} lang={lang} />
        </div>
        <div className="rounded-2xl bg-white/85 p-3 pt-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-5">
            <span className="text-2xl" aria-hidden>
              🏏
            </span>
            {item.words.map((word, i) => (
              <WordChip
                key={i}
                tone={chunkTone(i)}
                tag={chunkTag(i)}
                disabled={!askDone || item.object === null || locked || i === item.subject || i === item.verb}
                shakeKey={attempt}
                onClick={() => catchChunk(i)}
              >
                {word}
              </WordChip>
            ))}
            {done && item.object !== null ? (
              <span className="text-2xl" aria-hidden>
                🧤
              </span>
            ) : null}
          </div>
          <BanglaLine id={`${itemKey}:bn`} text={item.bn} lang={lang} />
        </div>
      </div>

      {miss && !askDone ? <SlipNote text={M1_UI.passAskHint} lang={lang} /> : null}

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {(["what", "whom", "none"] as const).map((ask) => (
          <BigChoice
            key={ask}
            label={pick(ASK_LABEL[ask], lang)}
            tone={askTone(ask)}
            disabled={askDone || locked}
            lang={lang}
            shakeKey={miss?.tries}
            onClick={() => chooseAsk(ask)}
          />
        ))}
      </div>
    </div>
  );
}

export function ObjectPlaceGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<ObjectPlaceItem>) {
  const [selected, setSelected] = useAttemptChoice<ObjectPlaceItem["answer"]>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";
  const focus = (item.words[item.focus] ?? "").replace(/[.,!?]+$/, "");

  const choose = (basket: ObjectPlaceItem["answer"]) => {
    if (locked) return;
    setSelected(basket);
    void playUiClickSfx();
    const kind = item.answer === "object" ? { en: "the Object", bn: "Object" } : { en: "a place", bn: "স্থান" };
    const body: Bilingual = {
      en: `**${focus}** is ${kind.en}. ${item.why.en}`,
      bn: `**${focus}** হলো ${kind.bn}। ${item.why.bn}`,
    };
    onReady(() =>
      onAnswer(basket === item.answer ? { correct: true, body } : { correct: false, hint: M1_UI.placeHint, reveal: body }),
    );
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <SentenceCard itemKey={itemKey} sentence={item.words.join(" ")} bangla={item.bn} lang={lang} active={!locked} settled={done}>
        {item.words.map((word, i) => (
          <WordChip
            key={i}
            tone={i === item.focus ? (done ? "subject" : "lit") : "idle"}
            tag={done && i === item.focus ? (item.answer === "object" ? "Object" : "Place") : undefined}
            disabled
          >
            {word}
          </WordChip>
        ))}
      </SentenceCard>

      <div className="grid grid-cols-2 gap-3">
        <BigChoice
          label={pick(M1_UI.basketObject, lang)}
          sub={M1_UI.basketObjectSub}
          icon={<Target className="size-5" aria-hidden />}
          tone={optionTone<ObjectPlaceItem["answer"]>("object", selected, status, item.answer)}
          disabled={locked}
          lang={lang}
          shakeKey={attempt}
          onClick={() => choose("object")}
          className="min-h-20"
        />
        <BigChoice
          label={pick(M1_UI.basketPlace, lang)}
          sub={M1_UI.basketPlaceSub}
          icon={<MapPin className="size-5" aria-hidden />}
          tone={optionTone<ObjectPlaceItem["answer"]>("place", selected, status, item.answer)}
          disabled={locked}
          lang={lang}
          shakeKey={attempt}
          onClick={() => choose("place")}
          className="min-h-20"
        />
      </div>
    </div>
  );
}

export function MirrorWordsGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<MirrorItem>) {
  const [selected, setSelected] = useAttemptChoice<string>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";

  const choose = (option: string) => {
    if (locked) return;
    setSelected(option);
    void playUiClickSfx();
    const sentence = mirrorSentence(item);
    const body: Bilingual = { en: `**${sentence}** ${item.why.en}`, bn: `**${sentence}** ${item.why.bn}` };
    const hint = item.side === "subject" ? M1_UI.mirrorHintSubject : M1_UI.mirrorHintObject;
    onReady(() => onAnswer(option === item.answer ? { correct: true, body } : { correct: false, hint, reveal: body }));
  };

  const slotTone: ChipTone = done ? "subject" : status === "retry" ? "wrong" : "selected";

  return (
    <div className="space-y-3 sm:space-y-5">
      <GameFrame
        tone="violet"
        active={!locked}
        header={
          <BanglaStrip text={item.bangla}>
            <SpeakButton id={`${itemKey}:bn`} text={item.bangla} lang="bn" />
          </BanglaStrip>
        }
      >
        <div className="flex flex-wrap items-center justify-center gap-2 py-2">
          <PlainWords text={item.before} />
          <span className="flex flex-col items-center gap-1">
            <BlankSlot value={done ? item.answer : selected} tone={slotTone} />
            {done ? (
              <span className={cn(LANG_FACE[lang], "text-[11px] font-black text-accent")}>
                {pick(item.side === "subject" ? M1_UI.mirrorBefore : M1_UI.mirrorAfter, lang)}
              </span>
            ) : null}
          </span>
          <PlainWords text={item.after} />
        </div>
        {done ? (
          <div className="mt-1 flex justify-end">
            <ListenButtons idPrefix={`${itemKey}:s:`} text={mirrorSentence(item)} lang={lang} />
          </div>
        ) : null}
      </GameFrame>

      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
        {item.options.map((option) => (
          <WordChip
            key={option}
            tone={optionTone(option, selected, status, item.answer)}
            disabled={locked}
            shakeKey={attempt}
            onClick={() => choose(option)}
            className="min-w-20 justify-center"
          >
            {option}
          </WordChip>
        ))}
      </div>
    </div>
  );
}

type Decision = "complete" | "needs";

export function CompleteOrNotGame({
  item,
  itemKey,
  lang,
  status,
  attempt,
  onReady,
  onAnswer,
  onMistake,
}: GameProps<CompleteItem> & { onMistake: () => void }) {
  const [decided, setDecided] = useState(false);
  const [miss, setMiss] = useState<{ choice: Decision; tries: number } | null>(null);
  const [selected, setSelected] = useAttemptChoice<string>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";
  const answerDecision: Decision = item.complete ? "complete" : "needs";
  const finished = completeSentence(item);
  const body: Bilingual = { en: `**${finished}** ${item.why.en}`, bn: `**${finished}** ${item.why.bn}` };

  const decide = (choice: Decision) => {
    if (decided || locked) return;
    if (choice !== answerDecision) {
      setMiss((current) => ({ choice, tries: (current?.tries ?? 0) + 1 }));
      onMistake();
      void playThinkAgainEvalSfx();
      return;
    }
    setDecided(true);
    setMiss(null);
    void playUiClickSfx();
    if (item.complete) onReady(() => onAnswer({ correct: true, body }));
  };

  const chooseObject = (option: string) => {
    if (!decided || item.complete || locked) return;
    setSelected(option);
    void playUiClickSfx();
    onReady(() =>
      onAnswer(option === item.answer ? { correct: true, body } : { correct: false, hint: M1_UI.completePickHint, reveal: body }),
    );
  };

  const decisionTone = (choice: Decision): ChipTone => {
    if (decided) return choice === answerDecision ? "subject" : "dim";
    return miss?.choice === choice ? "wrong" : "idle";
  };

  const shownObject = done ? item.answer : selected;

  return (
    <div className="space-y-3 sm:space-y-5">
      <GameFrame
        tone="emerald"
        active={!locked}
        header={
          <>
            <StepPill
              text={done ? DONE_PILL : decided ? M1_UI.completeStepPick : M1_UI.completeStep}
              lang={lang}
              tone={done ? "done" : "now"}
            />
            {done ? <ListenButtons idPrefix={`${itemKey}:s:`} text={finished} lang={lang} /> : null}
          </>
        }
      >
        <div className="flex flex-wrap items-center justify-center gap-2 py-2">
          <span className={cn(EN_FACE, "text-2xl font-black text-slate-900 sm:text-3xl")}>
            {item.start}
            {item.complete && decided ? "." : null}
          </span>
          {!item.complete ? (
            shownObject ? (
              <BlankSlot value={shownObject} tone={done ? "subject" : status === "retry" ? "wrong" : "selected"} />
            ) : (
              <span className={cn(EN_FACE, "text-2xl font-black text-slate-300")}>...</span>
            )
          ) : !decided ? (
            <span className={cn(EN_FACE, "text-2xl font-black text-slate-300")}>...</span>
          ) : null}
        </div>
        <div className="text-center">
          <BanglaLine id={`${itemKey}:bn`} text={item.bn} lang={lang} />
        </div>
      </GameFrame>

      {miss && !decided ? (
        <SlipNote text={item.complete ? M1_UI.completeIsHint : M1_UI.completeNeedsHint} lang={lang} />
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <BigChoice
          label={pick(M1_UI.completeYes, lang)}
          tone={decisionTone("complete")}
          disabled={decided || locked}
          lang={lang}
          shakeKey={miss?.tries}
          onClick={() => decide("complete")}
        />
        <BigChoice
          label={pick(M1_UI.completeNeeds, lang)}
          tone={decisionTone("needs")}
          disabled={decided || locked}
          lang={lang}
          shakeKey={miss?.tries}
          onClick={() => decide("needs")}
        />
      </div>

      {decided && !item.complete && item.options ? (
        <div className="flex flex-wrap justify-center gap-2.5">
          {item.options.map((option) => (
            <WordChip
              key={option}
              tone={optionTone(option, selected, status, item.answer ?? "")}
              disabled={locked}
              shakeKey={attempt}
              onClick={() => chooseObject(option)}
            >
              {option}
            </WordChip>
          ))}
        </div>
      ) : null}
    </div>
  );
}
