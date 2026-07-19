"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Crown,
  Gamepad2,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { Button } from "@/components/ui/button";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { useFounderBenefitsCopy } from "@/src/hooks/useLocalizedCopy";
import {
  getFounderCounter,
  type FounderLiveCounter,
  type FounderTier,
  type FounderTierLiveStat,
} from "@/src/lib/api/gamlish";
import { getFounderTierLabel } from "@/src/lib/founder-benefits-copy";
import { localizeDigits } from "@/src/lib/ui-locale";
import { cn } from "@/lib/utils";

const BENEFIT_ICONS = {
  badge: Crown,
  number: Trophy,
  wall: Star,
  game: Gamepad2,
  profile: Zap,
  squad: Users,
} as const;

const TIER_PILL: Record<FounderTier, string> = {
  GOLD: "bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 text-amber-950 shadow-[0_0_24px_-6px_rgba(251,191,36,0.7)]",
  SILVER:
    "bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 text-slate-900 shadow-[0_0_24px_-6px_rgba(148,163,184,0.55)]",
  BRONZE:
    "bg-gradient-to-br from-orange-200 via-orange-400 to-amber-700 text-orange-950 shadow-[0_0_24px_-6px_rgba(234,88,12,0.45)]",
};

const TIER_PANEL: Record<FounderTier, string> = {
  GOLD: "border-amber-400/40 from-amber-400/20 via-card to-card",
  SILVER: "border-slate-400/40 from-slate-300/25 via-card to-card",
  BRONZE: "border-orange-400/40 from-orange-400/20 via-card to-card",
};

function formatFounderNumber(n: number, locale: "en" | "bn"): string {
  return `#${localizeDigits(String(n).padStart(3, "0"), locale)}`;
}

function resolvePreviewTier(
  counter: FounderLiveCounter | null,
  ownedTier: FounderTier | null,
): { tier: FounderTier; number: number; isOwned: boolean } {
  if (ownedTier) {
    return { tier: ownedTier, number: 0, isOwned: true };
  }
  const open = counter?.tiers.find((t) => t.status === "OPEN");
  if (open) {
    return {
      tier: open.tier,
      number: open.from + open.filled,
      isOwned: false,
    };
  }
  return { tier: "GOLD", number: 1, isOwned: false };
}

function TierSpot({
  stat,
  copy,
  locale,
}: {
  stat: FounderTierLiveStat;
  copy: ReturnType<typeof useFounderBenefitsCopy>;
  locale: "en" | "bn";
}) {
  const displayLabel =
    stat.status === "LOCKED"
      ? copy.locked
      : stat.status === "SOLD_OUT"
        ? copy.soldOutTier
        : `${localizeDigits(stat.filled, locale)}/${localizeDigits(stat.capacity, locale)}`;

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-colors",
        stat.status === "OPEN"
          ? "border-amber-400/50 bg-amber-400/10"
          : "border-border/40 bg-muted/30 opacity-80",
      )}
    >
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground">
        {getFounderTierLabel(stat.tier, locale)}
      </span>
      <span className="text-xs font-bold text-foreground">{displayLabel}</span>
    </div>
  );
}

/**
 * Premium Founding Member pitch: be-first hero, reveal CTA, tier-personalized preview.
 */
