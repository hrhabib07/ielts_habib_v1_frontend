"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Check, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  hasBlockingPaymentStatus,
  PaymentApplicationStatusCard,
} from "@/src/components/pricing/PaymentApplicationStatusCard";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
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
  const payment = usePaymentApplicationStatus(true);
  const blocked = hasBlockingPaymentStatus(
    payment.activeSubscription,
    payment.latestRequest,
  );
  const isPending = payment.latestRequest?.status === "PENDING";
  const hasPurchased = payment.hasPurchased;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "gamlish_payment_submitted_tracked";
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");

    // GTM dataLayer + Meta Pixel / custom hooks for conversion matching
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        currency: "BDT",
        items: [{ item_name: "Gamlish Founder Pre-order" }],
      },
      payment_status: "PENDING",
    });
    window.dispatchEvent(
      new CustomEvent("gamlish:payment_submitted", {
        detail: { status: "PENDING" },
      }),
    );
    if (typeof window.fbq === "function") {
      window.fbq("track", "Purchase", {
        content_name: "Gamlish Founder Pre-order",
        currency: "BDT",
      });
    }
  }, []);

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
    fbq?: (...args: unknown[]) => void;
  }
}
