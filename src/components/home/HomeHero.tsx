"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProfileSummary, getMyProfile } from "@/src/lib/api/profile";
import { ArrowRight, BookOpen } from "lucide-react";
import type { CurrentUser } from "@/src/lib/auth-server";
import { HeroAnimation } from "@/src/components/home/HeroAnimation";

type HeroMode = "minimal" | "band" | "loading";

interface HomeHeroProps {
  children?: React.ReactNode;
  initialUser?: CurrentUser | null;
  roleCtaHref?: string | null;
  roleCtaLabel?: string | null;
}

export function HomeHero({
  children,
  initialUser = null,
  roleCtaHref = null,
  roleCtaLabel = null,
}: HomeHeroProps) {
  const needsStudentSummary = initialUser?.role === "STUDENT";
  const [mode, setMode] = useState<HeroMode>(() =>
    needsStudentSummary ? "loading" : "minimal",
  );
  const [targetBand, setTargetBand] = useState<number | null>(null);
  const [overallProgressPct, setOverallProgressPct] = useState<number>(0);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (!needsStudentSummary) {
      setMode("minimal");
      return;
    }

    let cancelled = false;
    getProfileSummary()
      .then((res) => {
        if (cancelled) return;
        if (res?.targetBand != null) {
          setMode("band");
          setTargetBand(res.targetBand);
          setOverallProgressPct(res.overallProgressPct ?? 0);
          getMyProfile().then((p) => {
            if (!cancelled && p?.name) setUserName(p.name);
          });
        } else {
          setMode("minimal");
        }
      })
      .catch(() => {
        if (!cancelled) setMode("minimal");
      });
    return () => {
      cancelled = true;
    };
  }, [needsStudentSummary]);

  if (mode === "loading") {
    return (
      <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6 text-center">
        <div className="h-24 w-48 animate-pulse rounded-lg bg-muted" />
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      </section>
    );
  }

  if (mode === "band" && targetBand != null) {
    return (
      <BandHero
        band={targetBand}
        overallProgressPct={overallProgressPct}
        userName={userName}
      />
    );
  }

  return (
    <>
      <MinimalHero
        roleCtaHref={roleCtaHref}
        roleCtaLabel={roleCtaLabel}
        isAuthenticated={!!initialUser}
      />
      {children}
    </>
  );
}

interface MinimalHeroProps {
  roleCtaHref?: string | null;
  roleCtaLabel?: string | null;
  isAuthenticated: boolean;
}

const HERO_TITLE = "Turn Your Target Band Into Reality with Gamlish";
const HERO_SUBTITLE = "Follow the system. Track your progress. Hit your band.";

function MinimalHero({
  roleCtaHref,
  roleCtaLabel,
  isAuthenticated,
}: MinimalHeroProps) {
  const showGuestCtas = !isAuthenticated;
  const showRoleCta = isAuthenticated && roleCtaHref && roleCtaLabel;

  return (
    <section className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-start overflow-visible px-4 pb-12 pt-20 text-center sm:px-6 sm:pb-16 sm:pt-24 md:pt-28">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:to-primary/10"
        aria-hidden
      />
      <div className="relative z-10 flex w-full max-w-full flex-col items-center">
        {showGuestCtas ? (
          <>
            <div className="mx-auto w-full max-w-2xl space-y-3 px-1 sm:space-y-4 sm:px-0">
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {HERO_TITLE}
              </h1>
              <p className="text-balance text-base font-medium leading-snug text-muted-foreground sm:text-lg">
                {HERO_SUBTITLE}
              </p>
            </div>
            <div className="mt-4 flex w-full min-w-0 justify-center px-2 sm:mt-5 sm:px-4">
              <HeroAnimation />
            </div>
            <div className="mt-5 flex w-full max-w-2xl flex-col items-stretch gap-3 px-1 sm:mt-6 sm:flex-row sm:justify-center sm:gap-4 sm:px-0">
              <Button size="lg" className="w-full gap-2 shadow-lg sm:w-auto" asChild>
                <Link href="/register">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/how-it-works">How it works</Link>
              </Button>
            </div>
          </>
        ) : showRoleCta ? (
          <div className="flex flex-col items-center gap-6 py-8">
            <Button size="lg" className="gap-2 shadow-lg" asChild>
              <Link href={roleCtaHref ?? "#"}>
                {roleCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Large band digits make very low % (e.g. 3%) only a few pixels tall — looks empty.
 * When journey is above 0, use at least this fill height so a sliver of water is visible.
 * True % stays in copy and aria-label. 0% stays empty (no floor).
 */
const VISUAL_WATER_MIN_PCT = 8;

function journeyToVisualWaterPercent(journeyPct: number): number {
  const p = Math.min(100, Math.max(0, Math.round(journeyPct)));
  if (p <= 0) return 0;
  return Math.min(100, Math.max(VISUAL_WATER_MIN_PCT, p));
}

function BandHero({
  band,
  overallProgressPct,
  userName,
}: {
  band: number;
  overallProgressPct: number;
  userName: string | null;
}) {
  const bandLabel = Number.isInteger(band) ? String(band) : band.toFixed(1);
  const topLine = userName ? `${userName} can achieve` : "You can achieve";

  const targetFillPct = journeyToVisualWaterPercent(overallProgressPct);

  const [fillPct, setFillPct] = useState(0);
  const fillRef = useRef(0);

  useEffect(() => {
    const target = targetFillPct;
    const from = fillRef.current;
    if (from === target) return;

    let raf = 0;
    const duration = 2200;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - t) * (1 - t);
      const pct = Math.round(from + eased * (target - from));
      fillRef.current = pct;
      setFillPct(pct);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetFillPct]);

  return (
    <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6 pt-8 text-center">
      <div className="max-w-xl flex flex-col items-center">
        <p className="mt-12 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {topLine}
        </p>

        <div className="band-score-container my-10 flex min-h-[7rem] items-center justify-center">
          <span
            className="band-score-fill font-bold tabular-nums select-none text-8xl tracking-tight md:text-9xl"
            style={{ "--fill-pct": `${fillPct}%` } as React.CSSProperties}
            aria-hidden
          >
            {bandLabel}
          </span>
          <span
            className="band-score-outline font-bold tabular-nums select-none text-8xl tracking-tight md:text-9xl"
            aria-label={`Target band score ${bandLabel}, course journey ${overallProgressPct}%`}
          >
            {bandLabel}
          </span>
        </div>

        <p className="text-muted-foreground">in Reading module</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {overallProgressPct}% course journey — pass quizzes, practice tests, and finals with fewer
          attempts to raise the bar faster.
        </p>

        <div className="pt-8">
          <Link href="/profile/reading">
            <Button size="lg" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Improve your reading skills
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
