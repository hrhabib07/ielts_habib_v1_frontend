"use client";

import { Lock, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { cn } from "@/lib/utils";

export function GuestCampShowcase() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-md">
        <motion.div
          className="text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: GUEST_EASE }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            {copy.campShowcaseEyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {copy.campShowcaseTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {copy.campShowcaseSub}
          </p>
        </motion.div>

        <ol className="relative mt-8 space-y-3">
          <div
            className="pointer-events-none absolute bottom-4 left-[1.35rem] top-4 w-px bg-gradient-to-b from-primary/50 via-border to-border"
            aria-hidden
          />
          {copy.mockupZones.map((zone, index) => {
            const unlocked = Boolean(zone.freeStart) || index === 0;
            return (
              <motion.li
                key={zone.zoneLabel}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl border px-4 py-3.5",
                  unlocked
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/40 bg-muted/25 opacity-80",
                )}
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.05,
                  ease: GUEST_EASE,
                }}
              >
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black",
                    unlocked
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {unlocked ? (
                    <Sparkles className="h-4 w-4" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-xs font-semibold text-muted-foreground">
                    {zone.zoneLabel}
                    {zone.freeStart ? ` · ${copy.campFreeStart}` : ""}
                  </span>
                  <span className="block text-sm font-bold text-foreground">
                    {zone.title}
                  </span>
                </span>
                {!unlocked ? (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {copy.campLocked}
                  </span>
                ) : null}
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
