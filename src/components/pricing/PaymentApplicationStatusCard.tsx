"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
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
  const hasActiveAccess =
    activeSubscription?.status === "ACTIVE" &&
    new Date(activeSubscription.endDate).getTime() > Date.now();

  if (hasActiveAccess) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/80 via-emerald-900/40 to-slate-950 p-6 shadow-xl md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-emerald-50">
                Premium access active
              </p>
              <p className="mt-1 text-sm text-emerald-100/80">
                Your payment was verified. You have full{" "}
                {ENABLE_READING ? "Reading module" : "English Foundations"} access until{" "}
                <strong>{formatDateTime(activeSubscription.endDate)}</strong>.
              </p>
            </div>
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              <Link href={ENABLE_READING ? "/profile/reading" : PRIMARY_STUDENT_HREF}>
                {ENABLE_READING ? "Go to Reading" : "Go to camp map"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (latestRequest?.status === "PENDING") {
    return (
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/70 via-orange-950/50 to-slate-950 p-6 shadow-xl md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
            <Clock3 className="h-6 w-6 text-amber-300" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold text-amber-50">
                Payment under review
              </p>
              <p className="mt-1 text-sm leading-relaxed text-amber-100/85">
                We received your payment proof. Our team is verifying your bKash
                transaction manually. You will get access within 24–48 hours once
                approved.
              </p>
            </div>
            <dl className="grid gap-2 rounded-xl border border-amber-500/25 bg-black/20 p-4 text-sm text-amber-50/90 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-amber-200/70">Plan</dt>
                <dd className="font-medium">{resolvePlanName(latestRequest.planId)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-amber-200/70">Amount paid</dt>
                <dd className="font-medium">{latestRequest.paidAmount.toLocaleString()} BDT</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-amber-200/70">Transaction ID</dt>
                <dd className="font-mono font-medium">{latestRequest.transactionId}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-amber-200/70">Submitted</dt>
                <dd className="font-medium">{formatDateTime(latestRequest.createdAt)}</dd>
              </div>
            </dl>
            <p className="text-xs text-amber-200/70">
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
      <div className="rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/80 via-slate-950 to-slate-950 p-6 shadow-xl md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/20">
            <XCircle className="h-6 w-6 text-red-400" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-lg font-semibold text-red-50">
                Payment application rejected
              </p>
              <p className="mt-1 text-sm text-red-100/80">
                Your last payment proof could not be verified. Review the reason below
                and submit a new application if needed.
              </p>
            </div>
            <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-200/80">
                    Admin message
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-red-50">{reason}</p>
                </div>
              </div>
            </div>
            <dl className="grid gap-2 text-sm text-red-100/80 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-red-200/60">Transaction ID</dt>
                <dd className="font-mono">{latestRequest.transactionId}</dd>
              </div>
              {latestRequest.reviewedAt && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-red-200/60">Reviewed</dt>
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
  const hasActiveAccess =
    activeSubscription?.status === "ACTIVE" &&
    new Date(activeSubscription.endDate).getTime() > Date.now();

  if (hasActiveAccess) return true;
  if (latestRequest?.status === "PENDING") return true;
  return false;
}
