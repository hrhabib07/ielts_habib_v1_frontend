"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Check, Gamepad2, HelpCircle } from "lucide-react";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import { GUEST_UI } from "@/src/features/guest/copy";
import { cn } from "@/lib/utils";

export type GuestJourneyStep = "note" | "quiz" | "game";

const STEPS: readonly {
  id: GuestJourneyStep;
  label: Bilingual;
  Icon: typeof BookOpen;
}[] = [
  { id: "note", label: GUEST_UI.miniPathNote, Icon: BookOpen },
  { id: "quiz", label: GUEST_UI.miniPathCheck, Icon: HelpCircle },
  { id: "game", label: GUEST_UI.miniPathGame, Icon: Gamepad2 },
];

const HINT: Record<GuestJourneyStep, { en: string; bn: string }> = {
  note: {
    en: "Game coming soon · finish this short note first",
    bn: "গেইম আসছে · আগে এই ছোট নোট শেষ করুন",
  },
  quiz: {
    en: "Almost there · then you play the game",
    bn: "প্রায় হয়ে গেছে · এরপর গেইম খেলবেন",
  },
  game: {
    en: "Your turn · play what you just learned",
    bn: "এবার আপনার পালা · যা শিখেছেন, গেইমে খেলুন",
  },
};

function stepState(
  id: GuestJourneyStep,
  current: GuestJourneyStep,
): "done" | "current" | "soon" {
  const order: GuestJourneyStep[] = ["note", "quiz", "game"];
  const here = order.indexOf(id);
  const now = order.indexOf(current);
  if (here < now) return "done";
  if (here === now) return "current";
  return "soon";
}

/** Sticky Note → Check → Game path so guests feel the game coming while they learn. */
export function GuestJourneyStrip({
  lang,
  current,
  className,
}: {
  lang: LessonLanguage;
  current: GuestJourneyStep;
  className?: string;
}) {
  const face = LANG_FACE[lang];
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/10 via-white to-amber-50 px-3 py-2.5 shadow-sm",
        className,
      )}
    >
      <p className={cn(face, "text-center text-[11px] font-black text-accent")}>
        {pick(HINT[current], lang)}
      </p>
      <div className="relative mt-2.5 flex items-start justify-between px-1">
        <span aria-hidden className="absolute inset-x-6 top-4 border-t-2 border-dashed border-accent/25" />
        {STEPS.map((step) => {
          const state = stepState(step.id, current);
          const Icon = step.Icon;
          const node = (
            <span
              className={cn(
                "relative z-[1] flex size-8 items-center justify-center rounded-full border-b-4 text-white",
                state === "done" && "border-emerald-700 bg-emerald-500",
                state === "current" && "border-primary bg-accent shadow-md shadow-accent/30",
                state === "soon" && "border-amber-400 bg-amber-300 text-amber-950",
              )}
            >
              {state === "done" ? (
                <Check className="size-4" strokeWidth={3} aria-hidden />
              ) : (
                <Icon className="size-3.5" aria-hidden />
              )}
            </span>
          );
          return (
            <div key={step.id} className="relative flex w-[4.5rem] flex-col items-center gap-1">
              {state === "soon" && step.id === "game" && !reduceMotion ? (
                <motion.span
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {node}
                </motion.span>
              ) : (
                node
              )}
              <span
                className={cn(
                  face,
                  "text-[10px] font-black",
                  state === "done" && "text-emerald-700",
                  state === "current" && "text-accent",
                  state === "soon" && "text-amber-800",
                )}
              >
                {pick(step.label, lang)}
                {state === "soon" && step.id === "game" ? (
                  <span className="block font-bold opacity-80">{pick(GUEST_UI.comingSoon, lang)}</span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
