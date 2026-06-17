"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Lock,
  Sparkles,
} from "lucide-react";
import type { Level } from "@/src/lib/api/levels";
import type { ReadingPathLevelStatus } from "@/src/lib/api/readingStrictProgression";
import {
  getMockLevelLaunchState,
  isMockLevelOrder,
  shouldUseMockLevelPlaceholder,
} from "@/src/lib/readingMockLevelsLaunch";
import { readingPathPremium } from "@/src/lib/readingPathPremium";
import type { ReadingPathZone } from "@/src/lib/readingPathZones";
import { formatLevelDisplayTitle } from "@/src/lib/formatLevelDisplayTitle";
import { cn } from "@/lib/utils";

export { formatLevelDisplayTitle } from "@/src/lib/formatLevelDisplayTitle";

type LevelAccess = {
  isPassed: boolean;
  isCurrent: boolean;
  accessible: boolean;
  premiumLocked: boolean;
  progressionLocked: boolean;
};

function getLockMessage(params: {
  access: LevelAccess;
  levelIndex: number;
  levels: Level[];
  displayLevelNumber: (order: number) => number;
  paymentPending: boolean;
}): string {
  const { access, levelIndex, levels, displayLevelNumber, paymentPending } = params;

  if (access.premiumLocked) {
    if (paymentPending) {
      return "Your payment is being reviewed. Level 3 and beyond will unlock automatically once approved. usually within 24–48 hours.";
    }
    return "You finished the free levels. Unlock premium on the pricing page to start Level 3 and continue your 21-level journey.";
  }

  if (levelIndex > 0) {
    const prevNum = displayLevelNumber(levels[levelIndex - 1]!.order);
    return `Complete Level ${prevNum} first. One level at a time. you've got this!`;
  }

  return "This level unlocks as you progress on your reading path.";
}

