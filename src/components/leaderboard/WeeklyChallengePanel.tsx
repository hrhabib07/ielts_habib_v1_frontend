"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Crown, Gift, Medal, Timer, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getWeeklyChallengeState,
  type WeeklyChallengeState,
  type WeeklyStanding,
} from "@/src/lib/api/weeklyChallenge";

export type WeeklyArenaHandle = {
  scrollToMe: () => void;
  refresh: () => Promise<void>;
};

export type WeeklyMeDock = {
  rank: number;
  weeklyXp: number;
  displayName: string;
  username: string;
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  if (d > 0) return `${d}d ${hh}:${mm}:${ss}`;
  return `${hh}:${mm}:${ss}`;
}

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
    size === "lg"
      ? "h-14 w-14 text-lg"
      : size === "md"
        ? "h-10 w-10 text-sm"
        : "h-8 w-8 text-xs";
  const initial = (Array.from(name.trim())[0] || "?").toUpperCase();
  if (url && failedUrl !== url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        onError={() => setFailedUrl(url)}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-emerald-400/30",
          dim,
        )}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 font-black text-white ring-2 ring-emerald-400/20",
        dim,
      )}
    >
      {initial}
    </span>
  );
}

function RankMark({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950">
        <Crown className="h-4 w-4" />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800">
        <Medal className="h-4 w-4" />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950">
        <Medal className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-black tabular-nums text-emerald-800 dark:text-emerald-200">
      {rank}
    </span>
  );
}

function WeeklyPodium({
  entries,
  youLabel,
}: {
  entries: WeeklyStanding[];
  youLabel: string;
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
    entry: WeeklyStanding | null;
    rank: 1 | 2 | 3;
  }) => {
    if (!entry) return <div className="min-w-0 flex-1" />;
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
              "min-h-[11.5rem] border-amber-400 bg-gradient-to-b from-amber-300/45 via-emerald-50/50 to-card px-2 pb-3 pt-3.5 shadow-lg shadow-amber-500/15",
            rank === 2 &&
              "min-h-[9.75rem] border-slate-300 bg-gradient-to-b from-slate-100 to-card px-2 pb-2.5 pt-3 shadow-sm dark:border-slate-500/50 dark:from-slate-400/20",
            rank === 3 &&
              "min-h-[8.5rem] border-orange-200 bg-gradient-to-b from-orange-50 to-card px-2 pb-2 pt-2.5 shadow-sm dark:border-orange-500/35 dark:from-orange-500/15",
            entry.isYou && "ring-2 ring-emerald-400/60",
          )}
        >
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide",
              rank === 1 && "bg-amber-400 text-amber-950",
              rank === 2 &&
                "bg-slate-300 text-slate-700 dark:bg-slate-400 dark:text-slate-900",
              rank === 3 &&
                "bg-orange-200 text-amber-900 dark:bg-amber-700/80 dark:text-amber-50",
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
            <span className="mt-0.5 rounded-full bg-emerald-500/20 px-1.5 text-[9px] font-bold text-emerald-800 dark:text-emerald-200">
              {youLabel}
            </span>
          ) : null}
          <p
            className={cn(
              "mt-1 flex items-center gap-0.5 font-black tabular-nums text-emerald-700 dark:text-emerald-300",
              rank === 1 ? "text-sm" : "text-xs",
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            {entry.weeklyXp.toLocaleString("en-US")}
          </p>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="mb-4">
      <p className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
        <Trophy className="h-3.5 w-3.5" />
        টপ ৩ · ২০ টাকা রেস
      </p>
      <div className="flex items-end gap-2 sm:gap-3">
        <Pedestal entry={second} rank={2} />
        <Pedestal entry={first} rank={1} />
        <Pedestal entry={third} rank={3} />
      </div>
    </div>
  );
}

type Props = {
  youLabel: string;
  onMeChange?: (me: WeeklyMeDock | null) => void;
};

