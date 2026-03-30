"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type Phase = "settle" | "whisper" | "finalTouch" | "transform" | "merged" | "hold";

const SETTLE_MS = 1_350;
const WHISPER_MS = 2_900;
const FINAL_MS = 520;
const TRANSFORM_MS = 880;
/** Overlapping crossfade: split “Gam”+“lish” dissolves into one “Gamlish” (no empty beat). */
const MERGE_CROSSFADE_MS = 520;
const HOLD_MS = 3_400;

const EASE_WHISPER: [number, number, number, number] = [0.45, 0, 0.55, 1];
const EASE_FINAL: [number, number, number, number] = [0.33, 0, 0.25, 1];
const EASE_PEEL: [number, number, number, number] = [0.4, 0, 0.2, 1];
/** Last leg: slow dock so “closing” reads as one continuous move into the word. */
const EASE_DOCK: [number, number, number, number] = [0.12, 0.85, 0.15, 1];

const WHISPER_WORD_X = 2.25;
const FINAL_WORD_X = 3.15;

const WHISPER_TIMES = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1] as const;

const TRANSFORM_S = TRANSFORM_MS / 1000;

export function GamlishWordmarkAnimation({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("settle");
  const [cycleKey, setCycleKey] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let alive = true;

    const runCycle = () => {
      if (!alive) return;
      clearTimers();
      setCycleKey((k) => k + 1);
      setPhase("settle");
      const tWhisper = SETTLE_MS;
      const tFinal = tWhisper + WHISPER_MS;
      const tTransform = tFinal + FINAL_MS;
      const tMerged = tTransform + TRANSFORM_MS;
      const tHold = tMerged + MERGE_CROSSFADE_MS;
      const tLoop = tHold + HOLD_MS;

      schedule(() => {
        if (alive) setPhase("whisper");
      }, tWhisper);
      schedule(() => {
        if (alive) setPhase("finalTouch");
      }, tFinal);
      schedule(() => {
        if (alive) setPhase("transform");
      }, tTransform);
      schedule(() => {
        if (alive) setPhase("merged");
      }, tMerged);
      schedule(() => {
        if (alive) setPhase("hold");
      }, tHold);
      schedule(() => {
        if (alive) runCycle();
      }, tLoop);
    };

    runCycle();
    return () => {
      alive = false;
      clearTimers();
    };
  }, [reducedMotion, clearTimers, schedule]);

  if (reducedMotion) {
    return (
      <span
        className={cn(
          "text-lg font-semibold tracking-tight text-foreground leading-none",
          className,
        )}
      >
        Gamlish
      </span>
    );
  }

  const showWords = phase === "settle" || phase === "whisper" || phase === "finalTouch";
  const showPostConflict =
    phase === "transform" || phase === "merged" || phase === "hold";
  const mergeWordVisible = phase === "merged" || phase === "hold";

  const whisperTransition = {
    duration: WHISPER_MS / 1000,
    times: [...WHISPER_TIMES],
    ease: EASE_WHISPER,
  };

  const gameWhisper = {
    x: [0, WHISPER_WORD_X, 0, WHISPER_WORD_X, 0, WHISPER_WORD_X, 0],
    scale: [1, 1.024, 1, 1.024, 1, 1.036, 1],
    rotate: [0, -0.9, 0, -0.9, 0, -1.15, 0],
  };

  const englishWhisper = {
    x: [0, -WHISPER_WORD_X, 0, -WHISPER_WORD_X, 0, -WHISPER_WORD_X, 0],
    scale: [1, 1.024, 1, 1.024, 1, 1.036, 1],
    rotate: [0, 0.9, 0, 0.9, 0, 1.15, 0],
  };

  const gameAnimate =
    phase === "whisper"
      ? gameWhisper
      : phase === "finalTouch"
        ? { x: FINAL_WORD_X, scale: 1.045, rotate: -1.35 }
        : { x: 0, scale: 1, rotate: 0 };

  const englishAnimate =
    phase === "whisper"
      ? englishWhisper
      : phase === "finalTouch"
        ? { x: -FINAL_WORD_X, scale: 1.045, rotate: 1.35 }
        : { x: 0, scale: 1, rotate: 0 };

  const wordTransition =
    phase === "whisper"
      ? whisperTransition
      : phase === "finalTouch"
        ? { duration: FINAL_MS / 1000, ease: EASE_FINAL }
        : { duration: 0.35, ease: EASE_WHISPER };

  const gapGlowWhisper = {
    opacity: [0, 0.5, 0, 0.55, 0, 0.72, 0],
    scale: [0.65, 1.2, 0.65, 1.25, 0.65, 1.45, 0.65],
  };

  const gapGlowFinal = { opacity: 0.88, scale: 1.55 };

  const peelTransition = {
    duration: TRANSFORM_S,
    times: [0, 0.12, 0.38, 0.58],
    ease: EASE_PEEL,
  };

  /** Five stops: last ~22% is a slow dock + kern so it meets “Gamlish” without a gap frame. */
  const convergeTransition = {
    duration: TRANSFORM_S,
    times: [0, 0.16, 0.48, 0.78, 1],
    ease: EASE_DOCK,
  };

  const gamDockX = [0, 1.25, 5.25, 7.6, 9.1] as const;
  const lishDockX = [0, -1.25, -5.25, -7.6, -9.1] as const;
  /** Pull “lish” under “Gam” so the seam matches single-word kerning. */
  const lishDockMarginLeft = [0, 0, -0.8, -2.4, -3.8] as const;
  const gamDockMarginRight = [0, 0, -0.3, -0.9, -1.35] as const;

  return (
    <span
      className={cn(
        "relative inline-flex h-7 min-w-[10.5rem] sm:min-w-[11.25rem] items-center justify-start",
        className,
      )}
      aria-hidden
    >
      <AnimatePresence mode="sync" initial={false}>
        {showWords && (
          <motion.span
            key={`words-${cycleKey}`}
            className="absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap"
            initial={{ opacity: 0, filter: "blur(3px)" }}
            animate={{
              opacity: phase === "finalTouch" ? 0.98 : 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              filter: "blur(5px)",
              transition: { duration: 0.24, ease: EASE_PEEL },
            }}
            transition={{ duration: 0.5, ease: EASE_WHISPER }}
          >
            <span className="relative inline-flex items-baseline text-lg font-semibold tracking-tight text-foreground">
              <motion.span
                className="inline-block origin-bottom will-change-transform"
                animate={gameAnimate}
                transition={wordTransition}
              >
                Game
              </motion.span>

              <span className="relative inline-block w-[0.32em] shrink-0" aria-hidden>
                <motion.span
                  className="pointer-events-none absolute left-1/2 top-[55%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/35 blur-md dark:bg-primary/45"
                  initial={false}
                  animate={
                    phase === "whisper"
                      ? gapGlowWhisper
                      : phase === "finalTouch"
                        ? gapGlowFinal
                        : { opacity: 0, scale: 0.6 }
                  }
                  transition={
                    phase === "whisper"
                      ? whisperTransition
                      : phase === "finalTouch"
                        ? { duration: FINAL_MS / 1000, ease: EASE_FINAL }
                        : { duration: 0.25 }
                  }
                />
              </span>

              <motion.span
                className="inline-block origin-bottom will-change-transform"
                animate={englishAnimate}
                transition={wordTransition}
              >
                English
              </motion.span>
            </span>
          </motion.span>
        )}
      </AnimatePresence>

      {showPostConflict && (
        <span
          key={`post-${cycleKey}`}
          className="absolute left-0 top-1/2 isolate h-7 w-full max-w-[12rem] -translate-y-1/2"
        >
          {/* Split pieces: stay visible while crossfading into the single word (no dead frame). */}
          <motion.span
            className="absolute left-0 top-1/2 inline-flex -translate-y-1/2 items-baseline whitespace-nowrap text-lg font-semibold tracking-tight text-foreground will-change-[opacity]"
            initial={false}
            animate={{
              opacity: phase === "transform" ? 1 : 0,
            }}
            transition={{
              opacity: {
                duration: phase === "transform" ? 0.2 : 0.5,
                ease: EASE_PEEL,
              },
            }}
          >
            <motion.span
              className="inline-block will-change-transform"
              initial={false}
              animate={{
                x: [...gamDockX],
                marginRight: [...gamDockMarginRight],
              }}
              transition={convergeTransition}
            >
              Gam
            </motion.span>
            <motion.span
              className="inline-block will-change-transform"
              initial={false}
              animate={{
                opacity: [1, 1, 0.45, 0],
                filter: ["blur(0px)", "blur(0px)", "blur(7px)", "blur(16px)"],
                scale: [1, 1, 0.88, 0.72],
              }}
              transition={peelTransition}
            >
              e
            </motion.span>
            <motion.span
              className="inline-block will-change-transform"
              initial={false}
              animate={{
                opacity: [1, 1, 0.4, 0],
                filter: ["blur(0px)", "blur(0px)", "blur(8px)", "blur(18px)"],
                scale: [1, 1, 0.86, 0.7],
              }}
              transition={peelTransition}
            >
              Eng
            </motion.span>
            <motion.span
              className="inline-block will-change-transform"
              initial={false}
              animate={{
                x: [...lishDockX],
                marginLeft: [...lishDockMarginLeft],
              }}
              transition={convergeTransition}
            >
              lish
            </motion.span>
          </motion.span>

          <motion.span
            className="absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-lg font-semibold tracking-tight text-foreground leading-none will-change-[opacity,filter]"
            initial={false}
            animate={{
              opacity: mergeWordVisible ? 1 : 0,
              filter: mergeWordVisible ? "blur(0px)" : "blur(3px)",
            }}
            transition={{
              opacity: {
                duration: mergeWordVisible ? 0.48 : 0.18,
                delay: mergeWordVisible ? 0.08 : 0,
                ease: [0.2, 0.85, 0.25, 1],
              },
              filter: {
                duration: mergeWordVisible ? 0.4 : 0.15,
                delay: mergeWordVisible ? 0.05 : 0,
                ease: EASE_DOCK,
              },
            }}
          >
            Gamlish
          </motion.span>
        </span>
      )}
    </span>
  );
}
