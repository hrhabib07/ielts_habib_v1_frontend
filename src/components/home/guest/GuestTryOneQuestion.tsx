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
        "relative overflow-hidden border-border/40 p-5 sm:p-6",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12, ease: GUEST_EASE }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.09] via-transparent to-primary/[0.05]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-steel/20 blur-3xl"
        aria-hidden
      />

      <div className="relative">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
          <Zap className="h-3 w-3" aria-hidden />
          {tryOne.eyebrow}
        </p>

        <AnimatePresence mode="wait">
          {state === "won" ? (
            <motion.div
              key="won"
              className="guest-try-win mt-4 text-center"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: GUEST_EASE }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent ring-1 ring-accent/20">
                <Sparkles className="h-5 w-5" aria-hidden />
              </div>
              <p className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                {tryOne.winTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{tryOne.winXp}</p>
              <Button
                size="lg"
                className="guest-cta-glow mt-5 h-11 w-full rounded-full bg-accent font-semibold text-accent-foreground sm:w-auto sm:px-8"
                asChild
              >
                <Link href="/register">{tryOne.winCta}</Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="play"
              className="mt-4"
              initial={false}
              exit={{ opacity: 0 }}
            >
              <p className="rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-base font-semibold text-foreground sm:text-lg">
                {tryOne.sentence}
              </p>
              <p className="mt-3 text-sm font-medium text-muted-foreground">{tryOne.prompt}</p>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {tryOne.options.map((option) => {
                  const isPicked = picked === option;
                  const showWrong = state === "wrong" && isPicked;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onPick(option)}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-sm font-semibold transition-all",
                        "border-border/60 bg-background/80 text-foreground hover:-translate-y-0.5 hover:border-accent/35 hover:bg-accent/5 hover:shadow-sm",
                        showWrong &&
                          "border-destructive/50 bg-destructive/10 text-destructive hover:translate-y-0",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {state === "wrong" ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{tryOne.wrongHint}</p>
                  <button
                    type="button"
                    onClick={reset}
                    className="text-xs font-semibold text-accent underline-offset-2 hover:underline"
                  >
                    {tryOne.tryAgain}
                  </button>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
