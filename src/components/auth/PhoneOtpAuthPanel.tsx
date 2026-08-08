"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Lock, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPhoneOtp, verifyPhoneOtp, setPasswordRequest } from "@/src/auth/api";
import { updateProfile } from "@/src/lib/api/profile";
import { persistSessionToken } from "@/src/lib/auth-session-ready";
import {
  clearDemoSessionId,
  readDemoSessionId,
} from "@/src/lib/demo-session";
import { getStudentPostAuthHref } from "@/src/lib/auth-redirects";
import { cn } from "@/lib/utils";
import { trackFunnelEvent } from "@/src/lib/api/analytics";
import { DemoOtpWaitTheater } from "@/src/components/demo/DemoOtpWaitTheater";

type Locale = "en" | "bn";
type Step = "phone" | "otp" | "setup";

type Props = {
  locale: Locale;
  className?: string;
  /** When true, reads demo session id and prefers continuePath after verify. */
  attachDemoSession?: boolean;
  onSuccessNavigate?: () => void;
  /** Force post-auth href for students (e.g. /player after demo save). */
  forceReturnTo?: string;
  /** Hide the intro hint (used inside accordion panels). */
  compact?: boolean;
  /**
   * saveXp = outcome CTA for demo save screen
   * ("Save my XP" + tiny OTP subline). Login/register stay default.
   */
  ctaMode?: "default" | "saveXp";
};

function extractApiError(err: unknown): string | null {
  const ax =
    err && typeof err === "object" && "response" in err
      ? (err as {
          response?: {
            data?: { message?: string; errorSources?: { message?: string }[] };
          };
        })
      : null;
  return (
    ax?.response?.data?.message ??
    ax?.response?.data?.errorSources?.[0]?.message ??
    null
  );
}

function isPlaceholderDisplayName(name: string | null | undefined): boolean {
  if (!name?.trim()) return true;
  return /^Gamlish[_-]?\d+$/i.test(name.trim());
}

const COPY = {
  bn: {
    phoneLabel: "মোবাইল নম্বর",
    phonePlaceholder: "01XXXXXXXXX",
    sendOtp: "OTP পাঠান",
    sendOtpSaveXp: "আমার XP সেভ করো",
    sendOtpSaveXpHint: "মোবাইলে OTP যাবে",
    sending: "পাঠানো হচ্ছে…",
    otpLabel: "SMS কোড",
    otpPlaceholder: "6 অঙ্কের কোড",
    verify: "ভেরিফাই করুন",
    verifying: "চেক করা হচ্ছে…",
    resend: "আবার OTP পাঠান",
    changePhone: "নম্বর বদলান",
    hint: "মোবাইল OTP দিয়ে অ্যাকাউন্ট তৈরি করুন। তারপর নাম ও পাসওয়ার্ড সেট করুন।",
    sentTo: (masked: string) => `${masked} এ কোড পাঠানো হয়েছে`,
    waitResend: (s: number) => `${s} সেকেন্ড পর আবার পাঠাতে পারবেন`,
    setupTitle: "নাম ও পাসওয়ার্ড সেট করুন",
    setupBody:
      "নাম গেমে দেখাবে। পাসওয়ার্ড দিয়ে পরে ফোন ছাড়াও লগইন করতে পারবেন।",
    nameLabel: "নাম / nickname",
    namePlaceholder: "যেমন: রাফি, সুমাইয়া",
    passwordLabel: "পাসওয়ার্ড",
    passwordPlaceholder: "কমপক্ষে 6 অক্ষর",
    confirmLabel: "পাসওয়ার্ড নিশ্চিত করুন",
    confirmPlaceholder: "আবার পাসওয়ার্ড লিখুন",
    setupSubmit: "সেভ করে চালিয়ে যান",
    setupSaving: "সেভ হচ্ছে…",
    errName: "আপনার নাম লিখুন।",
    errPasswordShort: "পাসওয়ার্ড কমপক্ষে 6 অক্ষর হতে হবে।",
    errPasswordMismatch: "পাসওয়ার্ড দুইবার একই হতে হবে।",
  },
  en: {
    phoneLabel: "Mobile number",
    phonePlaceholder: "01XXXXXXXXX",
    sendOtp: "Send OTP",
    sendOtpSaveXp: "Save my XP",
    sendOtpSaveXpHint: "We'll text you an OTP",
    sending: "Sending…",
    otpLabel: "SMS code",
    otpPlaceholder: "6-digit code",
    verify: "Verify",
    verifying: "Verifying…",
    resend: "Resend OTP",
    changePhone: "Change number",
    hint: "Create your account with mobile OTP, then set your name and password.",
    sentTo: (masked: string) => `Code sent to ${masked}`,
    waitResend: (s: number) => `Resend available in ${s}s`,
    setupTitle: "Set your name and password",
    setupBody:
      "Your name shows in the game. Your password lets you log in later even without SMS.",
    nameLabel: "Name / nickname",
    namePlaceholder: "e.g. Rafi, Sumaiya",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 6 characters",
    confirmLabel: "Confirm password",
    confirmPlaceholder: "Type password again",
    setupSubmit: "Save and continue",
    setupSaving: "Saving…",
    errName: "Please enter your name.",
    errPasswordShort: "Password must be at least 6 characters.",
    errPasswordMismatch: "Passwords must match.",
  },
} as const;

