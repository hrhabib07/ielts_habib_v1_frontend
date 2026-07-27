"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { BkashCheckoutForm } from "@/src/components/pricing/BkashCheckoutForm";
import {
  hasBlockingPaymentStatus,
  PaymentApplicationStatusCard,
} from "@/src/components/pricing/PaymentApplicationStatusCard";
import { FounderBenefitsShowcase } from "@/src/components/pricing/FounderBenefitsShowcase";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { useCheckoutCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { Button } from "@/components/ui/button";
import { brandStatus } from "@/src/lib/brand-theme";
import { cn } from "@/lib/utils";

export function CheckoutContent({
  initialPricing = null,
}: {
  initialPricing?: PublicPricing | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceCheckoutForm = searchParams.get("again") === "1";
  const copy = useCheckoutCopy();
  const { locale } = useUiLocale();
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
  const isTestPending =
    isPendingReview && Boolean(payment.latestRequest?.isTest);

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
            ? "মূল্য লোড করা যায়নি। ব্যাকএন্ড চালু আছে কিনা দেখুন, তারপর আবার চেষ্টা করুন।"
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

  /** Pending real submission: confirmation URL for ad tracking.
   *  Test QA can force the form with ?again=1 to resubmit. */
  useEffect(() => {
    if (payment.loading) return;
    if (forceCheckoutForm && isTestPending) return;
    if (isPendingReview) {
      router.replace("/payment/confirmation");
    }
  }, [
    payment.loading,
    isPendingReview,
    isTestPending,
    forceCheckoutForm,
    router,
  ]);

  if (pricingLoading || payment.loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (pricingError || !pricing) {
    return (
      <div
        className={cn(
          "mx-auto max-w-lg px-4 py-16 text-center",
          locale === "bn" && "font-bengali",
        )}
      >
        <p className="text-destructive">
          {pricingError ?? (locale === "bn" ? "মূল্য পাওয়া যায়নি" : "Pricing unavailable")}
        </p>
        <Button className="mt-4 rounded-xl" onClick={() => void loadPricing(false)}>
          {locale === "bn" ? "আবার চেষ্টা করুন" : "Try again"}
        </Button>
      </div>
    );
  }

  if (hasPurchased) {
    return (
      <div
        className={cn(
          "mx-auto max-w-3xl space-y-6 px-4 py-8 md:py-12",
          locale === "bn" && "font-bengali",
        )}
      >
        <PaymentApplicationStatusCard
          activeSubscription={payment.activeSubscription}
          latestRequest={payment.latestRequest}
        />
        {hasActiveAccess ? (
          <div className={cn("rounded-3xl border p-8 text-center", brandStatus.success.card)}>
            <h2 className="text-xl font-bold text-foreground">
              {locale === "bn" ? "প্রিমিয়াম অ্যাক্সেস সক্রিয়" : "Premium access is active"}
            </h2>
            <Button asChild className="mt-4 rounded-xl">
              <Link href="/player">
                {locale === "bn" ? "খেলা চালিয়ে যান" : "Continue playing"}
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  if ((blocked || isPendingReview) && !(forceCheckoutForm && isTestPending)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative isolate overflow-x-hidden",
        locale === "bn" && "font-bengali",
      )}
      lang={locale}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(236,72,153,0.14),transparent_55%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.45)_45%,hsl(var(--background))_100%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-xl space-y-5 px-3 py-6 sm:max-w-2xl sm:px-6 sm:py-10">
        <div className="space-y-1.5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-pink-700 dark:text-pink-300">
            {copy.pageEyebrow}
          </p>
          <h1 className="text-balance text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {copy.pageTitle}
          </h1>
          <p className="text-pretty text-sm text-muted-foreground sm:text-[15px]">
            {copy.pageSub}
          </p>
          {forceCheckoutForm && isTestPending ? (
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              QA test mode: you can submit again. This will not create a real Founder purchase.
            </p>
          ) : null}
        </div>

        {payment.latestRequest?.status === "REJECTED" ? (
          <PaymentApplicationStatusCard
            activeSubscription={payment.activeSubscription}
            latestRequest={payment.latestRequest}
          />
        ) : null}

        <div
          id="bkash-checkout"
          className="scroll-mt-24 overflow-hidden rounded-[1.5rem] border border-pink-500/20 bg-card/95 shadow-[0_16px_40px_-20px_rgba(236,72,153,0.35)] backdrop-blur-sm sm:rounded-[1.75rem]"
        >
          <div
            className="h-1.5 w-full bg-gradient-to-r from-pink-400 via-rose-500 to-fuchsia-500"
            aria-hidden
          />
          <div className="p-3.5 sm:p-6">
            <BkashCheckoutForm
              pricing={pricing}
              onClose={() => router.push("/pricing")}
              onSubmitted={() => {
                router.push("/payment/confirmation");
              }}
            />
          </div>
        </div>

        <FounderBenefitsShowcase />
      </div>
    </div>
  );
}