export const WeeklyChallengePanel = forwardRef<WeeklyArenaHandle, Props>(
  function WeeklyChallengePanel({ youLabel, onMeChange }, ref) {
    const [state, setState] = useState<WeeklyChallengeState | null>(null);
    const [remainingMs, setRemainingMs] = useState(0);
    const [failed, setFailed] = useState(false);
    const [loading, setLoading] = useState(true);
    const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());
    const topRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef<WeeklyChallengeState | null>(null);
    const reduce = useReducedMotion();

    const load = async () => {
      setLoading(true);
      try {
        const data = await getWeeklyChallengeState();
        stateRef.current = data;
        setState(data);
        setRemainingMs(data.msUntilLock);
        setFailed(false);
        onMeChange?.(data.me);
      } catch {
        stateRef.current = null;
        setFailed(true);
        onMeChange?.(null);
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refresh: load,
      scrollToMe: () => {
        const me = stateRef.current?.me;
        if (!me || me.weeklyXp <= 0) {
          topRef.current?.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start",
          });
          return;
        }
        if (me.rank > 0 && me.rank <= 3) {
          topRef.current?.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start",
          });
          return;
        }
        const el = rowRefs.current.get(me.username);
        if (el) {
          el.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "center",
          });
        } else {
          topRef.current?.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start",
          });
        }
      },
    }));

    useEffect(() => {
      void load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (!state) return;
      const tick = window.setInterval(() => {
        setRemainingMs((prev) => Math.max(0, prev - 1000));
      }, 1000);
      return () => window.clearInterval(tick);
    }, [state?.periodKey, state?.nextLockAt]);

    if (failed) {
      return (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Weekly board load হয়নি। আবার চেষ্টা করো।
        </p>
      );
    }

    if (loading && !state) {
      return (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-xl bg-emerald-500/10" />
          ))}
        </div>
      );
    }

    if (!state) return null;

    const showPodium = state.standings.some((s) => s.rank <= 3 && s.weeklyXp > 0);
    const listEntries = showPodium
      ? state.standings.filter((row) => row.rank > 3)
      : state.standings;

    return (
      <div ref={topRef}>
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-card to-card px-4 py-3.5 sm:gap-4 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
              <Gift className="h-3.5 w-3.5" />
              Weekly 20 TK · Live
            </p>
            <h2 className="mt-1 text-base font-black tracking-tight text-foreground sm:text-lg">
              টপ ৩ পাবে {state.prizeBdt} টাকা রিচার্জ
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              শুধু এই সপ্তাহের নতুন XP। লক: {state.nextLockLabel}.
            </p>
          </div>
          <div className="w-[6.75rem] shrink-0 rounded-xl bg-emerald-950 px-2.5 py-2.5 text-center text-emerald-50 shadow-md sm:w-[7.5rem]">
            <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200/85">
              <Timer className="h-3 w-3" />
              Lock in
            </p>
            <p className="mt-1 font-mono text-sm font-black tabular-nums sm:text-base">
              {formatCountdown(remainingMs)}
            </p>
          </div>
        </div>

        {state.lastWeek && state.lastWeek.winners.length > 0 ? (
          <div className="mb-4 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
              <Trophy className="h-3.5 w-3.5" />
              গত সপ্তাহের সেরা
            </p>
            <ul className="flex flex-wrap gap-2">
              {state.lastWeek.winners.map((w) => (
                <li
                  key={`${state.lastWeek!.periodKey}-${w.rank}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-2.5 py-1 text-xs font-bold ring-1 ring-amber-400/30"
                >
                  <span className="tabular-nums text-amber-700 dark:text-amber-300">
                    #{w.rank}
                  </span>
                  <span className="max-w-[8rem] truncate">{w.displayName}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {state.standings.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            এই সপ্তাহে এখনও কেউ weekly XP পায়নি। মিশন খেলে এগিয়ে যাও!
          </p>
        ) : (
          <>
            {showPodium ? (
              <WeeklyPodium entries={state.standings} youLabel={youLabel} />
            ) : null}

            {listEntries.length > 0 ? (
              <ol className="divide-y divide-emerald-500/15 overflow-hidden rounded-2xl border border-emerald-500/25 bg-card/70">
                {listEntries.map((row) => (
                  <li
                    key={row.username}
                    ref={(node) => {
                      if (node) rowRefs.current.set(row.username, node);
                      else rowRefs.current.delete(row.username);
                    }}
                  >
                    <Link
                      href={`/u/${encodeURIComponent(row.username)}`}
                      className={cn(
                        "flex items-center gap-2.5 px-2 py-2 transition-colors sm:gap-3 sm:px-2.5",
                        row.isYou
                          ? "bg-emerald-500/12 ring-1 ring-inset ring-emerald-400/35"
                          : "hover:bg-emerald-500/5",
                      )}
                    >
                      <span className="w-8 shrink-0">
                        <RankMark rank={row.rank} />
                      </span>
                      <Avatar
                        name={row.displayName}
                        url={row.avatarUrl}
                        size="sm"
                      />
                      <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
                        <span className="truncate text-sm font-bold">
                          {row.displayName}
                        </span>
                        {row.isYou ? (
                          <span className="shrink-0 rounded-full bg-emerald-500/20 px-1.5 text-[9px] font-bold uppercase text-emerald-800 dark:text-emerald-200">
                            {youLabel}
                          </span>
                        ) : null}
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-sm font-black tabular-nums text-emerald-700 dark:text-emerald-300">
                        <Zap className="h-3.5 w-3.5 opacity-80" />
                        {row.weeklyXp.toLocaleString("en-US")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : null}

            <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground/80">
              Weekly XP = এই সপ্তাহে নতুন করে পাওয়া XP। All-time XP আলাদা বোর্ডে।
            </p>
          </>
        )}
      </div>
    );
  },
);
