"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ProfileSummary, StudentProfile } from "@/src/lib/api/types";
import { BookOpen, MapPin, Sparkles, TrendingUp } from "lucide-react";
import type { CurrentUser } from "@/src/lib/auth-server";
import {
  hasUsableClientToken,
  isActiveStudentSessionClient,
} from "@/src/lib/auth";
import { GuestLandingPage } from "@/src/components/home/guest/GuestLandingPage";
import { StudentEnglishHome } from "@/src/components/home/StudentEnglishHome";
import { ENABLE_READING } from "@/src/lib/platform-config";
import { BandScoreWaterDisplay } from "@/src/components/home/BandScoreWaterDisplay";
import {
  STUDENT_JOURNEY_HERO_MOCK,
  resolveJourneyMapPoint,
} from "@/src/components/home/studentJourneyHeroConfig";
import { getStudentDisplayName } from "@/src/lib/student-display-name";
import { countryCodeToLabel } from "@/src/lib/countryCodes";
import {
  journeyProgressBarStyle,
  resolveJourneyProgress,
  type ResolvedJourneyProgress,
} from "@/src/lib/journeyVisualProgress";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { EarlyAdopterCountdown } from "@/src/components/founding-member/EarlyAdopterCountdown";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";

const StudentBandJourneyFlightVisual = dynamic(
  () =>
    import("@/src/components/home/StudentBandJourneyFlightVisual").then(
      (m) => m.StudentBandJourneyFlightVisual,
    ),
  {
    loading: () => (
      <div
        className="absolute inset-0 animate-pulse rounded-2xl bg-muted/25"
        aria-hidden
      />
    ),
    ssr: false,
  },
);

type HeroMode = "minimal" | "student" | "loading";

interface StudentHeroData {
  band: number | null;
  journey: ResolvedJourneyProgress;
  userName: string | null;
  currentCountry: string;
  dreamCountry: string;
  isFoundingMember: boolean;
}

interface HomeHeroProps {
  children?: React.ReactNode;
  initialUser?: CurrentUser | null;
  roleCtaHref?: string | null;
  roleCtaLabel?: string | null;
}

