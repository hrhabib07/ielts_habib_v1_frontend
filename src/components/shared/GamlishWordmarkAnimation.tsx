"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

type Phase = "settle" | "whisper" | "finalTouch" | "crossfade" | "hold";

const SETTLE_MS = 1_600;
const WHISPER_MS = 3_400;
const FINAL_MS = 650;
const CROSSFADE_MS = 1_100;
const HOLD_MS = 3_800;

const EASE_SMOOTH: [number, number, number, number] = [0.4, 0, 0.2, 1];
const EASE_WHISPER: [number, number, number, number] = [0.45, 0.05, 0.55, 0.95];
const EASE_CROSS: [number, number, number, number] = [0.22, 1, 0.36, 1];

const WHISPER_X = 2.4;
const FINAL_X = 3.2;
const WHISPER_TIMES = [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1] as const;

const mutedWord =
  "font-normal text-[0.92em] text-muted-foreground/75 tracking-normal";
const boldWord = "font-semibold text-foreground tracking-normal";

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
      const tCross = tFinal + FINAL_MS;
      const tHold = tCross + CROSSFADE_MS;
      const tLoop = tHold + HOLD_MS;

      schedule(() => alive && setPhase("whisper"), tWhisper);
      schedule(() => alive && setPhase("finalTouch"), tFinal);
      schedule(() => alive && setPhase("crossfade"), tCross);
      schedule(() => alive && setPhase("hold"), tHold);
      schedule(() => alive && runCycle(), tLoop);
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

  const showPhrase =
    phase === "settle" || phase === "whisper" || phase === "finalTouch";
  const showBrand = phase === "crossfade" || phase === "hold";
  const brandSettled = phase === "hold";

  const whisperTransition = {
    duration: WHISPER_MS / 1000,
    times: [...WHISPER_TIMES],
    ease: EASE_WHISPER,
  };

  const leftWhisper = {
    x: [0, WHISPER_X, 0, WHISPER_X, 0, WHISPER_X, 0],
    scale: [1, 1.018, 1, 1.018, 1, 1.028, 1],
  };
  const rightWhisper = {
    x: [0, -WHISPER_X, 0, -WHISPER_X, 0, -WHISPER_X, 0],
    scale: [1, 1.018, 1, 1.018, 1, 1.028, 1],
  };

  const leftAnimate =
    phase === "whisper"
      ? leftWhisper
      : phase === "finalTouch"
        ? { x: FINAL_X, scale: 1.03 }
        : { x: 0, scale: 1 };

  const rightAnimate =
    phase === "whisper"
      ? rightWhisper
      : phase === "finalTouch"
        ? { x: -FINAL_X, scale: 1.03 }
        : { x: 0, scale: 1 };

  const wordTransition =
    phase === "whisper"
      ? whisperTransition
      : phase === "finalTouch"
        ? { duration: FINAL_MS / 1000, ease: EASE_SMOOTH }
        : { duration: 0.45, ease: EASE_SMOOTH };

  return (
    <span
      className={cn(
        "relative inline-flex h-7 min-w-[11.75rem] items-center sm:min-w-[12.75rem]",
        className,
      )}
      aria-hidden
    >
      <AnimatePresence mode="sync" initial={false}>
        {showPhrase && (
          <motion.span
            key={`phrase-${cycleKey}`}
            className="absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap"
            initial={{ opacity: 0, filter: "blur(3px)" }}
            animate={{
              opacity: phase === "finalTouch" ? 0.96 : 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              filter: "blur(5px)",
              scale: 0.985,
              transition: { duration: 0.55, ease: EASE_CROSS },
            }}
            transition={{ duration: 0.5, ease: EASE_SMOOTH }}
          >
            <span className="inline-flex items-baseline gap-x-[0.28em] text-[17px] leading-snug tracking-normal">
              <motion.span
                className="inline-flex items-baseline gap-x-[0.28em] will-change-transform"
                animate={leftAnimate}
                transition={wordTransition}
              >
                <span className={mutedWord}>The</span>
                <span className={boldWord}>Game</span>
              </motion.span>

              <motion.span
                className={cn("inline-block will-change-transform", mutedWord)}
                animate={
                  phase === "finalTouch"
                    ? { opacity: 0.45, scale: 0.94 }
                    : { opacity: 1, scale: 1 }
                }
                transition={wordTransition}
              >
                of
              </motion.span>

              <motion.span
                className={cn(boldWord, "inline-block will-change-transform")}
                animate={rightAnimate}
                transition={wordTransition}
              >
                English
              </motion.span>
            </span>
          </motion.span>
        )}

        {showBrand && (
          <motion.span
            key={`brand-${cycleKey}`}
            className={cn(
              boldWord,
              "absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap text-lg leading-none",
            )}
            initial={{ opacity: 0, filter: "blur(6px)", scale: 1.04, letterSpacing: "0.06em" }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
              letterSpacing: brandSettled ? "-0.01em" : "0.01em",
            }}
            exit={{
              opacity: 0,
              filter: "blur(4px)",
              transition: { duration: 0.35, ease: EASE_SMOOTH },
            }}
            transition={{
              opacity: { duration: CROSSFADE_MS / 1000, ease: EASE_CROSS },
              filter: { duration: CROSSFADE_MS / 1000, ease: EASE_CROSS },
              scale: { duration: CROSSFADE_MS / 1000, ease: EASE_CROSS },
              letterSpacing: { duration: 0.7, ease: EASE_CROSS, delay: 0.15 },
            }}
          >
            Gamlish
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
