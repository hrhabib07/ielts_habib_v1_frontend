"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Loader2, Users } from "lucide-react";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { getFoundingMembersWall, type FoundingMembersWall } from "@/src/lib/api/subscription";
import { cn } from "@/lib/utils";

function formatJoined(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function FoundingMembersWallContent() {
  const [wall, setWall] = useState<FoundingMembersWall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFoundingMembersWall()
      .then(setWall)
      .catch(() => setError("Could not load the Founders' Wall."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <header className="text-center">
        <div className="flex justify-center">
          <FoundingMemberBadge size="lg" showTooltip={false} />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Founders&apos; Wall
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          The pioneers who backed Gamlish before 1 August 2026. This list is permanent —
          the badge will never be issued again.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {loading ? "Loading…" : `${wall?.total ?? 0} founding members`}
        </div>
      </header>

      {loading ? (
        <div className="mt-12 flex justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <p className="mt-12 text-center text-sm text-destructive">{error}</p>
      ) : (
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {wall?.members.map((member, index) => (
            <li key={member.username}>
              <Link
                href={`/u/${member.username}`}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm",
                  "transition-all duration-200 hover:border-amber-400/40 hover:shadow-md hover:shadow-amber-500/5",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                    "bg-gradient-to-br from-amber-200 to-amber-500 text-amber-950",
                    "ring-1 ring-amber-300/60",
                  )}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-semibold text-foreground group-hover:text-amber-800 dark:group-hover:text-amber-200">
                      {member.displayName}
                    </span>
                    {member.isLegacyFounderSlot ? (
                      <Crown className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    @{member.username} · joined {formatJoined(member.joinedAt)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && wall?.members.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          No founding members yet. Be the first on{" "}
          <Link href="/pricing" className="font-medium text-accent underline-offset-2 hover:underline">
            Plans &amp; pricing
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
