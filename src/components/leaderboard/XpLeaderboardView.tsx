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
import {
  WeeklyChallengePanel,
  type WeeklyArenaHandle,
  type WeeklyMeDock,
} from "@/src/components/leaderboard/WeeklyChallengePanel";

type BoardTab = "weekly" | "alltime";

function Avatar({
  name,
  url,
  size = "md",
}: {
  name: string;
  url: string | null;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const dim =
    size === "lg"
      ? "h-14 w-14 text-lg"
      : size === "md"
        ? "h-10 w-10 text-sm"
        : size === "sm"
          ? "h-8 w-8 text-xs"
          : "h-7 w-7 text-[10px]";
  const initial = (Array.from(name.trim())[0] || "?").toUpperCase();
  if (url && failedUrl !== url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        onError={() => setFailedUrl(url)}
        className={cn("shrink-0 rounded-full object-cover ring-2 ring-amber-400/25", dim)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 font-black text-white ring-2 ring-amber-400/15",
        dim,
      )}
    >
      {initial}
    </span>
  );
}

function RankMark({ rank, compact }: { rank: number; compact?: boolean }) {
  const box = compact ? "h-8 w-8" : "h-9 w-9";
  if (rank === 1) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-sm shadow-amber-500/25",
          box,
        )}
      >
        <Crown className="h-4 w-4" />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800",
          box,
        )}
      >
        <Medal className="h-4 w-4" />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950",
          box,
        )}
      >
        <Medal className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-black tabular-nums text-muted-foreground",
        box,
      )}
    >
      {rank}
    </span>
  );
}

function HorizontalPodium({
  entries,
  copy,
}: {
  entries: XpLeaderboardEntry[];
  copy: ReturnType<typeof useLeaderboardUiCopy>;
}) {
  const reduce = useReducedMotion();
  const byRank = (rank: number) => entries.find((e) => e.rank === rank) ?? null;
  const first = byRank(1);
  const second = byRank(2);
  const third = byRank(3);
  if (!first && !second && !third) return null;

  const Pedestal = ({
    entry,
    rank,
  }: {
    entry: XpLeaderboardEntry | null;
    rank: 1 | 2 | 3;
  }) => {
    if (!entry) {
      return <div className="min-w-0 flex-1" />;
    }

    const rankLabel = rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd";

    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: rank === 1 ? 0.06 : rank === 2 ? 0 : 0.1,
        }}
        className={cn(
          "min-w-0 flex-1",
          rank === 1 && "z-[1]",
          rank === 2 && "pt-5",
          rank === 3 && "pt-9",
        )}
      >
        <Link
          href={`/u/${encodeURIComponent(entry.username)}`}
          className={cn(
            "flex h-full flex-col items-center rounded-2xl border text-center transition hover:brightness-[1.03]",
            rank === 1 &&
              "min-h-[11.5rem] border-amber-400 bg-gradient-to-b from-amber-300/45 via-amber-100/40 to-card px-2 pb-3 pt-3.5 shadow-lg shadow-amber-500/20 dark:from-amber-400/30 dark:via-amber-500/10",
            rank === 2 &&
              "min-h-[9.75rem] border-slate-300 bg-gradient-to-b from-slate-100 to-card px-2 pb-2.5 pt-3 shadow-sm dark:border-slate-500/50 dark:from-slate-400/20",
            rank === 3 &&
              "min-h-[8.5rem] border-orange-200 bg-gradient-to-b from-orange-50 to-card px-2 pb-2 pt-2.5 shadow-sm dark:border-orange-500/35 dark:from-orange-500/15",
            entry.isYou && "ring-2 ring-sky-400/55",
          )}
        >
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide",
              rank === 1 && "bg-amber-400 text-amber-950",
              rank === 2 && "bg-slate-300 text-slate-700 dark:bg-slate-400 dark:text-slate-900",
              rank === 3 && "bg-orange-200 text-amber-900 dark:bg-amber-700/80 dark:text-amber-50",
            )}
          >
            {rankLabel}
          </span>

          <div className="relative mt-2">
            <Avatar
              name={entry.displayName}
              url={entry.avatarUrl}
              size={rank === 1 ? "lg" : "md"}
            />
            <span
              className={cn(
                "absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black tabular-nums shadow-sm ring-2 ring-card",
                rank === 1 && "bg-amber-400 text-amber-950",
                rank === 2 && "bg-slate-500 text-white",
                rank === 3 && "bg-amber-700 text-amber-50",
              )}
            >
              #{rank}
            </span>
          </div>

          <p
            className={cn(
              "mt-2.5 w-full truncate px-1 font-black leading-tight",
              rank === 1 ? "text-sm sm:text-base" : "text-xs sm:text-sm",
            )}
          >
            {entry.displayName}
          </p>
          {entry.isYou ? (
            <span className="mt-0.5 rounded-full bg-sky-500/20 px-1.5 text-[9px] font-bold text-sky-800 dark:text-sky-200">
              {copy.you}
            </span>
          ) : null}
          <p
            className={cn(
              "mt-1 flex items-center gap-0.5 font-black tabular-nums",
              rank === 1 && "text-sm text-amber-700 dark:text-amber-300",
              rank === 2 && "text-xs text-slate-600 dark:text-slate-300",
              rank === 3 && "text-xs text-amber-800 dark:text-amber-400",
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            {entry.totalXp.toLocaleString("en-US")}
          </p>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="mb-4">
      <p className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
        <Trophy className="h-3.5 w-3.5" />
        {copy.podiumHint}
      </p>
      <div className="flex items-end gap-2 sm:gap-3">
        <Pedestal entry={second} rank={2} />
        <Pedestal entry={first} rank={1} />
        <Pedestal entry={third} rank={3} />
      </div>
    </div>
  );
}

