"use client";

import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { brandSurfaces } from "@/src/lib/brand-theme";
import {
  formatAccessDate,
  isPreorderAwaitingAccess,
} from "@/src/lib/subscription-access";
import { PaidMissionUnlockFlow } from "@/src/components/player/PaidMissionUnlockFlow";
import { cn } from "@/lib/utils";

/**
 * Paywall when a student opens a paid mission without English access.
 * Uses the same multi-step unlock journey as post-Mission-01 new users.
 */
export function PlayerSubscriptionGate({
  missionTitle: _missionTitle,
}: {
  missionTitle?: string | null;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  const { locale } = useUiLocale();
  const { subscription } = useStudentSession();
  const awaitingAccess = isPreorderAwaitingAccess(subscription);

  if (!awaitingAccess) {
    return <PaidMissionUnlockFlow onLater={() => undefined} />;
  }

  const title =
    locale === "bn" ? "আপনার অ্যাক্সেস শীঘ্রই খুলবে" : "Your access opens soon";
  const body =
    locale === "bn"
      ? `পেমেন্ট ভেরিফাই হয়েছে। প্রিমিয়াম মিশন ${formatAccessDate(subscription!.startDate, "bn-BD")} থেকে খেলতে পারবেন। তার আগে Mission 01 ফ্রি খেলুন।`
      : `Your payment is verified. Premium missions unlock on ${formatAccessDate(subscription!.startDate)}. Until then, Mission 01 stays free.`;

  return (
    <div
      className={cn(
        "mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center",
        locale === "bn" && "font-bengali",
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-[1.75rem] border p-6 shadow-xl sm:p-8",
          brandSurfaces.pricingCard,
        )}
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent/15 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/30">
          <CalendarClock className="h-7 w-7" />
        </div>

        <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
          {locale === "bn" ? "অ্যাক্সেস নির্ধারিত" : "Access scheduled"}
        </p>
        <h1 className="relative mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>

        <div className="relative mt-6 flex flex-col gap-2.5">
          <Button
            asChild
            className={cn("h-12 rounded-full text-base font-semibold", brandSurfaces.ctaButton)}
          >
            <Link href="/pricing">
              <CalendarClock className="mr-2 h-4 w-4" />
              {locale === "bn" ? "স্ট্যাটাস দেখুন" : "View status"}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full text-muted-foreground">
            <Link href="/player">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {PLAYER_UI.backToMap}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
