"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

interface LeaderboardMissionNudgeProps {
  isVisible: boolean;
  rank: number | null;
}

/**
 * Soft post-mission strip · never a blocking modal.
 * Shows when learner finished a mission but did not get a rank-climb sheet.
 */
export function LeaderboardMissionNudge({
  isVisible,
  rank,
}: LeaderboardMissionNudgeProps) {
  if (!isVisible) return null;

  return (
    <Link
      href="/leaderboard"
      className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-400/15 to-sky-500/10 px-4 py-3.5 font-bengali transition hover:border-amber-400/55"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-amber-950">
        <Trophy className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-black text-foreground">
          লিডারবোর্ডে তোমার জায়গা দেখো
        </span>
        <span className="block text-xs font-semibold text-muted-foreground">
          {rank != null
            ? `এখন তোমার র‍্যাঙ্ক #${rank} · এগিয়ে যেতে থাকো`
            : "অন্য খেলোয়াড়দের সাথে তুলনা করো"}
        </span>
      </span>
      <span className="text-xs font-black text-amber-800 dark:text-amber-200">Open</span>
    </Link>
  );
}
