"use client";

import { useState } from "react";
import { ArrowLeft, Check, Copy, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitSubscriptionRequest } from "@/src/lib/api/subscription";
import { formatBdt, type PublicPricing } from "@/src/lib/api/pricing";
import { brandStatus } from "@/src/lib/brand-theme";
import { cn } from "@/lib/utils";

export function BkashCheckoutForm({
  pricing,
  onClose,
  onSubmitted,
}: {
  pricing: PublicPricing;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [txId, setTxId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const payableAmount = pricing.finalPriceBdt;
  const bkashNumber = pricing.bkashNumber.trim();

  const handleCopy = async () => {
    if (!bkashNumber) return;
    try {
      await navigator.clipboard.writeText(bkashNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("নম্বর কপি করা যায়নি");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!txId.trim()) {
      setError("Transaction ID দিন");
      return;
    }
    if (!bkashNumber) {
      setError("bKash নম্বর এখনো সেট করা হয়নি। অ্যাডমিনের সাথে যোগাযোগ করুন।");
      return;
    }

    setSubmitting(true);
    try {
      await submitSubscriptionRequest({
        planId: pricing.planId,
        paymentMethod: "BKASH",
        transactionId: txId.trim(),
        senderNumber: senderNumber.trim() || undefined,
        paidAmount: payableAmount,
      });
      setSuccess(true);
      onSubmitted();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(message ?? "সাবমিট করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={cn("font-bengali rounded-3xl border p-8 text-center", brandStatus.success.card)}>
        <div className={cn("mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full", brandStatus.success.icon)}>
          <Check className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-foreground">পেমেন্ট সাবমিট হয়েছে</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          স্ট্যাটাস: <strong>Pending Verification</strong>. ভেরিফিকেশনের পর প্রি-অর্ডার কনফার্ম হবে।
          প্রিমিয়াম অ্যাক্সেস সাথে সাথে চালু হবে না
          {pricing.preOrderEnabled && pricing.accessStartsAt
            ? `. অ্যাক্সেস শুরু হবে ${new Date(pricing.accessStartsAt).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })} থেকে।`
            : "।"}
        </p>
      </div>
    );
  }

  return (
    <div className="font-bengali rounded-3xl border border-border/70 bg-card p-6 shadow-lg md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-foreground">bKash Send Money</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            পরিমাণ: <strong>{formatBdt(payableAmount)}</strong>
            {pricing.preOrderEnabled ? (
              <span className="mt-1 block text-xs font-medium text-amber-700 dark:text-amber-400">
                এটি আগস্ট প্রি-অর্ডার। অ্যাক্সেস সাথে সাথে পাবেন না।
              </span>
            ) : null}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose} className="rounded-xl">
          <ArrowLeft className="mr-1 h-4 w-4" />
          ফিরে যান
        </Button>
      </div>

      <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 dark:border-primary/30 dark:bg-primary/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">bKash নম্বর</p>
            {bkashNumber ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-lg font-black tracking-wide text-foreground">{bkashNumber}</p>
                <Button type="button" size="sm" variant="outline" className="h-8 rounded-lg" onClick={handleCopy}>
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  {copied ? "কপি হয়েছে" : "কপি"}
                </Button>
              </div>
            ) : (
              <p className="mt-1 text-sm text-primary">শীঘ্রই আপডেট করা হবে</p>
            )}
            {pricing.paymentInstructions ? (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {pricing.paymentInstructions}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="txId">Transaction ID *</Label>
          <Input
            id="txId"
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            placeholder="bKash TrxID"
            className="rounded-xl"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="senderNumber">আপনার bKash নম্বর</Label>
          <Input
            id="senderNumber"
            value={senderNumber}
            onChange={(e) => setSenderNumber(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="rounded-xl"
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" disabled={submitting} className="h-11 w-full rounded-2xl font-bold">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              সাবমিট হচ্ছে...
            </>
          ) : (
            "পেমেন্ট সাবমিট করুন"
          )}
        </Button>
      </form>
    </div>
  );
}
