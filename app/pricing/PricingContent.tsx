"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Smartphone } from "lucide-react";
import type { CurrentUser } from "@/src/lib/auth-server";
import { getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { FounderLaunchPricingCard } from "@/src/components/pricing/FounderLaunchPricingCard";
import {
  hasBlockingPaymentStatus,
  PaymentApplicationStatusCard,
} from "@/src/components/pricing/PaymentApplicationStatusCard";
import { PricingFaqSection } from "@/src/components/pricing/PricingFaqSection";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { useFounderLaunchCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { Button } from "@/components/ui/button";
import { brandStatus } from "@/src/lib/brand-theme";
import { formatBdt } from "@/src/lib/api/pricing";
import { cn } from "@/lib/utils";

export function PricingContent({
  initialUser,
  initialPricing = null,
}: {
  initialUser: CurrentUser | null;
  initialPricing?: PublicPricing | null;
}) {
  const router = useRouter();
  const [pricing, setPricing] = useState<PublicPricing | null>(initialPricing);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingLoading, setPricingLoading] = useState(!initialPricing);
  const copy = useFounderLaunchCopy();
  const { locale } = useUiLocale();

  const isLoggedIn = Boolean(initialUser);
  const { isFoundingMember } = useStudentSession();
  const payment = usePaymentApplicationStatus(isLoggedIn);
  const hasActiveAccess = payment.hasActiveAccess;
  const hasPurchased = payment.hasPurchased;
  const blocked = hasBlockingPaymentStatus(payment.activeSubscription, payment.latestRequest);
  const showPayCta = !hasPurchased && !blocked;

  const loadPricing = useCallback(async (silent = false) => {
    if (!silent) {
      setPricingLoading(true);
      setPricingError(null);
    }
    try {
      const data = await getPublicPricing();
      setPricing(data);
      setPricingError(null);
    } catch {
      if (!silent) {
        setPricingError(
          locale === "bn"
            ? "মূল্য লোড করা যায়নি। ব্যাকএন্ড চালু আছে কিনা দেখুন (localhost:5000), তারপর আবার চেষ্টা করুন।"
            : "Could not load pricing. Check the backend is running, then try again.",
        );
      }
    } finally {
      if (!silent) setPricingLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (initialPricing) {
      void loadPricing(true);
      return;
    }
    void loadPricing(false);
  }, [initialPricing, loadPricing]);

  /** Legacy links: /pricing?checkout=1|founder → /checkout */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "1" || checkout === "founder") {
      router.replace("/checkout");
    }
    // Clean legacy /pricing#pay-now bookmarks to plain /pricing
    if (window.location.hash === "#pay-now") {
      router.replace("/pricing");
    }
  }, [router]);

  const handleUpgrade = () => {
    if (!isLoggedIn) {
      window.location.href = `/login?redirect=${encodeURIComponent("/checkout")}`;
      return;
    }
    if (blocked || hasPurchased) return;
    router.push("/checkout");
  };

  if (pricingLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (pricingError || !pricing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center font-bengali">
        <p className="text-destructive">{pricingError ?? (locale === "bn" ? "মূল্য পাওয়া যায়নি" : "Pricing unavailable")}</p>
        <Button className="mt-4 rounded-xl" onClick={() => void loadPricing(false)}>
          {locale === "bn" ? "আবার চেষ্টা করুন" : "Try again"}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto max-w-3xl space-y-6 px-4 py-6 md:space-y-8 md:py-10",
        locale === "bn" && "font-bengali",
        showPayCta && "pb-28",
      )}
      lang={locale}
    >
      {isFoundingMember ? (
        <div className="flex justify-center">
          <FoundingMemberBadge />
        </div>
      ) : null}

      {isLoggedIn ? (
        <PaymentApplicationStatusCard
          activeSubscription={payment.activeSubscription}
          latestRequest={payment.latestRequest}
          onApplyAgain={() => router.push("/checkout")}
        />
      ) : null}

      {!hasPurchased && !blocked ? (
        <FounderLaunchPricingCard
          pricing={pricing}
          onUpgrade={handleUpgrade}
          disabled={blocked}
        />
      ) : hasActiveAccess ? (
        <div className={cn("rounded-3xl border p-8 text-center", brandStatus.success.card)}>
          <h2 className="text-xl font-bold text-foreground">
            {locale === "bn" ? "আপনার প্রিমিয়াম অ্যাক্সেস সক্রিয়" : "Your premium access is active"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "bn"
              ? "সব ক্যাম্প ও মিশন উপভোগ করতে প্লেয়ারে ফিরে যান।"
              : "Head back to the player to enjoy every camp and mission."}
          </p>
          <Button asChild className="mt-4 rounded-xl">
            <Link href="/player">
              {locale === "bn" ? "খেলা চালিয়ে যান" : "Continue playing"}
            </Link>
          </Button>
        </div>
      ) : null}

      <PricingFaqSection />

      {showPayCta ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-500/30 bg-background/95 px-4 py-3 shadow-[0_-12px_40px_rgba(15,23,42,0.15)] backdrop-blur-xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="num truncate text-sm font-black text-foreground">
                {formatBdt(pricing.finalPriceBdt)}
              </p>
              <p className="truncate text-xs font-medium text-muted-foreground">
                {copy.stickyPriceHint}
              </p>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={handleUpgrade}
              className="h-12 shrink-0 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 text-base font-black text-amber-950 shadow-md shadow-amber-500/25 hover:from-amber-300 hover:to-amber-400 sm:min-w-[12rem]"
            >
              <Smartphone className="mr-2 h-4 w-4" aria-hidden />
              {copy.upgradeShort}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