function LeaderRow({
  row,
  copy,
  rowRef,
}: {
  row: XpLeaderboardEntry;
  copy: ReturnType<typeof useLeaderboardUiCopy>;
  rowRef?: (node: HTMLLIElement | null) => void;
}) {
  return (
    <li ref={rowRef}>
      <Link
        href={`/u/${encodeURIComponent(row.username)}`}
        className={cn(
          "flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors sm:gap-3 sm:px-2.5",
          row.isYou
            ? "bg-sky-500/12 ring-1 ring-sky-400/35"
            : "hover:bg-muted/50",
          row.rank === 1 && "bg-amber-400/12",
          row.rank === 2 && "bg-slate-400/10",
          row.rank === 3 && "bg-orange-400/10",
        )}
      >
        <span className="w-8 shrink-0">
          <RankMark rank={row.rank} compact />
        </span>
        <Avatar name={row.displayName} url={row.avatarUrl} size="sm" />
        <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
          <span className="truncate text-sm font-bold text-foreground">
            {row.displayName}
          </span>
          <span className="hidden truncate text-xs text-muted-foreground/80 sm:inline">
            @{row.username}
          </span>
          {row.isYou ? (
            <span className="shrink-0 rounded-full bg-sky-500/20 px-1.5 text-[9px] font-bold uppercase text-sky-800 dark:text-sky-200">
              {copy.you}
            </span>
          ) : null}
        </div>
        <span className="shrink-0 text-right font-black tabular-nums text-amber-700 dark:text-amber-300">
          <span className="inline-flex items-center gap-0.5 text-sm">
            <Zap className="h-3.5 w-3.5 opacity-80" />
            {row.totalXp.toLocaleString("en-US")}
          </span>
        </span>
      </Link>
    </li>
  );
}

function ArenaDock({
  mode,
  allTimeMe,
  weeklyMe,
  copy,
  onFind,
}: {
  mode: BoardTab;
  allTimeMe: XpLeaderboardMe | null;
  weeklyMe: WeeklyMeDock | null;
  copy: ReturnType<typeof useLeaderboardUiCopy>;
  onFind: () => void;
}) {
  if (mode === "weekly") {
    if (!weeklyMe) return null;
    const rankLabel =
      weeklyMe.weeklyXp > 0 && weeklyMe.rank > 0 ? `#${weeklyMe.rank}` : "-";
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-950/95 px-3 py-2.5 text-emerald-50 shadow-2xl shadow-emerald-950/40 backdrop-blur-md">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-sm font-black tabular-nums text-amber-950">
            {rankLabel}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{weeklyMe.displayName}</p>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-100/85">
              <span className="inline-flex items-center gap-0.5 tabular-nums text-amber-300">
                <Zap className="h-3 w-3" />
                {weeklyMe.weeklyXp.toLocaleString("en-US")} {copy.weeklyXpLabel}
              </span>
              <span>·</span>
              <span>{copy.tabWeekly}</span>
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-9 shrink-0 rounded-full bg-emerald-100 font-bold text-emerald-950 hover:bg-white"
            onClick={onFind}
          >
            {copy.findMe}
          </Button>
        </div>
      </div>
    );
  }

  if (!allTimeMe) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-sky-400/40 bg-sky-950/95 px-3 py-2.5 text-sky-50 shadow-2xl shadow-sky-950/40 backdrop-blur-md dark:bg-sky-900/95">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-sm font-black tabular-nums text-amber-950">
          #{allTimeMe.rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{allTimeMe.displayName}</p>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-100/80">
            <span className="inline-flex items-center gap-0.5 tabular-nums text-amber-300">
              <Zap className="h-3 w-3" />
              {allTimeMe.totalXp.toLocaleString("en-US")} {copy.xp}
            </span>
            <span>·</span>
            <span>
              {copy.level} {allTimeMe.level}
            </span>
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-9 shrink-0 rounded-full bg-sky-100 font-bold text-sky-950 hover:bg-white"
          onClick={onFind}
        >
          {copy.findMe}
        </Button>
      </div>
    </div>
  );
}

