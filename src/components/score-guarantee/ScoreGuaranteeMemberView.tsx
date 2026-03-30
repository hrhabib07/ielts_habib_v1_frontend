"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Award,
  ArrowLeft,
  Droplets,
  FileCheck,
  Scale,
  Shield,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SCORE_GUARANTEE_POLICY_COPY,
  SCORE_GUARANTEE_LOCALE_STORAGE_KEY,
  type ScoreGuaranteePolicyLocale,
} from "@/src/lib/score-guarantee-policy-copy";

const CRITERIA_ICONS = [Award, Droplets, Scale, Timer, FileCheck] as const;
const BENGALI_STEP_NUMERALS = ["১", "২", "৩", "৪", "৫"] as const;

function readStoredLocale(): ScoreGuaranteePolicyLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SCORE_GUARANTEE_LOCALE_STORAGE_KEY);
    return raw === "bn" || raw === "en" ? raw : null;
  } catch {
    return null;
  }
}

export interface ScoreGuaranteeMemberViewProps {
  /** `public` = back link to pricing (no login required for this route). */
  readonly variant?: "member" | "public";
}

export function ScoreGuaranteeMemberView({ variant = "member" }: ScoreGuaranteeMemberViewProps) {
  const [locale, setLocale] = useState<ScoreGuaranteePolicyLocale>("en");
  const isPublic = variant === "public";

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored) setLocale(stored);
  }, []);

  const persistLocale = useCallback((next: ScoreGuaranteePolicyLocale) => {
    setLocale(next);
    try {
      window.localStorage.setItem(SCORE_GUARANTEE_LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const copy = SCORE_GUARANTEE_POLICY_COPY[locale];

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-3xl space-y-12 pb-12 pt-2 md:pt-4",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <nav aria-label="Breadcrumb">
          <Button variant="ghost" size="sm" className="-ml-2 gap-2 text-muted-foreground" asChild>
            <Link href={isPublic ? "/pricing" : "/profile"}>
              <ArrowLeft className="h-4 w-4" />
              {isPublic ? copy.backToPricing : copy.backToProfile}
            </Link>
          </Button>
        </nav>

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

      <header className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm md:p-10">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/[0.07] blur-3xl dark:bg-primary/15"
          aria-hidden
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            <Shield className="h-3.5 w-3.5" />
            {isPublic ? copy.badgePublic : copy.badge}
          </div>
          <h1 className="mt-5 text-balance text-3xl font-bold leading-[1.12] tracking-[-0.03em] text-foreground md:text-4xl md:leading-[1.1]">
            {copy.headlineLead}
            <span className="text-primary">{copy.headlineBrand}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-medium italic leading-snug text-foreground/90">
            {copy.tagline}
          </p>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {copy.intro}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {isPublic ? (
              <>
                <Button asChild>
                  <Link href="/register">{copy.getStartedPublic}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/pricing">{copy.plansBilling}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link href="/profile/reading">{copy.continuePath}</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/pricing">{copy.plansBilling}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section aria-labelledby="member-criteria-heading" className="space-y-6">
        <div>
          <h2
            id="member-criteria-heading"
            className="text-xl font-bold tracking-tight text-foreground md:text-2xl"
          >
            {copy.checklistTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {copy.checklistLead}
          </p>
        </div>
        <ol className="space-y-4">
          {copy.criteria.map((item, index) => {
            const Icon = CRITERIA_ICONS[index] ?? Award;
            const stepLabel =
              locale === "bn"
                ? BENGALI_STEP_NUMERALS[index] ?? String(index + 1)
                : index + 1;
            return (
              <li
                key={`${locale}-${item.title}`}
                className="flex gap-4 rounded-2xl border border-border/80 bg-muted/20 p-5 md:gap-5 md:p-6"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-sm font-bold text-primary shadow-sm ring-1 ring-border/60"
                  aria-hidden
                >
                  {stepLabel}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {item.body}
                  </p>
                </div>
                <span
                  className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex"
                  aria-hidden
                >
                  <Icon className="h-5 w-5" />
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section
        aria-labelledby="why-90-member"
        className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-background to-background p-8 md:p-10"
      >
        <h2
          id="why-90-member"
          className="text-xl font-bold tracking-tight text-foreground md:text-2xl"
        >
          {copy.whyTitle}
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          {copy.whyBody}
        </p>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground italic md:text-base">
          ({copy.whyAffiliateNote})
        </p>
      </section>

      <footer className="rounded-2xl border border-dashed border-border bg-muted/15 px-5 py-6 md:px-6">
        <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">{copy.footerNote}</p>
      </footer>
    </div>
  );
}
