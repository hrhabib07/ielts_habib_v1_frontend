"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { getSquadLeaderboard, type SquadLeaderboardRow } from "@/src/lib/api/squad";
import { SQUAD_BADGE_LABELS } from "@/src/lib/squad-ui-copy";
import { useSquadUiCopy } from "@/src/hooks/useLocalizedCopy";

export default function SquadLeaderboardPage() {
  const SQUAD_UI = useSquadUiCopy();
  const [rows, setRows] = useState<SquadLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSquadLeaderboard()
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 font-bengali sm:max-w-2xl">
      <Link href="/squad" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        {SQUAD_UI.back}
      </Link>
      <h1 className="text-2xl font-black">{SQUAD_UI.leaderboardTitle}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{SQUAD_UI.leaderboardHint}</p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">এই সপ্তাহে এখনো কোনো Squad XP পায়নি।</p>
      ) : (
        <ol className="mt-6 space-y-2">
          {rows.map((row) => (
            <li key={row.slug}>
              <Link
                href={`/squad/${row.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 transition-colors hover:bg-muted/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-lg font-black text-primary">
                  {row.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.memberCount} সদস্য
                    {row.highestBadge
                      ? ` · ${SQUAD_BADGE_LABELS[row.highestBadge] ?? row.highestBadge}`
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="flex items-center justify-end gap-1 font-black text-primary">
                    <Trophy className="h-4 w-4" />
                    {row.weeklyXp}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Weekly XP</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
