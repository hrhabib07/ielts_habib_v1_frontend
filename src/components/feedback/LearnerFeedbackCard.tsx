"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Star, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";

/** Campus Map mission total · used for fraction progress on player cards. */
export const CAMPUS_MISSIONS_TOTAL = 21;

function MissionProgressPill({
  done,
  total,
  label,
}: {
  done: number;
  total: number;
  label: string;
}) {
  const clamped = Math.max(0, Math.min(done, total));
  const pct = total > 0 ? Math.round((clamped / total) * 100) : 0;
  const targetPct = Math.max(pct > 0 ? 6 : 0, pct);
  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setFillWidth(targetPct);
      return;
    }

    setFillWidth(0);
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setFillWidth(targetPct);
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [targetPct]);

  return (
    <span
      className="relative inline-flex h-7 shrink-0 items-center gap-1.5 overflow-hidden rounded-full bg-sky-100 px-2.5 ring-1 ring-inset ring-sky-200/80 dark:bg-sky-950/40 dark:ring-sky-400/25"
      aria-label={`${clamped} of ${total} ${label}`}
    >
      {/* Track is the light pill · fill is the darker progress slice */}
      <span
        aria-hidden
        className="mission-progress-pill-fill absolute inset-y-0 left-0 z-0 rounded-full bg-sky-300/85 dark:bg-sky-500/55"
        style={{ width: `${fillWidth}%` }}
      />
      <Trophy
        className="relative z-10 h-3.5 w-3.5 shrink-0 text-sky-800 drop-shadow-[0_0_6px_rgba(255,255,255,0.65)] dark:text-sky-100"
        aria-hidden
      />
      <span className="relative z-10 whitespace-nowrap text-[11px] font-black leading-none tabular-nums tracking-tight text-sky-950 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] dark:text-sky-50">
        {clamped}/{total}{" "}
        <span className="font-bold">{label}</span>
      </span>
    </span>
  );
}

export function LearnerFeedbackCard({
  displayName,
  title,
  rating,
  body,
  className,
  pendingBadge,
  username,
  profileHandle,
  avatarUrl,
  totalXp,
  missionsCompleted,
  missionsTotal = CAMPUS_MISSIONS_TOTAL,
  interactive = false,
}: {
  displayName: string;
  title: string;
  rating: number;
  body: string;
  className?: string;
  pendingBadge?: boolean;
  username?: string | null;
  profileHandle?: string | null;
  avatarUrl?: string | null;
  totalXp?: number | null;
  missionsCompleted?: number | null;
  /** Denominator for progress fraction · defaults to Campus Map total (21). */
  missionsTotal?: number;
  /** Landing / promo mode · player-card chrome + profile link */
  interactive?: boolean;
}) {
  const { locale } = useUiLocale();
  const stars = Math.min(5, Math.max(0, Math.round(rating)));
  const name = displayName.trim() || "Learner";
  const role = title.trim() || "লার্নার";
  const text = body.trim() || "তোমার মতামত এখানে দেখা যাবে…";
  const handle = (profileHandle || username || "").trim().toLowerCase();
  const profileHref = handle ? `/u/${encodeURIComponent(handle)}` : null;
  const initial = (Array.from(name)[0] || "?").toUpperCase();
  const atHandle = username || handle;
  const missionLabel = locale === "bn" ? "মিশন" : "Missions";
  const showProof =
    (typeof totalXp === "number" && totalXp > 0) ||
    (typeof missionsCompleted === "number" && missionsCompleted > 0);

  const metaParts = [
    atHandle ? `@${atHandle}` : null,
    role || null,
  ].filter(Boolean);

  const identity = (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-black text-white shadow-sm ring-2 ring-sky-400/20">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1">
          <span className="truncate text-sm font-black text-foreground">
            {name}
          </span>
          {interactive && profileHref ? (
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/35 transition-colors group-hover/id:text-sky-500" />
          ) : null}
        </span>
        {metaParts.length > 0 ? (
          <span className="mt-0.5 block truncate font-bengali text-sm text-muted-foreground">
            {metaParts.join(" · ")}
          </span>
        ) : null}
      </span>
    </div>
  );

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 text-left shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300",
        interactive &&
          "hover:-translate-y-1 hover:shadow-[0_12px_36px_rgb(0,0,0,0.08)]",
        className,
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        {interactive && profileHref ? (
          <Link
            href={profileHref}
            className="group/id min-w-0 flex-1 rounded-xl outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-sky-400/40"
          >
            {identity}
          </Link>
        ) : (
          <div className="min-w-0 flex-1">{identity}</div>
        )}
        {pendingBadge ? (
          <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
            Pending
          </span>
        ) : null}
      </div>

      {showProof ? (
        <div className="relative z-10 mt-4 flex flex-wrap gap-2">
          {typeof totalXp === "number" && totalXp > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-black tabular-nums text-amber-800 dark:text-amber-200">
              <Zap className="h-3 w-3" />
              {totalXp.toLocaleString("en-US")} XP
            </span>
          ) : null}
          {typeof missionsCompleted === "number" && missionsCompleted > 0 ? (
            <MissionProgressPill
              done={missionsCompleted}
              total={missionsTotal}
              label={missionLabel}
            />
          ) : null}
        </div>
      ) : null}

      <div
        className="relative z-10 mt-3 flex items-center gap-0.5"
        aria-label={`${stars} of 5`}
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < stars
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        ))}
      </div>

      <div className="relative z-10 mt-3 flex gap-1.5">
        <span
          aria-hidden
          className="mt-[-0.2em] shrink-0 select-none font-[Georgia,'Times_New_Roman',serif] text-2xl leading-none text-amber-500"
        >
          “
        </span>
        <p className="min-w-0 font-bengali text-sm leading-relaxed text-muted-foreground">
          {text}
        </p>
      </div>
    </article>
  );
}
