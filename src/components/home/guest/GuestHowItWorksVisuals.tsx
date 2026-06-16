"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, TrendingUp, Wind, Zap, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuestHowItWorksSkillIcon } from "@/src/lib/guest-how-it-works-types";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";

/** Ascending level path with animated progress dot. */
export function LevelPathVisual({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("relative px-2 py-2", className)} aria-hidden>
      <svg viewBox="0 0 320 120" className="h-auto w-full max-w-sm" fill="none">
        <motion.path
          d="M 20 100 Q 80 95, 120 70 T 200 45 T 300 20"
          stroke="url(#hiw-path-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 8"
          initial={reduceMotion ? undefined : { pathLength: 0, opacity: 0.4 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: GUEST_EASE }}
        />
        <defs>
          <linearGradient id="hiw-path-grad" x1="0" y1="100" x2="320" y2="20">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="1" />
          </linearGradient>
        </defs>
        {[20, 120, 200, 300].map((cx, i) => (
          <motion.circle
            key={cx}
            cx={cx}
            cy={[100, 70, 45, 20][i]}
            r={i === 3 ? 7 : 5}
            className="fill-accent"
            initial={reduceMotion ? false : { scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.4, type: "spring" }}
          />
        ))}
      </svg>
    </div>
  );
}

export function SkillIconBadge({ icon }: { icon: GuestHowItWorksSkillIcon }) {
  const icons = { zap: Zap, clock: Clock3, wind: Wind, book: BookOpen, trending: TrendingUp };
  const Icon = icons[icon];
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/15 bg-accent/10 text-accent">
      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
    </span>
  );
}
