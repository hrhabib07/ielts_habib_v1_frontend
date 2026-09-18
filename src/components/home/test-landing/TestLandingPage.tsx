"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { GuestLandingLocaleProvider } from "@/src/components/home/guest/GuestLandingLocale";
import { TestLandingCamps } from "@/src/components/home/test-landing/TestLandingCamps";
import { TestLandingFaq } from "@/src/components/home/test-landing/TestLandingFaq";
import { TestLandingHero } from "@/src/components/home/test-landing/TestLandingHero";
import { TestLandingGraduates } from "@/src/components/home/test-landing/TestLandingGraduates";
import { TestLandingHowYouLearn } from "@/src/components/home/test-landing/TestLandingHowYouLearn";
import { TestLandingPlayingNow } from "@/src/components/home/test-landing/TestLandingPlayingNow";
import { TestLandingOffer } from "@/src/components/home/test-landing/TestLandingOffer";
import { TestLandingStickyCta } from "@/src/components/home/test-landing/TestLandingStickyCta";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { TEST_LANDING_PRIMARY_HREF } from "@/src/lib/test-landing-copy";

const GuestLandingAmbient = dynamic(
  () =>
    import("@/src/components/home/guest/GuestLandingAmbient").then(
      (m) => m.GuestLandingAmbient,
    ),
  { ssr: false },
);

const GuestLandingFooter = dynamic(
  () =>
    import("@/src/components/home/guest/GuestLandingFooter").then(
      (m) => m.GuestLandingFooter,
    ),
);

function TestLandingSurface() {
  const { copy, locale } = useTestLandingCopy();

  return (
    <div
      className={cn(
        "guest-landing-surface relative isolate overflow-x-hidden bg-background pb-24 text-foreground sm:pb-0",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <GuestLandingAmbient />
      </div>
      <div className="relative">
        <TestLandingHero />
        <TestLandingCamps />
        <TestLandingHowYouLearn />
        <TestLandingGraduates />
        <TestLandingPlayingNow />
        <TestLandingOffer />
        <TestLandingFaq />
        <GuestLandingFooter
          closing={{
            title: copy.footerCtaTitle,
            label: copy.offerCta,
            href: TEST_LANDING_PRIMARY_HREF,
          }}
        />
      </div>
      <TestLandingStickyCta />
    </div>
  );
}

export function TestLandingPage() {
  return (
    <GuestLandingLocaleProvider>
      <TestLandingSurface />
    </GuestLandingLocaleProvider>
  );
}
