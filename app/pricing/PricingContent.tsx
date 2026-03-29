"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2, Zap, ChevronDown, ChevronUp, Shield } from "lucide-react";
import {
  getPublicPlans,
  getFirst100PromoOffer,
  submitSubscriptionRequest,
  type SubscriptionPlan,
  type First100PromoOffer,
} from "@/src/lib/api/subscription";
import type { CurrentUser } from "@/src/lib/auth-server";

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
  first100PromoOffer: First100PromoOffer | null;
  onClose: () => void;
}

function computeDiscountAmount(
  basePrice: number,
  discountType: "PERCENT" | "FIXED" | undefined,
  discountValue: number | undefined,
): number {
  if (!discountType || discountValue == null) return 0;
  if (discountType === "PERCENT") return Math.round((basePrice * discountValue) / 100);
  return Math.min(basePrice, discountValue);
}

function PurchaseForm({ plan, first100PromoOffer, onClose }: PurchaseFormProps) {
  const [txId, setTxId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const basePrice = plan.discountPrice ?? plan.price;
  const first100Active =
    plan.module === "READING" &&
    first100PromoOffer?.enabled === true &&
    (first100PromoOffer.remainingUses ?? 0) > 0 &&
    typeof first100PromoOffer.code === "string" &&
    first100PromoOffer.code.trim() !== "";

  const discountAmount = first100Active
    ? computeDiscountAmount(
        basePrice,
        first100PromoOffer?.discountType,
        first100PromoOffer?.discountValue,
      )
    : 0;

  const payableAmount = Math.max(0, basePrice - discountAmount);
  const displayDurationDays =
    first100Active && first100PromoOffer?.durationOverrideDays
      ? first100PromoOffer.durationOverrideDays
      : plan.durationInDays;

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
        couponCode: first100Active ? first100PromoOffer?.code : undefined,
      });
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
          Your payment proof has been submitted. You will receive access within 24–48 hours
          after verification by our team.
        </p>
        <Button variant="outline" onClick={onClose}>
          Back to plans
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
          {formatDuration(displayDurationDays)} · {(plan.modulesIncluded ?? ["READING"]).join(", ")}
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground">Normal price: {plan.price.toLocaleString()} BDT</p>
          <p className="text-lg font-bold text-foreground">
            {paidAmount.toLocaleString()} BDT
            {first100Active && discountAmount > 0 && (
              <span className="ml-2 text-sm font-normal text-emerald-600">
                (Coupon user price)
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

        <div className="grid gap-4 sm:grid-cols-2">
          {first100Active && first100PromoOffer?.code && (
            <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-4 text-sm text-emerald-800">
              <p className="font-semibold">First 100 promo applied</p>
              <p className="mt-1 text-xs">
                Code: <span className="font-mono">{first100PromoOffer.code}</span>
              </p>
              <p className="mt-1 text-xs">
                Extended access: <span className="font-medium">{formatDuration(displayDurationDays)}</span>
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="paidAmount"
              className="text-sm font-medium text-foreground"
            >
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
              readOnly={first100Active}
            />
          </div>
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
  first100PromoOffer,
}: {
  plan: SubscriptionPlan;
  onPurchase: (plan: SubscriptionPlan) => void;
  isLoggedIn: boolean;
  first100PromoOffer: First100PromoOffer | null;
}) {
  const basePrice = plan.discountPrice ?? plan.price;
  const first100Active =
    plan.module === "READING" &&
    first100PromoOffer?.enabled === true &&
    (first100PromoOffer.remainingUses ?? 0) > 0 &&
    typeof first100PromoOffer.code === "string" &&
    first100PromoOffer.code.trim() !== "";

  const discountAmount = first100Active
    ? computeDiscountAmount(
        basePrice,
        first100PromoOffer?.discountType,
        first100PromoOffer?.discountValue,
      )
    : 0;

  const effectivePrice = Math.max(0, basePrice - discountAmount);
  const displayDurationDays =
    first100Active && first100PromoOffer?.durationOverrideDays
      ? first100PromoOffer.durationOverrideDays
      : plan.durationInDays;
  const normalDuration = formatDuration(plan.durationInDays);
  const couponDuration =
    first100Active && first100PromoOffer?.durationOverrideDays
      ? formatDuration(first100PromoOffer.durationOverrideDays)
      : null;
  const hasDiscount = effectivePrice < plan.price;
  const remainingPromoSeats = first100PromoOffer?.remainingUses ?? 0;
  const showUrgency = first100Active && remainingPromoSeats <= 15;
  const savedAmount = Math.max(0, plan.price - effectivePrice);

  return (
    <div className="rounded-2xl border bg-card p-8 flex flex-col max-w-md mx-auto w-full shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
        </div>
        {hasDiscount && (
          <span className="shrink-0 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
            Save {Math.round(((plan.price - effectivePrice) / plan.price) * 100)}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-foreground">
          {plan.price.toLocaleString()}{" "}
          <span className="text-lg font-normal text-muted-foreground">BDT</span>
        </p>
        {hasDiscount && (
          <div className="mt-2 rounded-lg border border-emerald-200/70 bg-emerald-50/60 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Coupon price unlocked
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-700">
              Your price: {effectivePrice.toLocaleString()} BDT (Save {savedAmount.toLocaleString()} BDT)
            </p>
          </div>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDuration(displayDurationDays)} access ·{" "}
          {plan.isWholePackage ? "All modules" : (plan.modulesIncluded ?? ["READING"]).join(", ")}
        </p>
        {couponDuration && (
          <p className="mt-2 text-sm text-emerald-700">
            Normal access: <span className="line-through decoration-2">{normalDuration}</span> ·
            Coupon access: <span className="font-semibold"> {couponDuration}</span>
          </p>
        )}
        {showUrgency && (
          <p className="mt-2 text-xs font-semibold text-rose-600">
            Hurry: only {remainingPromoSeats} promo seat{remainingPromoSeats > 1 ? "s" : ""} left.
          </p>
        )}
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
          <Button className="w-full gap-2" onClick={() => onPurchase(plan)}>
            <Zap className="h-4 w-4" />
            Get access
          </Button>
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
}

export function PricingContent({ initialUser }: PricingContentProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [first100PromoOffer, setFirst100PromoOffer] = useState<First100PromoOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const isLoggedIn = !!initialUser;

  useEffect(() => {
    Promise.all([getPublicPlans(), getFirst100PromoOffer("READING")])
      .then(([p, promo]) => {
        setPlans(p);
        setFirst100PromoOffer(promo);
      })
      .finally(() => setLoading(false));
  }, []);

  const faqs = [
    {
      q: "How do I get access after payment?",
      a: "After submitting your transaction ID, our team verifies it manually. You will receive access within 24–48 hours.",
    },
    {
      q: "Which payment methods are accepted?",
      a: "We currently accept bKash.",
    },
    {
      q: "Can I get a refund?",
      a: isLoggedIn
        ? "Purchase-related issues: contact support within 7 days. Separately, the Gamlish Score Guarantee™ may cover a 100% refund if you meet every eligibility rule—see your member guarantee page for the full checklist."
        : "Purchase-related issues: contact support within 7 days. After you register, the Score Guarantee™ page in your profile explains when a full refund may apply for eligible learners.",
    },
    {
      q: "What happens when my subscription expires?",
      a: "Your account remains but module access is restricted until you renew.",
    },
  ];

  return (
    <main className="mx-auto max-w-[900px] px-4 py-16 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Structured, affordable access to IELTS preparation. Simple pricing, no hidden fees.
        </p>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.05] via-card to-card p-6 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Gamlish Score Guarantee™
              </p>
              <p className="mt-1 font-semibold tracking-tight text-foreground text-lg">
                {isLoggedIn
                  ? "Your target band can be contractually backed"
                  : "We measure readiness—not guesswork"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {isLoggedIn
                  ? "Members who clear the Readiness Zone and every rule below may qualify for a 100% refund if the official exam does not match the band you trained for."
                  : "Create an account to access the full member guarantee policy and continue your path after checkout."}
              </p>
            </div>
          </div>
          <Button asChild variant={isLoggedIn ? "default" : "outline"} className="w-full shrink-0 sm:w-auto">
            <Link href={isLoggedIn ? "/profile/score-guarantee" : "/register"}>
              {isLoggedIn ? "Open member guarantee" : "Get started to view guarantee"}
            </Link>
          </Button>
        </div>
      </Card>

      {!selectedPlan && !loading && first100PromoOffer?.enabled && (first100PromoOffer.remainingUses ?? 0) > 0 && (
        <Card className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[#1e3a8a]/10 via-white to-emerald-50 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#1e3a8a]">
                {first100PromoOffer.usedCount === 0
                  ? "Be the first student of Gamblish"
                  : "Top 100 Students Deal"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {first100PromoOffer.usedCount === 0
                  ? "Lock 60% off + extended access for early subscribers."
                  : (first100PromoOffer.remainingUses ?? 0) <= 15
                    ? `Hurry: only ${first100PromoOffer.remainingUses} seat(s) left for the 60% discount.`
                    : `Only ${first100PromoOffer.remainingUses} seat(s) left for the 60% discount.`}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2 md:mt-0">
              <span className="shrink-0 rounded-full bg-[#1e3a8a]/10 px-3 py-1 text-xs font-semibold text-[#1e3a8a]">
                Promo: <span className="font-mono">{first100PromoOffer.code}</span>
              </span>
              <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {first100PromoOffer.discountType === "PERCENT"
                  ? `${first100PromoOffer.discountValue}% OFF`
                  : `Save ${first100PromoOffer.discountValue} BDT`}
              </span>
            </div>
          </div>
        </Card>
      )}

      {selectedPlan ? (
        <PurchaseForm
          plan={selectedPlan}
          first100PromoOffer={first100PromoOffer}
          onClose={() => setSelectedPlan(null)}
        />
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : plans.length === 0 ? (
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
              first100PromoOffer={first100PromoOffer}
            />
          ))}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Frequently asked questions</h2>
        <div className="divide-y rounded-xl border">
          {faqs.map((faq, i) => (
            <div key={i} className="px-5 py-4">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 text-left text-sm font-medium text-foreground"
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                {faq.q}
                {faqOpen === i ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
              {faqOpen === i && (
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
