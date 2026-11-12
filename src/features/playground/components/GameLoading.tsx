"use client";

import { motion } from "framer-motion";
import { GamlishMascot } from "@/src/features/playground/components/GamlishMascot";

/** Full-screen wait while a game loads: the mascot bobs above three pulsing dots. */
export function GameLoading() {
  return (
    <div
      role="status"
      aria-label="Loading the game"
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-accent/[0.08] via-background to-background"
    >
      <GamlishMascot size="lg" />
      <span className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2.5 rounded-full bg-accent"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </span>
    </div>
  );
}
