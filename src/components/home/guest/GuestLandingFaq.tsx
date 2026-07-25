"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { useGuestHomeSectionsCopy } from "@/src/components/home/guest/useGuestHomeSectionsCopy";
import { cn } from "@/lib/utils";

export function GuestLandingFaq() {
  const copy = useGuestHomeSectionsCopy();
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="relative py-14 sm:py-16 md:py-20"
      aria-labelledby="guest-faq-title"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.h2
          id="guest-faq-title"
          className="text-center text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: GUEST_EASE }}
        >
          {copy.faqTitle}
        </motion.h2>

        <div
          className="mt-8 divide-y divide-border/80 overflow-hidden rounded-2xl border border-border/80 bg-card/60"
          role="list"
        >
          {copy.faq.map((item, i) => {
            const open = openIndex === i;
            const panelId = `guest-faq-panel-${i}`;
            const buttonId = `guest-faq-btn-${i}`;

            return (
              <div key={item.q} role="listitem">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    className={cn(
                      "flex w-full items-start justify-between gap-3 px-4 py-4 text-left text-base font-semibold text-foreground sm:px-5",
                      "hover:bg-muted/30",
                    )}
                    onClick={() => setOpenIndex(open ? null : i)}
                  >
                    <span>{item.q}</span>
                    <span
                      className="mt-0.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    >
                      {open ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
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
                      initial={
                        reduceMotion ? false : { height: 0, opacity: 0 }
                      }
                      animate={{ height: "auto", opacity: 1 }}
                      exit={
                        reduceMotion
                          ? undefined
                          : { height: 0, opacity: 0 }
                      }
                      transition={{ duration: 0.28, ease: GUEST_EASE }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-5">
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
