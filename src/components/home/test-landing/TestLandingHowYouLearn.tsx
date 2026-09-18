"use client";

import { BookOpen, Gamepad2, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { LANDING_EYEBROW_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { TestLandingCtas } from "@/src/components/home/test-landing/TestLandingCtas";
import {
  HowLessonMock,
  HowLoopPath,
  HowPlayDemo,
  HowUnlockMock,
} from "@/src/components/home/test-landing/TestLandingHowLoopVisuals";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { cn } from "@/lib/utils";

const STEP_ICONS = [BookOpen, Gamepad2, Trophy] as const;

const STEP_CARD = [
  "border-sky-400/35 shadow-[0_24px_70px_-40px_rgba(14,165,233,0.55)]",
  "border-amber-400/40 shadow-[0_24px_70px_-40px_rgba(245,158,11,0.5)]",
  "border-emerald-400/35 shadow-[0_24px_70px_-40px_rgba(16,185,129,0.45)]",
] as const;

const STEP_REWARD = [
  "bg-sky-500/15 text-sky-800 dark:text-sky-200",
  "bg-amber-400 text-amber-950",
  "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
] as const;

export function TestLandingHowYouLearn() {
  const reduceMotion = Boolean(useReducedMotion());
  const { copy } = useTestLandingCopy();
  const stages = copy.howSteps.map((step) => step.stage);

  return (
    <section
      id="how-you-learn"
      className="relative scroll-mt-24 overflow-hidden border-y border-border/40 py-12 sm:py-20 md:py-24"
      aria-labelledby="test-landing-how-title"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(56,189,248,0.14),transparent_58%),radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(16,185,129,0.08),transparent_55%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: GUEST_EASE }}
        >
          <p className={LANDING_EYEBROW_CLASS}>{copy.howEyebrow}</p>
          <h2
            id="test-landing-how-title"
            className="mt-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            {copy.howTitle}
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-foreground/85 sm:text-xl">
            {copy.howIntro}
          </p>
        </motion.div>

        <HowLoopPath
          stages={stages}
          hint={copy.howLoopHint}
          reduceMotion={reduceMotion}
        />

        <ol className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
          {copy.howSteps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? BookOpen;
            return (
              <motion.li
                key={step.stage}
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-card/95 p-4 sm:p-5",
                  STEP_CARD[index] ?? STEP_CARD[0],
                  index === 1 && "lg:-translate-y-2",
                )}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.5,
                  delay: reduceMotion ? 0 : index * 0.08,
                  ease: GUEST_EASE,
                }}
              >
                {index === 0 ? (
                  <HowLessonMock
                    copy={copy.howLessonMock}
                    reduceMotion={reduceMotion}
                  />
                ) : null}
                {index === 1 ? (
                  <HowPlayDemo
                    copy={copy.howPlayDemo}
                    reduceMotion={reduceMotion}
                  />
                ) : null}
                {index === 2 ? (
                  <HowUnlockMock
                    copy={copy.howUnlockMock}
                    reduceMotion={reduceMotion}
                  />
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground/70">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl",
                        index === 0 && "bg-sky-500/15 text-sky-700 dark:text-sky-300",
                        index === 1 && "bg-amber-400/20 text-amber-800 dark:text-amber-200",
                        index === 2 &&
                          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    {step.stage}
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-black",
                      STEP_REWARD[index] ?? STEP_REWARD[0],
                    )}
                  >
                    {step.reward}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-bold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-base font-medium text-foreground/80">
                  {step.hook}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {step.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm leading-relaxed text-foreground/75"
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                          index === 0 && "bg-sky-500",
                          index === 1 && "bg-amber-500",
                          index === 2 && "bg-emerald-500",
                        )}
                        aria-hidden
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.li>
            );
          })}
        </ol>

        <p className="mx-auto mt-10 max-w-2xl text-center text-base leading-relaxed text-foreground/80 sm:text-lg">
          {copy.howFoot}
        </p>
        <div className="mt-6 flex justify-center">
          <TestLandingCtas copy={copy} size="block" />
        </div>
      </div>
    </section>
  );
}
