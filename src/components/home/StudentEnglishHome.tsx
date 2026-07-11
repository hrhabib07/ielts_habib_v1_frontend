"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Crown,
  Lock,
  Map,
  Play,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import {
  getPlayerCourseMap,
  type PlayerCourseMap,
  type PlayerMapMission,
} from "@/src/lib/api/player";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { cn } from "@/lib/utils";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { useStudentHomeCopy } from "@/src/hooks/useLocalizedCopy";
import {
  formatMissionLabel,
  formatMissionProgress,
  formatUnlockedCamps,
  localizeDigits,
} from "@/src/lib/ui-locale";
import { brandSurfaces } from "@/src/lib/brand-theme";
import { getStudentDisplayName } from "@/src/lib/student-display-name";

function resolveCurrentMission(
  missions: PlayerMapMission[],
): PlayerMapMission | undefined {
  return (
    missions.find((m) => m.status === "in_progress") ??
    missions.find((m) => m.status === "available") ??
    missions.find((m) => m.order === 1)
  );
}

function countUnlockedCamps(map: PlayerCourseMap | null): number {
  if (!map) return 1;
  return map.camps.filter((camp) =>
    camp.missions.some((mission) => mission.status !== "locked"),
  ).length;
}

type CampVisualState = "active" | "open" | "locked";

function campVisualState(
  map: PlayerCourseMap | null,
  campIndex: number,
  currentCampOrder: number | null,
): CampVisualState {
  const camp = map?.camps[campIndex];
  if (!camp) return campIndex === 0 ? "open" : "locked";
  const unlocked = camp.missions.some((m) => m.status !== "locked");
  if (!unlocked) return "locked";
  if (currentCampOrder != null && camp.order === currentCampOrder) return "active";
  return "open";
}