function buildStudentHeroData(
  summary: ProfileSummary | null,
  profile: StudentProfile | null,
  isFoundingMember: boolean,
): StudentHeroData {
  const band =
    summary?.targetBand ??
    profile?.desiredBandScore ??
    profile?.targetBands?.reading ??
    null;
  const overallProgressPct = summary?.overallProgressPct ?? 0;
  const userName = getStudentDisplayName(profile);
  const cur =
    countryCodeToLabel(profile?.currentCountry) ??
    profile?.currentCountry?.trim() ??
    null;
  const dream =
    countryCodeToLabel(profile?.dreamCountry) ??
    profile?.dreamCountry?.trim() ??
    null;

  return {
    band,
    journey: resolveJourneyProgress({
      passedLevelCount: summary?.passedLevelCount,
      totalLevels: summary?.totalLevels,
      masteredLevelCount: summary?.masteredLevelCount,
      overallProgressPct,
    }),
    userName,
    currentCountry: cur || STUDENT_JOURNEY_HERO_MOCK.currentCountry,
    dreamCountry: dream || STUDENT_JOURNEY_HERO_MOCK.dreamCountry,
    isFoundingMember,
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

  // Hooks must run unconditionally (Rules of Hooks). Early-return after these.
  const {
    profileSummary,
    profile,
    isFoundingMember,
    loading: sessionLoading,
  } = useStudentSession();

  const serverStudent = initialUser?.role === "STUDENT";
  const clientStudentFallback =
    authBootstrapped &&
    initialUser == null &&
    isActiveStudentSessionClient();
  const isStudent = serverStudent || clientStudentFallback;

  const studentData = useMemo(() => {
    if (!isStudent) return null;
    if (sessionLoading && !profileSummary && !profile) return null;
    return buildStudentHeroData(profileSummary, profile, isFoundingMember);
  }, [
    isStudent,
    sessionLoading,
    profileSummary,
    profile,
    isFoundingMember,
  ]);

  if (!ENABLE_READING && isStudent) {
    return <StudentEnglishHome />;
  }

  const mode: HeroMode = !isStudent
    ? "minimal"
    : studentData
      ? "student"
      : sessionLoading
        ? "loading"
        : "minimal";

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
        journey={studentData.journey}
        userName={studentData.userName}
        currentCountry={studentData.currentCountry}
        dreamCountry={studentData.dreamCountry}
        isFoundingMember={studentData.isFoundingMember}
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

function JourneyCountryPills({
  currentCountry,
  dreamCountry,
}: {
  currentCountry: string;
  dreamCountry: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-3.5">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/95 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" aria-hidden />
        {currentCountry}
      </span>
      <span className="text-muted-foreground/35" aria-hidden>
        →
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm dark:text-emerald-200">
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {dreamCountry}
      </span>
    </div>
  );
}

function BandHero({
  band,
  journey,
  userName,
  currentCountry,
  dreamCountry,
  isFoundingMember,
  moduleLabel,
  improveSkillsHref,
}: {
  band: number | null;
  journey: ResolvedJourneyProgress;
  userName: string | null;
  currentCountry: string;
  dreamCountry: string;
  isFoundingMember: boolean;
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

  const moduleLower = moduleLabel.toLowerCase();

  const dreamLine = `Your dream to study in ${dreamCountry} is within reach.`;

  const flightVisualProps = {
    currentCountryLabel: currentCountry,
    dreamCountryLabel: dreamCountry,
    from: fromPoint,
    to: toPoint,
    journeyProgressPct: journey.actualPct,
  };

  const progressBarStyle = journeyProgressBarStyle(journey.actualPct);

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center bg-background px-4 py-10 text-center sm:px-6 sm:py-12">
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <div className="relative z-20 flex flex-col items-center gap-2">
          <div className="inline-flex max-w-[min(100%,20rem)] items-center gap-2 rounded-full border border-border/50 bg-card/90 px-3.5 py-1.5 shadow-sm sm:max-w-none">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:tracking-[0.2em]">
              {headerLine}
            </span>
          </div>
          {isFoundingMember ? (
            <FoundingMemberBadge size="md" />
          ) : (
            <EarlyAdopterCountdown className="max-w-md" />
          )}
        </div>

        {bandLabel != null ? (
          <>
            <div
              className="mx-auto mt-3 h-px w-28 bg-gradient-to-r from-transparent via-border to-transparent sm:mt-4 sm:w-36"
              aria-hidden
            />

            <div className="relative isolate mt-3 w-full max-w-3xl sm:mt-4">
              <div className="relative aspect-[2/1] w-full">
                <StudentBandJourneyFlightVisual
                  {...flightVisualProps}
                  layout="watermark"
                />

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-2">
                  <div className="flex w-full flex-col items-center gap-1 sm:gap-1.5">
                    <p className="text-balance text-lg font-medium leading-snug text-foreground sm:text-xl">
                      Let&apos;s reach your goal of a
                    </p>

                    {band != null ? (
                      <BandScoreWaterDisplay
                        band={band}
                        overallProgressPct={journey.actualPct}
                        className="py-0.5"
                      />
                    ) : null}

                    <p className="text-balance text-lg font-semibold leading-snug text-foreground sm:text-xl">
                      in IELTS {moduleLabel}
                    </p>
                  </div>

                  <JourneyCountryPills
                    currentCountry={currentCountry}
                    dreamCountry={dreamCountry}
                  />
                </div>
              </div>
            </div>

            <p className="mt-4 max-w-lg text-balance text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
              {dreamLine}
            </p>

            <div className="mt-4 w-full max-w-md rounded-2xl border border-border/50 bg-card px-4 py-3 shadow-sm sm:mt-5">
              <div className="mb-2.5 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  Journey progress
                </span>
                <span className="tabular-nums text-accent">{journey.label}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-accent/80 transition-all duration-1000 ease-out"
                  style={progressBarStyle}
                />
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground/90">
                {journey.masteredLevelCount > 0
                  ? `${journey.masteredLevelCount} of 21 levels passed`
                  : "Keep going"}
                {". "}
                your Band {bandLabel} is closer than you think.
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
          <div className="flex w-full justify-center pt-6 pb-2 sm:pt-7">
            <Link href={improveSkillsHref} className="w-full max-w-sm sm:w-auto">
              <Button
                size="lg"
                className="group h-12 w-full gap-2.5 bg-accent text-base font-semibold shadow-[0_4px_20px_-4px_rgba(30,58,138,0.45)] transition-all hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_8px_28px_-6px_rgba(30,58,138,0.5)] sm:px-10"
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
