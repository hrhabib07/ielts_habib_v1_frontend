"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { BN_FACE, EN_FACE, SpeakButton } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import {
  BanglaLine,
  ListenButtons,
  SentenceCard,
  StepPill,
  WordChip,
} from "@/src/features/playground/components/PlaygroundParts";
import { isDone, type GameProps } from "@/src/features/playground/components/games/gameProps";
import {
  BigChoice,
  GameFrame,
  optionTone,
  shuffled,
  SlipNote,
  useAttemptChoice,
} from "@/src/features/playground/components/games/mission1/kit";
import { M1_UI, PERSON_KEYS, PERSON_LABEL, PERSON_SUB } from "@/src/features/playground/lib/mission1Copy";
import { swappedSentence, teamLine, teamPhrase } from "@/src/features/playground/lib/speech";
import type {
  AnswerResult,
  GroupChatItem,
  NameSwapItem,
  PersonKey,
  RespectItem,
  TeamUpItem,
} from "@/src/features/playground/types";
import { playThinkAgainEvalSfx, playUiClickSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

function withAnswer(answer: string, why: Bilingual): Bilingual {
  return { en: `**${answer}**. ${why.en}`, bn: `**${answer}**। ${why.bn}` };
}

function judge(correct: boolean, body: Bilingual, hint: Bilingual): AnswerResult {
  return correct ? { correct: true, body } : { correct: false, hint, reveal: body };
}

export function GroupChatGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<GroupChatItem>) {
  const [selected, setSelected] = useAttemptChoice<PersonKey>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";
  const sentence = item.words.join(" ");

  const choose = (key: PersonKey) => {
    if (locked) return;
    setSelected(key);
    void playUiClickSfx();
    const body = withAnswer(PERSON_LABEL[item.answer].en, item.why);
    onReady(() => onAnswer(judge(key === item.answer, body, item.trap ?? M1_UI.personHint)));
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <div
        className={cn(
          "mx-auto max-w-md overflow-hidden rounded-[2rem] border-[6px] border-slate-800 bg-slate-100 shadow-lg transition-shadow",
          !locked && "ring-4 ring-sky-100",
        )}
      >
        <div className="flex items-center gap-2.5 bg-emerald-600 px-4 py-2.5 text-white">
          <span className={cn(EN_FACE, "flex size-9 items-center justify-center rounded-full bg-white/25 text-base font-black")}>
            {item.sender.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn(EN_FACE, "truncate text-sm font-black")}>{item.sender}</p>
            <p className={cn(LANG_FACE[lang], "truncate text-xs font-semibold text-emerald-100")}>
              {pick(M1_UI.to(item.to), lang)}
            </p>
          </div>
          <ListenButtons idPrefix={`${itemKey}:s:`} text={sentence} lang={lang} />
        </div>
        <div className="px-3 py-4 sm:px-4">
          <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 shadow-sm">
            <p className={cn(EN_FACE, "text-[11px] font-black text-emerald-700")}>{item.sender}</p>
            <p className={cn(EN_FACE, "mt-0.5 text-lg font-semibold leading-relaxed text-slate-900 sm:text-xl")}>
              {item.words.map((word, i) => (
                <span key={i}>
                  {i > 0 ? " " : null}
                  {i === item.focus ? (
                    <mark
                      className={cn(
                        "rounded-lg px-1.5 py-0.5 font-black",
                        done ? "bg-sky-500 text-white" : "bg-amber-200 text-amber-950",
                      )}
                    >
                      {word}
                    </mark>
                  ) : (
                    word
                  )}
                </span>
              ))}
            </p>
          </div>
          <BanglaLine id={`${itemKey}:bn`} text={item.bn} lang={lang} />
        </div>
      </div>

      <p className={cn(LANG_FACE[lang], "text-center text-sm font-bold text-slate-500")}>{pick(M1_UI.whichPerson, lang)}</p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {PERSON_KEYS.map((key) => (
          <BigChoice
            key={key}
            label={PERSON_LABEL[key].en}
            sub={PERSON_SUB[key]}
            tone={optionTone(key, selected, status, item.answer)}
            disabled={locked}
            lang={lang}
            shakeKey={attempt}
            onClick={() => choose(key)}
          />
        ))}
      </div>
    </div>
  );
}

