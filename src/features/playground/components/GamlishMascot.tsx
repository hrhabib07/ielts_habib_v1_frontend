"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, useAnimate, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { cn } from "@/lib/utils";

export type MascotMood = "idle" | "happy" | "oops";

const SIZES = { sm: "size-11", md: "size-14 sm:size-16", lg: "size-24 sm:size-28" } as const;

const MOODS: Record<MascotMood, TargetAndTransition> = {
  idle: { y: [0, -4, 0], rotate: 0, transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } },
  happy: { y: [0, -14, 0, -6, 0], rotate: [0, -8, 8, 0], scale: [1, 1.08, 1], transition: { duration: 0.8 } },
  oops: { x: [0, -5, 5, -3, 3, 0], rotate: [0, -6, 0], transition: { duration: 0.5 } },
};

/** Sparkles thrown out on a right answer: direction (x, y in px) and colour. */
const SPARKS = [
  { x: -30, y: -26, color: "text-amber-400" },
  { x: 30, y: -30, color: "text-sky-400" },
  { x: -36, y: 6, color: "text-emerald-400" },
  { x: 38, y: 2, color: "text-amber-400" },
  { x: -14, y: -40, color: "text-rose-400" },
  { x: 16, y: -42, color: "text-accent" },
] as const;

/** The Gamlish logo as the game's guide: bobs while waiting, jumps (with sparkles) on a right answer, wobbles on a wrong one. */
export function GamlishMascot({
  mood = "idle",
  size = "md",
  moodKey,
  className,
}: {
  mood?: MascotMood;
  size?: keyof typeof SIZES;
  /** Changing this replays the mood (e.g. a second wrong answer). */
  moodKey?: string | number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const key = `${mood}-${moodKey ?? ""}`;
  const [scope, animate] = useAnimate<HTMLSpanElement>();

  // The image element stays mounted; only its wrapper animates, so the logo never blinks out while reloading.
  useEffect(() => {
    if (reduceMotion || !scope.current) return;
    const { transition, ...target } = MOODS[mood];
    const controls = animate(scope.current, target, transition);
    return () => controls.stop();
  }, [key, mood, reduceMotion, animate, scope]);

  return (
    <span aria-hidden className={cn("relative block shrink-0", SIZES[size], className)}>
      <span ref={scope} className="absolute inset-0 block drop-shadow-md">
        <Image src="/brand/gamlish-mascot.webp" alt="" fill sizes="112px" className="object-contain" unoptimized priority />
      </span>
      {mood === "happy" && !reduceMotion
        ? SPARKS.map((spark, i) => (
            <motion.span
              key={`${key}-${i}`}
              className={cn("pointer-events-none absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5 text-xs font-black", spark.color)}
              initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
              animate={{ x: spark.x, y: spark.y, scale: [0.2, 1.2, 0.6], opacity: [0, 1, 0] }}
              transition={{ duration: 0.75, delay: 0.05 + i * 0.03, ease: "easeOut" }}
            >
              ✦
            </motion.span>
          ))
        : null}
    </span>
  );
}
