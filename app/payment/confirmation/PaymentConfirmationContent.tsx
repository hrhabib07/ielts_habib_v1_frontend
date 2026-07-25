"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  hasBlockingPaymentStatus,
  PaymentApplicationStatusCard,
} from "@/src/components/pricing/PaymentApplicationStatusCard";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { cancelMyTestCheckoutRequests } from "@/src/lib/api/subscription";
import { brandStatus } from "@/src/lib/brand-theme";
import {
  SUPPORT_WHATSAPP_DISPLAY,
  SUPPORT_WHATSAPP_HREF,
} from "@/src/lib/contact";
import { PRIMARY_STUDENT_HREF } from "@/src/lib/platform-config";
import { cn } from "@/lib/utils";

/**
 * Distinct URL for Meta Pixel / ad conversion matching.
 * Fires after bKash TrxID submit (PENDING verification).
 */
export function PaymentConfirmationContent() {
  const router = useRouter();
  const payment = usePaymentApplicationStatus(true);
  const blocked = hasBlockingPaymentStatus(
    payment.activeSubscription,
    payment.latestRequest,
  );
  const isPending = payment.latestRequest?.status === "PENDING";
  const hasPurchased = payment.hasPurchased;
  const isTest = Boolean(payment.latestRequest?.isTest);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (payment.loading) return;
    const requestId = payment.latestRequest?._id ?? "unknown";
    const key = `gamlish_payment_submitted_tracked_${requestId}`;
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");

    // Single source for Meta Purchase: GTM listens to this dataLayer event.
    // Do NOT also call fbq('track','Purchase') here — that double-counts in Events Manager.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        currency: "BDT",
        items: [{ item_name: "Gamlish Founder Pre-order" }],
      },
      payment_status: "PENDING",
      is_test: isTest,
    });
    window.dispatchEvent(
      new CustomEvent("gamlish:payment_submitted", {
        detail: {
          status: "PENDING",
          isTest,
        },
      }),
    );
  }, [payment.loading, payment.latestRequest?._id, isTest]);

  const handleClearTestAndRetry = async () => {
    setClearError(null);
    setClearing(true);
    try {
      await cancelMyTestCheckoutRequests();
      await payment.refresh();
      router.push("/checkout");
    } catch {
      setClearError("Could not clear test request. Try again.");
      setClearing(false);
    }
  };

  if (payment.loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main
      className="mx-auto max-w-3xl space-y-8 px-4 py-10 font-bengali md:py-14"
      data-conversion="payment_submitted"
      data-payment-status="pending"
    >
      <div
        className={cn(
          "rounded-3xl border p-8 text-center md:p-10",
          brandStatus.success.card,
        )}
      >
        <div
          className={cn(
            "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full",
            brandStatus.success.icon,
          )}
        >
          <Check className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-2xl font-black text-foreground md:text-3xl">
          পেমেন্ট সাবমিট হয়েছে
        </h1>
        <p className="mt-2 text-base font-semibold text-foreground/80">
          Payment submitted successfully
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          স্ট্যাটাস: <strong>Pending Verification</strong>। অ্যাডমিন ভেরিফাই
          করলে প্রি-অর্ডার কনফার্ম হবে। প্রিমিয়াম অ্যাক্সেস সাথে সাথে চালু হবে না।
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Status: <strong>Pending Verification</strong>. Your pre-order will be
          confirmed after admin review. Premium access does not start
          immediately.
        </p>
      </div>

      {isTest ? (
        <div className="rounded-3xl border-2 border-amber-500/50 bg-amber-400/10 p-6 text-center dark:bg-amber-400/10">
          <p className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-200">
            QA / Meta test mode
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            This request is flagged as a test. It will not become a real Founder
            purchase. Delete it anytime, then submit again for more Meta checks.
          </p>
          <Button
            type="button"
            size="lg"
            disabled={clearing}
            onClick={() => void handleClearTestAndRetry()}
            className="mt-5 h-12 w-full max-w-md rounded-2xl bg-amber-500 text-base font-black text-amber-950 hover:bg-amber-400"
          >
            {clearing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="mr-2 h-5 w-5" aria-hidden />
            )}
            Delete test request & try again
          </Button>
          {clearError ? (
            <p className="mt-3 text-sm text-destructive">{clearError}</p>
          ) : null}
        </div>
      ) : null}

      {blocked || hasPurchased || isPending ? (
        <PaymentApplicationStatusCard
          activeSubscription={payment.activeSubscription}
          latestRequest={payment.latestRequest}
        />
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card p-6 text-center text-sm text-muted-foreground">
          <p>
            যদি আপনি এখনো পেমেন্ট সাবমিট না করে থাকেন, চেকআউটে ফিরে যান।
          </p>
          <p className="mt-1">
            If you have not submitted payment yet, go back to checkout.
          </p>
          <Button asChild className="mt-4 rounded-xl" variant="outline">
            <Link href="/checkout">Checkout এ যান</Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="rounded-xl">
          <Link href={PRIMARY_STUDENT_HREF}>ক্যাম্প ম্যাপে যান</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/pricing">Pricing এ ফিরুন</Link>
        </Button>
        <a
          href={SUPPORT_WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          WhatsApp {SUPPORT_WHATSAPP_DISPLAY}
        </a>
      </div>
    </main>
  );
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}
