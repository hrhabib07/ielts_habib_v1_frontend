"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProfileSummary, getMyProfile } from "@/src/lib/api/profile";
import { BookOpen, MapPin, Sparkles, TrendingUp } from "lucide-react";
import type { CurrentUser } from "@/src/lib/auth-server";
import {
  hasUsableClientToken,
  isActiveStudentSessionClient,
} from "@/src/lib/auth";
import { GuestLandingPage } from "@/src/components/home/guest/GuestLandingPage";
import { StudentBandJourneyFlightVisual } from "@/src/components/home/StudentBandJourneyFlightVisual";
import {
  STUDENT_JOURNEY_HERO_MOCK,
  resolveJourneyMapPoint,
} from "@/src/components/home/studentJourneyHeroConfig";
import { getStudentDisplayName } from "@/src/lib/student-display-name";

type HeroMode = "minimal" | "student" | "loading";

interface StudentHeroData {
  band: number | null;
  overallProgressPct: number;
  userName: string | null;
  currentCountry: string;
  dreamCountry: string;
  dreamCity: string | null;
}

interface HomeHeroProps {
  children?: React.ReactNode;
  initialUser?: CurrentUser | null;
  roleCtaHref?: string | null;
  roleCtaLabel?: string | null;
}

function buildStudentHeroData(
  summary: Awaited<ReturnType<typeof getProfileSummary>>,
  profile: Awaited<ReturnType<typeof getMyProfile>>,
): StudentHeroData {
  const band =
    summary?.targetBand ?? profile?.targetBands?.reading ?? null;
  const overallProgressPct = summary?.overallProgressPct ?? 0;
  const userName = getStudentDisplayName(profile);
  const cur =
    profile?.profile?.currentCountry?.trim() ||
    profile?.profile?.country?.trim() ||
    null;
  const dream = profile?.profile?.dreamCountry?.trim() || null;
  const dreamCity = profile?.profile?.dreamCity?.trim() || null;

  return {
    band,
    overallProgressPct,
    userName,
    currentCountry: cur || STUDENT_JOURNEY_HERO_MOCK.currentCountry,
    dreamCountry: dream || STUDENT_JOURNEY_HERO_MOCK.dreamCountry,
    dreamCity,
  };
}

export function HomeHero({
  children,
  initialUser = null,
  roleCtaHref = null,
  roleCtaLabel = null,
}: HomeHeroProps) {
  const [authBootstrapped, setAuthBootstrapped] = useState(false);
  useEffect(() => {
    setAuthBootstrapped(true);
  }, []);

  const serverStudent = initialUser?.role === "STUDENT";
  const clientStudentFallback =
    authBootstrapped &&
    initialUser == null &&
    isActiveStudentSessionClient();
  const isStudent = serverStudent || clientStudentFallback;

  const [mode, setMode] = useState<HeroMode>(() =>
    serverStudent ? "loading" : "minimal",
  );
  const [studentData, setStudentData] = useState<StudentHeroData | null>(null);

  useEffect(() => {
    if (!isStudent) {
      setMode("minimal");
      setStudentData(null);
      return;
    }

    setMode("loading");

    let cancelled = false;

    (async () => {
      const [summaryOutcome, profileOutcome] = await Promise.allSettled([
        getProfileSummary(),
        getMyProfile(),
      ]);

      if (cancelled) return;

      const summary =
        summaryOutcome.status === "fulfilled" ? summaryOutcome.value : null;
      const profile =
        profileOutcome.status === "fulfilled" ? profileOutcome.value : null;

      setStudentData(buildStudentHeroData(summary, profile));
      setMode("student");
    })();

    return () => {
      cancelled = true;
    };
  }, [isStudent]);

  if (mode === "loading") {
    return (
      <section className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="h-32 w-full max-w-lg animate-pulse rounded-2xl bg-muted/50" />
        <div className="mt-8 h-24 w-40 animate-pulse rounded-xl bg-muted/40" />
        <p className="mt-6 text-sm text-muted-foreground">Loading your journey…</p>
      </section>
    );
  }

  if (mode === "student" && studentData) {
    return (
      <BandHero
        band={studentData.band}
        overallProgressPct={studentData.overallProgressPct}
        userName={studentData.userName}
        currentCountry={studentData.currentCountry}
        dreamCountry={studentData.dreamCountry}
        dreamCity={studentData.dreamCity}
        moduleLabel={STUDENT_JOURNEY_HERO_MOCK.moduleLabel}
        improveSkillsHref={STUDENT_JOURNEY_HERO_MOCK.profileHref}
      />
    );
  }

  const showAsAuthenticatedUi =
    !!initialUser ||
    (authBootstrapped && hasUsableClientToken());

  if (!showAsAuthenticatedUi) {
    return (
      <>
        <GuestLandingPage />
        {children}
      </>
    );
  }

  return (
    <>
      <AuthenticatedHomeCta roleCtaHref={roleCtaHref} roleCtaLabel={roleCtaLabel} />
      {children}
    </>
  );
}

