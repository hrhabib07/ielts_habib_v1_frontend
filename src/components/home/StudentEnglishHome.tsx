"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Crown,
  Gamepad2,
  Map,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { getStudentDisplayName } from "@/src/lib/student-display-name";
import { getPlayerCourseMap, type PlayerCourseMap } from "@/src/lib/api/player";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { BD_UI } from "@/src/lib/bangladesh-ui-copy";
import { GAMLISH_BRAND } from "@/src/lib/gamlish-brand";
import { cn } from "@/lib/utils";

const CAMP_PREVIEW = [
  { title: "Camp 01", subtitle: "The Foundation", tone: "from-violet-600 to-indigo-700" },
  { title: "Camp 02", subtitle: "Action Kingdom", tone: "from-orange-500 to-rose-600" },
  { title: "Camp 03", subtitle: "Time Travel", tone: "from-cyan-600 to-blue-700" },
  { title: "Camp 04", subtitle: "Real English", tone: "from-emerald-600 to-teal-700" },
] as const;

export function StudentEnglishHome() {
  const { profile, isFoundingMember, loading: profileLoading } = useStudentSession();
  const [map, setMap] = useState<PlayerCourseMap | null>(null);

  const name = getStudentDisplayName(profile) ?? "খেলোয়াড়";

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
    const missions = map?.camps.flatMap((c) => c.missions) ?? [];
    const completed = missions.filter((m) => m.status === "completed").length;
    const inProgress = missions.find((m) => m.status === "in_progress");
    const nextMission = inProgress ?? missions.find((m) => m.status === "available");
    return { completed, total: missions.length, nextMission };
  }, [map]);

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.22),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-4 py-10 font-bengali sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700 dark:text-indigo-300">
            <Gamepad2 className="h-3.5 w-3.5" />
            {BD_UI.brandEyebrow}
          </span>
          {isFoundingMember ? <FoundingMemberBadge size="sm" /> : null}
        </div>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                {BD_UI.welcomeBack(name)}
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {BD_UI.studentHomeLead}
              </p>
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                {GAMLISH_BRAND.taglineLine2}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                size="lg"
                className="h-12 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-base font-bold shadow-lg shadow-indigo-600/25"
                asChild
              >
                <Link href="/player">
                  <Map className="mr-2 h-4 w-4" />
                  {BD_UI.openCampMap}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-full px-8" asChild>
                <Link href="/player/missions/mission-01-word-order">
                  <Zap className="mr-2 h-4 w-4 text-amber-500" />
                  {BD_UI.continueMission01}
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                icon={Trophy}
                label={BD_UI.missionsDone}
                value={profileLoading && !map ? "…" : `${stats.completed}/${stats.total || 21}`}
              />
              <StatCard
                icon={Star}
                label={BD_UI.freeToStart}
                value="Mission 01"
              />
              <StatCard
                icon={BookOpen}
                label={BD_UI.camps}
                value="৪টি"
              />
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-indigo-500/15 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-2xl shadow-indigo-950/30 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                    Your next move
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {stats.nextMission?.title ?? "Mission 01: Word Order"}
                  </p>
                  <p className="mt-1 text-sm text-violet-200/80">
                    {stats.nextMission?.status === "completed"
                      ? "Pick the next mission on the camp map."
                      : "Story → video → evaluations. One level at a time."}
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <Sparkles className="h-6 w-6 text-amber-300" />
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs text-violet-200/70">
                  <span>Course progress</span>
                  <span>
                    {stats.total > 0
                      ? `${Math.round((stats.completed / stats.total) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                    style={{
                      width:
                        stats.total > 0
                          ? `${Math.round((stats.completed / stats.total) * 100)}%`
                          : "4%",
                    }}
                  />
                </div>
              </div>

              <Button
                className="mt-6 w-full rounded-full bg-white font-semibold text-slate-950 hover:bg-violet-50"
                asChild
              >
                <Link href={stats.nextMission?.slug ? `/player/missions/${stats.nextMission.slug}` : "/player"}>
                  {stats.nextMission ? "Resume mission" : "Start playing"}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <section className="mt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Four camps. Twenty-one missions.</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                English Foundations, built like a game, not a lecture.
              </p>
            </div>
            <Link
              href="/pricing?course=english-foundations"
              className="hidden text-sm font-medium text-indigo-600 hover:underline sm:inline"
            >
              View full access
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CAMP_PREVIEW.map((camp, index) => (
              <Link
                key={camp.title}
                href="/player"
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={cn(
                    "mb-4 inline-flex rounded-xl bg-gradient-to-br px-3 py-2 text-xs font-bold uppercase tracking-wide text-white",
                    camp.tone,
                  )}
                >
                  {camp.title}
                </div>
                <p className="font-semibold text-foreground">{camp.subtitle}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {index === 0 ? "Mission 01 free" : "Unlock with full access"}
                </p>
                <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-card to-violet-500/5 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Ready for the full course?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Unlock all camps, missions, and evaluations after Mission 01.
              </p>
            </div>
          </div>
          <Button variant="outline" className="mt-4 shrink-0 sm:mt-0" asChild>
            <Link href="/pricing?course=english-foundations">See plans</Link>
          </Button>
        </section>
      </div>
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
    <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
