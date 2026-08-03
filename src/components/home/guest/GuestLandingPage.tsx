"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import {
  GuestLandingLocaleProvider,
  useGuestLandingLocale,
} from "@/src/components/home/guest/GuestLandingLocale";
import { GuestLandingHero } from "@/src/components/home/guest/GuestLandingHero";
import { GuestJoinOfferSection } from "@/src/components/home/guest/GuestJoinOfferSection";
import { GuestProblemHook } from "@/src/components/home/guest/GuestProblemHook";
import { GuestTransformGrid } from "@/src/components/home/guest/GuestTransformGrid";
import { GuestCampsRoadmap } from "@/src/components/home/guest/GuestCampsRoadmap";
import { GuestGameEngine } from "@/src/components/home/guest/GuestGameEngine";
import { GuestCompareFounder } from "@/src/components/home/guest/GuestCompareFounder";
import { GuestLandingFaq } from "@/src/components/home/guest/GuestLandingFaq";

const GuestLandingAmbient = dynamic(
  () =>
    import("@/src/components/home/guest/GuestLandingAmbient").then(
      (m) => m.GuestLandingAmbient,
    ),
  { ssr: false },
);

const GuestFoundersWallSection = dynamic(
  () =>
    import("@/src/components/home/guest/GuestFoundersWallSection").then(
      (m) => m.GuestFoundersWallSection,
    ),
  {
    loading: () => <div className="min-h-[20rem]" aria-hidden />,
  },
);

const GuestLandingFooter = dynamic(
  () =>
    import("@/src/components/home/guest/GuestLandingFooter").then(
      (m) => m.GuestLandingFooter,
    ),
);

const GuestStickyDemoCta = dynamic(
  () =>
    import("@/src/components/home/guest/GuestStickyDemoCta").then(
      (m) => m.GuestStickyDemoCta,
    ),
  { ssr: false },
);

function GuestLandingSurface() {
  const { locale } = useGuestLandingLocale();

  return (
    <div
      className={cn(
        "guest-landing-surface relative isolate overflow-x-hidden bg-background text-foreground",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <GuestLandingAmbient />
      </div>
      <div className="relative">
        <GuestLandingHero />
        <GuestJoinOfferSection />
        <GuestProblemHook />
        <GuestTransformGrid />
        <GuestCampsRoadmap />
        <GuestGameEngine />
        <GuestCompareFounder />
        <div id="founding-members">
          <GuestFoundersWallSection />
        </div>
        <GuestLandingFaq />
        <GuestLandingFooter />
      </div>
      <GuestStickyDemoCta />
    </div>
  );
}

/** Marketing landing for signed-out visitors only. */
export function GuestLandingPage() {
  return (
    <GuestLandingLocaleProvider>
      <GuestLandingSurface />
    </GuestLandingLocaleProvider>
  );
}