/** Compact CTA for logged-in admin/instructor on home (students use BandHero). */
function AuthenticatedHomeCta({
  roleCtaHref,
  roleCtaLabel,
}: {
  roleCtaHref?: string | null;
  roleCtaLabel?: string | null;
}) {
  if (!roleCtaHref || !roleCtaLabel) return null;

  return (
    <section className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-6 py-16 text-center">
      <Button size="lg" className="shadow-lg" asChild>
        <Link href={roleCtaHref}>{roleCtaLabel}</Link>
      </Button>
    </section>
  );
}

/**
 * Large band digits make very low % (e.g. 3%) only a few pixels tall — looks empty.
 * When journey is above 0, use at least this fill height so a sliver of water is visible.
 * True % stays in copy and aria-label. 0% stays empty (no floor).
 */
const VISUAL_WATER_MIN_PCT = 8;

/** Radial vignette + SVG noise; z-0 only — keeps headline, score, and CTA readable. */
function BandHeroAtmosphere() {
  const grainFilterId = useId().replace(/:/g, "");

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_88%_74%_at_50%_44%,rgb(255_255_255_/_0.55)_0%,rgb(255_255_255_/_0.08)_42%,rgb(226_232_240_/_0.5)_100%)] dark:bg-[radial-gradient(ellipse_88%_74%_at_50%_44%,rgb(255_255_255_/_0.08)_0%,transparent_40%,rgb(15_23_42_/_0.82)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.2] mix-blend-overlay dark:opacity-[0.16] dark:mix-blend-soft-light"
        aria-hidden
      >
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <filter
              id={`${grainFilterId}-grain`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.82"
                numOctaves="4"
                stitchTiles="stitch"
                result="turb"
              />
              <feColorMatrix
                type="saturate"
                values="0"
                in="turb"
                result="mono"
              />
            </filter>
          </defs>
          <rect
            width="100%"
            height="100%"
            filter={`url(#${grainFilterId}-grain)`}
            className="opacity-60"
          />
        </svg>
      </div>
    </>
  );
}

function journeyToVisualWaterPercent(journeyPct: number): number {
  const p = Math.min(100, Math.max(0, Math.round(journeyPct)));
  if (p <= 0) return 0;
  return Math.min(100, Math.max(VISUAL_WATER_MIN_PCT, p));
}