function BoardTabs({
  tab,
  onChange,
  weeklyLabel,
  allTimeLabel,
}: {
  tab: BoardTab;
  onChange: (next: BoardTab) => void;
  weeklyLabel: string;
  allTimeLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Leaderboard boards"
      className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-muted/70 p-1 ring-1 ring-border/60"
    >
      <button
        type="button"
        role="tab"
        aria-selected={tab === "weekly"}
        onClick={() => onChange("weekly")}
        className={cn(
          "rounded-full px-2 py-2.5 text-center text-[12px] font-black leading-tight transition sm:text-sm",
          tab === "weekly"
            ? "bg-emerald-600 text-white shadow-sm shadow-emerald-700/25"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {weeklyLabel}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={tab === "alltime"}
        onClick={() => onChange("alltime")}
        className={cn(
          "rounded-full px-2 py-2.5 text-center text-[12px] font-black leading-tight transition sm:text-sm",
          tab === "alltime"
            ? "bg-sky-600 text-white shadow-sm shadow-sky-700/25"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {allTimeLabel}
      </button>
    </div>
  );
}

export function XpLeaderboardView() {
  const copy = useLeaderboardUiCopy();
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<BoardTab>("weekly");
  const [data, setData] = useState<XpLeaderboardResult | null>(null);
  const [weeklyMe, setWeeklyMe] = useState<WeeklyMeDock | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [pending, startTransition] = useTransition();
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const listTopRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const weeklyRef = useRef<WeeklyArenaHandle>(null);
  const findMePending = useRef(false);

  useEffect(() => {
    if (tab !== "alltime") return;
    const onSlash = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onSlash);
    return () => window.removeEventListener("keydown", onSlash);
  }, [tab]);

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
    if (tab !== "alltime") return;
    void load(page, debouncedQ);
  }, [load, page, debouncedQ, tab]);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? 50)));
  const showPodium = !debouncedQ && page === 1 && (data?.entries.length ?? 0) > 0;
  const listEntries =
    showPodium && data
      ? data.entries.filter((row) => row.rank > 3)
      : (data?.entries ?? []);

  const scrollToMeAllTime = () => {
    const me = data?.me;
    if (!me) return;
    findMePending.current = true;
    if (data.page !== me.page || debouncedQ) {
      setQ("");
      setDebouncedQ("");
      setPage(me.page);
      return;
    }
    if (showPodium && me.rank <= 3) {
      listTopRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
      findMePending.current = false;
      return;
    }
    const el = rowRefs.current.get(me.username);
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    findMePending.current = false;
  };

  useEffect(() => {
    if (tab !== "alltime") return;
    if (!findMePending.current || !data?.me || loading) return;
    if (data.page === data.me.page && !debouncedQ) {
      const el = rowRefs.current.get(data.me.username);
      el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      findMePending.current = false;
    }
  }, [data, loading, debouncedQ, reduce, tab]);

  const goPage = (next: number) => {
    startTransition(() => {
      setPage(next);
      listTopRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  const hasMeDock =
    tab === "weekly" ? Boolean(weeklyMe) : Boolean(data?.me);

  return (
    <div className="relative min-h-[70vh] overflow-hidden">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 transition-opacity",
          tab === "weekly"
            ? "bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.16),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.10),_transparent_50%)]"
            : "bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.12),_transparent_50%)]",
        )}
      />

      <div
        className={cn(
          "relative mx-auto w-full max-w-4xl px-4 pt-5 font-bengali sm:px-6",
          hasMeDock ? "pb-28" : "pb-16",
        )}
      >
        <Link
          href="/player"
          className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground/80 transition hover:text-foreground sm:absolute sm:left-6 sm:top-5 sm:mb-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {copy.backToPlay}
        </Link>

        <header className="mb-3 flex flex-row items-end justify-between gap-3 pt-1 sm:pt-8">
          <div className="min-w-0">
            <div
              className={cn(
                "mb-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                tab === "weekly"
                  ? "bg-emerald-400/15 text-emerald-800 dark:text-emerald-200"
                  : "bg-amber-400/15 text-amber-800 dark:text-amber-200",
              )}
            >
              <Sparkles className="h-3 w-3" />
              Gamlish Arena
            </div>
            <h1 className="truncate text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {copy.title}
            </h1>
          </div>
          {tab === "alltime" && data ? (
            <p className="flex shrink-0 items-center gap-1.5 pb-0.5 text-xs font-bold tabular-nums text-sky-800 dark:text-sky-300 sm:text-sm">
              <span className="relative flex h-2 w-2" title="Live" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {copy.players(data.total)}
            </p>
          ) : null}
        </header>

        <BoardTabs
          tab={tab}
          onChange={setTab}
          weeklyLabel={copy.tabWeekly}
          allTimeLabel={copy.tabAllTime}
        />

        {tab === "weekly" ? (
          <WeeklyChallengePanel
            ref={weeklyRef}
            youLabel={copy.you}
            onMeChange={setWeeklyMe}
          />
        ) : (
          <>
            <div className="sticky top-14 z-20 mb-4 sm:top-16">
              <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">
                {copy.searchLabel}
              </p>
              <div className="flex items-stretch gap-2">
                <label className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-700/70 dark:text-sky-300/70" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={copy.searchPlaceholder}
                    className="w-full rounded-xl border border-sky-300/70 bg-white py-2.5 pl-10 pr-3 text-sm outline-none ring-0 placeholder:text-muted-foreground/60 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/25 dark:border-sky-700/60 dark:bg-sky-950/50 dark:focus:border-sky-500"
                    autoComplete="off"
                    enterKeyHint="search"
                    aria-label={copy.searchPlaceholder}
                  />
                </label>
                <Button
                  type="button"
                  size="sm"
                  className="h-auto shrink-0 rounded-xl bg-sky-600 px-3.5 font-bold text-white hover:bg-sky-700"
                  onClick={() => {
                    searchRef.current?.focus();
                    listTopRef.current?.scrollIntoView({
                      behavior: reduce ? "auto" : "smooth",
                      block: "start",
                    });
                  }}
                >
                  <Search className="h-4 w-4" />
                  {copy.searchAction}
                </Button>
              </div>
            </div>

            <div ref={listTopRef} />

            {loading && !data ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-11 animate-pulse rounded-xl bg-muted/60" />
                ))}
              </div>
            ) : !data || data.entries.length === 0 ? (
              <p className="mt-10 text-center text-sm text-muted-foreground">
                {debouncedQ ? copy.emptySearch : copy.empty}
              </p>
            ) : (
              <>
                {showPodium ? (
                  <HorizontalPodium entries={data.entries} copy={copy} />
                ) : null}

                <ol
                  className={cn(
                    "divide-y divide-border/40 overflow-hidden rounded-2xl border border-border/50 bg-card/60",
                    pending && "opacity-70",
                  )}
                >
                  {listEntries.map((row) => (
                    <LeaderRow
                      key={row.username}
                      row={row}
                      copy={copy}
                      rowRef={(node) => {
                        if (node) rowRefs.current.set(row.username, node);
                        else rowRefs.current.delete(row.username);
                      }}
                    />
                  ))}
                </ol>

                {totalPages > 1 ? (
                  <div className="mt-4 flex items-center justify-between gap-3">
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

                <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground/80">
                  {copy.tieRule}
                </p>
              </>
            )}
          </>
        )}
      </div>

      <ArenaDock
        mode={tab}
        allTimeMe={data?.me ?? null}
        weeklyMe={weeklyMe}
        copy={copy}
        onFind={() => {
          if (tab === "weekly") weeklyRef.current?.scrollToMe();
          else scrollToMeAllTime();
        }}
      />
    </div>
  );
}
