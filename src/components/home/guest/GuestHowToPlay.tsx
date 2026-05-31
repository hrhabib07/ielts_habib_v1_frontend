"use client";

import { CirclePlay, ClipboardCheck, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  guestGlassCardClass,
  guestIconTileClass,
  useGuestLandingLocale,
} from "@/src/components/home/guest/GuestLandingLocale";
import {
  GUEST_EASE,
  guestFadeUp,
  guestFadeUpViewport,
  guestStaggerContainer,
  guestStaggerItem,
} from "@/src/components/home/guest/guest-landing-motion";
import { cn } from "@/lib/utils";

const STEP_ICONS: LucideIcon[] = [CirclePlay, ClipboardCheck, Trophy];

export function GuestHowToPlay() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();

  return (
    <section
      id="how-to-play"
      className="scroll-mt-24 border-t border-border/40 px-4 py-14 sm:px-6 sm:py-20"
      aria-labelledby="how-to-play-heading"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={guestFadeUpViewport}
          variants={guestFadeUp}
          transition={{ duration: 0.6, ease: GUEST_EASE }}
        >
          <h2
            id="how-to-play-heading"
            className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:tracking-[-0.02em]"
          >
            {copy.howTitle}
          </h2>
        </motion.div>

        {/* Desktop: horizontal timeline with connectors */}
        <motion.ol
          className="relative mt-10 hidden lg:grid lg:grid-cols-3 lg:gap-6"
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={guestFadeUpViewport}
          variants={guestStaggerContainer}
          aria-label={copy.howTitle}
        >
          <div
            className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-[2.75rem] h-px bg-gradient-to-r from-transparent via-border to-transparent"
            aria-hidden
          />
          {copy.steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? CirclePlay;
            return (
              <motion.li key={step.stepNumber} variants={guestStaggerItem} className="relative list-none">
                <article
                  className={cn(
                    guestGlassCardClass,
                    "relative flex h-full flex-col p-8 transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-accent/25",
                  )}
                >
                  <div className="relative z-10 mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-accent text-sm font-bold text-accent-foreground shadow-md ring-4 ring-background">
                    {step.stepNumber}
                  </div>
                  <div className={cn(guestIconTileClass, "mx-auto mt-6")}>
                    <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                  </div>
                  <span
                    className={cn(
                      "mx-auto mt-5 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      step.badgeRequired
                        ? "bg-accent/15 text-accent ring-1 ring-accent/25"
                        : "bg-muted text-muted-foreground ring-1 ring-border/60",
                    )}
                  >
                    {step.badge}
                  </span>
                  <h3 className="mt-3 text-center text-xl font-semibold tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 flex-1 text-center text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </article>
              </motion.li>
            );
          })}
        </motion.ol>

        {/* Mobile / tablet: stacked cards with vertical timeline */}
        <motion.ol
          className="relative mt-8 space-y-5 lg:hidden"
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={guestFadeUpViewport}
          variants={guestStaggerContainer}
          aria-label={copy.howTitle}
        >
          <div
            className="pointer-events-none absolute bottom-4 left-[1.35rem] top-4 w-px bg-border"
            aria-hidden
          />
          {copy.steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? CirclePlay;
            return (
              <motion.li key={step.stepNumber} variants={guestStaggerItem} className="relative list-none pl-12">
                <span
                  className="absolute left-0 top-8 flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-accent text-sm font-bold text-accent-foreground shadow-md ring-4 ring-background"
                  aria-hidden
                >
                  {step.stepNumber}
                </span>
                <article className={cn(guestGlassCardClass, "p-6 sm:p-7")}>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className={guestIconTileClass}>
                      <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          step.badgeRequired
                            ? "bg-accent/15 text-accent ring-1 ring-accent/25"
                            : "bg-muted text-muted-foreground ring-1 ring-border/60",
                        )}
                      >
                        {step.badge}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                    </div>
                  </div>
                </article>
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}
