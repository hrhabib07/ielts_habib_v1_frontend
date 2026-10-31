"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Box, UserRound, Volume2, type LucideIcon } from "lucide-react";
import {
  BN_FACE,
  EN_FACE,
} from "@/src/features/chat-lesson/components/ChatPrimitives";
import { useLessonSpeech } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import {
  LANG_FACE,
  pick,
  type LessonLanguage,
} from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import {
  chunkAt,
  FeedbackText,
  SentenceCard,
  StepPill,
  useActiveWord,
  WordChip,
  type ChipTone,
} from "@/src/features/playground/components/PlaygroundParts";
import {
  isDone,
  type GameProps,
} from "@/src/features/playground/components/games/gameProps";
import { useAutoVoice } from "@/src/features/playground/hooks/useAutoVoice";
import { PG_UI } from "@/src/features/playground/lib/copy";
import {
  evaluateAskFirst,
  sentenceOf,
} from "@/src/features/playground/lib/evaluate";
import type { AskFirstItem } from "@/src/features/playground/types";
import {
  playThinkAgainEvalSfx,
  playUiClickSfx,
} from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

const KINDS: {
  id: AskFirstItem["kind"];
  label: Bilingual;
  sub: Bilingual;
  icon: LucideIcon;
}[] = [
  { id: "who", label: PG_UI.who, sub: PG_UI.whoSub, icon: UserRound },
  { id: "what", label: PG_UI.what, sub: PG_UI.whatSub, icon: Box },
];

function KindButton({
  label,
  sub,
  icon: Icon,
  wrong,
  lang,
  onClick,
}: {
  label: Bilingual;
  sub: Bilingual;
  icon: LucideIcon;
  wrong: boolean;
  lang: LessonLanguage;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={wrong ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border-2 border-b-4 px-3 py-2.5 text-left transition-colors active:translate-y-0.5 active:border-b-2 sm:gap-3 sm:px-4 sm:py-3",
        wrong
          ? "border-orange-300 border-b-orange-400 bg-orange-50"
          : "border-slate-200 border-b-slate-300 bg-white hover:border-sky-300 hover:bg-sky-50",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 sm:size-10">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            lang === "bn" ? BN_FACE : EN_FACE,
            "block text-base font-black text-slate-800 sm:text-lg",
          )}
        >
          {pick(label, lang)}
        </span>
        <span
          className={cn(
            LANG_FACE[lang],
            "block text-xs font-semibold text-slate-500",
          )}
        >
          {pick(sub, lang)}
        </span>
      </span>
    </motion.button>
  );
}

export function AskFirstGame({
  item,
  itemKey,
  lang,
  status,
  attempt,
  onReady,
  onAnswer,
  onMistake,
}: GameProps<AskFirstItem> & { onMistake: () => void }) {
  const autoVoice = useAutoVoice();
  const { speak, canSpeak, speakingId } = useLessonSpeech();
  const [kindPicked, setKindPicked] = useState(false);
  const [wrongKind, setWrongKind] = useState<{
    kind: AskFirstItem["kind"];
    tries: number;
  } | null>(null);
  const [choice, setChoice] = useState<{
    attempt: number;
    index: number;
  } | null>(null);
  const selected = choice?.attempt === attempt ? choice.index : null;
  const done = isDone(status);
  const locked = status !== "answering";
  const spoken = chunkAt(item.words, useActiveWord(`${itemKey}:s:`));
  const questionId = `${itemKey}:q`;

  const chooseKind = (kind: AskFirstItem["kind"]) => {
    if (kindPicked || locked) return;
    if (kind === item.kind) {
      setKindPicked(true);
      setWrongKind(null);
      void playUiClickSfx();
      if (autoVoice) speak(questionId, item.question.en, "en");
      return;
    }
    setWrongKind((current) => ({ kind, tries: (current?.tries ?? 0) + 1 }));
    onMistake();
    void playThinkAgainEvalSfx();
  };

  const choose = (index: number) => {
    if (!kindPicked || locked) return;
    setChoice({ attempt, index });
    void playUiClickSfx();
    onReady(() => onAnswer(evaluateAskFirst(item, index)));
  };

  const toneFor = (index: number): ChipTone => {
    if (done)
      return index === item.subject
        ? "subject"
        : index === selected
          ? "wrong"
          : "dim";
    if (status === "retry" && index === selected) return "wrong";
    if (!kindPicked) return "dim";
    return index === selected ? "selected" : "idle";
  };

  const header = !kindPicked ? (
    <StepPill text={PG_UI.pickQuestion} lang={lang} tone="now" />
  ) : done ? (
    <StepPill text={PG_UI.stepDone} lang={lang} tone="done" />
  ) : (
    <StepPill text={PG_UI.tapSubject} lang={lang} tone="now" />
  );

  const banner = kindPicked ? (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2.5 flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200"
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            EN_FACE,
            "text-base font-black leading-snug text-emerald-900 sm:text-lg",
          )}
        >
          {item.question.en}
          {lang === "bn" ? (
            <span
              className={cn(
                BN_FACE,
                "ml-1.5 text-sm font-semibold text-emerald-800/80",
              )}
            >
              ({item.question.bn})
            </span>
          ) : null}
        </p>
        {done ? null : (
          <p
            className={cn(
              LANG_FACE[lang],
              "text-xs font-semibold text-emerald-700",
            )}
          >
            {pick(PG_UI.answerIsSubject, lang)}
          </p>
        )}
      </div>
      {canSpeak(item.question.en, "en") ? (
        <button
          type="button"
          onClick={() => speak(`${questionId}:tap`, item.question.en, "en")}
          aria-label={pick(PG_UI.listen, lang)}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
            speakingId?.startsWith(questionId)
              ? "bg-emerald-500 text-white"
              : "text-emerald-700 hover:bg-emerald-100",
          )}
        >
          <Volume2 className="size-4" aria-hidden />
        </button>
      ) : null}
    </motion.div>
  ) : null;

  return (
    <div className="space-y-3 sm:space-y-5">
      <SentenceCard
        itemKey={itemKey}
        sentence={sentenceOf(item.words)}
        bangla={item.meaningBn}
        lang={lang}
        header={header}
        banner={banner}
        active={kindPicked && !locked}
        settled={status !== "answering"}
      >
        {item.words.map((word, i) => (
          <WordChip
            key={i}
            tone={toneFor(i)}
            spoken={spoken === i}
            disabled={!kindPicked || locked}
            shakeKey={attempt}
            tag={
              done && i === item.subject
                ? pick(PG_UI.subjectTag, lang)
                : undefined
            }
            onClick={() => choose(i)}
          >
            {word}
          </WordChip>
        ))}
      </SentenceCard>

      {kindPicked ? null : (
        <div className="space-y-2.5">
          <div className="flex gap-2.5">
            {KINDS.map((kind) => (
              <KindButton
                key={`${kind.id}-${wrongKind?.kind === kind.id ? wrongKind.tries : 0}`}
                label={kind.label}
                sub={kind.sub}
                icon={kind.icon}
                wrong={wrongKind?.kind === kind.id}
                lang={lang}
                onClick={() => chooseKind(kind.id)}
              />
            ))}
          </div>
          {wrongKind ? (
            <motion.div
              key={wrongKind.tries}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-orange-50 px-3.5 py-2.5 ring-1 ring-orange-200"
            >
              <FeedbackText
                text={item.kindWhy}
                lang={lang}
                className="text-sm font-semibold text-orange-800 sm:text-[15px]"
              />
            </motion.div>
          ) : null}
        </div>
      )}
    </div>
  );
}
