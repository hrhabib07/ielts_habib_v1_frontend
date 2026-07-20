"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Smartphone } from "lucide-react";
import type { CurrentUser } from "@/src/lib/auth-server";
import { getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { FounderLaunchPricingCard } from "@/src/components/pricing/FounderLaunchPricingCard";
import { FounderBenefitsShowcase } from "@/src/components/pricing/FounderBenefitsShowcase";
import { BkashCheckoutForm } from "@/src/components/pricing/BkashCheckoutForm";
import {
  hasBlockingPaymentStatus,
  PaymentApplicationStatusCard,
} from "@/src/components/pricing/PaymentApplicationStatusCard";
import { PricingFaqSection } from "@/src/components/pricing/PricingFaqSection";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { useFounderLaunchCopy } from "@/src/hooks/useLocalizedCopy";
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
  const [pricing, setPricing] = useState<PublicPricing | null>(initialPricing);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingLoading, setPricingLoading] = useState(!initialPricing);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const copy = useFounderLaunchCopy();

  const isLoggedIn = Boolean(initialUser);
  const { isFoundingMember } = useStudentSession();
  const payment = usePaymentApplicationStatus(isLoggedIn);
  const hasActiveAccess = payment.hasActiveAccess;
  const hasPurchased = payment.hasPurchased;
  const blocked = hasBlockingPaymentStatus(payment.activeSubscription, payment.latestRequest);
  const showPayCta = !hasPurchased && !blocked && !checkoutOpen;

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
      // Keep any existing pricing on soft refresh; only hard-fail when empty.
      if (!silent) {
        setPricingError(
          "মূল্য লোড করা যায়নি। ব্যাকএন্ড চালু আছে কিনা দেখুন (localhost:5000), তারপর আবার চেষ্টা করুন।",
        );
      }
    } finally {
      if (!silent) setPricingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialPricing) {
      void loadPricing(true);
      return;
    }
    void loadPricing(false);
  }, [initialPricing, loadPricing]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "1" && isLoggedIn && !blocked && !hasPurchased) {
      setCheckoutOpen(true);
      requestAnimationFrame(() => {
        document
          .getElementById("bkash-checkout")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [isLoggedIn, blocked, hasPurchased]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#pay-now") {
      requestAnimationFrame(() => {
        document.getElementById("pay-now")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [pricingLoading, checkoutOpen]);

  const handleUpgrade = () => {
    if (!isLoggedIn) {
      window.location.href = `/login?redirect=${encodeURIComponent("/pricing?checkout=1")}`;
      return;
    }
    if (blocked || hasPurchased) return;
    setCheckoutOpen(true);
    requestAnimationFrame(() => {
      document.getElementById("bkash-checkout")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
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
        <p className="text-destructive">{pricingError ?? "মূল্য পাওয়া যায়নি"}</p>
        <Button className="mt-4 rounded-xl" onClick={() => void loadPricing(false)}>
          আবার চেষ্টা করুন
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto max-w-3xl space-y-8 px-4 py-8 font-bengali md:py-12",
        showPayCta && "pb-28",
      )}
    >
      <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-400/10 px-4 py-4 text-center dark:border-amber-400/35">
        <p className="text-base font-black text-amber-950 dark:text-amber-100">
          পেমেন্ট এখানেই — নিচের বড় বোতামে ট্যাপ করুন
        </p>
        <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">
          Payment is here — tap the big button below
        </p>
      </div>

      {isFoundingMember ? (
        <div className="flex justify-center">
          <FoundingMemberBadge />
        </div>
      ) : null}

      {isLoggedIn ? (
        <PaymentApplicationStatusCard
          activeSubscription={payment.activeSubscription}
          latestRequest={payment.latestRequest}
          onApplyAgain={() => setCheckoutOpen(true)}
        />
      ) : null}

      {checkoutOpen && isLoggedIn && !hasPurchased && !blocked ? (
        <>
          <div id="bkash-checkout" className="scroll-mt-24">
            <BkashCheckoutForm
              pricing={pricing}
              onClose={() => setCheckoutOpen(false)}
              onSubmitted={() => payment.refresh()}
            />
          </div>
          <FounderBenefitsShowcase />
        </>
      ) : !hasPurchased && !blocked ? (
        <>
          <FounderLaunchPricingCard
            pricing={pricing}
            onUpgrade={handleUpgrade}
            disabled={blocked}
          />
          <FounderBenefitsShowcase />
        </>
      ) : hasActiveAccess ? (
        <div className={cn("rounded-3xl border p-8 text-center", brandStatus.success.card)}>
          <h2 className="text-xl font-bold text-foreground">আপনার প্রিমিয়াম অ্যাক্সেস সক্রিয়</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            সব ক্যাম্প ও মিশন উপভোগ করতে প্লেয়ারে ফিরে যান।
          </p>
          <Button asChild className="mt-4 rounded-xl">
            <Link href="/player">খেলা চালিয়ে যান</Link>
          </Button>
        </div>
      ) : null}

      <PricingFaqSection />

      {showPayCta ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-500/30 bg-background/95 px-4 py-3 shadow-[0_-12px_40px_rgba(15,23,42,0.15)] backdrop-blur-xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="hidden min-w-0 flex-1 sm:block">
              <p className="truncate text-xs font-semibold text-muted-foreground">
                {formatBdt(pricing.finalPriceBdt)} · bKash
              </p>
              <p className="truncate text-sm font-bold text-foreground">
                {copy.upgradeShort}
              </p>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={handleUpgrade}
              className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-base font-black text-amber-950 shadow-md shadow-amber-500/25 hover:from-amber-300 hover:to-amber-400 sm:flex-none sm:min-w-[14rem]"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              {copy.upgradeShort}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
