"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, Crosshair, Clock3, TrendingUp, Wind, Zap, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  guestGlassCardClass,
  useGuestLandingLocale,
} from "@/src/components/home/guest/GuestLandingLocale";
import { GuestLandingVideo } from "@/src/components/home/guest/GuestLandingVideo";
import { LandingPathMockup } from "@/src/components/home/guest/LandingPathMockup";
import { LevelPathVisual } from "@/src/components/home/guest/GuestHowItWorksVisuals";
import type { GuestHowItWorksPillarIcon, GuestHowItWorksSkillIcon } from "@/src/lib/guest-how-it-works-types";
import {
  GUEST_EASE,
  guestFadeUpViewport,
  guestStaggerContainer,
  guestStaggerItem,
} from "@/src/components/home/guest/guest-landing-motion";
import { cn } from "@/lib/utils";

const PILLAR_ICONS: Record<GuestHowItWorksPillarIcon, LucideIcon> = {
  clock: Clock3,
  focus: Crosshair,
  brain: Brain,
};

const SKILL_ICONS: Record<GuestHowItWorksSkillIcon, LucideIcon> = {
  zap: Zap,
  clock: Clock3,
  wind: Wind,
  book: BookOpen,
  trending: TrendingUp,
};

export function GuestHowGamlishWorks() {
  const reduceMotion = useReducedMotion();
  const { copy } = useGuestLandingLocale();
  const content = copy.howItWorks;

  return (
    <section
      id="how-gamlish-works"
      className="scroll-mt-24 border-t border-border/30 px-4 pb-20 pt-4 sm:px-6 sm:pb-24"
      aria-labelledby="how-gamlish-video-heading"
    >
      <div className="mx-auto max-w-5xl space-y-16 sm:space-y-20">
        {/* Video — primary focus */}
        <motion.div
          className="text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: GUEST_EASE }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
            {content.videoEyebrow}
          </p>
          <h2
            id="how-gamlish-video-heading"
            className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {content.videoTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
            {content.videoSubtitle}
          </p>
          <GuestLandingVideo
            className="mx-auto mt-6 max-w-4xl shadow-2xl shadow-accent/10 ring-1 ring-border/40"
            title={content.videoTitle}
            placeholderTitle={content.videoPlaceholderTitle}
            placeholderBody={content.videoPlaceholderBody}
          />
        </motion.div>

        {/* Three pillars — icon strip */}
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={guestFadeUpViewport}
          variants={guestStaggerContainer}
        >
          <p className="text-center text-sm font-medium text-muted-foreground sm:text-base">
            {content.pillarsTitle}
          </p>
          <ul className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
            {content.examPillars.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.icon];
              return (
                <motion.li
                  key={pillar.title}
                  variants={guestStaggerItem}
                  className={cn(
                    guestGlassCardClass,
                    "group flex flex-col items-center px-3 py-5 text-center transition-transform duration-300 hover:-translate-y-1 sm:py-6",
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/15 bg-accent/10 text-accent transition-colors group-hover:border-accent/30 group-hover:bg-accent/15">
                    <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground sm:text-base">
                    {pillar.title}
                  </p>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        {/* 21 levels — visual */}
        <motion.div
          className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: GUEST_EASE }}
        >
          <div className="text-center lg:text-left">
            <span className="guest-hiw-badge inline-flex rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
              {content.levelsBadge}
            </span>
            <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {content.levelsTitle}
            </h2>
            <p className="mt-3 text-muted-foreground sm:text-lg">{content.levelsLine}</p>
            <div className="mt-6 hidden lg:block">
              <LevelPathVisual />
            </div>
          </div>
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-6 rounded-3xl bg-accent/10 blur-3xl"
              aria-hidden
            />
            <LandingPathMockup className="relative" compact />
          </div>
        </motion.div>

        {/* Skills — compact row */}
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={guestFadeUpViewport}
          variants={guestStaggerContainer}
        >
          <h2 className="text-center text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {content.skillsTitle}
          </h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
            {content.skills.map((skill) => {
              const SkillIcon = SKILL_ICONS[skill.icon];
              return (
                <motion.li
                  key={skill.label}
                  variants={guestStaggerItem}
                  className="group inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/80 px-3.5 py-2 shadow-sm backdrop-blur-sm transition-colors hover:border-accent/25 hover:bg-accent/5 sm:px-4 sm:py-2.5"
                >
                  <SkillIcon
                    className="h-4 w-4 shrink-0 text-accent"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-foreground">{skill.label}</span>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="guest-bottom-cta relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-accent/10 via-card to-muted/15 px-6 py-10 text-center sm:px-12 sm:py-12"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: GUEST_EASE }}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,color-mix(in_oklch,var(--accent)_18%,transparent),transparent_65%)]"
            aria-hidden
          />
          <p className="relative text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {content.bottomCtaTitle}
          </p>
          <p className="relative mt-2 text-sm text-muted-foreground sm:text-base">
            {content.bottomCtaSub}
          </p>
          <Button
            size="lg"
            className="guest-cta-glow relative mt-7 h-12 rounded-full bg-accent px-10 font-semibold text-accent-foreground hover:bg-accent/92"
            asChild
          >
            <Link href="/register" className="inline-flex items-center gap-2">
              {copy.ctaPrimary}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
