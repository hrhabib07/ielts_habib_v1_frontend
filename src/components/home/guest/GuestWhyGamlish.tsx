"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Target, Layers } from "lucide-react";
import {
  guestGlassCardClass,
  guestIconTileSmClass,
  useGuestLandingLocale,
} from "@/src/components/home/guest/GuestLandingLocale";
import {
  GUEST_EASE,
  guestFadeUp,
  guestFadeUpViewport,
} from "@/src/components/home/guest/guest-landing-motion";

const BAR_HEIGHTS = [42, 58, 71, 68, 84] as const;

function AccuracyMockup() {
  const { copy } = useGuestLandingLocale();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`relative overflow-hidden p-8 ${guestGlassCardClass}`}
      aria-hidden
      initial={reduceMotion ? false : { opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={guestFadeUpViewport}
      transition={{ duration: 0.7, ease: GUEST_EASE }}
    >
      <div className="flex items-end justify-between gap-3">
        {BAR_HEIGHTS.map((baseH, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <motion.div
              className="w-full rounded-t-lg bg-gradient-to-t from-accent to-accent/35"
              style={{ height: baseH }}
              animate={
                reduceMotion ? undefined : { height: [baseH, baseH + 8, baseH] }
              }
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }
              }
            />
            <span className="text-[9px] font-medium text-muted-foreground">L{i + 2}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-success/20 bg-success/8 px-5 py-4 dark:bg-success/12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-success">
          {copy.mockupBaselineLabel}
        </p>
        <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {copy.mockupBaselineBand}
        </p>
      </div>
    </motion.div>
  );
}

function ProgressionMockup() {
  const { copy } = useGuestLandingLocale();
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(
      () => setActiveIndex((i) => (i + 1) % copy.mockupSkillTags.length),
      2800,
    );
    return () => clearInterval(id);
  }, [reduceMotion, copy.mockupSkillTags.length]);

  return (
    <motion.div
      className={`relative overflow-hidden p-8 ${guestGlassCardClass}`}
      aria-hidden
      initial={reduceMotion ? false : { opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={guestFadeUpViewport}
      transition={{ duration: 0.7, ease: GUEST_EASE }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {copy.mockupOneSkillLabel}
      </p>
      <ul className="mt-5 space-y-2.5">
        {copy.mockupSkillTags.map((tag, i) => {
          const isActive = i === activeIndex;
          const isDone = i < activeIndex;
          return (
            <li
              key={tag}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors duration-500 ${
                isActive
                  ? "border-accent/35 bg-accent/8 dark:bg-accent/12"
                  : "border-border/50 bg-muted/30 dark:bg-muted/15"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold transition-colors duration-500 ${
                  isActive
                    ? "bg-accent/15 text-accent ring-1 ring-accent/25"
                    : isDone
                      ? "bg-success/12 text-success ring-1 ring-success/20"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? "✓" : "·"}
              </span>
              <span className="text-sm font-medium text-foreground">{tag}</span>
              {isActive && (
                <motion.span
                  className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-accent"
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {copy.mockupNowLabel}
                </motion.span>
              )}
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

function FeatureBlock({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={guestFadeUpViewport}
      variants={guestFadeUp}
      transition={{ duration: 0.65, ease: GUEST_EASE }}
    >
      {children}
    </motion.div>
  );
}

export function GuestWhyGamlish() {
  const { copy } = useGuestLandingLocale();
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-t border-border/40 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl space-y-24">
        <FeatureBlock>
          <div>
            <div className={guestIconTileSmClass}>
              <Target className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:tracking-[-0.02em]">
              {copy.accuracyTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {copy.accuracyBody}
            </p>
          </div>
          <AccuracyMockup />
        </FeatureBlock>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            className="order-1 lg:order-2"
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={guestFadeUpViewport}
            variants={guestFadeUp}
            transition={{ duration: 0.65, ease: GUEST_EASE }}
          >
            <div className={guestIconTileSmClass}>
              <Layers className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:tracking-[-0.02em]">
              {copy.progressionTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {copy.progressionBody}
            </p>
          </motion.div>
          <div className="order-2 lg:order-1">
            <ProgressionMockup />
          </div>
        </div>

        <motion.div
          className="guest-bottom-cta relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-accent/8 via-card to-muted/20 px-8 py-12 text-center sm:px-12 sm:py-14"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={guestFadeUpViewport}
          transition={{ duration: 0.7, ease: GUEST_EASE }}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(56,189,248,0.12),transparent_65%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(56,189,248,0.08),transparent_65%)]"
            aria-hidden
          />
          <p className="relative text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {copy.bottomCtaTitle}
          </p>
          <p className="relative mt-3 text-sm text-muted-foreground sm:text-base">
            {copy.bottomCtaSub}
          </p>
          <Button
            size="lg"
            className="guest-cta-glow relative mt-8 h-12 rounded-full bg-accent px-10 font-semibold text-accent-foreground hover:bg-accent/92"
            asChild
          >
            <Link href="/register">{copy.ctaPrimary}</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
