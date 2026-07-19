"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { LANDING_EYEBROW_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";

function splitSentences(body: string): string[] {
  return body
    .split(/(?<=[।.])\s+/)
    .map((s) => s.trim().replace(/[.।]+$/, ""))
    .filter(Boolean);
}

export function GuestComparisonSection() {
  const reduceMotion = useReducedMotion();
  const { locale, copy } = useGuestLandingLocale();
  const oldLines = splitSentences(copy.comparisonOldBody);
  const newLines = splitSentences(copy.comparisonNewBody);
  const isBn = locale === "bn";

  return (
    <section className="relative px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            className={cn(LANDING_EYEBROW_CLASS, "mx-auto")}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-48px" }}
            transition={{ duration: 0.45, ease: GUEST_EASE }}
          >
            {copy.comparisonEyebrow}
          </motion.p>
          <motion.h2
            className="mt-4 text-balance text-[1.65rem] font-bold leading-[1.2] tracking-tight text-foreground sm:text-4xl"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-48px" }}
            transition={{ duration: 0.5, delay: 0.04, ease: GUEST_EASE }}
          >
            {copy.comparisonTitle}
          </motion.h2>
          <motion.p
            className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-48px" }}
            transition={{ duration: 0.45, delay: 0.08, ease: GUEST_EASE }}
          >
            {isBn
              ? "একদিকে থেমে যাওয়া পড়াশোনা। অন্যদিকে খেলা, XP, আর এগিয়ে যাওয়ার পথ।"
              : "One side is stuck studying. The other is a play loop that keeps you moving."}
          </motion.p>
        </div>

        <motion.div
          className="mt-12 grid items-stretch gap-4 lg:grid-cols-[1fr_minmax(0,2.75rem)_1.15fr] lg:gap-0"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.1, ease: GUEST_EASE }}
        >
          {/* ——— BEFORE: quiet, archival ——— */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-stone-50/90 p-7 text-left sm:p-8 dark:border-stone-700/50 dark:bg-stone-900/40">
            <div
              className="pointer-events-none absolute inset-y-6 left-0 w-px bg-stone-300/70 dark:bg-stone-600/50"
              aria-hidden
            />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-stone-500">
              {copy.comparisonOldTitle}
            </p>
            <p className="mt-5 font-serif text-xl font-medium leading-snug tracking-tight text-stone-500 dark:text-stone-400 sm:text-2xl">
              {isBn ? "থেমে থাকা শেখা" : "Learning that stalls"}
            </p>

            <ol className="mt-8 flex flex-1 flex-col justify-center space-y-0">
              {oldLines.map((line, i) => (
                <li
                  key={line}
                  className={cn(
                    "border-t border-stone-200/90 py-4 first:border-t-0 first:pt-0 dark:border-stone-700/60",
                    i === oldLines.length - 1 && "pb-0",
                  )}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="w-6 shrink-0 font-serif text-sm tabular-nums text-stone-300 dark:text-stone-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-[15px] leading-relaxed text-stone-600 line-through decoration-stone-300/80 decoration-1 dark:text-stone-400 dark:decoration-stone-600">
                      {line}
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-8 text-[12px] font-medium text-stone-400 dark:text-stone-500">
              {isBn ? "কোনো অগ্রগতি নেই। কোনো গতি নেই।" : "No progress. No momentum."}
            </p>
          </div>

          {/* ——— Bridge ——— */}
          <div className="relative hidden items-center justify-center lg:flex">
            <div
              className="absolute inset-y-10 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-stone-200 via-sky-400/50 to-slate-800"
              aria-hidden
            />
            <motion.div
              className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-sky-500/25 bg-background text-sky-600 shadow-[0_12px_40px_-12px_rgba(56,189,248,0.45)] dark:border-sky-400/30 dark:bg-slate-950 dark:text-sky-300"
              initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.25, ease: GUEST_EASE }}
              aria-hidden
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </div>

          {/* Mobile bridge */}
          <div className="flex items-center justify-center gap-3 py-1 lg:hidden">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-sky-400/40" />
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-500/25 bg-background text-sky-600 dark:text-sky-300">
              <ArrowRight className="h-4 w-4 rotate-90" aria-hidden />
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-sky-400/40 via-border to-transparent" />
          </div>

          {/* ——— AFTER: game loop ——— */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950 p-7 text-left text-slate-50 shadow-[0_32px_80px_-36px_rgba(15,23,42,0.55)] sm:p-8">
            <div
              className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-sky-500/15 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent"
              aria-hidden
            />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400/90">
                  {copy.comparisonNewTitle}
                </p>
                <p className="mt-5 text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
                  {isBn ? "খেলে এগিয়ে যাওয়া" : "Learning that levels up"}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-black text-amber-950 shadow-[0_8px_24px_-8px_rgba(251,191,36,0.7)]">
                <Sparkles className="h-3 w-3" aria-hidden />
                +10 XP
              </span>
            </div>

            <ol className="relative mt-8 flex-1 space-y-0">
              {/* Vertical loop spine */}
              <div
                className="pointer-events-none absolute bottom-3 left-[15px] top-3 w-px bg-gradient-to-b from-sky-400/50 via-sky-500/25 to-amber-400/40"
                aria-hidden
              />

              {newLines.map((line, i) => {
                const isXp = i === 1;
                const isLast = i === newLines.length - 1;
                return (
                  <motion.li
                    key={line}
                    className={cn("relative flex gap-4 py-3.5", isLast && "pb-0")}
                    initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: 0.18 + i * 0.07,
                      ease: GUEST_EASE,
                    }}
                  >
                    <span
                      className={cn(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums",
                        isXp
                          ? "bg-amber-400 text-amber-950 ring-4 ring-amber-400/20"
                          : "bg-sky-500/15 text-sky-200 ring-4 ring-slate-950",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 pt-1">
                      <p className="text-[15px] font-medium leading-snug text-slate-100">
                        {line}
                      </p>
                      {isXp ? (
                        <p className="mt-1 text-[12px] font-medium text-amber-300/90">
                          {isBn
                            ? "প্রতি উত্তরে +1 · স্টেজ ক্লিয়ারে +10"
                            : "+1 per answer · +10 when you clear a stage"}
                        </p>
                      ) : null}
                    </div>
                  </motion.li>
                );
              })}
            </ol>

            <div className="relative mt-8 flex items-center justify-between border-t border-white/10 pt-5">
              <p className="text-[12px] font-medium text-slate-400">
                {isBn
                  ? "মিশন → XP → আনলক → আবার খেলো"
                  : "Mission → XP → unlock → play again"}
              </p>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-400">
                {isBn ? "লুপ" : "Loop"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
