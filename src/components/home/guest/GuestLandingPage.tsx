"use client";

import { cn } from "@/lib/utils";
import {
  GuestLandingLocaleProvider,
  useGuestLandingLocale,
} from "@/src/components/home/guest/GuestLandingLocale";
import { GuestLandingAmbient } from "@/src/components/home/guest/GuestLandingAmbient";
import { GuestLandingHero } from "@/src/components/home/guest/GuestLandingHero";
import { GuestComparisonSection } from "@/src/components/home/guest/GuestComparisonSection";
import { GuestPlayMoment } from "@/src/components/home/guest/GuestPlayMoment";
import { GuestHowGamlishWorks } from "@/src/components/home/guest/GuestHowGamlishWorks";
import { GuestStickyDemoCta } from "@/src/components/home/guest/GuestStickyDemoCta";

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
        <GuestPlayMoment />
        <GuestComparisonSection />
        <GuestHowGamlishWorks />
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
