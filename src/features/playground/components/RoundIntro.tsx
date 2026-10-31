"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Check, Cog, Heart, Pointer, RotateCcw, type LucideIcon } from "lucide-react";
import { BN_FACE, EN_FACE } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import { ROUND_ICONS } from "@/src/features/playground/components/roundIcons";
import { PG_UI } from "@/src/features/playground/lib/copy";
import type { SessionRound } from "@/src/features/playground/types";
import { cn } from "@/lib/utils";

const STEP_MS = 850;

function useDemoStep(steps: number, still: boolean): number {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (still || steps === 0) return;
    const timer = window.setInterval(() => setStep((s) => (s + 1) % (steps + 2)), STEP_MS);
    return () => window.clearInterval(timer);
  }, [steps, still]);
  return still ? steps : Math.min(step, steps);
}

function Hand() {
  return (
    <motion.span
      layoutId="demo-hand"
      className="pointer-events-none absolute -bottom-5 right-0 z-10 text-slate-700 drop-shadow"
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <Pointer className="size-6 fill-white" aria-hidden />
    </motion.span>
  );
}

function DemoChip({
  children,
  tone,
  hand = false,
  dashed = false,
}: {
  children: ReactNode;
  tone: "idle" | "lit" | "subject" | "picked";
  hand?: boolean;
  dashed?: boolean;
}) {
  return (
    <span
      className={cn(
        EN_FACE,
        "relative rounded-xl border-2 border-b-4 px-2.5 py-1 text-sm font-bold transition-colors duration-300",
        tone === "idle" && "border-slate-200 bg-white text-slate-700",
        tone === "lit" && "border-amber-400 bg-amber-200 text-amber-950",
        tone === "subject" && "border-sky-600 bg-sky-500 text-white",
        tone === "picked" && "border-emerald-500 bg-emerald-50 text-emerald-800",
        dashed && tone === "idle" && "border-dashed text-slate-400 italic",
      )}
    >
      {children}
      {hand ? <Hand /> : null}
    </span>
  );
}

function AskFirstDemo({ step }: { step: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        <DemoChip tone={step >= 1 ? "picked" : "idle"} hand={step === 0}>
          {step >= 1 ? <Check className="mr-1 inline size-3.5" strokeWidth={3} aria-hidden /> : null}
          Who?
        </DemoChip>
        <DemoChip tone="idle">What?</DemoChip>
      </div>
      <div className="flex justify-center gap-2">
        <DemoChip tone={step >= 3 ? "subject" : "idle"} hand={step === 2}>
          Rafi
        </DemoChip>
        <DemoChip tone="idle">plays</DemoChip>
        <DemoChip tone="idle">cricket.</DemoChip>
      </div>
    </div>
  );
}

const STRETCH_WORDS = ["The", "girl", "in", "the", "red", "dress", "reads."];
const STRETCH_END = 5;

function StretchDemo({ step }: { step: number }) {
  const end = Math.min(step, STRETCH_END);
  const finished = step > STRETCH_END;
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {STRETCH_WORDS.map((word, i) => (
        <DemoChip
          key={i}
          tone={finished ? (i <= STRETCH_END ? "subject" : "idle") : i <= end ? "lit" : "idle"}
          hand={!finished && i === end}
        >
          {word}
        </DemoChip>
      ))}
    </div>
  );
}

function HiddenYouDemo({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="flex items-center gap-2 text-sm font-black text-slate-500">
        <span className="flex size-7 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Heart className="size-4" aria-hidden />
        </span>
        Mom
      </span>
      <div className="flex gap-2">
        <DemoChip tone={step >= 1 ? "subject" : "idle"} dashed hand={step === 0}>
          {step >= 1 ? "(You)" : "You"}
        </DemoChip>
        <DemoChip tone="idle">Eat</DemoChip>
        <DemoChip tone="idle">your rice!</DemoChip>
      </div>
    </div>
  );
}

const TALK_TYPED = "My mother";

