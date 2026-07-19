"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import type {
  ActiveSubscription,
  SubscriptionPlan,
  SubscriptionRequest,
} from "@/src/lib/api/subscription";
import { ENABLE_READING, PRIMARY_STUDENT_HREF } from "@/src/lib/platform-config";
import { brandStatus } from "@/src/lib/brand-theme";
import {
  formatAccessDate,
  hasPurchasedSubscription,
  hasUsablePremiumAccess,
  isPreorderAwaitingAccess,
} from "@/src/lib/subscription-access";
import { cn } from "@/lib/utils";

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function resolvePlanName(
  plan: SubscriptionPlan | string | undefined,
): string {
  if (!plan) return "Premium plan";
  if (typeof plan === "string") return "Premium plan";
  return plan.name;
}

export interface PaymentApplicationStatusCardProps {
  activeSubscription: ActiveSubscription | null;
  latestRequest: SubscriptionRequest | null;
  onApplyAgain?: () => void;
}

export function PaymentApplicationStatusCard({
  activeSubscription,
  latestRequest,
  onApplyAgain,
}: PaymentApplicationStatusCardProps) {
  if (hasUsablePremiumAccess(activeSubscription)) {
    return (
      <div className={cn("rounded-2xl border p-6 shadow-lg md:p-8", brandStatus.success.card)}>
        <div className="flex items-start gap-4">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", brandStatus.success.icon)}>
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <div>
              <p className={cn("text-lg font-semibold", brandStatus.success.title)}>
                Premium access active
              </p>
              <p className={cn("mt-1 text-sm", brandStatus.success.body)}>
                Your payment was verified. You have full{" "}
                {ENABLE_READING ? "Reading module" : "English Foundations"} access until{" "}
                <strong>{formatDateTime(activeSubscription!.endDate)}</strong>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className={brandStatus.success.button}>
                <Link href={ENABLE_READING ? "/profile/reading" : PRIMARY_STUDENT_HREF}>
                  {ENABLE_READING ? "Go to Reading" : "Go to camp map"}
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/username">Claim your username</Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-xl">
                <Link href="/profile">View Gamlish profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isPreorderAwaitingAccess(activeSubscription)) {
    const startLabel = formatAccessDate(activeSubscription!.startDate);
    return (
      <div className={cn("rounded-2xl border p-6 shadow-lg md:p-8", brandStatus.pending.card)}>
        <div className="flex items-start gap-4">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", brandStatus.pending.icon)}>
            <CalendarClock className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <div>
              <p className={cn("text-lg font-semibold", brandStatus.pending.title)}>
                August pre-order confirmed
              </p>
              <p className={cn("mt-1 text-sm leading-relaxed", brandStatus.pending.body)}>
                Your payment is verified. Premium access is not available yet. It unlocks on{" "}
                <strong>{startLabel}</strong> and runs until{" "}
                <strong>{formatDateTime(activeSubscription!.endDate)}</strong>.
              </p>
              <p className={cn("mt-2 text-sm", brandStatus.pending.body)}>
                Until then you can still play free Mission 01.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="rounded-xl">
                <Link href={PRIMARY_STUDENT_HREF}>Go to camp map</Link>
              </Button>
              <Button asChild className="rounded-xl">
                <Link href="/username">Claim your username</Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-xl">
                <Link href="/profile">View Gamlish profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (latestRequest?.status === "PENDING") {
    return (
      <div className={cn("rounded-2xl border p-6 shadow-lg md:p-8", brandStatus.pending.card)}>
        <div className="flex items-start gap-4">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", brandStatus.pending.icon)}>
            <Clock3 className="h-6 w-6" />
          </div>
          <div className="space-y-4">
            <div>
              <p className={cn("text-lg font-semibold", brandStatus.pending.title)}>
                Pending Verification
              </p>
              <p className={cn("mt-1 text-sm leading-relaxed", brandStatus.pending.body)}>
                আমরা আপনার bKash পেমেন্ট প্রুফ পেয়েছি। অ্যাডমিন ভেরিফাই করলে প্রি-অর্ডার কনফার্ম হবে।
                প্রিমিয়াম অ্যাক্সেস সাথে সাথে চালু হবে না। অ্যাক্সেস শুরু হবে ১ আগস্ট থেকে।
              </p>
            </div>
            <dl className={cn("grid gap-2 rounded-xl border p-4 text-sm sm:grid-cols-2", brandStatus.pending.detail)}>
              <div>
                <dt className={cn("text-xs uppercase tracking-wide", brandStatus.pending.label)}>Plan</dt>
                <dd className="font-medium">{resolvePlanName(latestRequest.planId)}</dd>
              </div>
              <div>
                <dt className={cn("text-xs uppercase tracking-wide", brandStatus.pending.label)}>Amount paid</dt>
                <dd className="font-medium">{latestRequest.paidAmount.toLocaleString()} BDT</dd>
              </div>
              <div>
                <dt className={cn("text-xs uppercase tracking-wide", brandStatus.pending.label)}>Transaction ID</dt>
                <dd className="font-mono font-medium">{latestRequest.transactionId}</dd>
              </div>
              <div>
                <dt className={cn("text-xs uppercase tracking-wide", brandStatus.pending.label)}>Submitted</dt>
                <dd className="font-medium">{formatDateTime(latestRequest.createdAt)}</dd>
              </div>
            </dl>
            <p className={cn("text-xs", brandStatus.pending.body)}>
              You cannot submit another application while this one is pending.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (latestRequest?.status === "REJECTED") {
    const reason =
      latestRequest.rejectionReason?.trim() ||
      "The admin did not provide a specific reason. Please double-check your transaction ID and amount, then submit again.";

    return (
      <div
        className={cn(
          "rounded-2xl border p-6 shadow-lg md:p-8",
          "border-red-300/60 bg-gradient-to-br from-red-50 via-white to-red-100/40",
          "dark:border-red-500/40 dark:from-red-950/80 dark:via-slate-950 dark:to-slate-950 dark:shadow-xl",
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/15 dark:bg-red-500/20">
            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold text-red-950 dark:text-red-50">
                Payment application rejected
              </p>
              <p className="mt-1 text-sm text-red-900/80 dark:text-red-100/80">
                Your last payment proof could not be verified. Review the reason below
                and submit a new application if needed.
              </p>
            </div>
            <div
              className={cn(
                "rounded-xl border p-4",
                "border-red-200/80 bg-red-50/80",
                "dark:border-red-500/30 dark:bg-red-950/40",
              )}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-300" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-800/80 dark:text-red-200/80">
                    Admin message
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-red-950 dark:text-red-50">{reason}</p>
                </div>
              </div>
            </div>
            <dl className="grid gap-2 text-sm text-red-900/80 dark:text-red-100/80 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-red-700/70 dark:text-red-200/60">Transaction ID</dt>
                <dd className="font-mono">{latestRequest.transactionId}</dd>
              </div>
              {latestRequest.reviewedAt && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-red-700/70 dark:text-red-200/60">Reviewed</dt>
                  <dd>{formatDateTime(latestRequest.reviewedAt)}</dd>
                </div>
              )}
            </dl>
            {onApplyAgain && (
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-500"
                onClick={onApplyAgain}
              >
                Submit new payment proof
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function hasBlockingPaymentStatus(
  activeSubscription: ActiveSubscription | null,
  latestRequest: SubscriptionRequest | null,
): boolean {
  if (hasPurchasedSubscription(activeSubscription)) return true;
  if (latestRequest?.status === "PENDING") return true;
  return false;
}
