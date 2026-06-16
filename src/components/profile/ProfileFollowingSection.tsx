"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swords, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getMyFollowing } from "@/src/lib/api/publicProfile";

interface FollowingRow {
  userId: string;
  username: string;
  displayName: string;
  currentCountryLabel: string;
  dreamCountryLabel: string;
  desiredBandScore: number | null;
}

export function ProfileFollowingSection() {
  const [following, setFollowing] = useState<FollowingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMyFollowing()
      .then((data) => {
        if (!cancelled) setFollowing(data);
      })
      .catch(() => {
        if (!cancelled) setFollowing([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="border-border/70 p-6 shadow-sm md:p-7">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-700 dark:text-violet-400">
          <Swords className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Rivals & following
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground md:text-xl">
            Profiles you follow
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One-way follows — only you see this list. Follower counts are never shown
            anywhere on Gamlish.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : following.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/10 px-4 py-8 text-center">
          <UserPlus className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">
            Follow public profiles from their share page to track rivals here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {following.map((row) => (
            <li key={row.userId} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <Link
                  href={`/u/${encodeURIComponent(row.username)}`}
                  className="font-semibold text-foreground hover:text-primary"
                >
                  {row.displayName}
                </Link>
                <p className="text-xs text-muted-foreground">@{row.username}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.currentCountryLabel} → {row.dreamCountryLabel}
                  {row.desiredBandScore != null ? ` · Band ${row.desiredBandScore}` : ""}
                </p>
              </div>
              <Link
                href={`/u/${encodeURIComponent(row.username)}`}
                className="text-xs font-medium text-primary hover:underline"
              >
                View profile
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
