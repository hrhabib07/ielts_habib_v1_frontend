"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { cn } from "@/lib/utils";
import { Flag, Compass, Clock3, Sparkles, type LucideIcon } from "lucide-react";

const CAMP_ICONS: readonly LucideIcon[] = [Flag, Compass, Clock3, Sparkles];

const CAMP_SURFACE = [
  "bg-[#0f172a]",
  "bg-[#132038]",
  "bg-[#152544]",
  "bg-[#1a2f52]",
] as const;

/** Visual camp strip. Always visible (no opacity-0 trap). */
export function GuestCampShowcase() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();

  return (
    <div>
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
        {copy.campShowcaseEyebrow}
      </p>
      <h2 className="mt-3 text-center text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {copy.campShowcaseTitle}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground sm:text-base">
        {copy.campShowcaseSub}
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {copy.mockupZones.map((zone, i) => {
          const Icon = CAMP_ICONS[i] ?? Flag;
          return (
            <motion.li
              key={zone.zoneLabel}
              className="group relative overflow-hidden rounded-2xl ring-1 ring-border/40 shadow-md"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: reduceMotion ? 0 : i * 0.08,
                ease: GUEST_EASE,
              }}
            >
              <div
                className={cn(
                  "relative flex min-h-[10.5rem] flex-col justify-between p-4 sm:min-h-[11.5rem] sm:p-5",
                  CAMP_SURFACE[i] ?? CAMP_SURFACE[0],
                )}
              >
                <div className="guest-camp-art-dots absolute inset-0 opacity-40" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" aria-hidden />

                <div className="relative flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-steel backdrop-blur-sm">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>

                <div className="relative mt-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-steel">
                    {zone.zoneLabel}
                  </p>
                  <p className="mt-1 text-base font-semibold text-white sm:text-lg">
                    {zone.title}
                  </p>
                  <div className="mt-3 h-0.5 w-12 rounded-full bg-steel/90 transition-all duration-300 group-hover:w-20" />
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
