"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPhoneOtp, verifyPhoneOtp } from "@/src/auth/api";
import { submitSubscriptionRequest } from "@/src/lib/api/subscription";
import { updateProfile } from "@/src/lib/api/profile";
import { formatBdt, type PublicPricing } from "@/src/lib/api/pricing";
import { purchaseOfferCompareLine } from "@/src/lib/purchase-offer-copy";
import { DoubleDurationUrgency } from "@/src/components/pricing/DoubleDurationUrgency";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { useCheckoutCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { getAccessToken } from "@/src/lib/auth";
import {
  persistSessionToken,
  waitForClientAuthReady,
} from "@/src/lib/auth-session-ready";
import { trackFunnelEvent } from "@/src/lib/api/analytics";
import { getOrCreateVisitorId } from "@/src/lib/analytics-visitor";
import { trackInitiateCheckout } from "@/src/lib/meta-pixel";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { cn } from "@/lib/utils";

const BKASH_SENDER_RE = /^01[3-9]\d{8}$/;
const PHONE_RE = /^01[3-9]\d{8}$/;
/** bKash TrxID is alphanumeric; length varies slightly by app version. */
const BKASH_TRX_RE = /^[A-Za-z0-9]{8,24}$/;
const EN_FACE = "font-sans tabular-nums";

function normalizeBkashNumber(raw: string): string {
  return raw.replace(/[\s\-]/g, "").trim();
}

function normalizeTransactionId(raw: string): string {
  return raw.replace(/\s+/g, "").trim().toUpperCase();
}

function readApiError(err: unknown): {
  status?: number;
  message: string | null;
  code: string | null;
  isNetwork: boolean;
} {
  if (!err || typeof err !== "object") {
    return { message: null, code: null, isNetwork: false };
  }

  const ax = err as {
    message?: string;
    code?: string;
    response?: {
      status?: number;
      data?: {
        message?: string;
        code?: string;
        errorSources?: { message?: string }[];
      };
    };
  };

  const isNetwork =
    !ax.response &&
    (ax.code === "ERR_NETWORK" ||
      ax.code === "ECONNABORTED" ||
      /network/i.test(ax.message ?? ""));

  const apiMessage =
    ax.response?.data?.message ??
    ax.response?.data?.errorSources?.[0]?.message ??
    null;

  return {
    status: ax.response?.status,
    message: typeof apiMessage === "string" ? apiMessage : null,
    code:
      typeof ax.response?.data?.code === "string"
        ? ax.response.data.code
        : null,
    isNetwork,
  };
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
  const { profile, subscription } = useStudentSession({
    profile: true,
    subscription: true,
  });
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
  /** Existing session (logged-in buyer). Guests verify phone on this page instead. */
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);

  const authProviders = profile?.authProviders ?? [];
  const isPhoneUser =
    authProviders.includes("phone") || Boolean(profile?.phoneVerified);
  const paymentTrackMeta = () => ({
    authProviders,
    isPhoneUser,
    phoneVerified: phoneVerified || Boolean(profile?.phoneVerified),
    hasBearer: Boolean(getAccessToken()),
    guestCheckout: !hasExistingSession,
    devicePath: typeof window !== "undefined" ? window.location.pathname : "/checkout",
  });

  useEffect(() => {
    let cancelled = false;
    setSessionChecking(true);
    void (async () => {
      const token = await waitForClientAuthReady({ timeoutMs: 2_500 });
      if (cancelled) return;
      setHasExistingSession(Boolean(token));
      if (token) setPhoneVerified(true);
      setSessionChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const payableAmount = pricing.finalPriceBdt;
  const bkashNumber = pricing.bkashNumber.trim();
  const paymentValid =
    Boolean(bkashNumber) &&
    BKASH_SENDER_RE.test(normalizeBkashNumber(senderNumber)) &&
    BKASH_TRX_RE.test(normalizeTransactionId(transactionId));
  const guestReady =
    phoneVerified &&
    displayName.trim().length >= 1 &&
    (hasExistingSession || Boolean(getAccessToken()));
  const canSubmit =
    !sessionChecking &&
    paymentValid &&
    (hasExistingSession || guestReady) &&
    !submitting &&
    !otpBusy;

  const handleCopy = async () => {
    if (!bkashNumber) return;
    try {
      await navigator.clipboard.writeText(bkashNumber);
      setCopied(true);
      setCopyConfirmOpen(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError(copy.copyFailed);
    }
  };

  const sendOtp = useCallback(async () => {
    setError(null);
    const normalized = normalizeBkashNumber(phone);
    if (!PHONE_RE.test(normalized)) {
      setError(copy.invalidPhone);
      return;
    }
    setOtpBusy(true);
    try {
      const res = await requestPhoneOtp(normalized);
      setPhone(normalized);
      setOtpSent(true);
      setOtp("");
      setPhoneVerified(false);
      setResendIn(res.data.resendAfterSeconds || 60);
      void trackFunnelEvent({
        event: "phone_otp_sent_success",
        path: "/checkout",
        screen: "bkash_checkout",
        metadata: paymentTrackMeta(),
      });
    } catch (err) {
      const { message } = readApiError(err);
      void trackFunnelEvent({
        event: "phone_otp_sent_error",
        path: "/checkout",
        screen: "bkash_checkout",
        metadata: { ...paymentTrackMeta(), error: message?.slice(0, 120) ?? null },
      });
      setError(message ?? copy.submitFailed);
    } finally {
      setOtpBusy(false);
    }
  }, [phone, copy.invalidPhone, copy.submitFailed]); // eslint-disable-line react-hooks/exhaustive-deps

  const verifyOtp = useCallback(async () => {
    setError(null);
    const normalized = normalizeBkashNumber(phone);
    if (!PHONE_RE.test(normalized)) {
      setError(copy.invalidPhone);
      return;
    }
    if (otp.trim().length < 4) {
      setError(copy.otpHint);
      return;
    }
    setOtpBusy(true);
    try {
      const res = await verifyPhoneOtp({
        phone: normalized,
        otp: otp.trim(),
      });
      const token = res.data.token;
      if (!token) {
        setError(copy.sessionExpired);
        return;
      }
      const persisted = await persistSessionToken(token);
      if (!persisted.ok) {
        void trackFunnelEvent({
          event: "phone_session_sync_failed",
          path: "/checkout",
          screen: "bkash_checkout",
          metadata: { ...paymentTrackMeta(), code: persisted.code ?? null },
        });
        setError(copy.sessionExpired);
        return;
      }
      if (res.data.isNewUser) {
        const { fireCompleteRegistration } = await import("@/src/lib/meta-registration");
        await fireCompleteRegistration(res.data.metaCompleteRegistrationEventId);
      }
      setPhoneVerified(true);
      void trackFunnelEvent({
        event: "phone_otp_verified_success",
        path: "/checkout",
        screen: "bkash_checkout",
        metadata: {
          ...paymentTrackMeta(),
          isNewUser: Boolean(res.data.isNewUser),
        },
      });
    } catch (err) {
      const { message } = readApiError(err);
      void trackFunnelEvent({
        event: "phone_otp_verified_error",
        path: "/checkout",
        screen: "bkash_checkout",
        metadata: { ...paymentTrackMeta(), error: message?.slice(0, 120) ?? null },
      });
      setError(message ?? copy.submitFailed);
    } finally {
      setOtpBusy(false);
    }
  }, [phone, otp, copy.invalidPhone, copy.otpHint, copy.sessionExpired, copy.submitFailed]); // eslint-disable-line react-hooks/exhaustive-deps

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

    if (!hasExistingSession) {
      if (!phoneVerified || !getAccessToken()) {
        setError(copy.otpRequired);
        return;
      }
      if (displayName.trim().length < 1) {
        setError(copy.invalidName);
        return;
      }
    }

    setSubmitting(true);
    void trackFunnelEvent({
      event: "payment_submit_clicked",
      path: "/checkout",
      screen: "bkash_checkout",
      metadata: {
        ...paymentTrackMeta(),
        trxLength: normalizedTrx.length,
      },
    });

    try {
      const token = await waitForClientAuthReady({ timeoutMs: 8_000 });
      if (!token) {
        void trackFunnelEvent({
          event: "payment_submit_error",
          path: "/checkout",
          screen: "bkash_checkout",
          metadata: {
            ...paymentTrackMeta(),
            errorCode: "NO_SESSION",
            status: 401,
          },
        });
        setError(copy.otpRequired);
        return;
      }

      if (!hasExistingSession && displayName.trim()) {
        try {
          await updateProfile({ displayName: displayName.trim().slice(0, 80) });
        } catch {
          // Name is best-effort; payment submit still proceeds.
        }
      }

      const submitOnce = () =>
        submitSubscriptionRequest({
          planId: pricing.planId,
          paymentMethod: "BKASH",
          senderNumber: normalizedSender,
          transactionId: normalizedTrx,
          paidAmount: payableAmount,
          visitorId: getOrCreateVisitorId(),
        });

      let created: { _id?: string } | null = null;
      try {
        created = await submitOnce();
      } catch (firstErr: unknown) {
        const first = readApiError(firstErr);
        if (
          first.isNetwork ||
          first.status === 401 ||
          first.status === 502 ||
          first.status === 503
        ) {
          await waitForClientAuthReady({ timeoutMs: 5_000 });
          created = await submitOnce();
        } else {
          throw firstErr;
        }
      }
      trackInitiateCheckout({
        value: payableAmount,
        eventId: created?._id,
        contentName:
          pricing.durationDays === 90
            ? "Gamlish 90 days"
            : `Gamlish ${pricing.durationDays} days`,
      });
      void trackFunnelEvent({
        event: "payment_submit_success",
        path: "/checkout",
        screen: "bkash_checkout",
        metadata: {
          ...paymentTrackMeta(),
          hasBearer: true,
        },
      });
      onSubmitted();
    } catch (err: unknown) {
      const { status, message: apiMessage, code: apiCode, isNetwork } =
        readApiError(err);

      const alreadySubmitted =
        status === 409 &&
        typeof apiMessage === "string" &&
        (/under review/i.test(apiMessage) ||
          /already been used/i.test(apiMessage) ||
          /already have a payment/i.test(apiMessage));

      if (alreadySubmitted) {
        void trackFunnelEvent({
          event: "payment_submit_success",
          path: "/checkout",
          screen: "bkash_checkout",
          metadata: {
            ...paymentTrackMeta(),
            idempotent: true,
            status: 409,
          },
        });
        onSubmitted();
        return;
      }

      const errorCode = isNetwork
        ? "NETWORK"
        : apiCode
          ? apiCode
          : status === 401 || status === 403
            ? "AUTH"
            : status === 429
              ? "RATE_LIMIT"
              : status
                ? `HTTP_${status}`
                : "UNKNOWN";

      void trackFunnelEvent({
        event: "payment_submit_error",
        path: "/checkout",
        screen: "bkash_checkout",
        metadata: {
          ...paymentTrackMeta(),
          errorCode,
          status: status ?? null,
          apiMessage: apiMessage?.slice(0, 180) ?? null,
          isNetwork,
        },
      });

      if (status === 401 || status === 403) {
        setError(copy.otpRequired);
        setPhoneVerified(false);
        return;
      }

      if (isNetwork) {
        setError(copy.networkError);
        return;
      }

      if (apiMessage && /too many subscription requests/i.test(apiMessage)) {
        setError(
          locale === "bn"
            ? "অনেকবার চেষ্টা করা হয়েছে। 15 মিনিট পর আবার সাবমিট করুন।"
            : apiMessage,
        );
        return;
      }

      setError(
        apiMessage === "Validation Error"
          ? (err as { response?: { data?: { errorSources?: { message?: string }[] } } })
              ?.response?.data?.errorSources?.[0]?.message ?? copy.submitFailed
          : apiMessage ?? copy.submitFailed,
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (subscription?.status === "ACTIVE") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-6 text-center">
        <p className="text-lg font-bold text-foreground">
          {locale === "bn" ? "আপনি ইতিমধ্যে পেমেন্ট করেছেন।" : "You already have an active payment."}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {locale === "bn"
            ? "এই পেমেন্ট ফর্ম আর দেখানো হবে না।"
            : "This payment form will not be shown again."}
        </p>
        <Button asChild className="mt-4 rounded-full">
          <Link href="/player">{locale === "bn" ? "লেভেল খুলুন" : "Open levels"}</Link>
        </Button>
      </div>
    );
  }

  const bn = locale === "bn";
  const identityStep = hasExistingSession ? null : 2;
  const paymentStep = hasExistingSession ? 2 : 3;

  return (
    <div className={cn(bn && "font-bengali")} lang={locale}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {bn ? "প্রাইসিং" : "Pricing"}
        </button>
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          {bn ? "নিরাপদ চেকআউট" : "Secure checkout"}
        </p>
      </div>

      <div className="space-y-5 pb-24 sm:pb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
            {bn ? "পেমেন্ট সম্পন্ন করুন" : "Complete payment"}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {bn ? "৩টি ধাপ। প্রায় ২ মিনিট।" : "3 steps. About 2 minutes."}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-4 text-center dark:bg-slate-800/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {bn ? "পে করতে হবে" : "Amount to pay"}
          </p>
          <p className={cn(EN_FACE, "mt-1 text-4xl font-black text-slate-900 dark:text-slate-50")}>
            {formatBdt(payableAmount)}
          </p>
          {pricing.regularPriceBdt > payableAmount ? (
            <p className="mt-1 text-sm text-slate-500">
              <span className="line-through">{formatBdt(pricing.regularPriceBdt)}</span>
            </p>
          ) : null}
          <p className="mt-2 text-sm font-semibold text-sky-800 dark:text-sky-300">
            {purchaseOfferCompareLine(bn, pricing.durationDays)}
          </p>
          <DoubleDurationUrgency
            variant="compact"
            showBuy={false}
            className="mt-3 text-left"
          />
        </div>

        <div className="space-y-3">
          <StepLabel n={1} label={bn ? "bKash-এ টাকা পাঠান" : "Send money on bKash"} />
          <ol className="space-y-1.5 pl-1 text-sm text-slate-700 dark:text-slate-200">
            <li>
              1.{" "}
              {bn ? "bKash অ্যাপ খুলুন → " : "Open bKash → "}
              <span className="rounded-md bg-pink-100 px-1.5 py-0.5 font-bold text-pink-700 dark:bg-pink-500/20 dark:text-pink-200">
                Send Money
              </span>
            </li>
            <li>2. {bn ? "নিচের নম্বরে পাঠান" : "Send to this number"}</li>
            <li>3. {bn ? "TrxID সেভ রাখুন" : "Save the TrxID"}</li>
          </ol>
          <div className="flex items-center gap-2 rounded-xl border border-pink-200 bg-pink-50/80 p-3 dark:border-pink-500/30 dark:bg-pink-500/10">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-pink-700 dark:text-pink-300">
                bKash
              </p>
              {bkashNumber ? (
                <p className={cn(EN_FACE, "truncate text-lg font-bold tracking-wide text-slate-900 dark:text-slate-50")}>
                  {bkashNumber}
                </p>
              ) : (
                <p className="text-sm text-pink-700">{copy.numberSoon}</p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!bkashNumber}
              onClick={() => void handleCopy()}
              className="shrink-0 border-pink-300 bg-white dark:border-pink-500/40"
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              {copied ? copy.copied : copy.copy}
            </Button>
          </div>
        </div>

        <form id="bkash-checkout-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          {!hasExistingSession ? (
            <div className="space-y-3">
              <StepLabel n={identityStep!} label={bn ? "আপনার পরিচয় (OTP)" : "Your identity (OTP)"} />
              {sessionChecking ? (
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {copy.sessionPreparing}
                </p>
              ) : phoneVerified ? (
                <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {copy.phoneVerified}
                </p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="checkoutName">{copy.nameLabel} *</Label>
                    <Input
                      id="checkoutName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="mt-1.5 h-12 rounded-xl"
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkoutPhone">{copy.phoneLabel} *</Label>
                    <Input
                      id="checkoutPhone"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setPhoneVerified(false);
                        setOtpSent(false);
                      }}
                      className={cn(EN_FACE, "mt-1.5 h-12 rounded-xl")}
                      placeholder="01XXXXXXXXX"
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                  </div>
                  {otpSent ? (
                    <div className="flex gap-2">
                      <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="OTP"
                        className={cn(EN_FACE, "h-12 rounded-xl tracking-widest")}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                      <Button
                        type="button"
                        onClick={() => void verifyOtp()}
                        disabled={otpBusy || otp.trim().length < 4}
                        className="h-12 shrink-0 rounded-xl"
                      >
                        {otpBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.verifyOtp}
                      </Button>
                    </div>
                  ) : null}
                  <Button
                    type="button"
                    variant={otpSent ? "outline" : "default"}
                    onClick={() => void sendOtp()}
                    disabled={otpBusy || resendIn > 0}
                    className="h-12 w-full rounded-xl font-bold"
                  >
                    {otpBusy && !otpSent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {otpSent
                      ? resendIn > 0
                        ? `${copy.resendOtp} (${resendIn})`
                        : copy.resendOtp
                      : copy.sendOtp}
                  </Button>
                </div>
              )}
            </div>
          ) : null}

          <div className="space-y-3">
            <StepLabel n={paymentStep} label={bn ? "পেমেন্ট ডিটেইলস" : "Payment details"} />
            <div>
              <Label htmlFor="senderNumber">{copy.senderLabel} *</Label>
              <Input
                id="senderNumber"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className={cn(EN_FACE, "mt-1.5 h-12 rounded-xl")}
                placeholder="01XXXXXXXXX"
                inputMode="numeric"
                autoComplete="tel"
                required
              />
            </div>
            <div>
              <Label htmlFor="transactionId">{copy.trxLabel} *</Label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className={cn(EN_FACE, "mt-1.5 h-12 rounded-xl font-mono uppercase tracking-wide")}
                placeholder={copy.trxPlaceholder}
                autoComplete="off"
                spellCheck={false}
                required
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              LANDING_CTA_CLASS,
              "hidden h-12 w-full rounded-xl text-base font-bold text-white sm:inline-flex",
            )}
          >
            {submitting || sessionChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {sessionChecking ? copy.sessionPreparing : copy.submitting}
              </>
            ) : (
              copy.submit
            )}
          </Button>
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-3 pt-2.5 backdrop-blur sm:hidden pb-[max(0.65rem,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
          <span>{copy.amountLabel}</span>
          <span className={cn(EN_FACE, "font-black text-foreground")}>{formatBdt(payableAmount)}</span>
        </div>
        <Button
          type="submit"
          form="bkash-checkout-form"
          disabled={!canSubmit}
          className={cn(LANDING_CTA_CLASS, "h-12 w-full rounded-xl text-[15px] font-black text-white")}
        >
          {submitting || sessionChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {sessionChecking ? copy.sessionPreparing : copy.submitting}
            </>
          ) : (
            copy.stickySubmit
          )}
        </Button>
      </div>

      {copyConfirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bkash-copy-confirm-title"
          onClick={() => setCopyConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-pink-200 bg-white p-5 shadow-xl dark:border-pink-500/30 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-6 w-6" strokeWidth={3} />
            </div>
            <h3
              id="bkash-copy-confirm-title"
              className="mt-3 text-center text-lg font-black text-slate-900 dark:text-slate-50"
            >
              {bn ? "নম্বর কপি হয়েছে" : "Number copied"}
            </h3>
            <p className={cn(EN_FACE, "mt-2 text-center text-base font-bold tracking-wide text-slate-900 dark:text-slate-50")}>
              {bkashNumber}
            </p>
            <p className="mt-3 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {bn ? "এখন bKash অ্যাপে " : "Open bKash "}
              <span className="rounded-md bg-pink-100 px-1.5 py-0.5 font-bold text-pink-700 dark:bg-pink-500/20 dark:text-pink-200">
                Send Money
              </span>{" "}
              {bn ? "খুলে এই নম্বরে টাকা পাঠান।" : "and send to this number."}
            </p>
            <Button
              type="button"
              className={cn(LANDING_CTA_CLASS, "mt-5 h-11 w-full rounded-xl font-bold text-white")}
              onClick={() => setCopyConfirmOpen(false)}
            >
              {bn ? "বুঝেছি" : "Got it"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-xs font-black text-white">
        {n}
      </span>
      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">{label}</h2>
    </div>
  );
}
