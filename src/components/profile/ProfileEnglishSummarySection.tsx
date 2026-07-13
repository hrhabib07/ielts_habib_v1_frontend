"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Gamepad2, Map, Star, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlayerCourseMap, type PlayerCourseMap } from "@/src/lib/api/player";
import { useGuestLandingLocaleState } from "@/src/hooks/useGuestLandingLocaleState";

const PROGRESS_COPY = {
  en: {
    missionsDone: "Missions completed",
    courseProgress: "Course progress",
    continue: "Continue playing",
    resume: "Resume mission",
    openMap: "Open camp map",
    empty: "Start Mission 01 to see your progress here.",
    start: "Start Mission 01",
    camps: "Camps unlocked",
    freeMission: "Mission 01 is free",
  },
  bn: {
    missionsDone: "মিশন সম্পন্ন",
    courseProgress: "কোর্স প্রোগ্রেস",
    continue: "খেলা চালিয়ে যান",
    resume: "মিশন চালিয়ে যান",
    openMap: "ক্যাম্প ম্যাপ খুলুন",
    empty: "প্রোগ্রেস দেখতে Mission 01 শুরু করুন।",
    start: "Mission 01 শুরু করুন",
    camps: "আনলক করা ক্যাম্প",
    freeMission: "Mission 01 ফ্রি",
  },
} as const;

export function ProfileEnglishSummarySection() {
  const { locale } = useGuestLandingLocaleState();
  const copy = PROGRESS_COPY[locale];
  const [map, setMap] = useState<PlayerCourseMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPlayerCourseMap()
      .then((data) => {
        if (!cancelled) setMap(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const missions = map?.camps.flatMap((c) => c.missions) ?? [];
    const completed = missions.filter((m) => m.status === "completed").length;
    const inProgress = missions.find((m) => m.status === "in_progress");
    const nextMission = inProgress ?? missions.find((m) => m.status === "available");
    const campsStarted = map?.camps.filter((c) =>
      c.missions.some((m) => m.status !== "locked"),
    ).length ?? 0;
    const pct = missions.length > 0 ? Math.round((completed / missions.length) * 100) : 0;
    return { completed, total: missions.length, nextMission, campsStarted, pct };
  }, [map]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/15 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-lg md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
              {copy.courseProgress}
            </p>
            <p className="text-4xl font-bold tabular-nums">{stats.pct}%</p>
            <p className="text-sm text-indigo-100/80">
              {stats.completed}/{stats.total || 21} {copy.missionsDone.toLowerCase()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-full bg-white font-semibold text-slate-950 hover:bg-indigo-50"
            >
              <Link
                href={
                  stats.nextMission?.slug
                    ? `/player/missions/${stats.nextMission.slug}`
                    : "/player/missions/mission-01-word-order"
                }
              >
                <Zap className="mr-2 h-4 w-4" />
                {stats.nextMission ? copy.resume : copy.start}
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-full border border-white/40 bg-white/10 font-semibold text-white shadow-none hover:bg-white/20 hover:text-white"
            >
              <Link href="/player">
                <Map className="mr-2 h-4 w-4" />
                {copy.openMap}
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
            style={{ width: `${Math.max(stats.pct, 4)}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Trophy} label={copy.missionsDone} value={`${stats.completed}/${stats.total || 21}`} />
        <StatCard icon={Map} label={copy.camps} value={String(stats.campsStarted)} />
        <StatCard icon={Star} label={copy.freeMission} value="01" />
        <StatCard
          icon={Gamepad2}
          label={locale === "bn" ? "পরবর্তী মিশন" : "Next mission"}
          value={stats.nextMission?.title?.replace("Mission ", "M") ?? "M01"}
        />
      </div>

      {stats.completed === 0 && !stats.nextMission ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-muted-foreground">{copy.empty}</p>
          <Button asChild className="mt-4 gap-2">
            <Link href="/player/missions/mission-01-word-order">
              {copy.start}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
