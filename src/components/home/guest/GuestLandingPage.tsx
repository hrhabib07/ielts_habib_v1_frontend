"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import {
  GuestLandingLocaleProvider,
  useGuestLandingLocale,
} from "@/src/components/home/guest/GuestLandingLocale";
import { GuestLandingHero } from "@/src/components/home/guest/GuestLandingHero";

const GuestLandingAmbient = dynamic(
  () =>
    import("@/src/components/home/guest/GuestLandingAmbient").then(
      (m) => m.GuestLandingAmbient,
    ),
  { ssr: false },
);

const GuestPlayMoment = dynamic(
  () =>
    import("@/src/components/home/guest/GuestPlayMoment").then(
      (m) => m.GuestPlayMoment,
    ),
  {
    loading: () => <div className="min-h-[28rem]" aria-hidden />,
  },
);

const GuestComparisonSection = dynamic(
  () =>
    import("@/src/components/home/guest/GuestComparisonSection").then(
      (m) => m.GuestComparisonSection,
    ),
  {
    loading: () => <div className="min-h-[24rem]" aria-hidden />,
  },
);

const GuestHowGamlishWorks = dynamic(
  () =>
    import("@/src/components/home/guest/GuestHowGamlishWorks").then(
      (m) => m.GuestHowGamlishWorks,
    ),
  {
    loading: () => <div className="min-h-[32rem]" aria-hidden />,
  },
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
        <GuestFoundersWallSection />
        <GuestPlayMoment />
        <GuestComparisonSection />
        <GuestHowGamlishWorks />
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
