"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2, Zap } from "lucide-react";
import {
  getPublicPlans,
  submitSubscriptionRequest,
  type SubscriptionPlan,
} from "@/src/lib/api/subscription";
import type { CurrentUser } from "@/src/lib/auth-server";
import { PricingFaqSection } from "@/src/components/pricing/PricingFaqSection";
import {
  hasBlockingPaymentStatus,
  PaymentApplicationStatusCard,
} from "@/src/components/pricing/PaymentApplicationStatusCard";
import { ExplodingOfferCheckoutCard } from "@/src/components/scholarship/ExplodingOfferCheckoutCard";
import { ScholarshipDecayClaimCard } from "@/src/components/scholarship/ScholarshipDecayClaimCard";
import { EarlyAdopterCountdown } from "@/src/components/founding-member/EarlyAdopterCountdown";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import {
  isFoundingMemberEligible,
  isFoundingMemberWindowOpen,
} from "@/src/lib/foundingMember";
import { useScholarship } from "@/src/contexts/ScholarshipContext";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";

function formatDuration(days: number): string {
  const totalMonths = Math.max(1, Math.floor(days / 30));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""}`;
  }

  return `${months} month${months > 1 ? "s" : ""}`;
}

function getPlanFeatures(plan: SubscriptionPlan): string[] {
  if (Array.isArray(plan.features) && plan.features.length > 0) {
    return plan.features;
  }
  return [
    ...(plan.modulesIncluded ?? ["READING"]).map(
      (mod) => `${mod.charAt(0) + mod.slice(1).toLowerCase()} module access`,
    ),
    "Level-based progression",
    "Band tracking and analytics",
    "Structured test attempts",
  ];
}

function extractBkashNumber(text: string | null | undefined): string | null {
  if (!text) return null;
  const normalized = text.replace(/[\s-]+/g, "");
  const match = normalized.match(/\b(?:\+?88)?01\d{9}\b/);
  if (!match) return null;
  return match[0];
}

interface PurchaseFormProps {
  plan: SubscriptionPlan;
  onClose: () => void;
  onSubmitted: () => void;
}

function PurchaseForm({ plan, onClose, onSubmitted }: PurchaseFormProps) {
  const { status: scholarshipStatus } = useScholarship();
  const [txId, setTxId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const basePrice = plan.discountPrice ?? plan.price;
  const scholarshipActive = Boolean(
    scholarshipStatus?.isClaimActive && scholarshipStatus.activeDiscountPercent > 0,
  );

  const discountAmount = scholarshipActive
    ? Math.round((basePrice * (scholarshipStatus?.activeDiscountPercent ?? 0)) / 100)
    : 0;

  const payableAmount = Math.max(0, basePrice - discountAmount);

  const [paidAmount, setPaidAmount] = useState<number>(payableAmount);
  const bkashNumber = extractBkashNumber(plan.manualPaymentInstructions);

  useEffect(() => {
    setPaidAmount(payableAmount);
  }, [payableAmount]);

  const handleCopyBkashNumber = async () => {
    if (!bkashNumber) return;
    try {
      await navigator.clipboard.writeText(bkashNumber);
      setCopiedNumber(true);
      window.setTimeout(() => setCopiedNumber(false), 1600);
    } catch {
      setCopiedNumber(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId.trim()) {
      setError("Transaction ID is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitSubscriptionRequest({
        planId: plan._id,
        paymentMethod: "BKASH",
        transactionId: txId.trim(),
        senderNumber: senderNumber.trim() || undefined,
        paidAmount,
      });
      onSubmitted();
      setSuccess(true);
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Payment submitted!</h3>
        <p className="text-sm text-muted-foreground">
          Your payment proof has been submitted. Track your application status above.
          You will receive access within 24–48 hours after verification.
        </p>
        <Button variant="outline" onClick={onClose}>
          View application status
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Complete your purchase</h3>
        <button
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
        <p className="font-medium text-foreground">{plan.name}</p>
        <p className="text-muted-foreground">
          {formatDuration(plan.durationInDays)} · {(plan.modulesIncluded ?? ["READING"]).join(", ")}
        </p>
        <div className="mt-2 space-y-1">
          {scholarshipActive && (
            <p className="text-xs text-muted-foreground line-through">
              {basePrice.toLocaleString()} BDT
            </p>
          )}
          <p className="text-lg font-bold text-foreground">
            {paidAmount.toLocaleString()} BDT
            {scholarshipActive && (
              <span className="ml-2 text-sm font-normal text-indigo-600 dark:text-indigo-400">
                ({scholarshipStatus?.activeDiscountPercent}% scholarship)
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Payment instructions</p>
        <div className="rounded-lg border p-4 text-sm text-muted-foreground space-y-1">
          {bkashNumber && (
            <div className="mb-3 rounded-lg border border-emerald-200/70 bg-emerald-50/60 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                bKash number
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-2xl font-bold tracking-wide text-emerald-700">
                  {bkashNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyBkashNumber}
                  className="rounded-md border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  {copiedNumber ? "Copied" : "Copy number"}
                </button>
              </div>
            </div>
          )}
          {plan.manualPaymentInstructions ? (
            <p className="whitespace-pre-line">{plan.manualPaymentInstructions}</p>
          ) : (
            <p className="whitespace-pre-line">
              Send {paidAmount.toLocaleString()} BDT and submit your transaction ID after payment.
            </p>
          )}
          <p className="pt-1 text-xs">
            Selected method: <span className="font-medium text-foreground">bKash</span>. Amount to pay:{" "}
            <span className="font-medium text-foreground">{paidAmount.toLocaleString()} BDT</span>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Payment method</label>
          <p className="mt-1 rounded-lg border px-4 py-2 text-sm font-medium text-foreground">
            bKash
          </p>
        </div>

        {scholarshipActive && (
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm text-indigo-900 dark:text-indigo-200">
            <p className="font-semibold">Scholarship applied</p>
            <p className="mt-1 text-xs">
              Elite {scholarshipStatus?.activeDiscountPercent}% discount — no promo code needed.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="paidAmount" className="text-sm font-medium text-foreground">
            Amount paid (BDT) <span className="text-destructive">*</span>
          </label>
          <input
            id="paidAmount"
            type="number"
            min={0}
            step={1}
            value={paidAmount}
            onChange={(e) => setPaidAmount(Number(e.target.value))}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
            readOnly={scholarshipActive}
          />
        </div>

        <div>
          <label htmlFor="txId" className="text-sm font-medium text-foreground">
            Transaction ID <span className="text-destructive">*</span>
          </label>
          <input
            id="txId"
            type="text"
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            placeholder="e.g. 8N6XXXXX"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>

        <div>
          <label htmlFor="senderNumber" className="text-sm font-medium text-foreground">
            Sender number (optional)
          </label>
          <input
            id="senderNumber"
            type="text"
            value={senderNumber}
            onChange={(e) => setSenderNumber(e.target.value)}
            placeholder="e.g. 01XXXXXXXXXX"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit payment proof"
          )}
        </Button>
      </form>
    </div>
  );
}

function PlanCard({
  plan,
  onPurchase,
  isLoggedIn,
  purchaseDisabled,
  purchaseDisabledReason,
}: {
  plan: SubscriptionPlan;
  onPurchase: (plan: SubscriptionPlan) => void;
  isLoggedIn: boolean;
  purchaseDisabled?: boolean;
  purchaseDisabledReason?: string;
}) {
  const { status: scholarshipStatus } = useScholarship();
  const basePrice = plan.discountPrice ?? plan.price;
  const scholarshipActive = Boolean(
    scholarshipStatus?.isClaimActive && scholarshipStatus.activeDiscountPercent > 0,
  );
  const effectivePrice = scholarshipActive
    ? Math.max(0, basePrice - Math.round((basePrice * scholarshipStatus!.activeDiscountPercent) / 100))
    : basePrice;
  const hasScholarshipPrice = scholarshipActive && effectivePrice < basePrice;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col rounded-2xl border border-border/80 bg-card/95 p-8 shadow-lg shadow-black/[0.04] backdrop-blur-sm dark:shadow-black/20">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
        </div>
        {hasScholarshipPrice && (
          <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {scholarshipStatus?.activeDiscountPercent}% scholarship
          </span>
        )}
      </div>

      <div className="mt-4">
        {hasScholarshipPrice ? (
          <>
            <p className="text-lg text-muted-foreground line-through">
              {basePrice.toLocaleString()} BDT
            </p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {effectivePrice.toLocaleString()}{" "}
              <span className="text-lg font-normal">BDT</span>
            </p>
          </>
        ) : (
          <p className="text-3xl font-bold text-foreground">
            {basePrice.toLocaleString()}{" "}
            <span className="text-lg font-normal text-muted-foreground">BDT</span>
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDuration(plan.durationInDays)} access ·{" "}
          {plan.isWholePackage ? "All modules" : (plan.modulesIncluded ?? ["READING"]).join(", ")}
        </p>
      </div>

      <ul className="mt-6 space-y-2 flex-1">
        {getPlanFeatures(plan).map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-2">
        {isLoggedIn ? (
          purchaseDisabled ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-800 dark:text-amber-200">
              {purchaseDisabledReason ?? "Checkout is unavailable right now."}
            </p>
          ) : (
            <Button className="w-full gap-2" onClick={() => onPurchase(plan)}>
              <Zap className="h-4 w-4" />
              Get access
            </Button>
          )
        ) : (
          <>
            <Link href="/register">
              <Button className="w-full gap-2">
                <Zap className="h-4 w-4" />
                Get started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                I already have an account
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

interface PricingContentProps {
  initialUser: CurrentUser | null;
  autoOpenCheckout?: boolean;
}

export function PricingContent({
  initialUser,
  autoOpenCheckout = false,
}: PricingContentProps) {
  const { status: scholarshipStatus } = useScholarship();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const isLoggedIn = !!initialUser;

  const {
    activeSubscription,
    latestRequest,
    loading: paymentStatusLoading,
    refresh: refreshPaymentStatus,
    hasActiveAccess,
    isPendingReview,
    isRejected,
  } = usePaymentApplicationStatus(isLoggedIn);

  const checkoutBlocked = hasBlockingPaymentStatus(
    activeSubscription,
    latestRequest,
  );

  const showStatusCard =
    isLoggedIn &&
    !paymentStatusLoading &&
    (hasActiveAccess || isPendingReview || isRejected);

  const showExplodingOffer =
    !selectedPlan &&
    !loading &&
    !paymentStatusLoading &&
    !checkoutBlocked &&
    scholarshipStatus?.isClaimActive;

  const showDecayClaim =
    !selectedPlan && !loading && !checkoutBlocked;

  const showFoundingMemberBadge =
    isLoggedIn && isFoundingMemberEligible(activeSubscription);

  const showFoundingCountdown =
    !showFoundingMemberBadge && isFoundingMemberWindowOpen();

  useEffect(() => {
    getPublicPlans()
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (
      !autoOpenCheckout ||
      loading ||
      paymentStatusLoading ||
      checkoutBlocked ||
      !isLoggedIn ||
      !plans[0]
    ) {
      return;
    }
    setSelectedPlan(plans[0]);
  }, [
    autoOpenCheckout,
    loading,
    paymentStatusLoading,
    checkoutBlocked,
    isLoggedIn,
    plans,
  ]);

  const handlePurchaseSubmitted = () => {
    setSelectedPlan(null);
    void refreshPaymentStatus();
  };

  const handleApplyAgain = () => {
    if (plans[0]) {
      setSelectedPlan(plans[0]);
    }
  };

  return (
    <main className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-20 space-y-12 md:space-y-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(40vh,20rem)] bg-[radial-gradient(ellipse_75%_60%_at_50%_-10%,var(--primary)_0%,transparent_58%)] opacity-[0.08] dark:opacity-[0.14]"
        aria-hidden
      />
      <div className="relative text-center space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Plans &amp; access
        </p>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-[2.5rem] md:leading-[1.15]">
          Unlock Reading mastery
        </h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
          Claim your 60% Founder scholarship — available until 1 August 2026.
        </p>
        {(showFoundingMemberBadge || showFoundingCountdown) && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-2 pt-2">
            {showFoundingMemberBadge ? (
              <FoundingMemberBadge size="md" />
            ) : (
              <EarlyAdopterCountdown className="w-full" />
            )}
            <Link
              href="/founding-members"
              className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-accent hover:underline"
            >
              See the Founders&apos; Wall
            </Link>
          </div>
        )}
      </div>

      {showStatusCard && (
        <PaymentApplicationStatusCard
          activeSubscription={activeSubscription}
          latestRequest={latestRequest}
          onApplyAgain={isRejected ? handleApplyAgain : undefined}
        />
      )}

      {showExplodingOffer && (
        <ExplodingOfferCheckoutCard onUpgradeClick={() => plans[0] && setSelectedPlan(plans[0])} />
      )}

      {showDecayClaim && <ScholarshipDecayClaimCard />}

      {selectedPlan ? (
        <PurchaseForm
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSubmitted={handlePurchaseSubmitted}
        />
      ) : loading || (isLoggedIn && paymentStatusLoading) ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : hasActiveAccess ? null : plans.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No plans available right now. Check back soon.</p>
        </Card>
      ) : (
        <div className={`grid gap-6 ${plans.length > 1 ? "md:grid-cols-2" : ""} justify-items-center`}>
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              onPurchase={setSelectedPlan}
              isLoggedIn={isLoggedIn}
              purchaseDisabled={isPendingReview}
              purchaseDisabledReason="Your payment is under review. Please wait for admin verification."
            />
          ))}
        </div>
      )}

      <PricingFaqSection />
    </main>
  );
}
