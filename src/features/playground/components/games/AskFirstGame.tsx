"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Volume2 } from "lucide-react";
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
import { GuideHand } from "@/src/features/playground/components/GuideHand";
import { useAutoVoice } from "@/src/features/playground/hooks/useAutoVoice";
import { useNudge } from "@/src/features/playground/hooks/useNudge";
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
  emoji: string;
  tone: string;
  badge: string;
}[] = [
  {
    id: "who",
    label: PG_UI.who,
    sub: PG_UI.whoSub,
    emoji: "🙋",
    tone: "border-sky-300 border-b-sky-500 bg-gradient-to-b from-sky-50 to-sky-100/70 hover:from-sky-100",
    badge: "bg-white ring-sky-200",
  },
  {
    id: "what",
    label: PG_UI.what,
    sub: PG_UI.whatSub,
    emoji: "📦",
    tone: "border-amber-300 border-b-amber-500 bg-gradient-to-b from-amber-50 to-amber-100/70 hover:from-amber-100",
    badge: "bg-white ring-amber-200",
  },
];

function KindButton({
  kind,
  index,
  wrong,
  guide,
  lang,
  onClick,
}: {
  kind: (typeof KINDS)[number];
  index: number;
  wrong: boolean;
  guide: boolean;
  lang: LessonLanguage;
  onClick: () => void;
}) {
  const nudgeRef = useNudge<HTMLButtonElement>(!wrong, index);
  return (
    <motion.button
      ref={nudgeRef}
      type="button"
      onClick={onClick}
      animate={wrong ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-2xl border-2 border-b-[6px] px-3 py-3 text-left shadow-md shadow-slate-900/5 transition-[background-color,border-color,translate] hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 sm:gap-3 sm:px-4 sm:py-3.5",
        wrong ? "border-orange-300 border-b-orange-500 bg-orange-50" : kind.tone,
        guide && "ring-4 ring-accent/25",
      )}
    >
      {guide ? <GuideHand placement="left-7 top-1/2 sm:left-9" /> : null}
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm ring-2 sm:size-12 sm:text-3xl",
          kind.badge,
        )}
        aria-hidden
      >
        {kind.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn(lang === "bn" ? BN_FACE : EN_FACE, "block text-lg font-black text-slate-900 sm:text-xl")}>
          {pick(kind.label, lang)}
        </span>
        <span className={cn(LANG_FACE[lang], "block text-xs font-bold text-slate-500")}>{pick(kind.sub, lang)}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-slate-400 max-sm:hidden" aria-hidden />
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
  onStep,
  guide = false,
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

  useEffect(() => {
    onStep?.(kindPicked ? 1 : 0);
  }, [kindPicked, onStep]);

  const guideKind = guide && !kindPicked && !locked;
  const guideTile = guide && kindPicked && !locked && selected === null;

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
            nudgeIndex={i}
            guide={guideTile && i === item.subject}
            tag={done && i === item.subject ? pick(PG_UI.subjectTag, lang) : undefined}
            onClick={() => choose(i)}
          >
            {word}
          </WordChip>
        ))}
      </SentenceCard>

      {kindPicked ? null : (
        <div className="space-y-2.5">
          <div className="flex gap-2.5">
            {KINDS.map((kind, index) => (
              <KindButton
                key={`${kind.id}-${wrongKind?.kind === kind.id ? wrongKind.tries : 0}`}
                kind={kind}
                index={index}
                wrong={wrongKind?.kind === kind.id}
                guide={guideKind && kind.id === item.kind}
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
