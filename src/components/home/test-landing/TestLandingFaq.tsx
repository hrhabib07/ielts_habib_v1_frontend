"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { cn } from "@/lib/utils";

export function TestLandingFaq() {
  const copy = useTestLandingCopy().copy;
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="relative border-t border-border/40 py-12 sm:py-20 md:py-24"
      aria-labelledby="test-landing-faq-title"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2
          id="test-landing-faq-title"
          className="text-center text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
        >
          {copy.faqTitle}
        </h2>

        <div
          className="mt-8 divide-y divide-border/70 overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/80 shadow-sm"
          role="list"
        >
          {copy.faq.map((item, i) => {
            const open = openIndex === i;
            const panelId = `test-landing-faq-panel-${i}`;
            const buttonId = `test-landing-faq-btn-${i}`;

            return (
              <div key={item.q} role="listitem">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    className={cn(
                      "flex w-full items-start justify-between gap-3 px-4 py-4 text-left text-lg font-semibold text-foreground sm:px-5 sm:text-xl",
                      "hover:bg-muted/30",
                    )}
                    onClick={() => setOpenIndex(open ? null : i)}
                  >
                    <span>{item.q}</span>
                    <span className="mt-1 shrink-0 text-muted-foreground" aria-hidden>
                      {open ? (
                        <Minus className="h-5 w-5" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: GUEST_EASE }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-5 text-base leading-relaxed text-foreground/80 sm:px-5 sm:text-lg">
                        {item.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
