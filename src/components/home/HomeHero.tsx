"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProfileSummary, getMyProfile } from "@/src/lib/api/profile";
import { ArrowRight, BookOpen } from "lucide-react";
import type { CurrentUser } from "@/src/lib/auth-server";

type HeroMode = "minimal" | "band" | "loading";

interface HomeHeroProps {
  children?: React.ReactNode;
  initialUser?: CurrentUser | null;
  roleCtaHref?: string | null;
  roleCtaLabel?: string | null;
}

export function HomeHero({ children, initialUser = null, roleCtaHref = null, roleCtaLabel = null }: HomeHeroProps) {
  const [mode, setMode] = useState<HeroMode>("loading");
  const [targetBand, setTargetBand] = useState<number | null>(null);
  const [currentEstimatedBand, setCurrentEstimatedBand] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProfileSummary()
      .then((res) => {
        if (cancelled) return;
        if (res?.targetBand != null) {
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
  }, []);

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

function MinimalHero({ roleCtaHref, roleCtaLabel, isAuthenticated }: MinimalHeroProps) {
  const showAuthCtas = !isAuthenticated || !roleCtaHref || !roleCtaLabel;

  return (
    <section className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl space-y-10">
        <div className="space-y-6">
          <h1 className="animate-hero-fade-in-up text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            IELTS HABIB
          </h1>
          <p className="animate-slogan-reveal text-xl font-medium tracking-[0.12em] text-muted-foreground uppercase md:text-2xl">
            Quietly Exceptional
          </p>
        </div>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          A focused IELTS preparation platform for students. Start with Reading.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row justify-center pt-4">
          {showAuthCtas ? (
            <>
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Get Started
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
            <Link href={roleCtaHref}>
              <Button size="lg" className="gap-2">
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

const FILL_MIN_PCT = 12; // never zero — little bit to motivate
const FILL_MAX_PCT = 88; // never full — room to grow

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

  // Fill % from progress: current/target, clamped between FILL_MIN and FILL_MAX
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
