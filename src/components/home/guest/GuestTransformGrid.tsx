"use client";

import {
  Brain,
  CheckCircle2,
  Flame,
  PenLine,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { useGuestHomeSectionsCopy } from "@/src/components/home/guest/useGuestHomeSectionsCopy";
import { cn } from "@/lib/utils";

const ICONS = [ShieldCheck, Brain, CheckCircle2, PenLine, Rocket, Flame] as const;
const ICON_COLORS = [
  "text-emerald-600 bg-emerald-500/12",
  "text-violet-600 bg-violet-500/12",
  "text-sky-600 bg-sky-500/12",
  "text-blue-600 bg-blue-500/12",
  "text-indigo-600 bg-indigo-500/12",
  "text-orange-600 bg-orange-500/12",
] as const;

/** Latin count chips stay readable (Hind Siliguri Bengali 1 is too thin). */
function highlightLeadingCount(title: string) {
  const match = title.match(/^(\d+টি)\s+([\s\S]+)$/);
  if (!match) return title;
  return (
    <>
      <span className="num mr-1.5 inline-block rounded-md bg-sky-600 px-2 py-0.5 align-middle text-[0.92em] font-black tracking-tight text-white shadow-sm dark:bg-sky-500">
        {match[1]}
      </span>
      <span className="align-middle">{match[2]}</span>
    </>
  );
}

export function GuestTransformGrid() {
  const copy = useGuestHomeSectionsCopy();
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative py-14 sm:py-16 md:py-20"
      aria-labelledby="guest-transform-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: GUEST_EASE }}
        >
          <h2
            id="guest-transform-title"
            className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {highlightLeadingCount(copy.transformTitle)}
          </h2>
          <p className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">
            {copy.transformSub}
          </p>
        </motion.div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.transformCards.map((card, i) => {
            const Icon = ICONS[i] ?? CheckCircle2;
            return (
              <motion.li
                key={card.title}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: reduceMotion ? 0 : i * 0.05,
                  ease: GUEST_EASE,
                }}
                className={cn(
                  "group rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm",
                  "transition-all duration-300 hover:-translate-y-1",
                  "hover:border-sky-400/40 hover:shadow-[0_18px_40px_-18px_rgba(56,189,248,0.55)]",
                  "dark:bg-card/60",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-xl",
                    ICON_COLORS[i],
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
