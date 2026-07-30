"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Crown,
  Loader2,
  Lock,
  Shield,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitSubscriptionRequest } from "@/src/lib/api/subscription";
import { formatBdt, type PublicPricing } from "@/src/lib/api/pricing";
import { useCheckoutCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

const BKASH_SENDER_RE = /^01[3-9]\d{8}$/;
/** bKash TrxID is alphanumeric; length varies slightly by app version. */
const BKASH_TRX_RE = /^[A-Za-z0-9]{8,24}$/;
const EN_FACE = "font-sans tabular-nums";

function normalizeBkashNumber(raw: string): string {
  return raw.replace(/[\s\-]/g, "").trim();
}

function normalizeTransactionId(raw: string): string {
  return raw.replace(/\s+/g, "").trim().toUpperCase();
}

export function BkashCheckoutForm({
  pricing,
  onClose,
  onSubmitted,
}: {
  pricing: PublicPricing;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const copy = useCheckoutCopy();
  const { locale } = useUiLocale();
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const payableAmount = pricing.finalPriceBdt;
  const bkashNumber = pricing.bkashNumber.trim();
  const canSubmit =
    Boolean(bkashNumber) &&
    BKASH_SENDER_RE.test(normalizeBkashNumber(senderNumber)) &&
    BKASH_TRX_RE.test(normalizeTransactionId(transactionId)) &&
    !submitting;

  const handleCopy = async () => {
    if (!bkashNumber) return;
    try {
      await navigator.clipboard.writeText(bkashNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(copy.copyFailed);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!bkashNumber) {
      setError(copy.missingBkash);
      return;
    }

    const normalizedSender = normalizeBkashNumber(senderNumber);
    if (!BKASH_SENDER_RE.test(normalizedSender)) {
      setError(copy.invalidSender);
      return;
    }

    const normalizedTrx = normalizeTransactionId(transactionId);
    if (!BKASH_TRX_RE.test(normalizedTrx)) {
      setError(copy.invalidTrx);
      return;
    }

    setSubmitting(true);
    try {
      await submitSubscriptionRequest({
        planId: pricing.planId,
        paymentMethod: "BKASH",
        senderNumber: normalizedSender,
        transactionId: normalizedTrx,
        paidAmount: payableAmount,
      });
      onSubmitted();
    } catch (err: unknown) {
      const ax =
        err && typeof err === "object" && "response" in err
          ? (err as {
              response?: {
                status?: number;
                data?: {
                  message?: string;
                  errorSources?: { message?: string }[];
                };
              };
            })
          : null;
      const apiMessage =
        ax?.response?.data?.message ??
        ax?.response?.data?.errorSources?.[0]?.message ??
        null;

      // Already submitted / under review → treat as success (avoid scary false failure).
      const alreadySubmitted =
        ax?.response?.status === 409 &&
        typeof apiMessage === "string" &&
        (/under review/i.test(apiMessage) ||
          /already been used/i.test(apiMessage) ||
          /already have a payment/i.test(apiMessage));

      if (alreadySubmitted) {
        onSubmitted();
        return;
      }

      setError(
        apiMessage === "Validation Error"
          ? ax?.response?.data?.errorSources?.[0]?.message ?? copy.submitFailed
          : apiMessage ?? copy.submitFailed,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cn(locale === "bn" && "font-bengali")}
      lang={locale}
    >
      <div className="space-y-4 pb-[5.5rem] sm:space-y-5 sm:pb-2">
        {/* Status strip */}
        <div
          className="flex flex-col gap-1.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
          role="status"
        >
          <p className="flex items-start gap-2 text-[13px] font-semibold leading-snug text-emerald-900 dark:text-emerald-100 sm:items-center sm:text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300 sm:mt-0" />
            <span>{copy.statusLock}</span>
          </p>
          <p className="flex items-start gap-2 text-[13px] font-semibold leading-snug text-pink-900 dark:text-pink-100 sm:items-center sm:text-sm">
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-pink-600 dark:text-pink-300 sm:mt-0" />
            <span>{copy.statusNext}</span>
          </p>
        </div>

        {/* Urgency */}
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-400/15 to-amber-400/[0.04] px-3.5 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-950 dark:text-amber-100">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              {copy.urgencyEyebrow}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {copy.back}
            </button>
          </div>
          <h2 className="mt-2.5 text-balance text-[1.35rem] font-black leading-tight tracking-tight text-foreground sm:text-2xl">
            {copy.urgencyTitle}
          </h2>
          <p className="mt-2 text-pretty text-[14px] font-medium leading-relaxed text-foreground/80 sm:text-[15px]">
            {copy.urgencyBody}
          </p>

          <div className="mt-3.5 rounded-2xl border border-amber-500/30 bg-background/85 px-3.5 py-3">
            <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {copy.amountLabel}
            </p>
            <p
              className={cn(
                EN_FACE,
                "mt-1 text-center text-3xl font-black tracking-tight text-foreground sm:text-4xl",
              )}
            >
              {formatBdt(payableAmount)}
            </p>

            {pricing.regularPriceBdt > payableAmount ? (
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-amber-500/20 pt-3">
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {copy.regularPriceLabel}
                  </p>
                  <p
                    className={cn(
                      EN_FACE,
                      "mt-0.5 text-sm font-bold text-muted-foreground line-through decoration-rose-500/80",
                    )}
                  >
                    {formatBdt(pricing.regularPriceBdt)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                    {copy.founderPriceLabel}
                  </p>
                  <p
                    className={cn(
                      EN_FACE,
                      "mt-0.5 text-sm font-black text-emerald-700 dark:text-emerald-300",
                    )}
                  >
                    {formatBdt(payableAmount)}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-500/15 px-1 py-1 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                    {copy.youSaveLabel}
                  </p>
                  <p
                    className={cn(
                      EN_FACE,
                      "mt-0.5 text-sm font-black text-emerald-700 dark:text-emerald-300",
                    )}
                  >
                    {formatBdt(pricing.regularPriceBdt - payableAmount)}
                  </p>
                </div>
              </div>
            ) : null}

            {pricing.preOrderEnabled ? (
              <p className="mt-2 text-center text-xs font-medium text-amber-800 dark:text-amber-300">
                {copy.preOrderNote}
              </p>
            ) : null}
          </div>
        </div>

        {/* Steps */}
        <div className="rounded-2xl border border-border/70 bg-muted/25 px-3.5 py-4 sm:px-4">
          <h3 className="text-[15px] font-bold text-foreground sm:text-base">
            {copy.stepsTitle}
          </h3>
          <ol className="mt-3 space-y-2.5">
            {[copy.step1, copy.step2, copy.step3].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span
                  className={cn(
                    EN_FACE,
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black",
                    index === 2
                      ? "bg-pink-600 text-white"
                      : "bg-pink-500/15 text-pink-800 dark:text-pink-200",
                  )}
                >
                  {index + 1}
                </span>
                <p className="pt-1 text-[13px] font-medium leading-snug text-foreground/85 sm:text-sm">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* bKash number + copy */}
        <div className="rounded-2xl border border-pink-500/30 bg-pink-500/[0.06] p-3.5 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-500/15">
              <Smartphone className="h-5 w-5 text-pink-600" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {copy.bkashNumberLabel}
              </p>
              {bkashNumber ? (
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <p
                    className={cn(
                      EN_FACE,
                      "text-xl font-black tracking-wide text-foreground sm:text-2xl",
                    )}
                  >
                    {bkashNumber}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-xl border-pink-500/40 font-bold"
                    onClick={() => void handleCopy()}
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    {copied ? copy.copied : copy.copy}
                  </Button>
                </div>
              ) : (
                <p className="mt-1 text-sm text-pink-700 dark:text-pink-300">
                  {copy.numberSoon}
                </p>
              )}
              {pricing.paymentInstructions ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {pricing.paymentInstructions}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          id="bkash-checkout-form"
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-4 rounded-2xl border border-border/70 bg-card p-3.5 sm:p-5"
        >
          <div className="space-y-2">
            <Label htmlFor="senderNumber">{copy.senderLabel} *</Label>
            <Input
              id="senderNumber"
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              inputMode="numeric"
              autoComplete="tel"
              className={cn(EN_FACE, "h-12 rounded-xl text-base")}
              required
            />
            <p className="text-xs text-muted-foreground">{copy.senderHint}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionId">{copy.trxLabel} *</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder={copy.trxPlaceholder}
              autoComplete="off"
              spellCheck={false}
              className={cn(
                EN_FACE,
                "h-12 rounded-xl text-base font-mono uppercase tracking-wide",
              )}
              required
            />
            <p className="text-xs text-muted-foreground">{copy.trxHint}</p>
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="hidden h-14 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-base font-black text-white shadow-lg shadow-pink-500/30 hover:from-pink-400 hover:to-rose-500 sm:inline-flex"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {copy.submitting}
              </>
            ) : (
              copy.submit
            )}
          </Button>
        </form>

        <ul className="grid gap-2 sm:grid-cols-3">
          <li className="flex items-center gap-2 text-[12px] font-semibold text-foreground/85 sm:text-[13px]">
            <Shield className="h-3.5 w-3.5 shrink-0 text-pink-600" aria-hidden />
            {copy.perkSecure}
          </li>
          <li className="flex items-center gap-2 text-[12px] font-semibold text-foreground/85 sm:text-[13px]">
            <Lock className="h-3.5 w-3.5 shrink-0 text-pink-600" aria-hidden />
            {copy.perkManual}
          </li>
          <li className="flex items-center gap-2 text-[12px] font-semibold text-foreground/85 sm:text-[13px]">
            <Crown className="h-3.5 w-3.5 shrink-0 text-pink-600" aria-hidden />
            {copy.perkFounder}
          </li>
        </ul>

        <p className="flex items-start justify-center gap-2 px-1 text-center text-[11px] font-medium leading-relaxed text-muted-foreground sm:text-xs">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
          <span>{copy.trustBadge}</span>
        </p>
      </div>

      {/* Mobile sticky submit */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-pink-500/20 bg-background/95 px-3 pt-2.5 shadow-[0_-12px_40px_rgba(236,72,153,0.18)] backdrop-blur-xl sm:hidden pb-[max(0.65rem,env(safe-area-inset-bottom))]"
        role="region"
        aria-label={copy.stickySubmit}
      >
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
          <span>{copy.amountLabel}</span>
          <span className={cn(EN_FACE, "font-black text-foreground")}>
            {formatBdt(payableAmount)}
          </span>
        </div>
        <Button
          type="submit"
          form="bkash-checkout-form"
          disabled={!canSubmit}
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-[15px] font-black text-white shadow-md shadow-pink-500/30 hover:from-pink-400 hover:to-rose-500"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {copy.submitting}
            </>
          ) : (
            copy.stickySubmit
          )}
        </Button>
      </div>
    </div>
  );
}