export function FounderBenefitsShowcase({ className }: { className?: string }) {
  const copy = useFounderBenefitsCopy();
  const { locale } = useUiLocale();
  const { profile, isFoundingMember } = useStudentSession();
  const [open, setOpen] = useState(false);
  const [counter, setCounter] = useState<FounderLiveCounter | null>(null);

  const ownedTier =
    isFoundingMember && profile?.founderTier ? profile.founderTier : null;
  const ownedNumber =
    isFoundingMember && profile?.founderNumber != null
      ? profile.founderNumber
      : null;

  useEffect(() => {
    if (isFoundingMember) setOpen(true);
  }, [isFoundingMember]);

  useEffect(() => {
    getFounderCounter()
      .then(setCounter)
      .catch(() => setCounter(null));
  }, []);

  const preview = useMemo(() => {
    const base = resolvePreviewTier(counter, ownedTier);
    if (ownedTier && ownedNumber != null) {
      return { ...base, number: ownedNumber, isOwned: true };
    }
    return base;
  }, [counter, ownedTier, ownedNumber]);

  const tierName = getFounderTierLabel(preview.tier, locale);
  const displayName =
    profile?.displayName?.trim() ||
    profile?.username ||
    (locale === "bn" ? "আপনি" : "You");

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(251,191,36,0.22),transparent_55%),linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--background))_100%)] p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] sm:p-8",
        locale === "bn" && "font-bengali",
        className,
      )}
      lang={locale}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <div className="relative space-y-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {copy.headline}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {copy.subhead}
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            size="lg"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className={cn(
              "h-12 rounded-2xl px-6 text-sm font-bold shadow-lg transition-all",
              "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-950",
              "hover:brightness-105 hover:shadow-[0_12px_40px_-12px_rgba(245,158,11,0.65)]",
              "dark:from-amber-400 dark:via-yellow-300 dark:to-amber-500",
            )}
          >
            {open ? copy.hideCta : copy.revealCta}
            <ChevronDown
              className={cn(
                "ml-2 h-4 w-4 transition-transform duration-300",
                open && "rotate-180",
              )}
            />
          </Button>
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="space-y-5 pt-1">
              {/* Personalized badge preview */}
              <div
                className={cn(
                  "rounded-2xl border bg-gradient-to-br p-5 text-center sm:p-6",
                  TIER_PANEL[preview.tier],
                )}
              >
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {preview.isOwned
                    ? copy.yourBadgeTitle
                    : copy.previewTitle(tierName)}
                </p>

                <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
                  <div className="flex w-full items-center gap-3 rounded-2xl border border-border/50 bg-background/70 px-4 py-3 text-left backdrop-blur-sm">
                    <span
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-black",
                        TIER_PILL[preview.tier],
                      )}
                    >
                      {displayName.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-foreground">
                        {displayName}
                      </span>
                      <span className="mt-1 inline-flex">
                        <FoundingMemberBadge size="sm" showTooltip={false} />
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black",
                        TIER_PILL[preview.tier],
                      )}
                    >
                      {tierName} ·{" "}
                      {formatFounderNumber(
                        preview.number > 0 ? preview.number : 1,
                        locale,
                      )}
                    </span>
                  </div>

                  <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                    {preview.isOwned ? copy.yourPreviewBody : copy.previewBody}
                  </p>
                </div>
              </div>

              {/* Live spots */}
              {counter?.isOpen ? (
                <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 text-center">
                  <p className="inline-flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300">
                    <Crown className="h-4 w-4" />
                    {copy.spotsLeft(
                      localizeDigits(counter.slotsRemaining, locale),
                      localizeDigits(counter.maxSlots, locale),
                    )}
                  </p>
                  <div className="mt-3 flex items-stretch gap-2">
                    {counter.tiers.map((stat) => (
                      <TierSpot
                        key={stat.tier}
                        stat={stat}
                        copy={copy}
                        locale={locale}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {copy.counterHint}
                  </p>
                </div>
              ) : counter && !counter.isOpen ? (
                <p className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
                  {copy.soldOut}
                </p>
              ) : null}

              <div>
                <h3 className="mb-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {copy.benefitsTitle}
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {copy.benefits.map((benefit) => {
                    const Icon =
                      BENEFIT_ICONS[benefit.id as keyof typeof BENEFIT_ICONS] ??
                      Sparkles;
                    return (
                      <li
                        key={benefit.id}
                        className="flex gap-3 rounded-2xl border border-border/40 bg-card/70 p-3.5 shadow-sm backdrop-blur-sm"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-700 dark:text-amber-300">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-foreground">
                            {benefit.title}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                            {benefit.body}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span>{copy.afterCloseNote}</span>
              </div>

              <p className="text-center text-xs">
                <Link
                  href="/founding-members"
                  className="inline-flex items-center gap-1.5 font-semibold text-amber-700 underline-offset-2 hover:underline dark:text-amber-300"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {copy.wallLink}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