function BandHero({
  band,
  overallProgressPct,
  userName,
  currentCountry,
  dreamCountry,
  dreamCity,
  moduleLabel,
  improveSkillsHref,
}: {
  band: number | null;
  overallProgressPct: number;
  userName: string | null;
  currentCountry: string;
  dreamCountry: string;
  dreamCity: string | null;
  moduleLabel: string;
  improveSkillsHref: string;
}) {
  const bandLabel =
    band == null
      ? null
      : Number.isInteger(band)
        ? String(band)
        : band.toFixed(1);
  const headerLine = userName
    ? `${userName.toUpperCase()}, YOU ARE ON YOUR WAY`
    : "YOU ARE ON YOUR WAY";

  const fromPoint = resolveJourneyMapPoint(currentCountry, "from");
  const toPoint = resolveJourneyMapPoint(dreamCountry, "to");

  const targetFillPct =
    band == null ? 0 : journeyToVisualWaterPercent(overallProgressPct);

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

  const moduleLower = moduleLabel.toLowerCase();

  const dreamLine =
    dreamCity != null && dreamCity.length > 0
      ? `Your journey toward ${dreamCity}, ${dreamCountry}, is underway.`
      : `Your dream to study in ${dreamCountry} is within reach.`;

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-x-clip bg-background px-4 py-12 text-center sm:px-6 sm:py-16">
      <StudentBandJourneyFlightVisual
        currentCountryLabel={currentCountry}
        dreamCountryLabel={dreamCountry}
        from={fromPoint}
        to={toPoint}
        journeyProgressPct={overallProgressPct}
      />
      <BandHeroAtmosphere />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[18%] h-64 w-64 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl dark:bg-accent/15"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        <div className="inline-flex max-w-[min(100%,20rem)] items-center gap-2 rounded-full border border-accent/15 bg-card/80 px-3 py-1.5 shadow-sm ring-1 ring-accent/10 backdrop-blur-sm sm:max-w-none">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:tracking-[0.2em]">
            {headerLine}
          </span>
        </div>

        {bandLabel != null ? (
          <>
            <p className="mt-8 text-balance text-lg font-medium text-foreground sm:text-xl">
              Let&apos;s reach your goal of a
            </p>

            <div className="band-score-container relative my-6 flex min-h-[7.5rem] items-center justify-center sm:my-8">
              <div
                className="pointer-events-none absolute inset-0 rounded-full bg-accent/5 blur-2xl"
                aria-hidden
              />
              <span
                className="band-score-fill font-bold tabular-nums select-none text-[clamp(4.5rem,16vw,7.5rem)] leading-none tracking-tight"
                style={{ "--fill-pct": `${fillPct}%` } as React.CSSProperties}
                aria-hidden
              >
                {bandLabel}
              </span>
              <span
                className="band-score-outline font-bold tabular-nums select-none text-[clamp(4.5rem,16vw,7.5rem)] leading-none tracking-tight"
                aria-label={`Target band score ${bandLabel}, ${overallProgressPct}% complete`}
              >
                {bandLabel}
              </span>
            </div>

            <p className="text-balance text-lg font-semibold text-foreground sm:text-xl">
              in IELTS {moduleLabel}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                {currentCountry}
              </span>
              <span className="text-muted-foreground/50" aria-hidden>
                →
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm dark:text-emerald-200">
                <MapPin className="h-3.5 w-3.5" />
                {dreamCity ? `${dreamCity}, ${dreamCountry}` : dreamCountry}
              </span>
            </div>

            <p className="mt-6 max-w-lg text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
              {dreamLine}
            </p>

            <div className="mt-5 w-full max-w-md rounded-2xl border border-border/40 bg-card/70 px-4 py-3 shadow-sm ring-1 ring-accent/[0.06] backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  Journey progress
                </span>
                <span className="tabular-nums text-accent">{overallProgressPct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-accent/80 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, overallProgressPct))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground/90">
                Keep going — your Band {bandLabel} is closer than you think.
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="mt-8 text-balance text-base font-medium text-foreground sm:text-lg">
              Your personalized flight path is ready.
            </p>
            <p className="mt-4 max-w-md text-balance text-sm text-muted-foreground sm:text-base">
              {dreamLine} Set your reading target band to see your score goal
              fill in here, or head straight into practice.
            </p>
            <div className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 pb-6 sm:flex-row sm:justify-center">
              <Button size="lg" className="gap-2" asChild>
                <Link href={improveSkillsHref}>
                  <BookOpen className="h-4 w-4" />
                  Improve your {moduleLower} skills
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/onboarding">Set target band</Link>
              </Button>
            </div>
          </>
        )}

        {bandLabel != null ? (
          <div className="flex w-full justify-center pt-8 pb-4 sm:pt-10">
            <Link href={improveSkillsHref} className="w-full max-w-sm sm:w-auto">
              <Button
                size="lg"
                className="group h-12 w-full gap-2.5 bg-accent text-base font-semibold shadow-[0_4px_20px_-4px_rgba(30,58,138,0.45)] transition-all hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_8px_28px_-6px_rgba(30,58,138,0.5)] sm:px-8"
              >
                <BookOpen className="h-4 w-4 transition-transform group-hover:scale-110" />
                Improve your {moduleLower} skills
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
