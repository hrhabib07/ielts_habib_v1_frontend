"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { CurrentUser } from "@/src/lib/auth-server";
import { getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { FounderLaunchPricingCard } from "@/src/components/pricing/FounderLaunchPricingCard";
import { BkashCheckoutForm } from "@/src/components/pricing/BkashCheckoutForm";
import {
  hasBlockingPaymentStatus,
  PaymentApplicationStatusCard,
} from "@/src/components/pricing/PaymentApplicationStatusCard";
import { PricingFaqSection } from "@/src/components/pricing/PricingFaqSection";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { Button } from "@/components/ui/button";
import { brandStatus } from "@/src/lib/brand-theme";
import { cn } from "@/lib/utils";

export function PricingContent({ initialUser }: { initialUser: CurrentUser | null }) {
  const [pricing, setPricing] = useState<PublicPricing | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isLoggedIn = Boolean(initialUser);
  const { isFoundingMember } = useStudentSession();
  const payment = usePaymentApplicationStatus(isLoggedIn);
  const hasActiveAccess = payment.hasActiveAccess;
  const hasPurchased = payment.hasPurchased;
  const blocked = hasBlockingPaymentStatus(payment.activeSubscription, payment.latestRequest);

  const loadPricing = useCallback(async () => {
    setPricingLoading(true);
    setPricingError(null);
    try {
      const data = await getPublicPricing();
      setPricing(data);
    } catch {
      setPricingError("মূল্য লোড করা যায়নি। পেজ রিফ্রেশ করুন।");
    } finally {
      setPricingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "1" && isLoggedIn && !blocked && !hasPurchased) {
      setCheckoutOpen(true);
    }
  }, [isLoggedIn, blocked, hasPurchased]);

  const handleUpgrade = () => {
    if (!isLoggedIn) {
      window.location.href = `/login?redirect=${encodeURIComponent("/pricing?checkout=1")}`;
      return;
    }
    if (blocked || hasPurchased) return;
    setCheckoutOpen(true);
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
        <Button className="mt-4 rounded-xl" onClick={loadPricing}>
          আবার চেষ্টা করুন
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 font-bengali md:py-12">
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
        <BkashCheckoutForm
          pricing={pricing}
          onClose={() => setCheckoutOpen(false)}
          onSubmitted={() => payment.refresh()}
        />
      ) : !hasPurchased && !blocked ? (
        <FounderLaunchPricingCard
          pricing={pricing}
          onUpgrade={handleUpgrade}
          disabled={blocked}
        />
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
    </div>
  );
}
