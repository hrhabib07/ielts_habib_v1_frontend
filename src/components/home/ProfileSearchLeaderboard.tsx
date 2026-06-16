"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Heart, Search, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getProfileLeaderboard } from "@/src/lib/api/publicProfile";
import type { ProfileLeaderboard } from "@/src/lib/api/types";
import { cn } from "@/lib/utils";

interface ProfileSearchLeaderboardProps {
  className?: string;
  compact?: boolean;
}

export function ProfileSearchLeaderboard({
  className,
  compact = false,
}: ProfileSearchLeaderboardProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [leaderboard, setLeaderboard] = useState<ProfileLeaderboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProfileLeaderboard()
      .then((data) => {
        if (!cancelled) setLeaderboard(data);
      })
      .catch(() => {
        if (!cancelled) setLeaderboard({ topByLikes: [], topByViews: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const handle = query.trim().replace(/^@/, "").toLowerCase();
    if (handle.length >= 3) {
      router.push(`/u/${encodeURIComponent(handle)}`);
    }
  };

  const hasLeaderboard =
    (leaderboard?.topByLikes.length ?? 0) > 0 ||
    (leaderboard?.topByViews.length ?? 0) > 0;

  return (
    <Card
      className={cn(
        "border-border/60 bg-card/85 shadow-sm ring-1 ring-accent/[0.05] backdrop-blur-sm",
        compact ? "p-4" : "p-5 md:p-6",
        className,
      )}
    >
      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a public profile (@username)"
            className="h-11 rounded-full border-border/70 bg-background/80 pl-10"
            aria-label="Search public profiles by username"
          />
        </div>
        <Button type="submit" className="h-11 shrink-0 rounded-full px-6">
          View profile
        </Button>
      </form>

      <div className={cn("mt-5 grid gap-4", compact ? "md:grid-cols-2" : "lg:grid-cols-2")}>
        <LeaderboardColumn
          title="Most hearts"
          icon={<Heart className="h-4 w-4 text-rose-500" />}
          entries={leaderboard?.topByLikes ?? []}
          metric="likes"
          loading={loading}
        />
        <LeaderboardColumn
          title="Most views"
          icon={<Eye className="h-4 w-4 text-primary" />}
          entries={leaderboard?.topByViews ?? []}
          metric="views"
          loading={loading}
        />
      </div>

      {!loading && !hasLeaderboard ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Public profiles with hearts and views will appear here.
        </p>
      ) : null}
    </Card>
  );
}

function LeaderboardColumn({
  title,
  icon,
  entries,
  metric,
  loading,
}: {
  title: string;
  icon: React.ReactNode;
  entries: ProfileLeaderboard["topByLikes"];
  metric: "likes" | "views";
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/15 p-3">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Trophy className="h-3.5 w-3.5 text-accent" />
        {icon}
        <span>{title}</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">No profiles yet.</p>
      ) : (
        <ol className="space-y-1.5">
          {entries.map((entry, index) => (
            <li key={`${entry.username}-${metric}`}>
              <Link
                href={`/u/${encodeURIComponent(entry.username)}`}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-background/70"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="w-5 shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="truncate font-medium text-foreground">
                    {entry.displayName}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                  {metric === "likes"
                    ? `${entry.totalLikes} ♥`
                    : `${entry.totalViews.toLocaleString()} views`}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
