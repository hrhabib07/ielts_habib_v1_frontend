"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { GuestLandingLocaleProvider } from "@/src/components/home/guest/GuestLandingLocale";
import { BanglaAnswerLinks } from "@/src/components/home/test-landing/BanglaAnswerLinks";
import { TestLandingHero } from "@/src/components/home/test-landing/TestLandingHero";
import { TestLandingStickyCta } from "@/src/components/home/test-landing/TestLandingStickyCta";
import { TestLandingCtas } from "@/src/components/home/test-landing/TestLandingCtas";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";

const GuestLandingAmbient = dynamic(
  () =>
    import("@/src/components/home/guest/GuestLandingAmbient").then(
      (m) => m.GuestLandingAmbient,
    ),
  { ssr: false },
);

const TestLandingGraduates = dynamic(() =>
  import("@/src/components/home/test-landing/TestLandingGraduates").then(
    (m) => m.TestLandingGraduates,
  ),
);

const TestLandingPlayingNow = dynamic(() =>
  import("@/src/components/home/test-landing/TestLandingPlayingNow").then(
    (m) => m.TestLandingPlayingNow,
  ),
);

const TestLandingFaq = dynamic(() =>
  import("@/src/components/home/test-landing/TestLandingFaq").then(
    (m) => m.TestLandingFaq,
  ),
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
        <TestLandingGraduates />
        <TestLandingPlayingNow />
        <TestLandingFaq />
        <GuestLandingFooter
          closing={{
            title: copy.footerCtaTitle,
            action: <TestLandingCtas copy={copy} size="block" source="footer" />,
          }}
        >
          <BanglaAnswerLinks />
        </GuestLandingFooter>
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
