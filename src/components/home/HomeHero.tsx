"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProfileSummary, getMyProfile } from "@/src/lib/api/profile";
import { ArrowRight, BookOpen } from "lucide-react";
import type { CurrentUser } from "@/src/lib/auth-server";
import { GamlishLogo } from "@/src/components/shared/GamlishLogo";
import { BRAND } from "@/src/lib/constants";

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
  const [mode, setMode] = useState<HeroMode>("loading");
  const [targetBand, setTargetBand] = useState<number | null>(null);
  const [currentEstimatedBand, setCurrentEstimatedBand] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const isStudent = initialUser?.role === "STUDENT";
    getProfileSummary()
      .then((res) => {
        if (cancelled) return;
        if (isStudent && res?.targetBand != null) {
          setMode("band");
          setTargetBand(res.targetBand);
          setCurrentEstimatedBand(res.currentEstimatedBand ?? null);
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
  }, [initialUser?.role]);

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
        currentEstimatedBand={currentEstimatedBand}
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

function MinimalHero({
  roleCtaHref,
  roleCtaLabel,
  isAuthenticated,
}: MinimalHeroProps) {
  const showAuthCtas = !isAuthenticated || !roleCtaHref || !roleCtaLabel;

  return (
    <section className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      {/* Premium gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:to-primary/10"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-3xl space-y-10">
        <div className="flex justify-center">
          <GamlishLogo showWordmark={false} variant="hero" />
        </div>
        <div className="space-y-6">
          <h1 className="animate-hero-fade-in-up text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {BRAND.tagline}
          </h1>
          <p className="animate-slogan-reveal mx-auto max-w-xl text-base font-medium tracking-wide text-muted-foreground md:text-lg">
            {BRAND.subheadline}
          </p>
        </div>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {BRAND.heroSubtext}
        </p>
        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:justify-center">
          {showAuthCtas ? (
            <>
              <Link href="/register">
                <Button size="lg" className="gap-2 shadow-lg">
                  {BRAND.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Login
                </Button>
              </Link>
            </>
          ) : (
            <Link href={roleCtaHref ?? "#"}>
              <Button size="lg" className="gap-2 shadow-lg">
                {roleCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

const FILL_MIN_PCT = 12;
const FILL_MAX_PCT = 88;

function BandHero({
  band,
  currentEstimatedBand,
  userName,
}: {
  band: number;
  currentEstimatedBand: number | null;
  userName: string | null;
}) {
  const bandLabel = Number.isInteger(band) ? String(band) : band.toFixed(1);
  const topLine = userName ? `${userName} can achieve` : "You can achieve";

  const targetFillPct = (() => {
    if (currentEstimatedBand == null || currentEstimatedBand <= 0) return FILL_MIN_PCT;
    const ratio = Math.min(1, currentEstimatedBand / band);
    return Math.round(FILL_MIN_PCT + ratio * (FILL_MAX_PCT - FILL_MIN_PCT));
  })();

  const [fillPct, setFillPct] = useState(FILL_MIN_PCT);

  useEffect(() => {
    if (targetFillPct <= FILL_MIN_PCT) return;
    const duration = 2200;
    const start = performance.now();
    const startPct = FILL_MIN_PCT;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - t) * (1 - t);
      const pct = Math.round(startPct + eased * (targetFillPct - startPct));
      setFillPct(pct);
      if (t < 1) requestAnimationFrame(tick);
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
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
            aria-label={`Target band score ${bandLabel}, progress ${fillPct}%`}
          >
            {bandLabel}
          </span>
        </div>

        <p className="text-muted-foreground">in Reading module</p>
        <p className="mt-2 text-sm text-muted-foreground">
          You're {fillPct}% of the way to your target.
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
