"use client";

import { forwardRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Eye, Turtle, Volume2 } from "lucide-react";
import { BN_FACE, EN_FACE, RichText } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { useLessonSpeech } from "@/src/features/chat-lesson/hooks/useLessonSpeech";
import { spokenWords } from "@/src/features/chat-lesson/lib/speechText";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { PG_UI } from "@/src/features/playground/lib/copy";
import { cn } from "@/lib/utils";

export const SLOW_RATE = 0.7;

/** Word index being spoken in any clip whose speech id starts with `prefix`. */
export function useActiveWord(prefix: string): number | null {
  const { speakingId, activeWord } = useLessonSpeech();
  return speakingId?.startsWith(prefix) ? activeWord : null;
}

/** Which chunk holds the spoken word, when chunks can contain several words ("My alarm"). */
export function chunkAt(words: readonly string[], wordIndex: number | null): number | null {
  if (wordIndex === null) return null;
  let start = 0;
  for (const [i, chunk] of words.entries()) {
    const count = spokenWords(chunk).length;
    if (wordIndex < start + count) return i;
    start += count;
  }
  return null;
}

export type ChipTone = "idle" | "selected" | "lit" | "subject" | "wrong" | "dim";

const CHIP_TONES: Record<ChipTone, string> = {
  idle: "border-slate-200 border-b-slate-300 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50",
  selected: "border-sky-400 border-b-sky-500 bg-sky-100 text-sky-900",
  lit: "border-amber-400 border-b-amber-500 bg-amber-200 text-amber-950",
  subject: "border-sky-600 border-b-sky-700 bg-sky-500 text-white",
  wrong: "border-orange-300 border-b-orange-400 bg-orange-50 text-orange-700",
  dim: "border-slate-200 border-b-slate-200 bg-white/70 text-slate-500",
};

export function WordChip({
  children,
  tone,
  spoken = false,
  disabled = false,
  shakeKey,
  tag,
  onClick,
  className,
}: {
  children: ReactNode;
  tone: ChipTone;
  spoken?: boolean;
  disabled?: boolean;
  /** Changing this replays the shake (used for wrong answers). */
  shakeKey?: string | number;
  tag?: string;
  onClick?: () => void;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      key={tone === "wrong" ? `wrong-${shakeKey ?? ""}` : undefined}
      onClick={onClick}
      disabled={disabled}
      animate={
        tone === "wrong" && !reduceMotion
          ? { x: [0, -7, 7, -5, 5, 0] }
          : tone === "subject" && !reduceMotion
            ? { scale: [1, 1.08, 1] }
            : { x: 0, scale: 1 }
      }
      transition={{ duration: 0.4 }}
      className={cn(
        EN_FACE,
        "relative rounded-xl border-2 border-b-4 px-2.5 py-1.5 text-base font-bold leading-snug transition-colors duration-150 sm:rounded-2xl sm:px-4 sm:py-2.5 sm:text-xl",
        "enabled:active:translate-y-0.5 enabled:active:border-b-2 disabled:cursor-default",
        CHIP_TONES[tone],
        spoken && "ring-4 ring-amber-200",
        className,
      )}
    >
      {tag ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
          {tag}
        </span>
      ) : null}
      {children}
    </motion.button>
  );
}

function RoundIconButton({
  label,
  active,
  onClick,
  tone,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone: "sky" | "emerald";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-b-4 transition-all active:translate-y-0.5 active:border-b-2 sm:size-11 sm:rounded-2xl",
        tone === "sky"
          ? active
            ? "border-sky-600 bg-sky-500 text-white"
            : "border-sky-200 border-b-sky-300 bg-white text-sky-600 hover:bg-sky-50"
          : active
            ? "border-emerald-600 bg-emerald-500 text-white"
            : "border-emerald-200 border-b-emerald-300 bg-white text-emerald-600 hover:bg-emerald-50",
      )}
    >
      {children}
    </button>
  );
}

/** Big English listen button plus the slow (turtle) one. Hidden when there is no recorded clip. */
export function ListenButtons({ idPrefix, text, lang }: { idPrefix: string; text: string; lang: LessonLanguage }) {
  const { canSpeak, speak, speakingId } = useLessonSpeech();
  if (!canSpeak(text, "en")) return null;
  const normalId = `${idPrefix}tap`;
  const slowId = `${idPrefix}slow`;
  return (
    <div className="flex shrink-0 items-center gap-2">
      <RoundIconButton
        label={pick(PG_UI.listen, lang)}
        active={speakingId === normalId || speakingId === `${idPrefix}auto` || speakingId === `${idPrefix}after`}
        onClick={() => speak(normalId, text, "en")}
        tone="sky"
      >
        <Volume2 className="size-4 sm:size-5" aria-hidden />
      </RoundIconButton>
      <RoundIconButton
        label={pick(PG_UI.listenSlow, lang)}
        active={speakingId === slowId}
        onClick={() => speak(slowId, text, "en", { rate: SLOW_RATE })}
        tone="sky"
      >
        <Turtle className="size-4 sm:size-5" aria-hidden />
      </RoundIconButton>
    </div>
  );
}

