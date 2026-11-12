"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Pointer } from "lucide-react";
import { cn } from "@/lib/utils";

const TAP_LOOP_S = 1.3;

/**
 * The demo's pointing hand on a practice question; by default its fingertip lands on the parent's centre. `tap` presses with a ripple at the fingertip;
 * `drag` stays pressed while its parent moves it (the Stretch game slides it word to word).
 * Purely visual: taps go through it.
 */
export function GuideHand({
  mode = "tap",
  placement = "left-1/2 top-1/2 -ml-[11px] -mt-[3px]",
  layoutId,
}: {
  mode?: "tap" | "drag";
  placement?: string;
  layoutId?: string;
}) {
  const reduceMotion = useReducedMotion();
  const tapping = mode === "tap" && !reduceMotion;
  return (
    <motion.span
      aria-hidden
      layoutId={layoutId}
      className={cn("pointer-events-none absolute z-20 select-none", placement)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ layout: { type: "spring", stiffness: 260, damping: 26 } }}
    >
      {tapping ? (
        <motion.span
          className="absolute left-[-1px] top-[-9px] size-6 rounded-full bg-amber-400/70"
          animate={{ scale: [0.3, 0.3, 1.8], opacity: [0, 0.8, 0] }}
          transition={{ duration: TAP_LOOP_S, times: [0, 0.45, 1], repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}
      <motion.span
        className="relative block text-slate-800 drop-shadow-[0_3px_4px_rgba(15,23,42,0.35)]"
        animate={
          tapping
            ? { y: [6, 0, 0, 6], scale: [1, 0.88, 0.88, 1] }
            : mode === "drag" && !reduceMotion
              ? { scale: 0.9 }
              : undefined
        }
        transition={tapping ? { duration: TAP_LOOP_S, times: [0, 0.4, 0.6, 1], repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <Pointer className="size-8 fill-white sm:size-9" strokeWidth={1.75} />
      </motion.span>
    </motion.span>
  );
}
