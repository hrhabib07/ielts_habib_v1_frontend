"use client";

import { useState } from "react";
import Link from "next/link";
import { MissionZeroSaveProgress } from "@/src/components/demo/MissionZeroSaveProgress";
import { Button } from "@/components/ui/button";
import { MISSION_ZERO_COPY } from "@/src/lib/mission-zero-copy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

const SIX_HOURS = 6 * 60 * 60 * 1000;

/**
 * Isolated QA preview of the final demo save card WITH an active countdown.
 * Does not affect live /demo for expired visitors.
 */
export default function DemoSavePreviewPage() {
  const { locale } = useUiLocale();
  const copy = MISSION_ZERO_COPY[locale];
  const [layout, setLayout] = useState<"default" | "a">("a");

  return (
    <main className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#e0f2fe_0%,transparent_50%),hsl(var(--background))] px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-4">
        <header className="space-y-2 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
            Test only · forced active countdown
          </p>
          <h1
            className={cn(
              "text-xl font-black tracking-tight text-foreground",
              locale === "bn" && "font-bengali",
            )}
          >
            {locale === "bn"
              ? "ফাইনাল সেভ স্ক্রিন প্রিভিউ"
              : "Final save screen preview"}
          </h1>
          <p className="text-xs font-medium text-muted-foreground">
            Live `/demo` still hides the timer if your real offer expired. This
            page always shows an active countdown for QA.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant={layout === "default" ? "default" : "outline"}
              onClick={() => setLayout("default")}
            >
              Live layout (phone-first)
            </Button>
            <Button
              type="button"
              size="sm"
              variant={layout === "a" ? "default" : "outline"}
              onClick={() => setLayout("a")}
            >
              Layout A (Google-first)
            </Button>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/demo">Back to live demo</Link>
          </Button>
        </header>

        <div className="rounded-3xl border border-border/70 bg-card/95 p-3 shadow-lg sm:p-4">
          <MissionZeroSaveProgress
            copy={copy}
            totalXp={50}
            sessionId="preview-save-countdown"
            saveLayout={layout}
            forceActiveOfferCountdownMs={SIX_HOURS}
            onGoogleNavigate={() => undefined}
            onEmailNavigate={() => undefined}
          />
        </div>

        <p className="text-center text-[11px] font-semibold text-muted-foreground">
          Tip · tap &quot;আমার XP সেভ করো&quot; with a real number to also preview
          the OTP wait theater. Use a test phone if needed.
        </p>
      </div>
    </main>
  );
}
