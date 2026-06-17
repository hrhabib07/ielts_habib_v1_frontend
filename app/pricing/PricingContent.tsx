"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Loader2, ShieldCheck, Smartphone } from "lucide-react";
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
import { FoundingMemberPricingAlert } from "@/src/components/pricing/FoundingMemberPricingAlert";
import { PremiumPricingHero } from "@/src/components/pricing/PremiumPricingHero";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { isFoundingMemberEligible } from "@/src/lib/foundingMember";
import { useScholarship } from "@/src/contexts/ScholarshipContext";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { useScholarshipDecayTimer } from "@/src/hooks/useScholarshipTimer";
import {
  computeDiscountedPrice,
  FOUNDER_SCHOLARSHIP_PERCENT,
} from "@/src/lib/pricingOffer";
import { resolveBkashNumber } from "@/src/lib/bkash";
import { resolveScholarshipWindowStart } from "@/src/lib/scholarshipWindow";

function resolvePayableAmount(
  basePrice: number,
  scholarshipStatus: ReturnType<typeof useScholarship>["status"],
  decayTimer: { ready: boolean; currentTierPercent: number },
): { payableAmount: number; discountPercent: number; scholarshipActive: boolean } {
  const apiDiscount = scholarshipStatus?.activeDiscountPercent ?? 0;
  const timerDiscount =
    decayTimer.ready && decayTimer.currentTierPercent > 0
      ? FOUNDER_SCHOLARSHIP_PERCENT
      : 0;
  const discountPercent = apiDiscount > 0 ? apiDiscount : timerDiscount;
  const scholarshipActive = discountPercent > 0;
  const payableAmount =
    scholarshipActive && scholarshipStatus?.discountedPrice
      ? scholarshipStatus.discountedPrice
      : computeDiscountedPrice(basePrice, discountPercent);
  return { payableAmount, discountPercent, scholarshipActive };
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
  const decayTimer = useScholarshipDecayTimer(
    resolveScholarshipWindowStart(scholarshipStatus),
  );
  const { payableAmount, discountPercent, scholarshipActive } = resolvePayableAmount(
    basePrice,
    scholarshipStatus,
    decayTimer,
  );
  const bkashNumber = resolveBkashNumber(plan.manualPaymentInstructions);

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
        paidAmount: payableAmount,
      });
      onSubmitted();
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      setError(
        msg ??
          "Failed to submit. Check your transaction ID and that you sent the exact amount.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/5 to-card p-10 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
          <Check className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Payment submitted!</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We received your bKash proof. Our team verifies manually. premium unlocks within
          24–48 hours. You&apos;ll get an email when access is active.
        </p>
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Step 2 of 2
          </p>
          <h3 className="text-xl font-bold text-foreground">Pay with bKash</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
          <p className="text-xs font-medium text-muted-foreground">You pay</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">
            {payableAmount.toLocaleString()}{" "}
            <span className="text-lg font-semibold">BDT</span>
          </p>
          {scholarshipActive && (
            <p className="mt-1 text-xs text-violet-600 dark:text-violet-400">
              {discountPercent}% Founder scholarship applied
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm">
          <p className="font-medium text-foreground">{plan.name}</p>
          <p className="mt-1 text-muted-foreground">
            Full Reading module · structured levels · mock tests
          </p>
        </div>
      </div>

      {bkashNumber ? (
        <div className="rounded-2xl border-2 border-dashed border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                1. Send money to this bKash number
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-extrabold tracking-wide text-emerald-700 dark:text-emerald-400">
                  {bkashNumber}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-emerald-500/40"
                  onClick={() => void handleCopyBkashNumber()}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedNumber ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Send exactly{" "}
                <strong className="text-foreground">
                  {payableAmount.toLocaleString()} BDT
                </strong>{" "}
                via bKash Send Money.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border p-4 text-sm text-muted-foreground whitespace-pre-line">
          {plan.manualPaymentInstructions ??
            `Send ${payableAmount.toLocaleString()} BDT via bKash and enter your transaction ID below.`}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm font-semibold text-foreground">
          2. Paste your bKash transaction ID
        </p>

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
            className="mt-1.5 w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            required
          />
        </div>

        <div>
          <label htmlFor="senderNumber" className="text-sm font-medium text-foreground">
            Your bKash number (optional)
          </label>
          <input
            id="senderNumber"
            type="text"
            value={senderNumber}
            onChange={(e) => setSenderNumber(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="mt-1.5 w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-base font-bold"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Submit payment proof
            </>
          )}
        </Button>
      </form>
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

  const showFoundingMemberBadge =
    isLoggedIn && isFoundingMemberEligible(activeSubscription);

  const primaryPlan = plans[0] ?? null;

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
      !primaryPlan
    ) {
      return;
    }
    setSelectedPlan(primaryPlan);
  }, [
    autoOpenCheckout,
    loading,
    paymentStatusLoading,
    checkoutBlocked,
    isLoggedIn,
    primaryPlan,
  ]);

  const handlePurchaseSubmitted = () => {
    setSelectedPlan(null);
    void refreshPaymentStatus();
  };

  const handleStartPurchase = () => {
    if (primaryPlan) setSelectedPlan(primaryPlan);
  };

  return (
    <main className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-16 space-y-10">
      {showFoundingMemberBadge && (
        <div className="flex justify-center">
          <FoundingMemberBadge size="md" />
        </div>
      )}

      {showStatusCard && (
        <PaymentApplicationStatusCard
          activeSubscription={activeSubscription}
          latestRequest={latestRequest}
          onApplyAgain={isRejected ? handleStartPurchase : undefined}
        />
      )}

      {!selectedPlan && !hasActiveAccess && (
        <>
          <PremiumPricingHero
            scholarshipStatus={scholarshipStatus}
            isLoggedIn={isLoggedIn}
            onPurchase={handleStartPurchase}
            purchaseDisabled={isPendingReview}
            purchaseDisabledReason="Your payment is under review. Please wait for verification."
          />
          <FoundingMemberPricingAlert />
        </>
      )}

      {selectedPlan ? (
        <PurchaseForm
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSubmitted={handlePurchaseSubmitted}
        />
      ) : loading || (isLoggedIn && paymentStatusLoading) ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !hasActiveAccess && !primaryPlan ? (
        <div className="rounded-2xl border p-8 text-center text-muted-foreground">
          <p>No plans available right now. Check back soon.</p>
        </div>
      ) : null}

      <PricingFaqSection />
    </main>
  );
}
