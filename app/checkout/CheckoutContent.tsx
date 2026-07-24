"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { BkashCheckoutForm } from "@/src/components/pricing/BkashCheckoutForm";
import {
  hasBlockingPaymentStatus,
  PaymentApplicationStatusCard,
} from "@/src/components/pricing/PaymentApplicationStatusCard";
import { FounderBenefitsShowcase } from "@/src/components/pricing/FounderBenefitsShowcase";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { Button } from "@/components/ui/button";
import { brandStatus } from "@/src/lib/brand-theme";
import { cn } from "@/lib/utils";

export function CheckoutContent({
  initialPricing = null,
}: {
  initialPricing?: PublicPricing | null;
}) {
  const router = useRouter();
  const [pricing, setPricing] = useState<PublicPricing | null>(initialPricing);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingLoading, setPricingLoading] = useState(!initialPricing);

  const payment = usePaymentApplicationStatus(true);
  const blocked = hasBlockingPaymentStatus(
    payment.activeSubscription,
    payment.latestRequest,
  );
  const hasPurchased = payment.hasPurchased;
  const hasActiveAccess = payment.hasActiveAccess;
  const isPendingReview = payment.latestRequest?.status === "PENDING";

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
          "মূল্য লোড করা যায়নি। ব্যাকএন্ড চালু আছে কিনা দেখুন, তারপর আবার চেষ্টা করুন।",
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

  /** Pending submission already done — confirmation URL for ad tracking. */
  useEffect(() => {
    if (payment.loading) return;
    if (isPendingReview) {
      router.replace("/payment/confirmation");
    }
  }, [payment.loading, isPendingReview, router]);

  if (pricingLoading || payment.loading) {
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

  if (hasPurchased) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 font-bengali md:py-12">
        <PaymentApplicationStatusCard
          activeSubscription={payment.activeSubscription}
          latestRequest={payment.latestRequest}
        />
        {hasActiveAccess ? (
          <div className={cn("rounded-3xl border p-8 text-center", brandStatus.success.card)}>
            <h2 className="text-xl font-bold text-foreground">প্রিমিয়াম অ্যাক্সেস সক্রিয়</h2>
            <Button asChild className="mt-4 rounded-xl">
              <Link href="/player">খেলা চালিয়ে যান</Link>
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  if (blocked || isPendingReview) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 font-bengali md:py-12">
      <div className="space-y-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-600 dark:text-pink-400">
          Checkout
        </p>
        <h1 className="text-2xl font-black text-foreground md:text-3xl">
          bKash পেমেন্ট
        </h1>
        <p className="text-sm text-muted-foreground">
          Send Money করুন, তারপর TrxID সাবমিট করুন
        </p>
      </div>

      {payment.latestRequest?.status === "REJECTED" ? (
        <PaymentApplicationStatusCard
          activeSubscription={payment.activeSubscription}
          latestRequest={payment.latestRequest}
        />
      ) : null}

      <div id="bkash-checkout" className="scroll-mt-24">
        <BkashCheckoutForm
          pricing={pricing}
          onClose={() => router.push("/pricing")}
          onSubmitted={() => {
            router.push("/payment/confirmation");
          }}
        />
      </div>

      <FounderBenefitsShowcase />
    </div>
  );
}
