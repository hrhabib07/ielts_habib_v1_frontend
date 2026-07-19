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

const TIER_ORDER: FounderTier[] = ["GOLD", "SILVER", "BRONZE"];

const TIER_META: Record<
  FounderTier,
  { label: string; badge: string; text: string }
> = {
  GOLD: {
    label: "Gold Founders",
    badge: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950",
    text: "text-amber-600 dark:text-amber-400",
  },
  SILVER: {
    label: "Silver Founders",
    badge: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900",
    text: "text-slate-500 dark:text-slate-300",
  },
  BRONZE: {
    label: "Bronze Founders",
    badge: "bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950",
    text: "text-orange-600 dark:text-orange-400",
  },
};

function TierCounter({ stat }: { stat: FounderTierLiveStat }) {
  const meta = TIER_META[stat.tier];
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card/80 p-4 text-center shadow-sm">
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold",
          meta.badge,
        )}
      >
        <Trophy className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-foreground">{meta.label}</span>
      {stat.status === "LOCKED" ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Lock className="h-3 w-3" /> Locked
        </span>
      ) : stat.status === "SOLD_OUT" ? (
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
          Sold Out
        </span>
      ) : (
        <span className={cn("text-sm font-bold tabular-nums", meta.text)}>
          {stat.filled} / {stat.capacity}
        </span>
      )}
    </div>
  );
}

function MemberRow({ member }: { member: FounderWallMember }) {
  const meta = TIER_META[member.founderTier];
  return (
    <li>
      <Link
        href={`/u/${member.handle}`}
        className="group flex items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-3.5 shadow-sm transition-all duration-200 hover:border-amber-400/40 hover:shadow-md"
      >
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
            meta.badge,
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

export function FoundingMembersWallContent() {
  const [wall, setWall] = useState<FoundersWall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFoundersWall()
      .then(setWall)
      .catch(() => setError("Could not load the Founders' Wall."))
      .finally(() => setLoading(false));
  }, []);

  const membersByTier = (tier: FounderTier): FounderWallMember[] =>
    (wall?.members ?? []).filter((m) => m.founderTier === tier);

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Founders&apos; Wall
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          The first 100 pioneers who backed Gamlish before launch. Founder numbers,
          tiers and badges are permanent — they will never be issued again.
        </p>
      </header>

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
                <TierCounter key={stat.tier} stat={stat} />
              ))}
            </section>
          ) : null}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {wall?.counter.slotsFilled ?? 0} / {wall?.counter.maxSlots ?? 100} founding
            members claimed
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
                        TIER_META[tier].text,
                      )}
                    >
                      {TIER_META[tier].label}
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
              No founding members yet. Be the first on{" "}
              <Link
                href="/pricing"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                Plans &amp; pricing
              </Link>
              .
            </p>
          )}
        </>
      )}
    </div>
  );
}
