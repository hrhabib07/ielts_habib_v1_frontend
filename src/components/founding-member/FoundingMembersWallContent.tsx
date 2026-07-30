"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFoundersWall,
  type FoundersWall,
  type FounderTier,
  type FounderTierLiveStat,
  type FounderWallMember,
} from "@/src/lib/api/gamlish";
import { FoundersWallClosingCountdown } from "@/src/components/founding-member/FoundersWallClosingCountdown";
import { FounderInlineCountdown } from "@/src/components/founding-member/FounderInlineCountdown";
import { isFoundingMemberWindowOpen } from "@/src/lib/foundingMember";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { FOUNDERS_WALL_PAGE_COPY } from "@/src/lib/founders-wall-page-copy";
import { localizeDigits } from "@/src/lib/ui-locale";

const TIER_ORDER: FounderTier[] = ["GOLD", "SILVER", "BRONZE"];

const TIER_BADGE: Record<FounderTier, string> = {
  GOLD: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950",
  SILVER: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900",
  BRONZE: "bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950",
};

const TIER_TEXT: Record<FounderTier, string> = {
  GOLD: "text-amber-600 dark:text-amber-400",
  SILVER: "text-slate-500 dark:text-slate-300",
  BRONZE: "text-orange-600 dark:text-orange-400",
};

function TierCounter({
  stat,
  label,
  lockedLabel,
  soldOutLabel,
}: {
  stat: FounderTierLiveStat;
  label: string;
  lockedLabel: string;
  soldOutLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card/80 p-4 text-center shadow-sm">
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold",
          TIER_BADGE[stat.tier],
        )}
      >
        <Trophy className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {stat.status === "LOCKED" ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Lock className="h-3 w-3" /> {lockedLabel}
        </span>
      ) : stat.status === "SOLD_OUT" ? (
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
          {soldOutLabel}
        </span>
      ) : (
        <span className={cn("text-sm font-bold tabular-nums", TIER_TEXT[stat.tier])}>
          {stat.filled} / {stat.capacity}
        </span>
      )}
    </div>
  );
}

function MemberRow({ member }: { member: FounderWallMember }) {
  return (
    <li>
      <Link
        href={`/u/${member.handle}`}
        className="group flex items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-3.5 shadow-sm transition-all duration-200 hover:border-amber-400/40 hover:shadow-md"
      >
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
            TIER_BADGE[member.founderTier],
          )}
        >
          #{String(member.founderNumber).padStart(3, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-foreground">
            {member.displayName}
          </span>
          {member.username ? (
            <span className="block truncate text-xs text-muted-foreground">
              @{member.username}
            </span>
          ) : null}
        </span>
      </Link>
    </li>
  );
}

function JoinHereSlot({
  nextNumber,
  numberLabel,
  sub,
  cta,
  aria,
  locale,
}: {
  nextNumber: number;
  numberLabel: string;
  sub: string;
  cta: string;
  aria: string;
  locale: "bn" | "en";
}) {
  const padded = String(nextNumber).padStart(3, "0");
  if (!isFoundingMemberWindowOpen()) return null;

  return (
    <section className="mt-10" aria-label={aria}>
      <Link
        href="/checkout"
        className="flex w-full flex-col gap-3 rounded-2xl border border-dashed border-amber-500/55 bg-gradient-to-r from-amber-400/15 via-amber-400/10 to-transparent p-4 transition-colors hover:from-amber-400/25 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-sm font-black tabular-nums text-amber-950 shadow-sm">
          #{padded}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-base font-bold tracking-tight text-amber-950 dark:text-amber-100 sm:text-lg">
            {numberLabel}
          </span>
          <FounderInlineCountdown
            locale={locale}
            size="sm"
            className="mt-1.5"
          />
          <span className="mt-1 block text-sm text-amber-900/80 dark:text-amber-200/80">
            {sub}
          </span>
        </span>
        <span className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 px-4 text-sm font-bold text-amber-950 shadow-sm transition-colors hover:bg-amber-400">
          {cta}
        </span>
      </Link>
    </section>
  );
}

export function FoundingMembersWallContent() {
  const { locale } = useUiLocale();
  const copy = FOUNDERS_WALL_PAGE_COPY[locale === "bn" ? "bn" : "en"];
  const [wall, setWall] = useState<FoundersWall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFoundersWall()
      .then(setWall)
      .catch(() => setError(copy.loadError))
      .finally(() => setLoading(false));
  }, [copy.loadError]);

  const membersByTier = (tier: FounderTier): FounderWallMember[] =>
    (wall?.members ?? []).filter((m) => m.founderTier === tier);

  const filled = wall?.counter.slotsFilled ?? 0;
  const max = wall?.counter.maxSlots ?? 100;
  const showJoinSlot = wall?.counter.isOpen === true && filled < max;
  const filledLabel = localizeDigits(filled, locale);
  const maxLabel = localizeDigits(max, locale);
  const nextPadded = String(filled + 1).padStart(3, "0");

  const tierLabel = (tier: FounderTier): string => {
    if (tier === "GOLD") return copy.gold;
    if (tier === "SILVER") return copy.silver;
    return copy.bronze;
  };

  return (
    <div
      className={cn(
        "relative mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16",
        locale === "bn" && "font-bengali",
      )}
      lang={locale}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {locale === "bn" ? copy.titleBn : copy.titleEn}
        </h1>
        {locale === "bn" && copy.titleEnSmall ? (
          <p className="mt-1 font-sans text-sm font-semibold tracking-wide text-amber-800/80 dark:text-amber-300/80">
            {copy.titleEnSmall}
          </p>
        ) : null}
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {copy.sub}
        </p>
      </header>

      <FoundersWallClosingCountdown
        nextFounderNumber={wall ? filled + 1 : null}
      />

      {loading ? (
        <div className="mt-12 flex justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <p className="mt-12 text-center text-sm text-destructive">{error}</p>
      ) : (
        <>
          {wall?.counter ? (
            <section className="mt-8 grid grid-cols-3 gap-3">
              {wall.counter.tiers.map((stat) => (
                <TierCounter
                  key={stat.tier}
                  stat={stat}
                  label={tierLabel(stat.tier)}
                  lockedLabel={copy.locked}
                  soldOutLabel={copy.soldOut}
                />
              ))}
            </section>
          ) : null}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {copy.claimed(filledLabel, maxLabel)}
          </p>

          {wall && wall.members.length > 0 ? (
            <div className="mt-10 space-y-10">
              {TIER_ORDER.map((tier) => {
                const members = membersByTier(tier);
                if (members.length === 0) return null;
                return (
                  <section key={tier}>
                    <h2
                      className={cn(
                        "mb-3 text-sm font-bold uppercase tracking-wide",
                        TIER_TEXT[tier],
                      )}
                    >
                      {tierLabel(tier)}
                    </h2>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {members.map((m) => (
                        <MemberRow key={m.founderNumber} member={m} />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          ) : (
            <p className="mt-12 text-center text-sm text-muted-foreground">
              {copy.empty}{" "}
              <Link
                href="/pricing"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                {copy.emptyCta}
              </Link>
              .
            </p>
          )}

          {showJoinSlot ? (
            <JoinHereSlot
              nextNumber={filled + 1}
              numberLabel={copy.joinNumber(nextPadded)}
              sub={copy.joinSub}
              cta={copy.joinCta}
              aria={copy.joinAria}
              locale={locale === "bn" ? "bn" : "en"}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
