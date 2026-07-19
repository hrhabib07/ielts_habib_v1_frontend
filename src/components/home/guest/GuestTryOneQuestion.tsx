"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  guestGlassCardClass,
  useGuestLandingLocale,
} from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";
import { Sparkles, Zap } from "lucide-react";

type DemoState = "idle" | "wrong" | "won";

export function GuestTryOneQuestion({ className }: { className?: string }) {
  const { copy } = useGuestLandingLocale();
  const tryOne = copy.tryOne;
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<DemoState>("idle");
  const [picked, setPicked] = useState<string | null>(null);

  const onPick = (option: string) => {
    if (state === "won") return;
    setPicked(option);
    if (option === tryOne.correctAnswer) {
      setState("won");
      return;
    }
    setState("wrong");
  };

  const reset = () => {
    setState("idle");
    setPicked(null);
  };

  return (
    <motion.div
      className={cn(
        guestGlassCardClass,
        "relative overflow-hidden border-border/50 bg-card p-5 shadow-md sm:p-6",
        state === "won" && "border-emerald-500/45 bg-emerald-500/5",
        className,
      )}
      animate={
        state === "won" && !reduceMotion ? { scale: [1, 1.02, 1] } : { scale: 1 }
      }
      transition={{ duration: 0.35, ease: GUEST_EASE }}
    >
      <div className="relative">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
          <Zap className="h-3 w-3" aria-hidden />
          {tryOne.eyebrow}
        </p>
        <p className="mt-2 text-lg font-bold tracking-tight text-foreground">
          {tryOne.title}
        </p>

        <AnimatePresence mode="wait">
          {state === "won" ? (
            <motion.div
              key="won"
              className="mt-4 text-center"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: GUEST_EASE }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-300">
                <Sparkles className="h-5 w-5" aria-hidden />
              </div>
              <p className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                {tryOne.winTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{tryOne.winBody}</p>
              <Button
                size="lg"
                className={cn(
                  "mt-5 h-12 w-full rounded-2xl font-bold",
                  LANDING_CTA_CLASS,
                )}
                asChild
              >
                <Link href="/demo">{tryOne.winCta}</Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div key="play" className="mt-4" initial={false} exit={{ opacity: 0 }}>
              <p className="rounded-xl border border-border/50 bg-muted/40 px-4 py-3.5 text-base font-semibold text-foreground sm:text-lg">
                {tryOne.sentence}
              </p>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {tryOne.prompt}
              </p>
              {/* Full-width stacked answers — same pattern as in-game MCQ */}
              <div className="mt-3 flex flex-col gap-2">
                {tryOne.options.map((option) => {
                  const isPicked = picked === option;
                  const isWrong = state === "wrong" && isPicked;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onPick(option)}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-colors",
                        isWrong
                          ? "border-destructive/50 bg-destructive/10 text-destructive"
                          : "border-border/60 bg-background hover:border-sky-500/50 hover:bg-sky-500/5",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {state === "wrong" ? (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-destructive">{tryOne.wrongHint}</p>
                  <Button type="button" variant="ghost" size="sm" onClick={reset}>
                    {tryOne.tryAgain}
                  </Button>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