export function StudentEnglishHome() {
  const { isFoundingMember, loading: profileLoading, profile } =
    useStudentSession();
  const { locale } = useUiLocale();
  const copy = useStudentHomeCopy();
  const reduceMotion = useReducedMotion();
  const [map, setMap] = useState<PlayerCourseMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPlayerCourseMap()
      .then((data) => {
        if (!cancelled) setMap(data);
      })
      .catch(() => {
        if (!cancelled) setMap(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const missions = map?.camps.flatMap((camp) => camp.missions) ?? [];
    const completed = missions.filter((m) => m.status === "completed").length;
    const currentMission = resolveCurrentMission(missions);
    const nextMission =
      missions.find((m) => m.status === "in_progress") ??
      missions.find((m) => m.status === "available");
    const unlockedCamps = countUnlockedCamps(map);
    const progressPct =
      missions.length > 0 ? Math.round((completed / missions.length) * 100) : 0;
    const currentCampOrder =
      map?.camps.find((c) =>
        c.missions.some((m) => m.id === (nextMission ?? currentMission)?.id),
      )?.order ?? null;

    return {
      completed,
      total: missions.length,
      currentMission,
      nextMission,
      unlockedCamps,
      progressPct,
      currentCampOrder,
    };
  }, [map]);

  const missionHref = stats.nextMission?.slug
    ? `/player/missions/${stats.nextMission.slug}`
    : stats.currentMission?.slug
      ? `/player/missions/${stats.currentMission.slug}`
      : "/player/missions/mission-01-word-order";

  const missionLabel = formatMissionLabel(
    stats.nextMission?.order ?? stats.currentMission?.order,
  );

  const progressHint =
    stats.nextMission?.status === "completed"
      ? copy.progressHintCompleted
      : copy.progressHint;

  const progressButtonLabel = stats.nextMission
    ? copy.progressButton
    : copy.progressButtonExplore;

  const playerName = getStudentDisplayName(profile);
  const greeting = playerName
    ? `${copy.heroGreeting}, ${playerName}`
    : copy.heroGreeting;

  const ringPct = Math.max(stats.progressPct, stats.completed > 0 ? stats.progressPct : 4);
  const ringStyle = {
    background: `conic-gradient(var(--steel) ${ringPct * 3.6}deg, color-mix(in srgb, var(--muted) 80%, transparent) 0deg)`,
  };

  return (
    <div
      className={cn(
        "relative min-h-[calc(100dvh-4rem)] overflow-hidden",
        brandSurfaces.pageGradient,
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div
        className={cn("pointer-events-none absolute inset-x-0 top-0 h-80", brandSurfaces.heroGlow)}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-steel/15 blur-3xl dark:bg-steel/10"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
              brandSurfaces.eyebrowBadge,
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {copy.heroBadge}
          </span>
          {isFoundingMember ? <FoundingMemberBadge size="sm" /> : null}
        </div>

        {/* Hero: short text + interactive play stage */}
        <div className="mt-6 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            <div>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {greeting}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">{copy.heroLine}</p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Button
                size="lg"
                className={cn(
                  "h-12 rounded-full px-8 text-base",
                  brandSurfaces.ctaButton,
                )}
                asChild
              >
                <Link href={missionHref}>
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  {copy.primaryButton}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "h-12 rounded-full px-8 text-base",
                  brandSurfaces.ctaButtonOutline,
                )}
                asChild
              >
                <Link href="/player">
                  <Map className="mr-2 h-4 w-4" />
                  {copy.secondaryButton}
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatChip
                icon={Trophy}
                label={copy.statCompletedMissions}
                value={
                  profileLoading && !map
                    ? "…"
                    : formatMissionProgress(stats.completed, stats.total, locale)
                }
              />
              <StatChip
                icon={Star}
                label={copy.statCurrentMission}
                value={
                  stats.currentMission
                    ? formatMissionLabel(stats.currentMission.order)
                    : formatMissionLabel(1)
                }
              />
              <StatChip
                icon={Map}
                label={copy.statCamps}
                value={formatUnlockedCamps(stats.unlockedCamps, locale)}
              />
            </div>
          </motion.div>

          {/* Interactive next-mission stage */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="relative"
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-[1.75rem] p-6 sm:p-8",
                brandSurfaces.featuredCard,
              )}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-steel/20 blur-2xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-primary/10 blur-2xl"
                aria-hidden
              />

              <div className="relative flex flex-col items-center text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-steel-deep dark:text-steel">
                  {copy.progressLabel}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {copy.progressTitle(missionLabel)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{progressHint}</p>

                <Link
                  href={missionHref}
                  className="group relative mt-7 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-steel focus-visible:ring-offset-2"
                  aria-label={progressButtonLabel}
                >
                  <motion.div
                    className="relative flex h-40 w-40 items-center justify-center rounded-full sm:h-44 sm:w-44"
                    style={ringStyle}
                    whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  >
                    <div className="flex h-[7.25rem] w-[7.25rem] flex-col items-center justify-center rounded-full bg-card shadow-inner sm:h-[8rem] sm:w-[8rem]">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-steel text-steel-foreground shadow-lg shadow-steel-deep/30 transition-transform group-hover:scale-105">
                        <Play className="h-5 w-5 fill-current" />
                      </span>
                      <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        {copy.playLabel}
                      </span>
                      <span className="text-lg font-bold tabular-nums text-foreground">
                        {localizeDigits(stats.progressPct, locale)}%
                      </span>
                    </div>
                  </motion.div>
                </Link>

                <div className="mt-5 w-full max-w-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{copy.progressBarLabel}</span>
                    <span className="font-semibold text-foreground">
                      {localizeDigits(stats.progressPct, locale)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted dark:bg-primary/25">
                    <motion.div
                      className="h-full rounded-full bg-steel"
                      initial={false}
                      animate={{
                        width: `${Math.max(stats.progressPct, stats.completed > 0 ? stats.progressPct : 4)}%`,
                      }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                <Button
                  className={cn("mt-5 w-full max-w-xs rounded-full", brandSurfaces.ctaButton)}
                  asChild
                >
                  <Link href={missionHref}>
                    {progressButtonLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Interactive camps */}
        <section className="mt-12 sm:mt-14">
          <h2 className="text-lg font-bold text-foreground sm:text-xl">
            {copy.campsSectionTitle}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {copy.camps.map((camp, index) => {
              const state = campVisualState(
                map,
                index,
                stats.currentCampOrder,
              );
              return (
                <Link
                  key={camp.title}
                  href="/player"
                  className={cn(
                    "group relative overflow-hidden rounded-2xl p-4 transition-all duration-300",
                    "ring-1 hover:-translate-y-1 hover:shadow-lg",
                    state === "active" &&
                      "bg-[#0f172a] text-white ring-steel/40 shadow-md shadow-steel-deep/20",
                    state === "open" &&
                      "bg-card text-foreground ring-border/60 hover:ring-steel/40",
                    state === "locked" &&
                      "bg-muted/50 text-muted-foreground ring-border/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.16em]",
                        state === "active" ? "text-steel" : "text-steel-deep dark:text-steel",
                      )}
                    >
                      {camp.title}
                    </span>
                    {state === "locked" ? (
                      <Lock className="h-3.5 w-3.5 opacity-70" />
                    ) : state === "active" ? (
                      <span className="rounded-full bg-steel/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-steel">
                        {copy.campActiveLabel}
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "mt-3 text-base font-semibold",
                      state === "active" ? "text-white" : "text-foreground",
                    )}
                  >
                    {camp.subtitle}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      state === "active" ? "text-white/65" : "text-muted-foreground",
                    )}
                  >
                    {state === "locked"
                      ? copy.campUnlockLabel
                      : state === "active"
                        ? copy.campActiveLabel
                        : copy.campStartLabel}
                  </p>
                  <div
                    className={cn(
                      "mt-4 h-0.5 w-10 rounded-full transition-all group-hover:w-16",
                      state === "locked" ? "bg-border" : "bg-steel",
                    )}
                  />
                </Link>
              );
            })}
          </div>
        </section>

        <section
          className={cn(
            "mt-8 flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between",
            brandSurfaces.premiumBanner,
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-steel/15 text-steel-deep dark:bg-steel/20 dark:text-steel">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{copy.premiumBannerTitle}</p>
              <p className="text-sm text-muted-foreground">{copy.premiumBannerLine}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className={cn("shrink-0", brandSurfaces.ctaButtonOutline)}
            asChild
          >
            <Link href="/pricing?course=english-foundations">
              {copy.premiumBannerButton}
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3 py-1.5 shadow-sm dark:border-steel-deep/25">
      <Icon className="h-3.5 w-3.5 text-steel-deep dark:text-steel" />
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-sm font-bold tabular-nums text-foreground">{value}</span>
    </div>
  );
}
