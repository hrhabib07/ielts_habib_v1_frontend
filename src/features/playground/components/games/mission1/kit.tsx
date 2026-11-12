"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BN_FACE, EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import type { ChipTone } from "@/src/features/playground/components/PlaygroundParts";
import { GuideHand } from "@/src/features/playground/components/GuideHand";
import { useNudge } from "@/src/features/playground/hooks/useNudge";
import type { PlayStatus } from "@/src/features/playground/hooks/usePlaygroundSession";
import { cn } from "@/lib/utils";

export function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a === undefined || b === undefined) continue;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

/** A choice that belongs to one attempt: a retry starts with nothing selected. */
export function useAttemptChoice<T>(attempt: number): [T | null, (value: T) => void] {
  const [choice, setChoice] = useState<{ attempt: number; value: T } | null>(null);
  return [choice?.attempt === attempt ? choice.value : null, (value: T) => setChoice({ attempt, value })];
}

/** Tone of an answer option: blue when picked, orange when the pick was wrong, solid when it is the answer. */
export function optionTone<T>(option: T, selected: T | null, status: PlayStatus, answer: T): ChipTone {
  const done = status === "correct" || status === "revealed";
  if (done && option === answer) return "subject";
  if (status === "retry" && option === selected) return "wrong";
  if (option === selected) return "selected";
  return done ? "dim" : "idle";
}

const FRAME_TONES = {
  sky: "from-sky-50 to-white",
  emerald: "from-emerald-50 to-white",
  amber: "from-amber-50 to-white",
  violet: "from-violet-50 to-white",
  rose: "from-rose-50 to-white",
  slate: "from-slate-100 to-white",
  lime: "from-lime-50 to-white",
  indigo: "from-indigo-50 to-white",
  teal: "from-teal-50 to-white",
  orange: "from-orange-50 to-white",
} as const;

export type FrameTone = keyof typeof FRAME_TONES;

/** The main game card: a soft themed background that glows while the learner should act. */
export function GameFrame({
  tone,
  active,
  header,
  children,
  className,
}: {
  tone: FrameTone;
  active: boolean;
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-b-[5px] bg-gradient-to-b p-3.5 shadow-sm transition-[border-color,box-shadow] duration-300 sm:p-6",
        FRAME_TONES[tone],
        active ? "border-accent/35 ring-4 ring-accent/10" : "border-slate-200",
        className,
      )}
    >
      {header ? <div className="mb-3 flex min-h-9 items-center justify-between gap-2">{header}</div> : null}
      {children}
    </div>
  );
}

const BIG_TONES: Record<ChipTone, string> = {
  idle: "border-slate-300 border-b-slate-400 bg-white text-slate-800 shadow-sm enabled:hover:-translate-y-0.5 enabled:hover:border-accent/50 enabled:hover:bg-accent/5 enabled:cursor-pointer",
  selected: "border-accent/70 border-b-accent bg-accent/10 text-accent",
  lit: "border-amber-400 border-b-amber-500 bg-amber-200 text-amber-950",
  subject: "border-accent border-b-primary bg-accent text-white",
  wrong: "border-orange-300 border-b-orange-400 bg-orange-50 text-orange-700",
  dim: "border-slate-200 border-b-slate-200 bg-white/70 text-slate-400",
};

/** A large answer button with an English label and an optional helper line. */
export function BigChoice({
  label,
  sub,
  tone,
  disabled,
  lang,
  icon,
  shakeKey,
  nudgeIndex = 0,
  guide = false,
  onClick,
  className,
}: {
  label: string;
  sub?: Bilingual;
  tone: ChipTone;
  disabled: boolean;
  lang: LessonLanguage;
  icon?: ReactNode;
  shakeKey?: number;
  nudgeIndex?: number;
  /** Practice question: the pointing hand taps this option. */
  guide?: boolean;
  onClick: () => void;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const nudgeRef = useNudge<HTMLButtonElement>(!disabled && tone === "idle", nudgeIndex);
  return (
    <motion.button
      ref={nudgeRef}
      type="button"
      key={tone === "wrong" ? `wrong-${shakeKey ?? 0}` : undefined}
      disabled={disabled}
      onClick={onClick}
      animate={tone === "wrong" && !reduceMotion ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-b-[5px] px-3 py-2 text-center transition-[color,background-color,border-color,translate] duration-150",
        "enabled:active:translate-y-0.5 enabled:active:border-b-2 disabled:cursor-default",
        BIG_TONES[tone],
        guide && "ring-4 ring-amber-300/70",
        className,
      )}
    >
      {guide ? <GuideHand /> : null}
      <span className={cn(EN_FACE, "flex items-center gap-1.5 text-base font-black leading-tight sm:text-lg")}>
        {icon}
        {label}
      </span>
      {sub ? (
        <span
          className={cn(
            LANG_FACE[lang],
            "text-[11.5px] font-semibold leading-tight sm:text-xs",
            tone === "subject" ? "text-accent-foreground" : "text-slate-500",
          )}
        >
          {pick(sub, lang)}
        </span>
      ) : null}
    </motion.button>
  );
}

/** Small orange note for a wrong tap in step 1 of a two-step game (costs the first-try bonus, not a try). */
export function SlipNote({ text, lang }: { text: Bilingual; lang: LessonLanguage }) {
  return (
    <p
      role="status"
      className={cn(
        LANG_FACE[lang],
        "rounded-2xl bg-orange-50 px-3.5 py-2 text-sm font-semibold text-orange-800 ring-1 ring-orange-200",
      )}
    >
      {pick(text, lang)}
    </p>
  );
}

/** Bangla sentence on a green strip, as in the Bangla Trap. */
export function BanglaStrip({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200">
      <p className={cn(BN_FACE, "min-w-0 flex-1 text-lg font-semibold text-emerald-900 sm:text-xl")}>{text}</p>
      {children}
    </div>
  );
}

/** A fixed English line (not a button), used around blanks and in finished sentences. */
export function PlainWords({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <span
      className={cn(
        EN_FACE,
        "text-lg font-bold text-slate-800 sm:text-2xl",
        /^[.,!?]$/.test(text) && "-ml-1.5",
        className,
      )}
    >
      {text}
    </span>
  );
}

/** The blank in a sentence: dashed while empty, filled with the picked word. */
export function BlankSlot({ value, tone }: { value: string | null; tone: ChipTone }) {
  return (
    <span
      className={cn(
        EN_FACE,
        "inline-flex min-w-[4.5rem] items-center justify-center rounded-xl border-2 border-b-4 px-3 py-1 text-lg font-black sm:min-w-24 sm:text-2xl",
        value ? BIG_TONES[tone] : "border-dashed border-accent/35 bg-accent/5 text-accent/35",
      )}
    >
      {value ?? "?"}
    </span>
  );
}
