"use client";

import { useId, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePricingFaqCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import type { PricingFaqAnswer } from "@/src/lib/pricing-faq-copy";

function FaqComparison({
  answer,
}: {
  answer: Extract<PricingFaqAnswer, { kind: "comparison" }>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/60">
      <div className="grid grid-cols-2 text-sm font-bold" aria-hidden>
        <div className="bg-muted/60 px-3 py-2.5 text-foreground/60">{answer.themLabel}</div>
        <div className="bg-emerald-500/10 px-3 py-2.5 text-emerald-700 dark:text-emerald-300">
          {answer.usLabel}
        </div>
      </div>
      <dl>
        {answer.rows.map((row) => (
          <div key={row.label} className="border-t border-border/60">
            <dt className="px-3 pt-2.5 text-xs font-semibold text-muted-foreground">
              {row.label}
            </dt>
            <dd className="grid grid-cols-2 gap-3 px-3 pb-3 pt-1 text-[13px] leading-snug sm:text-sm">
              <span className="text-foreground/60">
                <span className="sr-only">{answer.themLabel}: </span>
                {row.them}
              </span>
              <span className="flex items-start gap-1.5 font-medium text-foreground">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                <span>
                  <span className="sr-only">{answer.usLabel}: </span>
                  {row.us}
                </span>
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FaqAnswer({ answer }: { answer: PricingFaqAnswer }) {
  if (answer.kind === "plain") {
    return <p>{answer.text}</p>;
  }

  return (
    <div className="space-y-3">
      <p>{answer.intro}</p>
      {answer.kind === "comparison" ? (
        <FaqComparison answer={answer} />
      ) : (
        <ul className="space-y-2">
          {answer.items.map((item) => (
            <li key={item.text} className="flex items-start gap-2">
              <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              <span>
                {item.label ? (
                  <strong className="font-semibold text-foreground">{item.label} </strong>
                ) : null}
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      )}
      {answer.outro ? <p className="font-medium text-foreground">{answer.outro}</p> : null}
    </div>
  );
}

export function PricingFaqSection({
  id,
  className,
}: {
  id?: string;
  className?: string;
}) {
  const copy = usePricingFaqCopy();
  const { locale } = useUiLocale();
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn("scroll-mt-24 space-y-4", locale === "bn" && "font-bengali", className)}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div className="space-y-1">
        <h2
          id={titleId}
          className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
        >
          {copy.sectionTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{copy.sectionSub}</p>
      </div>

      <div className="overflow-hidden rounded-[1.35rem] border border-border/70 bg-card">
        {copy.items.map((faq, i) => {
          const open = openIndex === i;
          const buttonId = `${baseId}-q-${i}`;
          const panelId = `${baseId}-a-${i}`;
          return (
            <div
              key={`${locale}-${i}`}
              className={cn(i > 0 && "border-t border-border/60")}
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-[15px] font-semibold text-foreground hover:bg-muted/30 sm:px-5 sm:text-base"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  aria-controls={panelId}
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
              </h3>
              {open ? (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="px-4 pb-4 text-sm leading-relaxed text-foreground/75 sm:px-5 sm:text-base"
                >
                  <FaqAnswer answer={faq.answer} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