function TalkDemo({ step }: { step: number }) {
  const typed = TALK_TYPED.slice(0, step);
  const finished = step > TALK_TYPED.length;
  return (
    <div className="space-y-3 text-center">
      <p className={cn(EN_FACE, "text-base font-black text-slate-700")}>Who cooks in your home?</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <DemoChip tone={finished ? "subject" : "idle"} dashed={!typed}>
          {typed || "type here"}
          {!finished ? <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-sky-500 align-middle" /> : null}
        </DemoChip>
        <span className={cn(EN_FACE, "text-sm font-bold text-slate-700")}>cooks at home.</span>
      </div>
    </div>
  );
}

function CountBuildDemo({ step }: { step: number }) {
  return (
    <div className="space-y-3">
      <p className="text-3xl" aria-hidden>
        🍅🍅🍅
      </p>
      <div className="flex justify-center gap-2">
        <DemoChip tone={step >= 1 ? "picked" : "idle"} hand={step === 0}>
          three
        </DemoChip>
        <DemoChip tone={step >= 3 ? "subject" : "idle"} hand={step === 2}>
          tomatoes
        </DemoChip>
      </div>
    </div>
  );
}

const MACHINE_TYPED = "babies";

function PluralMachineDemo({ step }: { step: number }) {
  const typed = MACHINE_TYPED.slice(0, step);
  const finished = step > MACHINE_TYPED.length;
  return (
    <div className="flex flex-col items-center gap-2">
      <DemoChip tone="idle">baby</DemoChip>
      <Cog className={cn("size-5 text-slate-400", finished && "animate-spin")} aria-hidden />
      <DemoChip tone={finished ? "subject" : "idle"} dashed={!typed}>
        {typed || "type the Plural"}
        {!finished ? <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-sky-500 align-middle" /> : null}
      </DemoChip>
    </div>
  );
}

function BanglaTrapDemo({ step }: { step: number }) {
  return (
    <div className="space-y-3">
      <p className={cn(BN_FACE, "text-base font-semibold text-emerald-800")}>আমার তিনটি বোন আছে।</p>
      <div className="flex flex-wrap justify-center gap-1.5">
        <DemoChip tone="idle">I</DemoChip>
        <DemoChip tone="idle">have</DemoChip>
        <DemoChip tone="idle">three</DemoChip>
        <DemoChip tone={step >= 2 ? "subject" : step >= 1 ? "lit" : "idle"} hand={step <= 1}>
          {step >= 2 ? "sisters." : "sister."}
        </DemoChip>
      </div>
    </div>
  );
}

const BAZAR_TYPED = "potatoes";

function BazarDemo({ step }: { step: number }) {
  const typed = BAZAR_TYPED.slice(0, step);
  const finished = step > BAZAR_TYPED.length;
  return (
    <div className="space-y-2">
      <p className={cn(BN_FACE, "text-lg font-bold text-slate-800")}>৩টা আলু</p>
      <div className="flex items-center justify-center gap-2">
        <span className={cn(EN_FACE, "text-sm font-bold text-slate-700")}>three</span>
        <DemoChip tone={finished ? "subject" : "idle"} dashed={!typed}>
          {typed || "type the word"}
          {!finished ? <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-sky-500 align-middle" /> : null}
        </DemoChip>
      </div>
    </div>
  );
}

/**
 * A tap-by-tap demo: the hand taps `picks` in order (each picked chip turns blue), then `fill`
 * replaces chip text to show the finished answer. `top` is the line the learner reads first.
 */
type DemoScript = {
  top?: string;
  topBangla?: boolean;
  chips: readonly string[];
  picks: readonly number[];
  fill?: Readonly<Record<number, string>>;
};

const SCRIPTS: Partial<Record<SessionRound["kind"], DemoScript>> = {
  "group-chat": { top: "Rafi: “I am at the bus stop.”", chips: ["First", "Second", "Third"], picks: [0] },
  "name-swap": { top: "Rahim is my cousin.", chips: ["He", "She", "It", "They"], picks: [0] },
  "respect-trap": { top: "দাদা, আপনি কেমন আছেন?", topBangla: true, chips: ["You", "He", "She", "They"], picks: [0] },
  "team-up": { top: "Rafi and I", chips: ["First", "Second", "Third", "We", "You", "They"], picks: [0, 3] },
  "six-box": { top: "The children", chips: ["Singular · Third", "Plural · Third", "Plural · First"], picks: [1] },
  "code-lock": { chips: ["The keys", "on the table", "are mine.", "Plural", "Third"], picks: [0, 1, 3, 4] },
  "odd-one-out": { chips: ["He", "My uncle", "We", "The boy"], picks: [2] },
  "build-order": { top: "Plural · First", chips: ["My", "friend", "and", "I", "you"], picks: [0, 1, 2, 3] },
  "verb-spotlight": { chips: ["The", "cook", "makes", "tea."], picks: [2] },
  "fix-bridge": {
    top: "আমি ছাত্র।",
    topBangla: true,
    chips: ["I", "___", "a student.", "am", "is", "are"],
    picks: [3],
    fill: { 1: "am" },
  },
  "bin-extra": { top: "আমরা ঘর পরিষ্কার করি।", topBangla: true, chips: ["We", "do", "clean", "the room."], picks: [1], fill: { 1: "🗑️" } },
  "action-camera": { top: "🏏", chips: ["We", "___", "cricket."], picks: [1], fill: { 1: "play" } },
  "pass-ball": { chips: ["What?", "Whom?", "Rafi", "kicks", "the ball."], picks: [0, 4] },
  "object-place": { top: "We play in the park.", chips: ["Object", "Place"], picks: [1] },
  "mirror-words": {
    top: "রাফি আমাকে সাহায্য করে।",
    topBangla: true,
    chips: ["Rafi helps", "___", "I", "me", "my"],
    picks: [3],
    fill: { 1: "me" },
  },
  "complete-or-not": { top: "I want ...", chips: ["Complete", "Needs an Object", "a glass of water"], picks: [1, 2] },
  "bangla-flip": {
    top: "আমরা ভাত খাই।",
    topBangla: true,
    chips: ["We", "rice", "eat"],
    picks: [2],
    fill: { 1: "eat", 2: "rice" },
  },
  "grow-sentence": { chips: ["We play football", "in the field", "after class"], picks: [1, 2] },
  "sentence-doctor": { top: "We football play.", chips: ["Wrong order", "Missing Verb", "We play football."], picks: [0, 2] },
  "my-diary": { top: "আমরা ভাত খাই।", topBangla: true, chips: ["type here"], picks: [0], fill: { 0: "We eat rice." } },
};

function ScriptDemo({ script, step }: { script: DemoScript; step: number }) {
  const finished = step >= script.picks.length;
  return (
    <div className="space-y-3">
      {script.top ? (
        <p
          className={cn(
            script.topBangla ? BN_FACE : EN_FACE,
            "text-base font-bold",
            script.topBangla ? "text-emerald-800" : "text-slate-700",
          )}
        >
          {script.top}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-1.5">
        {script.chips.map((chip, i) => {
          const pickedAt = script.picks.indexOf(i);
          const picked = pickedAt !== -1 && pickedAt < step;
          const filled = finished ? script.fill?.[i] : undefined;
          return (
            <DemoChip
              key={i}
              tone={filled ? "picked" : picked ? "subject" : "idle"}
              hand={!finished && script.picks[step] === i}
            >
              {filled ?? chip}
            </DemoChip>
          );
        })}
      </div>
    </div>
  );
}

const DEMO_STEPS: Partial<Record<SessionRound["kind"], number>> = {
  "ask-first": 3,
  stretch: STRETCH_END + 1,
  "hidden-you": 1,
  talk: TALK_TYPED.length + 1,
  "count-build": 3,
  "plural-machine": MACHINE_TYPED.length + 1,
  "bangla-trap": 2,
  "bazar-list": BAZAR_TYPED.length + 1,
};

function RoundDemo({ kind }: { kind: SessionRound["kind"] }) {
  const reduceMotion = useReducedMotion();
  const script = SCRIPTS[kind];
  const step = useDemoStep(script ? script.picks.length : (DEMO_STEPS[kind] ?? 0), Boolean(reduceMotion));
  return (
    <LayoutGroup id={`demo-${kind}`}>
      {script ? <ScriptDemo script={script} step={step} /> : null}
      {kind === "ask-first" ? <AskFirstDemo step={step} /> : null}
      {kind === "stretch" ? <StretchDemo step={step} /> : null}
      {kind === "hidden-you" ? <HiddenYouDemo step={step} /> : null}
      {kind === "talk" ? <TalkDemo step={step} /> : null}
      {kind === "count-build" ? <CountBuildDemo step={step} /> : null}
      {kind === "plural-machine" ? <PluralMachineDemo step={step} /> : null}
      {kind === "bangla-trap" ? <BanglaTrapDemo step={step} /> : null}
      {kind === "bazar-list" ? <BazarDemo step={step} /> : null}
    </LayoutGroup>
  );
}

export function RoundIntro({
  round,
  number,
  total,
  lang,
  onStart,
}: {
  round: SessionRound;
  number: number;
  total: number;
  lang: LessonLanguage;
  onStart: () => void;
}) {
  const face = LANG_FACE[lang];
  const Icon: LucideIcon = round.kind === "review" ? RotateCcw : ROUND_ICONS[round.kind];
  const bonus = round.kind === "review";

  return (
    <motion.div
      className="flex min-h-full flex-col items-center justify-center px-4 py-4 text-center sm:px-5 sm:py-8"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      <motion.span
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl border-b-[5px] text-white shadow-lg sm:size-20 sm:rounded-3xl sm:border-b-[6px]",
          bonus ? "border-amber-600 bg-amber-400" : "border-violet-700 bg-violet-500",
        )}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.05 }}
      >
        <Icon className="size-7 sm:size-10" strokeWidth={2.5} aria-hidden />
      </motion.span>
      <p
        className={cn(
          face,
          "mt-3 text-xs font-black text-violet-600 sm:mt-5",
          lang === "en" && "uppercase tracking-[0.16em]",
          bonus && "text-amber-600",
        )}
      >
        {pick(bonus ? PG_UI.bonusRound : PG_UI.roundOf(number, total), lang)}
      </p>
      <h2 className={cn(face, "mt-0.5 text-2xl font-black text-slate-900 sm:mt-1 sm:text-4xl")}>{pick(round.title, lang)}</h2>
      <p className={cn(face, "mt-1.5 max-w-md text-sm font-semibold text-slate-600 sm:mt-2 sm:text-lg")}>
        {pick(round.goal, lang)}
      </p>

      {bonus ? null : (
        <div className="mt-4 w-full max-w-sm rounded-3xl border-2 border-b-[5px] border-slate-200 bg-white px-3 pb-6 pt-3 shadow-sm sm:mt-7 sm:px-4 sm:pb-7 sm:pt-4">
          <p className={cn(face, "mb-3 text-[11px] font-black text-slate-400 sm:mb-4", lang === "en" && "uppercase tracking-[0.14em]")}>
            {pick(PG_UI.howToPlay, lang)}
          </p>
          <RoundDemo kind={round.kind} />
        </div>
      )}

      <button
        type="button"
        onClick={onStart}
        autoFocus
        className={cn(
          face,
          "mt-5 flex h-12 w-full max-w-sm items-center justify-center rounded-2xl border-b-4 border-violet-700 bg-violet-500 text-lg font-extrabold text-white transition-all hover:bg-violet-500/90 active:translate-y-0.5 active:border-b-2 sm:mt-8 sm:h-14",
          lang === "en" && "uppercase tracking-wide",
        )}
      >
        {pick(PG_UI.letsPlay, lang)}
      </button>
    </motion.div>
  );
}
