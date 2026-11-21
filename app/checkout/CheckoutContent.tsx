"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { BkashCheckoutForm } from "@/src/components/pricing/BkashCheckoutForm";
import { PricingFaqSection } from "@/src/components/pricing/PricingFaqSection";
import {
  hasBlockingPaymentStatus,
  PaymentApplicationStatusCard,
} from "@/src/components/pricing/PaymentApplicationStatusCard";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { useCheckoutCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { waitForClientAuthReady } from "@/src/lib/auth-session-ready";
import type { CurrentUser } from "@/src/lib/auth-server";
import { Button } from "@/components/ui/button";
import { brandStatus } from "@/src/lib/brand-theme";
import { cn } from "@/lib/utils";

const PAYMENT_BOOT_WAIT_MS = 2000;

export function CheckoutContent({
  initialPricing = null,
  initialUser = null,
}: {
  initialPricing?: PublicPricing | null;
  initialUser?: CurrentUser | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceCheckoutForm = searchParams.get("again") === "1";
  const copy = useCheckoutCopy();
  const { locale } = useUiLocale();
  const bn = locale === "bn";
  const [pricing, setPricing] = useState<PublicPricing | null>(initialPricing);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingLoading, setPricingLoading] = useState(!initialPricing);
  const [sessionReady, setSessionReady] = useState(Boolean(initialUser));
  const [sessionChecking, setSessionChecking] = useState(!initialUser);
  const [paymentWaitExpired, setPaymentWaitExpired] = useState(false);

  const hasSession = Boolean(initialUser) || sessionReady;
  const payment = usePaymentApplicationStatus(hasSession);
  const blocked = hasBlockingPaymentStatus(
    payment.activeSubscription,
    payment.latestRequest,
  );
  const hasPurchased = payment.hasPurchased;
  const hasActiveAccess = payment.hasActiveAccess;
  const isPendingReview = payment.latestRequest?.status === "PENDING";
  const isTestPending =
    isPendingReview && Boolean(payment.latestRequest?.isTest);

  const loadPricing = useCallback(
    async (silent = false) => {
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
            bn
              ? "মূল্য লোড করা যায়নি। ব্যাকএন্ড চালু আছে কিনা দেখুন, তারপর আবার চেষ্টা করুন।"
              : "Could not load pricing. Check the backend is running, then try again.",
          );
        }
      } finally {
        if (!silent) setPricingLoading(false);
      }
    },
    [bn],
  );

  useEffect(() => {
    if (initialPricing) {
      void loadPricing(true);
      return;
    }
    void loadPricing(false);
  }, [initialPricing, loadPricing]);

  useEffect(() => {
    if (initialUser) {
      setSessionReady(true);
      setSessionChecking(false);
      return;
    }
    let cancelled = false;
    setSessionChecking(true);
    void waitForClientAuthReady({ timeoutMs: 1_500 }).then((token) => {
      if (cancelled) return;
      setSessionReady(Boolean(token));
      setSessionChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [initialUser]);

  useEffect(() => {
    if (!payment.loading) {
      setPaymentWaitExpired(false);
      return;
    }
    const timer = window.setTimeout(
      () => setPaymentWaitExpired(true),
      PAYMENT_BOOT_WAIT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [payment.loading]);

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

  const bootLoading =
    pricingLoading ||
    (hasSession &&
      (sessionChecking || (payment.loading && !paymentWaitExpired)));

  if (bootLoading) {
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
          bn && "font-bengali",
        )}
      >
        <p className="text-destructive">
          {pricingError ?? (bn ? "মূল্য পাওয়া যায়নি" : "Pricing unavailable")}
        </p>
        <Button
          className="mt-4 rounded-xl"
          onClick={() => void loadPricing(false)}
        >
          {bn ? "আবার চেষ্টা করুন" : "Try again"}
        </Button>
      </div>
    );
  }

  if (hasPurchased) {
    return (
      <div
        className={cn(
          "mx-auto max-w-3xl space-y-6 px-4 py-8 md:py-12",
          bn && "font-bengali",
        )}
      >
        <PaymentApplicationStatusCard
          activeSubscription={payment.activeSubscription}
          latestRequest={payment.latestRequest}
        />
        {hasActiveAccess ? (
          <div
            className={cn(
              "rounded-3xl border p-8 text-center",
              brandStatus.success.card,
            )}
          >
            <h2 className="text-xl font-bold text-foreground">
              {bn ? "প্রিমিয়াম অ্যাক্সেস সক্রিয়" : "Premium access is active"}
            </h2>
            <Button asChild className="mt-4 rounded-xl">
              <Link href="/player">
                {bn ? "খেলা চালিয়ে যান" : "Continue playing"}
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  if ((blocked || isPendingReview) && !(forceCheckoutForm && isTestPending)) {
    return (
      <div
        className={cn(
          "mx-auto max-w-lg px-4 py-16 text-center",
          bn && "font-bengali",
        )}
      >
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">{copy.sessionPreparing}</p>
        <Button asChild variant="outline" className="mt-6 rounded-xl">
          <Link href="/payment/confirmation">{copy.statusNext}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative isolate overflow-x-hidden bg-[radial-gradient(120%_80%_at_50%_-10%,#dbeafe_0%,transparent_42%)]",
        bn && "font-bengali",
      )}
      lang={locale}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:28px_28px] opacity-50"
      />

      <div className="mx-auto max-w-xl space-y-5 px-4 py-6 sm:max-w-2xl sm:px-6 sm:py-10">
        {forceCheckoutForm && isTestPending ? (
          <p className="text-center text-xs font-semibold text-amber-700 dark:text-amber-300">
            QA test mode: you can submit again. This will not create a real Founder purchase.
          </p>
        ) : null}

        {payment.latestRequest?.status === "REJECTED" ? (
          <PaymentApplicationStatusCard
            activeSubscription={payment.activeSubscription}
            latestRequest={payment.latestRequest}
          />
        ) : null}

        <div
          id="bkash-checkout"
          className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] sm:p-6 dark:border-slate-700 dark:bg-slate-900/90"
        >
          <BkashCheckoutForm
            pricing={pricing}
            onClose={() => router.push("/pricing")}
            onSubmitted={() => {
              router.push("/payment/confirmation");
            }}
          />
        </div>

        <PricingFaqSection id="checkout-faq" className="pt-2" />
      </div>
    </div>
  );
}
