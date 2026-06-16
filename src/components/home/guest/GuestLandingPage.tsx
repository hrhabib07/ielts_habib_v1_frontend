"use client";

import { cn } from "@/lib/utils";
import {
  GuestLandingLocaleProvider,
  useGuestLandingLocale,
} from "@/src/components/home/guest/GuestLandingLocale";
import { GuestLandingAmbient } from "@/src/components/home/guest/GuestLandingAmbient";
import { GuestLandingHero } from "@/src/components/home/guest/GuestLandingHero";
import { GuestHowGamlishWorks } from "@/src/components/home/guest/GuestHowGamlishWorks";

function GuestLandingSurface() {
  const { locale } = useGuestLandingLocale();

  return (
    <div
      className={cn(
        "relative isolate bg-background text-foreground",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <GuestLandingAmbient />
      </div>
      <div className="relative">
        <GuestLandingHero />
        <GuestHowGamlishWorks />
      </div>
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
