"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRICING_FAQ_COPY,
  PRICING_FAQ_LOCALE_STORAGE_KEY,
  type PricingFaqAnswer,
  type PricingFaqLocale,
} from "@/src/lib/pricing-faq-copy";

const GUARANTEE_POLICY_PATH = "/score-guarantee";

function readStoredLocale(): PricingFaqLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PRICING_FAQ_LOCALE_STORAGE_KEY);
    return raw === "bn" || raw === "en" ? raw : null;
  } catch {
    return null;
  }
}

function FaqAnswerBody({
  answer,
}: {
  answer: PricingFaqAnswer;
}) {
  if (answer.kind === "plain") {
    return <>{answer.text}</>;
  }
  return (
    <>
      {answer.before}
      <Link
        href={GUARANTEE_POLICY_PATH}
        className="font-medium text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary/90 hover:decoration-primary/60"
      >
        {answer.linkText}
      </Link>
      {answer.after}
    </>
  );
}

export function PricingFaqSection() {
  const [locale, setLocale] = useState<PricingFaqLocale>("en");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored) setLocale(stored);
  }, []);

  const persistLocale = useCallback((next: PricingFaqLocale) => {
    setLocale(next);
    try {
      window.localStorage.setItem(PRICING_FAQ_LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const copy = PRICING_FAQ_COPY[locale];

  return (
    <section
      className={cn("space-y-5", locale === "bn" && "font-bengali")}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-xl font-semibold text-foreground">{copy.sectionTitle}</h2>
        <div
          className="flex flex-col gap-2 sm:items-end"
          role="group"
          aria-label={copy.languageToggleAria}
        >
          <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground sm:text-right">
            {copy.languageToggleHint}
          </span>
          <div className="inline-flex rounded-full border border-border/80 bg-muted/40 p-1 shadow-inner backdrop-blur-sm dark:bg-muted/25">
            <button
              type="button"
              onClick={() => persistLocale("en")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                locale === "en"
                  ? "bg-background text-foreground shadow-sm dark:bg-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={locale === "en"}
            >
              {copy.englishLabel}
            </button>
            <button
              type="button"
              onClick={() => persistLocale("bn")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                locale === "bn"
                  ? "bg-background text-foreground shadow-sm dark:bg-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={locale === "bn"}
            >
              {copy.banglaLabel}
            </button>
          </div>
        </div>
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
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                <FaqAnswerBody answer={faq.answer} />
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
