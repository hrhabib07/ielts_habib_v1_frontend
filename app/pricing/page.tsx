"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2, Zap, ChevronDown, ChevronUp } from "lucide-react";
import {
  getPublicPlans,
  submitSubscriptionRequest,
  type SubscriptionPlan,
} from "@/src/lib/api/subscription";
import { getDecodedTokenClient } from "@/src/lib/auth";

function formatDuration(days: number): string {
  if (days % 365 === 0) return `${days / 365} year${days / 365 > 1 ? "s" : ""}`;
  if (days % 30 === 0) return `${days / 30} month${days / 30 > 1 ? "s" : ""}`;
  return `${days} days`;
}

interface PurchaseFormProps {
  plan: SubscriptionPlan;
  onClose: () => void;
}

function PurchaseForm({ plan, onClose }: PurchaseFormProps) {
  const [method, setMethod] = useState<"BKASH" | "BANK">("BKASH");
  const [txId, setTxId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectivePrice = plan.discountPrice ?? plan.price;

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
        paymentMethod: method,
        transactionId: txId.trim(),
        senderNumber: senderNumber.trim() || undefined,
        paidAmount: effectivePrice,
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
          {formatDuration(plan.durationInDays)} · {plan.modulesIncluded.join(", ")}
        </p>
        <p className="text-lg font-bold text-foreground mt-2">
          {effectivePrice.toLocaleString()} BDT
          {plan.discountPrice != null && (
            <span className="ml-2 text-sm font-normal line-through text-muted-foreground">
              {plan.price.toLocaleString()} BDT
            </span>
          )}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Payment instructions</p>
        <div className="rounded-lg border p-4 text-sm text-muted-foreground space-y-1">
          <p>
            <strong className="text-foreground">bKash:</strong> Send{" "}
            <strong className="text-foreground">{effectivePrice.toLocaleString()} BDT</strong> to{" "}
            <span className="font-mono">01XXXXXXXXXX</span> (merchant)
          </p>
          <p>
            <strong className="text-foreground">Bank:</strong> Contact us for bank details.
          </p>
          <p className="pt-1 text-xs">
            After sending, fill in the form below with your transaction ID.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Payment method</label>
          <div className="mt-1 flex gap-2">
            {(["BKASH", "BANK"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  method === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {m === "BKASH" ? "bKash" : "Bank Transfer"}
              </button>
            ))}
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

        {method === "BKASH" && (
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
        )}

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
}: {
  plan: SubscriptionPlan;
  onPurchase: (plan: SubscriptionPlan) => void;
}) {
  const isLoggedIn = !!getDecodedTokenClient();
  const effectivePrice = plan.discountPrice ?? plan.price;
  const hasDiscount = plan.discountPrice != null && plan.discountPrice < plan.price;

  return (
    <div className="rounded-xl border bg-card p-8 flex flex-col max-w-md mx-auto w-full">
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
          {effectivePrice.toLocaleString()}{" "}
          <span className="text-lg font-normal text-muted-foreground">BDT</span>
        </p>
        {hasDiscount && (
          <p className="text-sm text-muted-foreground line-through">
            {plan.price.toLocaleString()} BDT
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDuration(plan.durationInDays)} access ·{" "}
          {plan.isWholePackage ? "All modules" : plan.modulesIncluded.join(", ")}
        </p>
      </div>

      <ul className="mt-6 space-y-2 flex-1">
        {plan.modulesIncluded.map((mod) => (
          <li key={mod} className="flex items-center gap-2 text-sm text-foreground">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            {mod.charAt(0) + mod.slice(1).toLowerCase()} module access
          </li>
        ))}
        <li className="flex items-center gap-2 text-sm text-foreground">
          <Check className="h-4 w-4 text-green-500 shrink-0" />
          Level-based progression
        </li>
        <li className="flex items-center gap-2 text-sm text-foreground">
          <Check className="h-4 w-4 text-green-500 shrink-0" />
          Band tracking & analytics
        </li>
        <li className="flex items-center gap-2 text-sm text-foreground">
          <Check className="h-4 w-4 text-green-500 shrink-0" />
          Structured test attempts
        </li>
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

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    getPublicPlans()
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  const faqs = [
    {
      q: "How do I get access after payment?",
      a: "After submitting your transaction ID, our team verifies it manually. You will receive access within 24–48 hours.",
    },
    {
      q: "Which payment methods are accepted?",
      a: "We currently accept bKash and bank transfer.",
    },
    {
      q: "Can I get a refund?",
      a: "Please contact support within 7 days of purchase if you have any issues.",
    },
    {
      q: "What happens when my subscription expires?",
      a: "Your account remains but module access is restricted until you renew.",
    },
  ];

  return (
    <main className="mx-auto max-w-[900px] px-4 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Structured, affordable access to IELTS preparation. Simple pricing, no hidden fees.
        </p>
      </div>

      {/* Plans or purchase form */}
      {selectedPlan ? (
        <PurchaseForm plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
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
            <PlanCard key={plan._id} plan={plan} onPurchase={setSelectedPlan} />
          ))}
        </div>
      )}

      {/* FAQ */}
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
