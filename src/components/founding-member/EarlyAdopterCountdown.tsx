"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { getPublicPricing } from "@/src/lib/api/pricing";
import { formatFoundingCountdown } from "@/src/lib/foundingMember";
import { msUntilIso } from "@/src/lib/seasonal-offer";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

/**
 * Timed offer strip for First Week / First Month Adopter windows.
 * Hidden when no offerEndsAt or timer expired. Price always from API.
 */
export function EarlyAdopterCountdown(props: {
  className?: string;
  showLink?: boolean;
}) {
  const { className, showLink = true } = props;
  const { locale } = useUiLocale();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    let endsAt: string | null = null;
    let cancelled = false;

    void getPublicPricing()
      .then((pricing) => {
        if (cancelled) return;
        if (
          pricing.offerCohort !== "first_week" &&
          pricing.offerCohort !== "first_month"
        ) {
          setRemainingMs(0);
          return;
        }
        endsAt = pricing.offerEndsAt ?? null;
        setLabel(
          locale === "bn"
            ? (pricing.offerLabelBn ?? pricing.offerLabelEn ?? "অফার")
            : (pricing.offerLabelEn ?? "Offer"),
        );
        setRemainingMs(msUntilIso(endsAt));
      })
      .catch(() => {
        if (!cancelled) setRemainingMs(0);
      });

    const id = window.setInterval(() => {
      if (!endsAt) return;
      setRemainingMs(msUntilIso(endsAt));
    }, 30_000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [locale]);

  if (remainingMs === null || remainingMs <= 0) {
    return null;
  }

  const { days, hours, minutes } = formatFoundingCountdown(remainingMs);

  const inner = (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-sky-500/10 px-3 py-2 text-xs text-foreground ring-1 ring-amber-500/10",
        locale === "bn" && "font-bengali",
        className,
      )}
    >
      <Clock3 className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
      <span className="font-medium text-muted-foreground">
        {label}{" "}
        {locale === "bn" ? "বন্ধ হতে বাকি" : "closes in"}{" "}
        <span className="font-semibold tabular-nums text-amber-800 dark:text-amber-200">
          {days}d {hours}h {minutes}m
        </span>
      </span>
    </div>
  );

  if (!showLink) return inner;

  return (
    <Link href="/pricing" className="block transition-opacity hover:opacity-95">
      {inner}
    </Link>
  );
}