export function ReadingPathZoneCard(props: {
  zone: ReadingPathZone;
  zoneIndex: number;
  levels: Level[];
  allLevels: Level[];
  paymentPending: boolean;
  levelStatusById: Map<string, ReadingPathLevelStatus>;
  curriculumDemoAccount: boolean;
  isFutureZone: boolean;
  displayLevelNumber: (order: number) => number;
  getLevelAccess: (level: Level, levelIndex: number) => LevelAccess;
}) {
  const {
    zone,
    zoneIndex,
    levels,
    allLevels,
    paymentPending,
    levelStatusById,
    curriculumDemoAccount,
    isFutureZone,
    displayLevelNumber,
    getLevelAccess,
  } = props;

  const router = useRouter();
  const [hintLevelId, setHintLevelId] = useState<string | null>(null);

  const passedInZone = levels.filter(
    (l) => levelStatusById.get(l._id)?.isPassed || getLevelAccess(l, allLevels.findIndex((x) => x._id === l._id)).isPassed,
  ).length;
  const zonePct =
    levels.length > 0 ? Math.round((passedInZone / levels.length) * 100) : 0;

  const handleLevelClick = useCallback(
    (params: {
      level: Level;
      levelIndex: number;
      access: LevelAccess;
      href: string;
    }) => {
      const { level, access, href } = params;

      if (access.accessible) {
        setHintLevelId(null);
        router.push(href);
        return;
      }

      if (access.premiumLocked) {
        setHintLevelId(level._id);
        if (!paymentPending) {
          router.push("/pricing");
        }
        window.setTimeout(() => {
          setHintLevelId((current) => (current === level._id ? null : current));
        }, 5200);
        return;
      }

      setHintLevelId(level._id);
      window.setTimeout(() => {
        setHintLevelId((current) => (current === level._id ? null : current));
      }, 4200);
    },
    [router, paymentPending],
  );

  return (
    <article
      className={cn(
        "reading-zone-enter relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/40 bg-card",
        "shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] ring-1 ring-[color:var(--accent)]/[0.06]",
        "transition-all duration-300 hover:border-accent/25 hover:shadow-[0_12px_40px_-12px_rgba(30,58,138,0.15)] dark:hover:shadow-[0_16px_48px_-16px_rgba(56,189,248,0.12)]",
        isFutureZone && "opacity-[0.82] saturate-[0.94]",
      )}
      style={{ animationDelay: `${zoneIndex * 90}ms` }}
    >
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-accent/60" aria-hidden />

      <div
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl",
          zone.glowClass,
        )}
        aria-hidden
      />

      <header className="relative border-b border-border/30 px-5 pb-4 pt-5 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent ring-1 ring-accent/15">
              {zone.zoneLabel}
            </span>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
              {zone.title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{zone.subtitle}</p>
          </div>
          {isFutureZone && (
            <span className="shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ahead
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className={cn(readingPathPremium.progressTrack, "h-1 flex-1")}>
            <div
              className={readingPathPremium.progressFill}
              style={{ width: `${zonePct}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] font-semibold tabular-nums text-muted-foreground">
            {passedInZone}/{levels.length}
          </span>
        </div>
      </header>

      <ul className="relative flex flex-1 flex-col gap-0.5 p-3 sm:p-4">
        {levels.length === 0 && (
          <li className="rounded-xl border border-dashed border-border/40 px-3 py-8 text-center text-xs text-muted-foreground">
            Levels coming soon
          </li>
        )}
        {levels.map((level) => {
          const levelIndex = allLevels.findIndex((l) => l._id === level._id);
          const access = getLevelAccess(level, levelIndex);
          const mockPlaceholder = shouldUseMockLevelPlaceholder(level.order);
          const displayNum = displayLevelNumber(level.order);
          const title = formatLevelDisplayTitle(level, displayNum);

          const mockLaunchState =
            mockPlaceholder && isMockLevelOrder(level.order)
              ? getMockLevelLaunchState({
                  levelOrder: level.order,
                  levelIndex,
                  levels: allLevels,
                  currentOrder: -1,
                  detailCache: {},
                  contextDetail: null,
                  levelIdFromPath: null,
                  curriculumDemoAccount,
                })
              : null;

          const mockComingSoon = mockLaunchState === "coming_soon";
          const href = `/profile/reading/strict-levels/${level._id}`;
          const showHint = hintLevelId === level._id && !access.accessible;

          const rowClass = cn(
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
            "cursor-pointer active:scale-[0.99]",
            access.isCurrent && "bg-accent/10 ring-1 ring-accent/20",
            access.isPassed && !access.isCurrent && "bg-emerald-500/5 ring-1 ring-emerald-500/10",
            !access.isCurrent && !access.isPassed && access.accessible && "hover:bg-muted/40 hover:ring-1 hover:ring-accent/10",
            access.premiumLocked && "hover:bg-accent/5 hover:ring-1 hover:ring-accent/15",
            access.progressionLocked && "hover:bg-muted/25 opacity-80",
          );

          return (
            <li key={level._id}>
              <button
                type="button"
                className={rowClass}
                onClick={() =>
                  handleLevelClick({
                    level,
                    levelIndex,
                    access,
                    href,
                  })
                }
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold transition-transform duration-200 group-hover:scale-105",
                    access.isPassed
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : access.isCurrent
                        ? "bg-accent text-accent-foreground animate-soft-pulse"
                        : access.premiumLocked
                          ? "bg-accent/15 text-accent"
                          : access.accessible
                            ? "bg-muted/60 text-muted-foreground"
                            : "bg-muted/30 text-muted-foreground/70",
                  )}
                >
                  {access.isPassed ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : access.premiumLocked ? (
                    <CreditCard className="h-3 w-3" />
                  ) : !access.accessible ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    displayNum
                  )}
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 text-sm leading-snug text-left",
                    access.isCurrent
                      ? "font-semibold text-foreground"
                      : access.isPassed
                        ? "font-medium text-emerald-700 dark:text-emerald-300"
                        : access.premiumLocked
                          ? "font-medium text-foreground"
                          : "font-medium text-foreground",
                  )}
                >
                  {title}
                </span>
                {access.isPassed && (
                  <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Done
                  </span>
                )}
                {access.premiumLocked && !access.isPassed && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent">
                    {paymentPending ? (
                      <>
                        <Clock className="h-2.5 w-2.5" />
                        Review
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-2.5 w-2.5" />
                        Premium
                      </>
                    )}
                  </span>
                )}
                {mockComingSoon && access.accessible && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent">
                    <Clock className="h-2.5 w-2.5" />
                    Soon
                  </span>
                )}
                {access.isCurrent && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent-foreground">
                    <Sparkles className="h-2.5 w-2.5" />
                    Now
                  </span>
                )}
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent",
                    access.isCurrent && "text-accent",
                    access.premiumLocked && "text-accent/60",
                  )}
                />
              </button>

              {showHint && (
                <div
                  className={cn(
                    "animate-fade-up mx-1 mt-1 flex flex-col gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed ring-1",
                    access.premiumLocked
                      ? "border-accent/25 bg-accent/[0.06] text-foreground ring-accent/10"
                      : "border-border/50 bg-muted/30 text-muted-foreground ring-border/20",
                  )}
                  role="status"
                >
                  <span>{getLockMessage({ access, levelIndex, levels: allLevels, displayLevelNumber, paymentPending })}</span>
                  {access.premiumLocked && !paymentPending && (
                    <Link
                      href="/pricing"
                      className="inline-flex w-fit items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground"
                    >
                      <CreditCard className="h-3 w-3" />
                      Go to pricing
                    </Link>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
