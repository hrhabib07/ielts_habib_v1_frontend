"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePricingFaqCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";

export function PricingFaqSection() {
  const copy = usePricingFaqCopy();
  const { locale } = useUiLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className={cn("space-y-5", locale === "bn" && "font-bengali")}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {copy.sectionTitle}
      </h2>

      <div className="overflow-hidden rounded-[1.35rem] border border-border/70 bg-card">
        {copy.items.map((faq, i) => {
          const open = openIndex === i;
          return (
            <div
              key={`${locale}-${i}`}
              className={cn(i > 0 && "border-t border-border/60")}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-foreground"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
              >
                {faq.question}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              {open ? (
                <p className="px-5 pb-4 text-sm leading-relaxed text-foreground/75 sm:text-base">
                  {faq.answer.text}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
