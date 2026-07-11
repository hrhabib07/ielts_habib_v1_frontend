"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePricingFaqCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { UiLanguageToggle } from "@/src/components/shared/UiLanguageToggle";

export function PricingFaqSection() {
  const copy = usePricingFaqCopy();
  const { locale } = useUiLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className={cn("space-y-5", locale === "bn" && "font-bengali")}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-xl font-semibold text-foreground">{copy.sectionTitle}</h2>
        <UiLanguageToggle />
      </div>

      <div className="divide-y rounded-xl border">
        {copy.items.map((faq, i) => (
          <div key={`${locale}-${i}`} className="px-5 py-4">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 text-left text-sm font-medium text-foreground"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              {faq.question}
              {openIndex === i ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
            </button>
            {openIndex === i && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer.text}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
