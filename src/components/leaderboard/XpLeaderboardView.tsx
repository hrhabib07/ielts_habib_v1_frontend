"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Crown,
  Medal,
  Search,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getXpLeaderboard,
  type XpLeaderboardEntry,
  type XpLeaderboardMe,
  type XpLeaderboardResult,
} from "@/src/lib/api/xpLeaderboard";
import { useLeaderboardUiCopy } from "@/src/hooks/useLocalizedCopy";

function Avatar({
  name,
  url,
  size = "md",
}: {
  name: string;
  url: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const dim =
    size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";
  const initial = (Array.from(name.trim())[0] || "?").toUpperCase();
  if (url && failedUrl !== url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        onError={() => setFailedUrl(url)}
        className={cn("shrink-0 rounded-full object-cover ring-2 ring-amber-400/30", dim)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 font-black text-white ring-2 ring-amber-400/20",
        dim,
      )}
    >
      {initial}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-md shadow-amber-500/30">
        <Crown className="h-5 w-5" />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 shadow-md">
        <Medal className="h-5 w-5" />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950 shadow-md shadow-orange-500/20">
        <Medal className="h-5 w-5" />
      </span>
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-sm font-black tabular-nums text-primary">
      {rank}
    </span>
  );
}

function Podium({
  entries,
  copy,
}: {
  entries: XpLeaderboardEntry[];
  copy: ReturnType<typeof useLeaderboardUiCopy>;
}) {
  const reduce = useReducedMotion();
  const groups = [1, 2, 3]
    .map((rank) => ({
      rank,
      players: entries.filter((entry) => entry.rank === rank),
    }))
    .filter((group) => group.players.length > 0);
  if (groups.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
        <Trophy className="h-3.5 w-3.5" />
        {copy.podiumHint}
      </p>
      <div className="space-y-3">
        {groups.map((group, groupIndex) => (
          <motion.section
            key={group.rank}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.08, duration: 0.3 }}
            className={cn(
              "overflow-hidden rounded-2xl border p-3",
              group.rank === 1
                ? "border-amber-400/40 bg-gradient-to-r from-amber-400/20 to-card"
                : group.rank === 2
                  ? "border-slate-400/30 bg-slate-400/10"
                  : "border-orange-400/30 bg-orange-400/10",
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <RankBadge rank={group.rank} />
                <div>
                  <p className="text-sm font-black">Rank #{group.rank}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {group.players.length} {copy.playersAtRank}
                  </p>
                </div>
              </div>
              <p className="flex items-center gap-1 font-black tabular-nums text-amber-700 dark:text-amber-300">
                <Zap className="h-4 w-4" />
                {group.players[0]?.totalXp.toLocaleString("en-US")} {copy.xp}
              </p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {group.players.map((row) => (
                <Link
                  key={row.username}
                  href={`/u/${encodeURIComponent(row.username)}`}
                  className={cn(
                    "flex min-w-[10rem] items-center gap-2 rounded-xl border border-border/50 bg-card/80 p-2.5 transition hover:border-sky-400/50",
                    row.isYou && "border-sky-400/60 bg-sky-500/10 ring-1 ring-sky-400/30",
                  )}
                >
                  <Avatar name={row.displayName} url={row.avatarUrl} size="sm" />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 truncate text-xs font-bold">
                      <span className="truncate">{row.displayName}</span>
                      {row.isYou ? (
                        <span className="rounded-full bg-sky-500/20 px-1.5 text-[9px] text-sky-800 dark:text-sky-200">
                          {copy.you}
                        </span>
                      ) : null}
                    </span>
                    <span className="block truncate text-[10px] text-muted-foreground">
                      @{row.username}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        {copy.tieRule}
      </p>
    </div>
  );
}

function MeCard({
  me,
  copy,
  onFind,
}: {
  me: XpLeaderboardMe;
  copy: ReturnType<typeof useLeaderboardUiCopy>;
  onFind: () => void;
}) {
  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-sky-400/30 bg-gradient-to-r from-sky-500/15 via-card to-amber-400/10 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-black text-amber-950 shadow-md shadow-amber-500/25">
          #{me.rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-300">
            {copy.yourRank}
          </p>
          <p className="truncate font-bold">{me.displayName}</p>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-0.5 font-bold text-amber-700 dark:text-amber-300">
              <Zap className="h-3 w-3" />
              {me.totalXp.toLocaleString("en-US")} {copy.xp}
            </span>
            <span>·</span>
            <span>
              {copy.level} {me.level}
            </span>
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0 rounded-full border-sky-400/40"
          onClick={onFind}
        >
          {copy.findMe}
        </Button>
      </div>
    </div>
  );
}

export function XpLeaderboardView() {
  const copy = useLeaderboardUiCopy();
  const reduce = useReducedMotion();
  const [data, setData] = useState<XpLeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [pending, startTransition] = useTransition();
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const listTopRef = useRef<HTMLDivElement>(null);
  const findMePending = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q.trim()), 280);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (findMePending.current) return;
    setPage(1);
  }, [debouncedQ]);

  const load = useCallback(async (nextPage: number, search: string) => {
    setLoading(true);
    try {
      const result = await getXpLeaderboard({
        page: nextPage,
        limit: 50,
        q: search || undefined,
      });
      setData(result);
    } catch {
      setData({ entries: [], total: 0, page: 1, limit: 50, me: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page, debouncedQ);
  }, [load, page, debouncedQ]);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? 50)));
  const showPodium = !debouncedQ && page === 1 && (data?.entries.length ?? 0) > 0;

  const scrollToMe = () => {
    const me = data?.me;
    if (!me) return;
    findMePending.current = true;
    if (data.page !== me.page || debouncedQ) {
      setQ("");
      setDebouncedQ("");
      setPage(me.page);
      return;
    }
    const el = rowRefs.current.get(me.username);
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    findMePending.current = false;
  };

  useEffect(() => {
    if (!findMePending.current || !data?.me || loading) return;
    if (data.page === data.me.page && !debouncedQ) {
      const el = rowRefs.current.get(data.me.username);
      el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      findMePending.current = false;
    }
  }, [data, loading, debouncedQ, reduce]);

  const goPage = (next: number) => {
    startTransition(() => {
      setPage(next);
      listTopRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  };

  return (
    <div className="relative min-h-[70vh] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.10),_transparent_50%)]"
      />

      <div className="mx-auto max-w-lg px-4 pb-24 pt-8 font-bengali sm:max-w-2xl">
        <Link
          href="/player"
          className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.backToPlay}
        </Link>

        <div className="mb-6">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
            <Sparkles className="h-3.5 w-3.5" />
            Gamlish Arena
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
          {data ? (
            <p className="mt-1 text-xs font-semibold tabular-nums text-sky-800 dark:text-sky-300">
              {copy.players(data.total)}
            </p>
          ) : null}
        </div>

        {data?.me ? <MeCard me={data.me} copy={copy} onFind={scrollToMe} /> : null}

        <div className="sticky top-14 z-20 -mx-4 mb-4 border-b border-border/40 bg-background/90 px-4 py-3 backdrop-blur-md sm:top-16">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-2xl border border-border/60 bg-card/80 py-3 pl-10 pr-3 text-sm outline-none ring-sky-500/30 placeholder:text-muted-foreground focus:border-sky-400/50 focus:ring-2"
              autoComplete="off"
              enterKeyHint="search"
            />
          </label>
        </div>

        <div ref={listTopRef} />

        {loading && !data ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/60" />
            ))}
          </div>
        ) : !data || data.entries.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            {debouncedQ ? copy.emptySearch : copy.empty}
          </p>
        ) : (
          <>
            {showPodium ? <Podium entries={data.entries} copy={copy} /> : null}

            <ol className={cn("space-y-2", pending && "opacity-70")}>
              {data.entries.map((row, index) => (
                <motion.li
                  key={row.username}
                  ref={(node) => {
                    if (node) rowRefs.current.set(row.username, node);
                    else rowRefs.current.delete(row.username);
                  }}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.25 }}
                >
                  <Link
                    href={`/u/${encodeURIComponent(row.username)}`}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-3.5 transition-colors sm:p-4",
                      row.isYou
                        ? "border-sky-400/50 bg-sky-500/10 ring-1 ring-sky-400/30"
                        : "border-border/60 bg-card/70 hover:bg-muted/40",
                      row.rank <= 3 && !row.isYou && "border-amber-400/25",
                    )}
                  >
                    <RankBadge rank={row.rank} />
                    <Avatar name={row.displayName} url={row.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate font-bold">
                        <span className="truncate">{row.displayName}</span>
                        {row.isYou ? (
                          <span className="shrink-0 rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-800 dark:text-sky-200">
                            {copy.you}
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        @{row.username}
                        <span className="mx-1">·</span>
                        {copy.level} {row.level}
                        <span className="mx-1">·</span>
                        {row.missionsCompleted} {copy.missions}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center justify-end gap-1 font-black tabular-nums text-amber-700 dark:text-amber-300">
                        <Zap className="h-4 w-4" />
                        {row.totalXp.toLocaleString("en-US")}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {copy.xp}
                      </p>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ol>

            {totalPages > 1 ? (
              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={page <= 1 || loading}
                  onClick={() => goPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {copy.prev}
                </Button>
                <p className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {copy.pageOf(page, totalPages)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={page >= totalPages || loading}
                  onClick={() => goPage(page + 1)}
                >
                  {copy.next}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
