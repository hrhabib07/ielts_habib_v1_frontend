"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getProfileSummary, getMyProfile } from "@/src/lib/api/profile";
import { BookOpen } from "lucide-react";
import type { CurrentUser } from "@/src/lib/auth-server";
import { HeroAnimation } from "@/src/components/home/HeroAnimation";
import { StudentBandJourneyFlightVisual } from "@/src/components/home/StudentBandJourneyFlightVisual";
import {
  STUDENT_JOURNEY_HERO_MOCK,
  resolveJourneyMapPoint,
} from "@/src/components/home/studentJourneyHeroConfig";

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
  const [profileCurrentCountry, setProfileCurrentCountry] = useState<
    string | null
  >(null);
  const [profileDreamCountry, setProfileDreamCountry] = useState<string | null>(
    null,
  );

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
            if (cancelled || !p) return;
            if (p.name) setUserName(p.name);
            const cur = p.profile?.currentCountry ?? null;
            const dream = p.profile?.dreamCountry ?? null;
            setProfileCurrentCountry(cur);
            setProfileDreamCountry(dream);
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
      <section className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-6 text-center font-bengali">
        <div className="h-24 w-48 animate-pulse rounded-lg bg-muted" />
        <p className="mt-4 text-sm text-muted-foreground">লোড হচ্ছে…</p>
      </section>
    );
  }

  if (mode === "band" && targetBand != null) {
    return (
      <BandHero
        band={targetBand}
        overallProgressPct={overallProgressPct}
        userName={userName}
        currentCountry={
          profileCurrentCountry?.trim() ||
          STUDENT_JOURNEY_HERO_MOCK.currentCountry
        }
        dreamCountry={
          profileDreamCountry?.trim() || STUDENT_JOURNEY_HERO_MOCK.dreamCountry
        }
        moduleLabel={STUDENT_JOURNEY_HERO_MOCK.moduleLabel}
        improveSkillsHref={STUDENT_JOURNEY_HERO_MOCK.profileHref}
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

const HERO_EYEBROW =
  "আসসালামু আলাইকুম আপনাকে, এবং আপনার IELTS Reading-এর ভয়কে!";
/** Main headline — comma break for two visual lines (no em dash) */
const HERO_TITLE_LINE1 = "আপনাকে সালাম Gamlish-এ স্বাগতম জানাতে,";
const HERO_TITLE_LINE2 = "আর আপনার ভয়কে সালাম চিরতরে বিদায় দিতে।";
const HERO_SUBTITLE =
  "Gamlish-এর গ্যামিফাইড সলিউশন আপনার রিডিংয়ের এই ভীতিকে নিখুঁত আত্মবিশ্বাসে রূপান্তর করবে। ভয় কাটিয়ে আপনার কাঙ্ক্ষিত ব্যান্ড স্কোর (Desired Band Score) অর্জন এখন হবে একদম স্মুথ।";
/** First CTA leads with confidence; second explains the product */
const CTA_PRIMARY = "আত্মবিশ্বাসে শুরু করুন";
const CTA_SECONDARY = "কীভাবে কাজ করে";

const EASE_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];

function heroTextVariants(reduceMotion: boolean | null) {
  const blur = reduceMotion ? 0 : 8;
  return {
    hidden: { opacity: 0, y: reduceMotion ? 6 : 16, filter: `blur(${blur}px)` },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: reduceMotion ? 0.2 : 0.58,
        ease: EASE_PREMIUM,
      },
    },
  };
}

