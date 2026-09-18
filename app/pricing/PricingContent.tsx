"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { CurrentUser } from "@/src/lib/auth-server";
import { getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { PricingPageHero } from "@/src/components/pricing/PricingPageHero";
import {
  hasBlockingPaymentStatus,
  PaymentApplicationStatusCard,
} from "@/src/components/pricing/PaymentApplicationStatusCard";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { Button } from "@/components/ui/button";
import { brandStatus } from "@/src/lib/brand-theme";
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
  const { locale } = useUiLocale();

  const isLoggedIn = Boolean(initialUser);
  const { isFoundingMember } = useStudentSession();
  const payment = usePaymentApplicationStatus(isLoggedIn);
  const hasActiveAccess = payment.hasActiveAccess;
  const hasPurchased = payment.hasPurchased;
  const blocked = hasBlockingPaymentStatus(payment.activeSubscription, payment.latestRequest);

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
        <p className="text-destructive">
          {pricingError ?? (locale === "bn" ? "মূল্য পাওয়া যায়নি" : "Pricing unavailable")}
        </p>
        <Button className="mt-4 rounded-xl" onClick={() => void loadPricing(false)}>
          {locale === "bn" ? "আবার চেষ্টা করুন" : "Try again"}
        </Button>
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
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(56,189,248,0.14),transparent_60%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
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
          <PricingPageHero
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
      </div>
    </div>
  );
}