export function NameSwapGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<NameSwapItem>) {
  const reduceMotion = useReducedMotion();
  const [options] = useState(() => shuffled(item.options));
  const [selected, setSelected] = useAttemptChoice<string>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";

  const choose = (option: string) => {
    if (locked) return;
    setSelected(option);
    void playUiClickSfx();
    const body: Bilingual = {
      en: `**${swappedSentence(item)}** ${item.why.en}`,
      bn: `**${swappedSentence(item)}** ${item.why.bn}`,
    };
    onReady(() => onAnswer(judge(option === item.answer, body, item.trap ?? M1_UI.swapHint)));
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <SentenceCard
        itemKey={itemKey}
        sentence={done ? swappedSentence(item) : item.words.join(" ")}
        bangla={item.bn}
        lang={lang}
        active={!locked}
        settled={done}
      >
        {item.words.map((word, i) =>
          i === item.focus ? (
            <motion.span
              key={done ? "swapped" : "original"}
              initial={done && !reduceMotion ? { rotateX: 90, opacity: 0 } : false}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <WordChip tone={done ? "subject" : "lit"} disabled>
                {done ? item.answer : word}
              </WordChip>
            </motion.span>
          ) : (
            <WordChip key={i} tone={done ? "dim" : "idle"} disabled>
              {word}
            </WordChip>
          ),
        )}
      </SentenceCard>

      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
        {options.map((option) => (
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

export function RespectTrapGame({ item, itemKey, lang, status, attempt, onReady, onAnswer }: GameProps<RespectItem>) {
  const [selected, setSelected] = useAttemptChoice<string>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";

  const choose = (option: string) => {
    if (locked) return;
    setSelected(option);
    void playUiClickSfx();
    const body: Bilingual = {
      en: `**${item.en}** ${item.why.en}`,
      bn: `**${item.en}** ${item.why.bn}`,
    };
    const hint = item.trap?.pick === option ? item.trap.hint : M1_UI.respectHint;
    onReady(() => onAnswer(judge(option === item.answer, body, hint)));
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <GameFrame tone="rose" active={!locked}>
        <div className="flex items-start gap-3">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-rose-100" aria-hidden>
            {item.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn(LANG_FACE[lang], "text-xs font-black text-rose-700")}>{pick(item.speaker, lang)}</p>
            <div className="mt-1 flex items-center gap-2 rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 shadow-sm">
              <p className={cn(BN_FACE, "min-w-0 flex-1 text-xl font-semibold leading-relaxed text-slate-900")}>{item.bangla}</p>
              <SpeakButton id={`${itemKey}:bn`} text={item.bangla} lang="bn" />
            </div>
          </div>
        </div>
        {done ? (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-sky-500 px-3.5 py-2.5 text-white">
            <p className={cn(EN_FACE, "min-w-0 flex-1 text-lg font-black sm:text-xl")}>{item.en}</p>
            <SpeakButton id={`${itemKey}:s:tap`} text={item.en} lang="en" className="size-9 text-white" />
          </div>
        ) : null}
      </GameFrame>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {item.options.map((option) => (
          <BigChoice
            key={option}
            label={option}
            tone={optionTone(option, selected, status, item.answer)}
            disabled={locked}
            lang={lang}
            shakeKey={attempt}
            onClick={() => choose(option)}
          />
        ))}
      </div>
    </div>
  );
}

export function TeamUpGame({
  item,
  itemKey,
  lang,
  status,
  attempt,
  onReady,
  onAnswer,
  onMistake,
}: GameProps<TeamUpItem> & { onMistake: () => void }) {
  const [personDone, setPersonDone] = useState(false);
  const [miss, setMiss] = useState<{ key: PersonKey; tries: number } | null>(null);
  const [selected, setSelected] = useAttemptChoice<TeamUpItem["pronoun"]>(attempt);
  const done = isDone(status);
  const locked = status !== "answering";

  const choosePerson = (key: PersonKey) => {
    if (personDone || locked) return;
    if (key === item.person) {
      setPersonDone(true);
      setMiss(null);
      void playUiClickSfx();
      return;
    }
    setMiss((current) => ({ key, tries: (current?.tries ?? 0) + 1 }));
    onMistake();
    void playThinkAgainEvalSfx();
  };

  const choosePronoun = (pronoun: TeamUpItem["pronoun"]) => {
    if (!personDone || locked) return;
    setSelected(pronoun);
    void playUiClickSfx();
    const body: Bilingual = {
      en: `**${teamLine(item)}** ${item.why.en}`,
      bn: `**${teamLine(item)}** ${item.why.bn}`,
    };
    onReady(() => onAnswer(judge(pronoun === item.pronoun, body, M1_UI.teamRule)));
  };

  const personTone = (key: PersonKey) => {
    if (personDone) return key === item.person ? "subject" : "dim";
    return miss?.key === key ? "wrong" : "idle";
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <GameFrame
        tone="violet"
        active={!locked}
        header={
          <>
            <StepPill
              text={done ? { en: "Done!", bn: "হয়ে গেছে!" } : personDone ? M1_UI.teamStepWord : M1_UI.teamStepPerson}
              lang={lang}
              tone={done ? "done" : "now"}
            />
            <ListenButtons idPrefix={`${itemKey}:s:`} text={teamPhrase(item)} lang={lang} />
          </>
        }
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          {item.members.map((member, i) => (
            <span key={member} className="flex items-center gap-2">
              {i > 0 ? <Plus className="size-4 text-violet-400" aria-hidden /> : null}
              <span className={cn(EN_FACE, "rounded-2xl border-2 border-b-4 border-violet-200 bg-white px-3 py-1.5 text-lg font-black text-slate-800 sm:text-xl")}>
                {member}
              </span>
            </span>
          ))}
          <ArrowRight className="mx-1 size-5 text-violet-400" aria-hidden />
          <span
            className={cn(
              EN_FACE,
              "flex min-w-16 items-center justify-center rounded-full border-2 border-b-4 px-4 py-1.5 text-lg font-black sm:text-xl",
              done ? "border-sky-600 bg-sky-500 text-white" : "border-dashed border-violet-300 bg-violet-50 text-violet-300",
            )}
          >
            {done ? item.pronoun : "?"}
          </span>
        </div>
        <BanglaLine id={`${itemKey}:bn`} text={item.bn} lang={lang} />
      </GameFrame>

      {miss && !personDone ? <SlipNote text={M1_UI.teamRule} lang={lang} /> : null}

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {PERSON_KEYS.map((key) => (
          <BigChoice
            key={key}
            label={PERSON_LABEL[key].en}
            sub={PERSON_SUB[key]}
            tone={personTone(key)}
            disabled={personDone || locked}
            lang={lang}
            shakeKey={miss?.tries}
            onClick={() => choosePerson(key)}
          />
        ))}
      </div>

      {personDone ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {(["We", "You", "They"] as const).map((pronoun) => (
            <BigChoice
              key={pronoun}
              label={pronoun}
              tone={optionTone(pronoun, selected, status, item.pronoun)}
              disabled={locked}
              lang={lang}
              shakeKey={attempt}
              onClick={() => choosePronoun(pronoun)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
