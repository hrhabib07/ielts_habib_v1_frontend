"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Zap } from "lucide-react";
import { getXpLeaderboard } from "@/src/lib/api/xpLeaderboard";
import { cn } from "@/lib/utils";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";

/**
 * Always-visible but non-blocking arena promo for the player map.
 */
export function LeaderboardArenaPromo({ className }: { className?: string }) {
  const { locale } = useUiLocale();
  const bn = locale === "bn";
  const [rank, setRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getXpLeaderboard({ page: 1, limit: 1 })
      .then((board) => {
        if (cancelled) return;
        setRank(board.me?.rank ?? null);
        setTotalPlayers(board.total);
      })
      .catch(() => {
        if (!cancelled) {
          setRank(null);
          setTotalPlayers(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href="/leaderboard"
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-400/15 via-card to-sky-500/10 px-4 py-3 transition hover:border-amber-400/55 hover:shadow-md hover:shadow-amber-500/10",
        className,
      )}
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-amber-950 shadow-md shadow-amber-500/25">
        <Trophy className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-black text-foreground">
          {bn ? "XP Arena · লিডারবোর্ড" : "XP Arena · Leaderboard"}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs font-semibold text-muted-foreground">
          {rank != null ? (
            <span className="inline-flex items-center gap-0.5 text-amber-800 dark:text-amber-200">
              <Zap className="h-3 w-3" />
              {bn ? `তোমার র‍্যাঙ্ক #${rank}` : `Your rank #${rank}`}
            </span>
          ) : (
            <span>{bn ? "র‍্যাঙ্কে উঠো" : "Climb the ranks"}</span>
          )}
          {totalPlayers != null ? (
            <>
              <span aria-hidden>·</span>
              <span className="tabular-nums">
                {totalPlayers.toLocaleString("en-US")}{" "}
                {bn ? "জন খেলোয়াড়" : "players"}
              </span>
            </>
          ) : null}
        </span>
      </span>
      <span className="shrink-0 text-xs font-black text-amber-800 transition group-hover:translate-x-0.5 dark:text-amber-200">
        {bn ? "দেখো" : "Open"}
      </span>
    </Link>
  );
}
