"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { useGuestHomeSectionsCopy } from "@/src/components/home/guest/useGuestHomeSectionsCopy";
import { cn } from "@/lib/utils";

const STEP_GRADIENTS = [
  "from-sky-400 to-blue-600",
  "from-violet-400 to-indigo-600",
  "from-amber-400 to-orange-500",
] as const;

export function GuestGameEngine() {
  const copy = useGuestHomeSectionsCopy();
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative py-14 sm:py-16 md:py-20"
      aria-labelledby="guest-engine-title"
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
            id="guest-engine-title"
            className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {copy.engineTitle}
          </h2>
          <p className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">
            {copy.engineSub}
          </p>
        </motion.div>

        <ol className="relative mt-12 grid gap-6 md:grid-cols-3 md:gap-5">
          {copy.engineSteps.map((step, i) => (
            <motion.li
              key={step.title}
              className="relative"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.5,
                delay: reduceMotion ? 0 : i * 0.08,
                ease: GUEST_EASE,
              }}
            >
              {!reduceMotion ? (
                <motion.span
                  className={cn(
                    "pointer-events-none absolute -top-3 right-4 z-10",
                    i === 0 &&
                      "rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-black text-amber-950 shadow-lg shadow-amber-500/30",
                    i > 0 && "text-xl",
                  )}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 2.6,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  aria-hidden
                >
                  {i === 0 ? "+10 XP" : i === 1 ? "👑" : "🔥"}
                </motion.span>
              ) : null}

              <div className="h-full rounded-2xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur-sm dark:bg-card/60">
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black text-white shadow-md",
                    STEP_GRADIENTS[i],
                  )}
                >
                  {i + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>

              {i < copy.engineSteps.length - 1 ? (
                <div
                  className="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 border-t-2 border-dashed border-sky-400/50 md:block"
                  aria-hidden
                />
              ) : null}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