/** Bangla help line. Shown in Bangla mode; one tap away in English mode. Never auto-plays. */
export function BanglaLine({ id, text, lang }: { id: string; text: string; lang: LessonLanguage }) {
  const [open, setOpen] = useState(false);
  const { canSpeak, speak, speakingId } = useLessonSpeech();

  if (lang === "en" && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          EN_FACE,
          "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200 transition-colors hover:bg-slate-50",
        )}
      >
        <Eye className="size-3.5" aria-hidden />
        {pick(PG_UI.showMeaning, lang)}
      </button>
    );
  }

  const active = speakingId === id;
  return (
    <div className="mt-2 flex items-center gap-2">
      <p className={cn(BN_FACE, "min-w-0 text-[15px] leading-relaxed text-slate-600 sm:text-base")}>{text}</p>
      {canSpeak(text, "bn") ? (
        <button
          type="button"
          onClick={() => speak(id, text, "bn")}
          aria-label="বাংলায় শুনুন"
          aria-pressed={active}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
            active ? "bg-emerald-500 text-white" : "text-emerald-600 hover:bg-emerald-100",
          )}
        >
          <Volume2 className={cn("size-4", active && "animate-pulse")} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

/**
 * White card holding the English sentence (as chips), its listen buttons and the Bangla meaning.
 * Listen buttons sit in the top row so the chips get the full width on small phones.
 */
export function SentenceCard({
  itemKey,
  sentence,
  bangla,
  lang,
  header,
  banner,
  active = false,
  settled = false,
  children,
}: {
  itemKey: string;
  sentence: string;
  bangla: string;
  lang: LessonLanguage;
  header?: ReactNode;
  /** Full-width block between the top row and the chips, e.g. the question to answer. */
  banner?: ReactNode;
  /** Glows when the learner should tap inside it now. */
  active?: boolean;
  /** Answered: on phones the Bangla line steps aside so the feedback panel fits without scrolling. */
  settled?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-b-[5px] bg-white p-3.5 shadow-sm transition-[border-color,box-shadow] duration-300 sm:p-6",
        active ? "border-sky-300 ring-4 ring-sky-100" : "border-slate-200",
      )}
    >
      <div className="flex min-h-9 items-center justify-between gap-2">
        <div className="min-w-0 flex-1">{header}</div>
        <ListenButtons idPrefix={`${itemKey}:s:`} text={sentence} lang={lang} />
      </div>
      {banner}
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-4 pt-2">{children}</div>
      <div className={cn(settled && "max-sm:hidden")}>
        <BanglaLine id={`${itemKey}:bn`} text={bangla} lang={lang} />
      </div>
    </div>
  );
}

/** Feedback text with `**Subject**` shown in blue. */
export function FeedbackText({ text, lang, className }: { text: Bilingual; lang: LessonLanguage; className?: string }) {
  return (
    <p className={cn(LANG_FACE[lang], "leading-relaxed", className)}>
      <RichText text={pick(text, lang)} strongClassName="text-sky-700" />
    </p>
  );
}

/** "Step 1 of 2 · ..." pill at the top of a card; turns green with a tick when done. */
export function StepPill({ text, lang, tone }: { text: Bilingual; lang: LessonLanguage; tone: "now" | "done" }) {
  return (
    <span
      className={cn(
        LANG_FACE[lang],
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black",
        tone === "now" ? "bg-sky-100 text-sky-700" : "bg-emerald-100 text-emerald-700",
      )}
    >
      {tone === "done" ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : null}
      {pick(text, lang)}
    </span>
  );
}

/** Inline answer box for typing games: dashed while empty, orange after a wrong try. */
export const TypedField = forwardRef<
  HTMLInputElement,
  {
    value: string;
    placeholder: string;
    disabled: boolean;
    retry: boolean;
    onChange: (value: string) => void;
    label: string;
    maxLength?: number;
    className?: string;
  }
>(function TypedField({ value, placeholder, disabled, retry, onChange, label, maxLength = 40, className }, ref) {
  return (
    <input
      ref={ref}
      value={value}
      onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
      disabled={disabled}
      aria-label={label}
      maxLength={maxLength}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck={false}
      enterKeyHint="done"
      placeholder={placeholder}
      className={cn(
        EN_FACE,
        "min-w-[8ch] max-w-full rounded-2xl border-2 border-b-4 border-dashed border-sky-300 bg-sky-50/70 px-3 py-1.5 text-lg font-bold text-sky-900 outline-none transition-colors [field-sizing:content] placeholder:font-semibold placeholder:text-sky-300 focus:border-solid focus:border-sky-500 focus:bg-white sm:px-3.5 sm:py-2 sm:text-2xl",
        retry && "border-solid border-orange-300 bg-orange-50 text-orange-800",
        className,
      )}
    />
  );
});

/** The step label above an interaction, e.g. "Step 2 · Tap the Subject". */
export function StageLabel({ text, lang, done = false }: { text: Bilingual; lang: LessonLanguage; done?: boolean }) {
  return (
    <p
      className={cn(
        LANG_FACE[lang],
        "text-xs font-black tracking-wide",
        lang === "en" && "uppercase tracking-[0.12em]",
        done ? "text-emerald-600" : "text-slate-400",
      )}
    >
      {pick(text, lang)}
    </p>
  );
}
