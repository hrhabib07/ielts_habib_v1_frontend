"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  LineChart,
  ShieldCheck,
  Target,
  Waypoints,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  HOW_IT_WORKS_COPY,
  HOW_IT_WORKS_LOCALE_STORAGE_KEY,
  type HowItWorksLocale,
  type HowItWorksSectionIcon,
} from "@/src/lib/how-it-works-copy";

const SECTION_ICONS: Record<HowItWorksSectionIcon, LucideIcon> = {
  goal: Target,
  adaptive: Waypoints,
  levels: Layers,
  readiness: LineChart,
  refund: ShieldCheck,
};

const BENGALI_STEP_NUMERALS = ["১", "২", "৩", "৪", "৫"] as const;

function readStoredLocale(): HowItWorksLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(HOW_IT_WORKS_LOCALE_STORAGE_KEY);
    return raw === "bn" || raw === "en" ? raw : null;
  } catch {
    return null;
  }
}

export function HowItWorksContent() {
  const [locale, setLocale] = useState<HowItWorksLocale>("en");

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored) setLocale(stored);
  }, []);

  const persistLocale = useCallback((next: HowItWorksLocale) => {
    setLocale(next);
    try {
      window.localStorage.setItem(HOW_IT_WORKS_LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const copy = HOW_IT_WORKS_COPY[locale];

  return (
    <div
      className={cn(
        "relative min-h-[calc(100vh-6rem)]",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(42vh,28rem)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--primary)_0%,transparent_58%)] opacity-[0.09] dark:opacity-[0.14]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-24 h-px max-w-4xl mx-auto bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 md:py-16">
        <Button variant="ghost" size="sm" className="mb-8 -ml-2 gap-2 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            {copy.back}
          </Link>
        </Button>

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="min-w-0 flex-1 space-y-3">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-[2.35rem] md:leading-[1.15]">
              {copy.title}
            </h1>
          </div>

          <div
            className="flex shrink-0 flex-col gap-2 sm:items-end"
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

        <ol className="mt-12 space-y-4 sm:mt-14 sm:space-y-5">
          {copy.sections.map((section, index) => {
            const Icon = SECTION_ICONS[section.icon];
            const step = index + 1;
            return (
              <li key={section.title}>
                <Card className="group overflow-hidden border-border/70 bg-card/85 shadow-sm backdrop-blur-[2px] transition-[box-shadow,transform] duration-300 hover:border-primary/25 hover:shadow-md dark:bg-card/70">
                  <div className="flex gap-4 p-5 sm:gap-5 sm:p-6 md:gap-6">
                    <div className="flex shrink-0 flex-col items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold tabular-nums text-primary dark:bg-primary/15">
                        {locale === "bn"
                          ? BENGALI_STEP_NUMERALS[index] ?? String(step)
                          : step}
                      </span>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/[0.06] text-primary transition-colors group-hover:border-primary/25 group-hover:bg-primary/10 dark:bg-primary/10">
                        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                      <h2 className="text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
                        {section.title}
                      </h2>
                      <p className="text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
                        {section.body}
                      </p>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>

        <div className="relative mt-14 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-primary/[0.04] to-transparent p-8 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] dark:from-primary/15 dark:via-primary/8 sm:mt-16 sm:p-10 md:p-12">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20"
            aria-hidden
          />
          <div className="relative flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <p className="max-w-md text-sm font-medium leading-relaxed text-foreground/90 sm:text-base">
              {copy.ctaHint}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:shrink-0">
              <Button size="lg" className="h-12 gap-2 px-7 text-base font-semibold shadow-lg shadow-primary/15" asChild>
                <Link href="/register">
                  {copy.ctaPrimary}
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 border-border/90 bg-background/60 px-6 text-base font-semibold backdrop-blur-sm" asChild>
                <Link href="/login">{copy.ctaSecondary}</Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
