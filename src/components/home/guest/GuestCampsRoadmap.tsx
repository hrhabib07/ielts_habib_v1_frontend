"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { useGuestHomeSectionsCopy } from "@/src/components/home/guest/useGuestHomeSectionsCopy";
import { cn } from "@/lib/utils";

export function GuestCampsRoadmap() {
  const copy = useGuestHomeSectionsCopy();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  return (
    <section
      className="relative border-y border-border/40 bg-muted/30 py-14 dark:bg-muted/15 sm:py-16 md:py-20"
      aria-labelledby="guest-roadmap-title"
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
            id="guest-roadmap-title"
            className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            {copy.roadmapTitle}
          </h2>
          <p className="mt-3 text-pretty text-base text-muted-foreground sm:text-lg">
            {copy.roadmapSub}
          </p>
        </motion.div>

        {/* Desktop horizontal roadmap */}
        <div className="relative mt-12 hidden lg:block">
          <div
            className="absolute left-[8%] right-[8%] top-8 h-0.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 opacity-50"
            aria-hidden
          />
          <ol className="relative grid grid-cols-4 gap-4">
            {copy.camps.map((camp, i) => {
              const isActive = active === i;
              return (
                <li key={camp.badge}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    aria-label={camp.title}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className={cn(
                      "w-full rounded-2xl border bg-card/90 p-4 text-left shadow-sm backdrop-blur-sm transition-all duration-300",
                      isActive
                        ? "border-sky-400/70 shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_16px_36px_-16px_rgba(56,189,248,0.55)]"
                        : "border-border/70 hover:border-sky-400/40",
                    )}
                  >
                    <span className="inline-flex rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                      {camp.badge}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold leading-snug text-foreground">
                      {camp.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {camp.body}
                    </p>
                    {isActive ? (
                      <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
                        {camp.skills.map((skill) => (
                          <li
                            key={skill}
                            className="flex items-start gap-1.5 text-xs text-foreground/85"
                          >
                            <Check
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500"
                              aria-hidden
                            />
                            {skill}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Mobile vertical timeline */}
        <ol className="relative mt-10 space-y-4 lg:hidden">
          <div
            className="absolute bottom-4 left-[1.15rem] top-4 w-px bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-500 opacity-50"
            aria-hidden
          />
          {copy.camps.map((camp, i) => {
            const isActive = active === i;
            return (
              <li key={camp.badge} className="relative pl-10">
                <span
                  className={cn(
                    "absolute left-0 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-sky-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.55)]"
                      : "bg-card text-sky-700 ring-1 ring-sky-400/40 dark:text-sky-300",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  aria-pressed={isActive}
                  aria-label={camp.title}
                  onClick={() => setActive(i)}
                  className={cn(
                    "w-full rounded-2xl border bg-card/90 p-4 text-left transition-all",
                    isActive
                      ? "border-sky-400/70 shadow-[0_12px_30px_-14px_rgba(56,189,248,0.5)]"
                      : "border-border/70",
                  )}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                    {camp.badge}
                  </span>
                  <h3 className="mt-1.5 text-sm font-semibold text-foreground">
                    {camp.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {camp.body}
                  </p>
                  {isActive ? (
                    <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
                      {camp.skills.map((skill) => (
                        <li
                          key={skill}
                          className="flex items-start gap-1.5 text-xs text-foreground/85"
                        >
                          <Check
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500"
                            aria-hidden
                          />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
