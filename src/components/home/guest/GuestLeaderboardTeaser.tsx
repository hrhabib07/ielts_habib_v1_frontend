"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Trophy, Zap } from "lucide-react";
import { getXpLeaderboard, type XpLeaderboardEntry } from "@/src/lib/api/xpLeaderboard";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { cn } from "@/lib/utils";

/**
 * Guest FOMO strip · public top players + join CTA.
 */
export function GuestLeaderboardTeaser() {
  const { locale } = useGuestLandingLocale();
  const bn = locale === "bn";
  const [rows, setRows] = useState<XpLeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getXpLeaderboard({ page: 1, limit: 5 })
      .then((data) => {
        if (cancelled) return;
        setRows(data.entries.slice(0, 5));
        setTotal(data.total);
      })
      .catch(() => {
        if (!cancelled) {
          setRows([]);
          setTotal(0);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (rows.length === 0) return null;

  return (
    <section className="border-y border-border/50 bg-gradient-to-b from-amber-400/8 via-background to-sky-500/5 px-4 py-12 sm:py-14">
      <div className="mx-auto max-w-lg sm:max-w-2xl">
        <div className="mb-5 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
            <Trophy className="h-3.5 w-3.5" />
            XP Arena
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {bn ? "এখনই র‍্যাঙ্কে জায়গা নাও" : "Claim your spot on the board"}
          </h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {bn
              ? `${total.toLocaleString("en-US")} জন খেলোয়াড় ইতিমধ্যে খেলছে। জয়েন করলেই তোমার নাম এখানে উঠবে।`
              : `${total.toLocaleString("en-US")} players are already climbing. Join to put your name on the board.`}
          </p>
        </div>

        <ol className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.username}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-3.5 py-3",
                row.rank === 1
                  ? "border-amber-400/40 bg-amber-400/15"
                  : "border-border/60 bg-card/80",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black",
                  row.rank === 1
                    ? "bg-amber-400 text-amber-950"
                    : "bg-muted text-foreground",
                )}
              >
                {row.rank === 1 ? <Crown className="h-4 w-4" /> : `#${row.rank}`}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{row.displayName}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  @{row.username}
                </span>
              </span>
              <span className="inline-flex items-center gap-0.5 text-sm font-black tabular-nums text-amber-700 dark:text-amber-300">
                <Zap className="h-3.5 w-3.5" />
                {row.totalXp.toLocaleString("en-US")}
              </span>
            </li>
          ))}
          <li className="flex items-center gap-3 rounded-2xl border border-dashed border-sky-400/40 bg-sky-500/5 px-3.5 py-3 opacity-90">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-xs font-black text-white">
              ?
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-foreground">
                {bn ? "তোমার জায়গা খালি আছে" : "Your seat is empty"}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {bn
                  ? "ফ্রি ডেমো খেলে প্রথম XP নাও"
                  : "Play the free demo · earn your first XP"}
              </span>
            </span>
          </li>
        </ol>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/demo"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-sky-600 text-sm font-black text-white transition hover:bg-sky-500"
          >
            {bn ? "ডেমো খেলে জয়েন করো" : "Play demo · join the race"}
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl border border-border bg-card text-sm font-bold text-foreground transition hover:bg-muted"
          >
            {bn ? "লিডারবোর্ড দেখো" : "See full leaderboard"}
          </Link>
        </div>
      </div>
    </section>
  );
}
