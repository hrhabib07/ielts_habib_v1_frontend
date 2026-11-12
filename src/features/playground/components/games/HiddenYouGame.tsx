"use client";

import { useState } from "react";
import {
  GraduationCap,
  Heart,
  Megaphone,
  Signpost,
  Smartphone,
  Stethoscope,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick } from "@/src/features/chat-lesson/lib/uiCopy";
import {
  chunkAt,
  SentenceCard,
  useActiveWord,
  WordChip,
  type ChipTone,
} from "@/src/features/playground/components/PlaygroundParts";
import { isDone, type GameProps } from "@/src/features/playground/components/games/gameProps";
import { PG_UI } from "@/src/features/playground/lib/copy";
import {
  evaluateHiddenYou,
  HIDDEN,
  sentenceOf,
  type HiddenYouPick,
} from "@/src/features/playground/lib/evaluate";
import type { HiddenYouItem, SpeakerKind } from "@/src/features/playground/types";
import { playUiClickSfx } from "@/src/lib/player-eval-sfx";
import { cn } from "@/lib/utils";

const SPEAKERS: Record<SpeakerKind, { icon: LucideIcon; tone: string }> = {
  mom: { icon: Heart, tone: "bg-rose-100 text-rose-600" },
  dad: { icon: UserRound, tone: "bg-indigo-100 text-indigo-600" },
  teacher: { icon: GraduationCap, tone: "bg-violet-100 text-violet-600" },
  friend: { icon: Users, tone: "bg-sky-100 text-sky-600" },
  sister: { icon: UserRound, tone: "bg-pink-100 text-pink-600" },
  sign: { icon: Signpost, tone: "bg-amber-100 text-amber-700" },
  app: { icon: Smartphone, tone: "bg-slate-200 text-slate-700" },
  coach: { icon: Megaphone, tone: "bg-orange-100 text-orange-600" },
  doctor: { icon: Stethoscope, tone: "bg-teal-100 text-teal-700" },
};

export function HiddenYouGame({ item, itemKey, lang, status, attempt, onReady, onAnswer, guide = false }: GameProps<HiddenYouItem>) {
  const [choice, setChoice] = useState<{ attempt: number; pick: HiddenYouPick } | null>(null);
  const selected = choice?.attempt === attempt ? choice.pick : null;
  const done = isDone(status);
  const locked = status !== "answering";
  const guideOn = guide && !locked && selected === null;
  const spoken = chunkAt(item.words, useActiveWord(`${itemKey}:s:`));
  const speaker = SPEAKERS[item.speaker];
  const SpeakerIcon = speaker.icon;
  const isCommand = item.subject === undefined;

  const choose = (value: HiddenYouPick) => {
    if (locked) return;
    setChoice({ attempt, pick: value });
    void playUiClickSfx();
    onReady(() => onAnswer(evaluateHiddenYou(item, value)));
  };

  const toneFor = (value: HiddenYouPick): ChipTone => {
    const isAnswer = isCommand ? value === HIDDEN : value === item.subject;
    if (done) return isAnswer ? "subject" : value === selected ? "wrong" : "dim";
    if (status === "retry" && value === selected) return "wrong";
    return value === selected ? "selected" : "idle";
  };

  const youTone = toneFor(HIDDEN);
  const youGhost = youTone === "idle" || youTone === "dim";

  return (
    <SentenceCard
      itemKey={itemKey}
      sentence={sentenceOf(item.words)}
      bangla={item.meaningBn}
      lang={lang}
      settled={locked}
      header={
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className={cn("flex size-8 items-center justify-center rounded-full sm:size-10", speaker.tone)}>
            <SpeakerIcon className="size-4 sm:size-5" aria-hidden />
          </span>
          <span className={cn(LANG_FACE[lang], "text-sm font-black text-slate-600")}>
            {pick(item.speakerLabel, lang)}
          </span>
        </div>
      }
    >
      <WordChip
        tone={youTone}
        disabled={locked}
        shakeKey={attempt}
        tag={done && isCommand ? pick(PG_UI.subjectTag, lang) : undefined}
        guide={guideOn && isCommand}
        onClick={() => choose(HIDDEN)}
        className={cn(
          youGhost && "border-dashed border-slate-300 bg-slate-50/60 text-slate-400 italic hover:text-accent",
        )}
      >
        <span className={EN_FACE}>{done && isCommand ? "(You)" : pick(PG_UI.hiddenYou, lang)}</span>
      </WordChip>
      {item.words.map((word, i) => (
        <WordChip
          key={i}
          tone={toneFor(i)}
          spoken={spoken === i}
          disabled={locked}
          shakeKey={attempt}
          tag={done && i === item.subject ? pick(PG_UI.subjectTag, lang) : undefined}
          guide={guideOn && !isCommand && i === item.subject}
          nudgeIndex={i + 1}
          onClick={() => choose(i)}
        >
          {word}
        </WordChip>
      ))}
      {done ? null : (
        <p className={cn(LANG_FACE[lang], "basis-full text-xs font-semibold text-slate-400")}>
          {pick(PG_UI.hiddenYouHelp, lang)}
        </p>
      )}
    </SentenceCard>
  );
}
