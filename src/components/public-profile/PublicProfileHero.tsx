"use client";

import { MapPin, Sparkles, TrendingUp } from "lucide-react";
import { StudentBandJourneyFlightVisual } from "@/src/components/home/StudentBandJourneyFlightVisual";
import { BandScoreWaterDisplay, formatBandLabel } from "@/src/components/home/BandScoreWaterDisplay";
import { resolveJourneyMapPoint, STUDENT_JOURNEY_HERO_MOCK } from "@/src/components/home/studentJourneyHeroConfig";
import type { PublicProfile } from "@/src/lib/api/types";
import {
  journeyProgressBarStyle,
  resolveJourneyProgress,
} from "@/src/lib/journeyVisualProgress";
import { PublicProfileSocialBar } from "./PublicProfileSocialBar";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";

interface PublicProfileHeroProps {
  profile: PublicProfile;
  isLoggedIn: boolean;
  onLike: () => Promise<void>;
  onFollow: () => Promise<void>;
  socialBusy?: boolean;
}

export function PublicProfileHero({
  profile,
  isLoggedIn,
  onLike,
  onFollow,
  socialBusy,
}: PublicProfileHeroProps) {
  const targetBand =
    profile.progress?.targetBand ?? profile.desiredBandScore ?? null;
  const journey = resolveJourneyProgress({
    passedLevelCount: profile.progress?.masteredLevelCount,
    overallProgressPct: profile.progress?.overallProgressPct,
    masteredLevelCount: profile.progress?.masteredLevelCount,
  });
  const progressBarStyle = journeyProgressBarStyle(journey.actualPct);
  const fromPoint = resolveJourneyMapPoint(profile.currentCountryLabel, "from");
  const toPoint = resolveJourneyMapPoint(profile.dreamCountryLabel, "to");
  const moduleLabel = STUDENT_JOURNEY_HERO_MOCK.moduleLabel;
  const dreamLine = `Their dream to study in ${profile.dreamCountryLabel} is within reach.`;
  const bandLabel = targetBand != null ? formatBandLabel(targetBand) : null;

  const flightVisualProps = {
    currentCountryLabel: profile.currentCountryLabel,
    dreamCountryLabel: profile.dreamCountryLabel,
    from: fromPoint,
    to: toPoint,
    journeyProgressPct: journey.actualPct,
  };

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center bg-background px-4 py-10 text-center sm:px-6 sm:py-12">
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <div className="relative z-20 flex flex-col items-center gap-2">
          <div className="inline-flex max-w-[min(100%,20rem)] items-center gap-2 rounded-full border border-border/50 bg-card/90 px-3.5 py-1.5 shadow-sm sm:max-w-none">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:tracking-[0.2em]">
              Gamlish profile · @{profile.username}
            </span>
          </div>
          {profile.isFoundingMember ? <FoundingMemberBadge size="md" /> : null}
        </div>

        {targetBand != null && bandLabel != null ? (
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
                    <h1 className="max-w-xl text-balance text-lg font-medium leading-snug text-foreground sm:text-xl">
                      We believe{" "}
                      <span className="font-semibold text-accent">{profile.displayName}</span> can
                      achieve their IELTS goal of Band
                    </h1>

                    <BandScoreWaterDisplay
                      band={targetBand}
                      overallProgressPct={journey.actualPct}
                      ariaLabelPrefix={`${profile.displayName} target band score`}
                      className="py-0.5"
                    />

                    <p className="text-balance text-lg font-semibold leading-snug text-foreground sm:text-xl">
                      in IELTS {moduleLabel}.
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/95 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" aria-hidden />
                      {profile.currentCountryLabel}
                    </span>
                    <span className="text-muted-foreground/35" aria-hidden>
                      →
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm dark:text-emerald-200">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {profile.dreamCountryLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 max-w-lg text-balance text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
              {dreamLine}
            </p>

            <div className="mt-4 w-full">
              <PublicProfileSocialBar
                username={profile.username}
                social={profile.social}
                isLoggedIn={isLoggedIn}
                onLike={onLike}
                onFollow={onFollow}
                busy={socialBusy}
              />
            </div>

            {profile.progress ? (
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
                  Keep going. Band {bandLabel} is closer than you think.
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <h1 className="mt-8 max-w-2xl text-balance text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl">
              We believe{" "}
              <span className="text-accent">{profile.displayName}</span> can achieve their
              IELTS goal.
            </h1>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                {profile.currentCountryLabel}
              </span>
              <span className="text-muted-foreground/50" aria-hidden>
                →
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm dark:text-emerald-200">
                <MapPin className="h-3.5 w-3.5" />
                {profile.dreamCountryLabel}
              </span>
            </div>

            <div className="mt-8 w-full">
              <PublicProfileSocialBar
                username={profile.username}
                social={profile.social}
                isLoggedIn={isLoggedIn}
                onLike={onLike}
                onFollow={onFollow}
                busy={socialBusy}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
