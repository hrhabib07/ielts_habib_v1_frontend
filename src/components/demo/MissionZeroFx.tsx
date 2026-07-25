"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function MissionZeroConfetti({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  const [pieces] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${(i * 37) % 100}%`,
      delay: (i % 8) * 0.05,
      duration: 1.2 + (i % 5) * 0.15,
      color:
        i % 4 === 0
          ? "#38bdf8"
          : i % 4 === 1
            ? "#fbbf24"
            : i % 4 === 2
              ? "#34d399"
              : "#a78bfa",
    })),
  );

  if (!active || reduceMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 h-2.5 w-2.5 rounded-sm"
          style={{ left: p.left, backgroundColor: p.color }}
          initial={{ y: -12, opacity: 1, rotate: 0 }}
          animate={{ y: 420, opacity: 0, rotate: 220 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export function FloatingXpBadge({
  text,
  show,
}: {
  text: string;
  show: boolean;
}) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key={text}
          className="pointer-events-none absolute left-1/2 top-6 z-30 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg"
          initial={{ opacity: 0, y: 12, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.45 }}
        >
          {text}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