export function PhoneOtpAuthPanel({
  locale,
  className,
  attachDemoSession = true,
  onSuccessNavigate,
  forceReturnTo,
  compact = false,
  ctaMode = "default",
}: Props) {
  const copy = COPY[locale];
  const isSaveXpCta = ctaMode === "saveXp";
  const phoneSubmitLabel = isSaveXpCta ? copy.sendOtpSaveXp : copy.sendOtp;
  const phoneSubmitHint = isSaveXpCta ? copy.sendOtpSaveXpHint : null;
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<Step>("phone");
  const [phoneMasked, setPhoneMasked] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [pendingHref, setPendingHref] = useState("/player");
  const [needsPassword, setNeedsPassword] = useState(true);

  const otpSentAtRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (attachDemoSession) {
      sessionIdRef.current = readDemoSessionId();
    }
  }, [attachDemoSession]);

  function track(event: Parameters<typeof trackFunnelEvent>[0]["event"], meta?: Record<string, unknown>) {
    void trackFunnelEvent({
      event,
      demoSessionId: sessionIdRef.current,
      screen: "demo_step_4_signup",
      step: 4,
      metadata: meta,
    });
  }

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const finishNavigate = useCallback(
    (href: string) => {
      onSuccessNavigate?.();
      window.location.href = href;
    },
    [onSuccessNavigate],
  );

  const sendOtp = useCallback(async () => {
    setLoading(true);
    setError(null);
    const isResend = step === "otp";
    track(isResend ? "phone_otp_resend_clicked" : "phone_otp_send_clicked");
    try {
      const res = await requestPhoneOtp(phone.trim());
      otpSentAtRef.current = Date.now();
      track("phone_otp_sent_success");
      setPhoneMasked(res.data.phoneMasked || res.data.phoneDisplay);
      setStep("otp");
      setResendIn(res.data.resendAfterSeconds || 60);
      setOtp("");
    } catch (err) {
      const errMsg = extractApiError(err) ?? "Could not send OTP. Try again.";
      track("phone_otp_sent_error", { error: errMsg });
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [phone, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const verify = useCallback(async () => {
    setLoading(true);
    setError(null);
    const deliveryMs = otpSentAtRef.current ? Date.now() - otpSentAtRef.current : null;
    try {
      const res = await verifyPhoneOtp({
        phone: phone.trim(),
        otp: otp.trim(),
        demoSessionId: attachDemoSession ? readDemoSessionId() : null,
      });
      const token = res.data.token;
      const role = res.data.user.role;
      const continuePath = res.data.continuePath;
      const isNewUser = Boolean(res.data.isNewUser);
      const hasPassword = Boolean(res.data.hasPassword);
      const currentName = res.data.user.displayName ?? null;

      track("phone_otp_verified_success", {
        deliveryMs: deliveryMs ?? undefined,
        isNewUser,
      });

      if (!token) {
        track("phone_otp_verified_error", { error: "missing_token" });
        setError(
          locale === "bn"
            ? "লগইন টোকেন পাওয়া যায়নি। আবার OTP দিন।"
            : "Login token missing. Please verify OTP again.",
        );
        return;
      }

      const persisted = await persistSessionToken(token);
      if (!persisted.ok) {
        track("phone_session_sync_failed", {
          code: persisted.code,
          isNewUser,
        });
        setError(
          locale === "bn"
            ? "সেশন সেভ হয়নি। নেটওয়ার্ক চেক করে আবার ভেরিফাই করুন  -  তারপরই পেমেন্ট সাবমিট করুন।"
            : "Could not save your session. Check your network and verify OTP again before paying.",
        );
        return;
      }
      track("phone_session_sync_success", { isNewUser });

      if (continuePath) clearDemoSessionId();

      if (role === "ADMIN") {
        finishNavigate("/dashboard/admin");
        return;
      }
      if (role === "INSTRUCTOR") {
        finishNavigate("/dashboard/instructor");
        return;
      }

      const href =
        forceReturnTo ||
        continuePath ||
        getStudentPostAuthHref("/player");
      setPendingHref(href);

      const needsName = isNewUser || isPlaceholderDisplayName(currentName);
      const needsPw = !hasPassword;
      if (needsName || needsPw) {
        setNeedsPassword(needsPw);
        setDisplayName(needsName ? "" : currentName?.trim() || "");
        setPassword("");
        setConfirmPassword("");
        setStep("setup");
        return;
      }

      finishNavigate(href);
    } catch (err) {
      const errMsg = extractApiError(err) ?? "Invalid or expired OTP.";
      track("phone_otp_verified_error", { error: errMsg });
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [
    attachDemoSession,
    finishNavigate,
    forceReturnTo,
    locale,
    otp,
    phone,
  ]);

  const saveSetupAndGo = useCallback(async () => {
    const name = displayName.trim();
    if (name.length < 1) {
      setError(copy.errName);
      return;
    }
    if (needsPassword) {
      if (password.length < 6) {
        setError(copy.errPasswordShort);
        return;
      }
      if (password !== confirmPassword) {
        setError(copy.errPasswordMismatch);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      await updateProfile({ displayName: name.slice(0, 80) });
      if (needsPassword) {
        await setPasswordRequest(password);
      }
      track("phone_setup_completed");
      finishNavigate(pendingHref);
    } catch (err) {
      setError(
        extractApiError(err) ??
          (locale === "bn"
            ? "সেভ করা যায়নি। আবার চেষ্টা করুন।"
            : "Could not save. Try again."),
      );
    } finally {
      setLoading(false);
    }
  }, [
    confirmPassword,
    copy.errName,
    copy.errPasswordMismatch,
    copy.errPasswordShort,
    displayName,
    finishNavigate,
    locale,
    needsPassword,
    password,
    pendingHref,
  ]);

  return (
    <div className={cn("space-y-3", className)}>
      {!compact && step !== "setup" ? (
        <p className="text-[12px] font-medium leading-snug text-muted-foreground">
          {copy.hint}
        </p>
      ) : null}

      {step === "phone" ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void sendOtp();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="phone-otp" className="text-sm font-medium">
              {copy.phoneLabel}
            </Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone-otp"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={copy.phonePlaceholder}
                className="h-11 rounded-xl border-border/80 bg-background pl-11 font-sans tabular-nums"
              />
            </div>
          </div>

          {error ? (
            <div
              className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={loading || phone.trim().length < 10}
            className={cn(
              "h-auto min-h-11 w-full rounded-xl text-[15px] font-semibold",
              phoneSubmitHint ? "flex-col gap-0.5 py-2.5" : "",
            )}
            size="lg"
          >
            {loading ? (
              copy.sending
            ) : (
              <>
                <span className="inline-flex items-center">
                  {phoneSubmitLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
                {phoneSubmitHint ? (
                  <span className="text-[10px] font-medium leading-none opacity-80">
                    {phoneSubmitHint}
                  </span>
                ) : null}
              </>
            )}
          </Button>
        </form>
      ) : null}

      {step === "otp" ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void verify();
          }}
        >
          {isSaveXpCta ? <DemoOtpWaitTheater locale={locale} /> : null}

          <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-foreground/80">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
            {copy.sentTo(phoneMasked)}
          </p>

          <div className="space-y-2">
            <Label htmlFor="sms-otp" className="text-sm font-medium">
              {copy.otpLabel}
            </Label>
            <Input
              id="sms-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              onFocus={() => {
                const deliveryMs = otpSentAtRef.current ? Date.now() - otpSentAtRef.current : null;
                track("phone_otp_field_focused", { deliveryMs: deliveryMs ?? undefined });
              }}
              placeholder={copy.otpPlaceholder}
              className="h-11 rounded-xl border-border/80 bg-background text-center font-sans text-lg tracking-[0.35em] tabular-nums"
            />
          </div>

          {error ? (
            <div
              className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={loading || otp.length < 6}
            className="h-11 w-full rounded-xl text-[15px] font-semibold"
            size="lg"
          >
            {loading ? copy.verifying : copy.verify}
          </Button>

          <div className="flex items-center justify-between gap-2 text-[12px]">
            <button
              type="button"
              className="font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError(null);
              }}
            >
              {copy.changePhone}
            </button>
            <button
              type="button"
              disabled={loading || resendIn > 0}
              className="font-semibold text-primary disabled:opacity-50"
              onClick={() => void sendOtp()}
            >
              {resendIn > 0 ? copy.waitResend(resendIn) : copy.resend}
            </button>
          </div>
        </form>
      ) : null}

      {step === "setup" ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void saveSetupAndGo();
          }}
        >
          <div className="space-y-1">
            <p className="text-[15px] font-bold leading-snug text-foreground">
              {copy.setupTitle}
            </p>
            <p className="text-[12px] font-medium leading-snug text-muted-foreground">
              {copy.setupBody}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-name-otp" className="text-sm font-medium">
              {copy.nameLabel}
            </Label>
            <div className="relative">
              <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="display-name-otp"
                type="text"
                autoComplete="nickname"
                autoFocus
                required
                maxLength={80}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={copy.namePlaceholder}
                className="h-11 rounded-xl border-border/80 bg-background pl-11"
              />
            </div>
          </div>

          {needsPassword ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone-password" className="text-sm font-medium">
                  {copy.passwordLabel}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={copy.passwordPlaceholder}
                    className="h-11 rounded-xl border-border/80 bg-background pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone-password-confirm"
                  className="text-sm font-medium"
                >
                  {copy.confirmLabel}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={copy.confirmPlaceholder}
                    className="h-11 rounded-xl border-border/80 bg-background pl-11"
                  />
                </div>
              </div>
            </>
          ) : null}

          {error ? (
            <div
              className="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={
              loading ||
              displayName.trim().length < 1 ||
              (needsPassword &&
                (password.length < 6 || confirmPassword.length < 6))
            }
            className="h-11 w-full rounded-xl text-[15px] font-semibold"
            size="lg"
          >
            {loading ? copy.setupSaving : copy.setupSubmit}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