function MinimalHero({
  roleCtaHref,
  roleCtaLabel,
  isAuthenticated,
}: MinimalHeroProps) {
  const reduceMotion = useReducedMotion();
  const showGuestCtas = !isAuthenticated;
  const showRoleCta = isAuthenticated && roleCtaHref && roleCtaLabel;
  const lineVariant = heroTextVariants(reduceMotion);

  return (
    <section
      lang="bn"
      className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center overflow-x-clip overflow-y-auto px-4 pb-6 pt-8 text-center sm:px-6 sm:pb-5 sm:pt-10 md:min-h-0 md:flex-1 md:overflow-y-hidden md:pb-5 md:pt-12 lg:pt-14"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.07] via-transparent to-muted/25 dark:from-primary/12 dark:via-transparent dark:to-muted/15"
        aria-hidden
      />
      <div className="relative z-10 flex w-full max-w-5xl min-h-0 flex-1 flex-col items-center justify-center gap-4 font-bengali sm:gap-5 md:max-h-full md:justify-center md:gap-5 lg:gap-6">
        {showGuestCtas ? (
          <>
            <div className="flex w-full min-h-0 min-w-0 shrink justify-center px-0 pt-1 sm:px-2 sm:pt-2 md:max-h-none md:items-center md:pt-2">
              <HeroAnimation />
            </div>
            <motion.div
              className="mx-auto mt-1 flex w-full max-w-3xl flex-col space-y-3 px-1 sm:space-y-3.5 sm:px-0 md:mt-2 md:min-h-0 md:shrink md:space-y-3"
              initial="hidden"
              animate="show"
              variants={{
                show: {
                  transition: {
                    staggerChildren: reduceMotion ? 0.06 : 0.14,
                    delayChildren: reduceMotion ? 0 : 0.08,
                  },
                },
              }}
            >
              <motion.p
                variants={lineVariant}
                className="text-balance text-xs font-semibold leading-relaxed sm:text-sm md:text-[0.8125rem]"
              >
                <span className="inline-block bg-gradient-to-r from-primary via-primary/95 to-primary/75 bg-clip-text text-transparent dark:from-sky-200/95 dark:via-primary/90 dark:to-sky-300/80">
                  {HERO_EYEBROW}
                </span>
              </motion.p>
              <motion.h1
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: reduceMotion ? 0.07 : 0.13,
                      delayChildren: 0,
                    },
                  },
                }}
                className="m-0 flex w-full flex-col items-center text-[clamp(1.05rem,2.05vw,1.6rem)] font-bold leading-[1.38] tracking-tight sm:text-[clamp(1.1rem,2.15vw,1.75rem)] lg:text-[clamp(1.2rem,2.25vw,1.9rem)]"
              >
                <motion.span
                  variants={lineVariant}
                  className="block max-w-full whitespace-normal bg-gradient-to-br from-foreground via-foreground to-foreground/75 bg-clip-text text-transparent drop-shadow-[0_1px_24px_rgba(15,23,42,0.06)] dark:from-slate-50 dark:via-slate-100 dark:to-slate-300/90 dark:drop-shadow-[0_1px_28px_rgba(248,250,252,0.07)]"
                >
                  {HERO_TITLE_LINE1}
                </motion.span>
                <motion.span
                  variants={lineVariant}
                  className="mt-1.5 block max-w-full whitespace-normal bg-gradient-to-r from-primary via-primary/92 to-slate-700 bg-clip-text text-transparent dark:from-sky-200/95 dark:via-primary/88 dark:to-slate-300/85"
                >
                  {HERO_TITLE_LINE2}
                </motion.span>
              </motion.h1>
              <motion.p
                variants={lineVariant}
                className="text-balance border-t border-border/60 pt-3 text-sm font-medium leading-relaxed text-muted-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:text-[0.95rem] md:border-border/50 md:pt-3.5 md:text-[0.8125rem] md:leading-[1.65] lg:text-sm"
              >
                {HERO_SUBTITLE}
              </motion.p>
            </motion.div>
            <motion.div
              className="mt-3 flex w-full max-w-2xl flex-col items-stretch gap-2.5 px-1 sm:mt-4 sm:flex-row sm:justify-center sm:gap-3 sm:px-0 md:mt-4 md:shrink-0"
              initial={{ opacity: 0, y: reduceMotion ? 4 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: reduceMotion ? 0.15 : 0.55,
                duration: reduceMotion ? 0.2 : 0.45,
                ease: EASE_PREMIUM,
              }}
            >
              <Button
                size="lg"
                className="h-11 w-full text-base font-semibold shadow-md transition-shadow hover:shadow-lg sm:h-10 sm:w-auto sm:px-6 md:h-10 md:text-sm"
                asChild
              >
                <Link href="/register">{CTA_PRIMARY}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 w-full border-border/80 bg-background/60 text-base font-semibold backdrop-blur-sm sm:h-10 sm:w-auto sm:px-6 md:h-10 md:text-sm"
                asChild
              >
                <Link href="/how-it-works">{CTA_SECONDARY}</Link>
              </Button>
            </motion.div>
          </>
        ) : showRoleCta ? (
          <div className="flex flex-col items-center gap-6 py-8">
            <Button size="lg" className="shadow-lg" asChild>
              <Link href={roleCtaHref ?? "#"}>{roleCtaLabel}</Link>
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
  moduleLabel,
  improveSkillsHref,
}: {
  band: number;
  overallProgressPct: number;
  userName: string | null;
  currentCountry: string;
  dreamCountry: string;
  moduleLabel: string;
  improveSkillsHref: string;
}) {
  const bandLabel = Number.isInteger(band) ? String(band) : band.toFixed(1);
  const headerLine = userName
    ? `${userName.toUpperCase()}, YOU ARE ON YOUR WAY`
    : "YOU ARE ON YOUR WAY";

  const fromPoint = resolveJourneyMapPoint(currentCountry, "from");
  const toPoint = resolveJourneyMapPoint(dreamCountry, "to");

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

  const moduleLower = moduleLabel.toLowerCase();

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden bg-background px-6 pt-8 text-center">
      <StudentBandJourneyFlightVisual
        currentCountryLabel={currentCountry}
        dreamCountryLabel={dreamCountry}
        from={fromPoint}
        to={toPoint}
        journeyProgressPct={overallProgressPct}
      />
      <BandHeroAtmosphere />

      <div className="relative z-10 flex max-w-xl flex-col items-center">
        <p className="mt-8 max-w-md text-xs font-semibold uppercase leading-relaxed tracking-widest text-muted-foreground sm:text-sm">
          {headerLine}
        </p>

        <p className="mt-8 text-balance text-base font-medium text-foreground sm:text-lg">
          Let&apos;s reach your goal of a
        </p>

        <div className="band-score-container my-6 flex min-h-[7rem] items-center justify-center sm:my-8">
          <span
            className="band-score-fill font-bold tabular-nums select-none text-8xl tracking-tight md:text-9xl"
            style={{ "--fill-pct": `${fillPct}%` } as React.CSSProperties}
            aria-hidden
          >
            {bandLabel}
          </span>
          <span
            className="band-score-outline font-bold tabular-nums select-none text-8xl tracking-tight md:text-9xl"
            aria-label={`Target band score ${bandLabel}, ${overallProgressPct}% complete`}
          >
            {bandLabel}
          </span>
        </div>

        <p className="text-balance text-base font-medium text-foreground sm:text-lg">
          in IELTS {moduleLabel}.
        </p>

        <p className="mt-5 max-w-md text-balance text-sm font-medium text-muted-foreground sm:text-base">
          Your dream to study in {dreamCountry} is within reach.
        </p>

        <p className="mt-3 max-w-md text-balance text-xs text-muted-foreground/90 sm:text-sm">
          {overallProgressPct}% complete. Keep going. Your Band {bandLabel} is closer than you
          think.
        </p>

        <div className="flex w-full justify-center pt-10 pb-6">
          <Link href={improveSkillsHref}>
            <Button size="lg" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Improve your {moduleLower} skills
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
