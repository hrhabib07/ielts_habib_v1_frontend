"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/src/auth/hooks";
import { useLoginSessionRecovery } from "@/src/auth/useLoginSessionRecovery";
import { AuthGamePanel } from "@/src/components/auth/AuthGamePanel";
import { AUTH_INPUT_CLASS, AUTH_LABEL_CLASS } from "@/src/components/auth/authStyles";
import {
  AuthMethodDivider,
  ContinueWithGoogleButton,
} from "@/src/components/auth/ContinueWithGoogleButton";
import { PhoneOtpAuthPanel } from "@/src/components/auth/PhoneOtpAuthPanel";
import { AuthErrorAlert } from "@/src/components/auth/AuthErrorAlert";
import { GamlishNavBrand } from "@/src/components/shared/GamlishNavBrand";
import { useGuestLandingLocaleState } from "@/src/hooks/useGuestLandingLocaleState";
import { AUTH_LOGIN_COPY } from "@/src/lib/auth-login-copy";
import { formatAuthQueryError } from "@/src/lib/auth-oauth-errors";
import { clearLogoutLock } from "@/src/lib/auth";
import { readAuthReturnPathFromSearch } from "@/src/lib/auth-redirects";
import { cn } from "@/lib/utils";

const DevQuickLogin =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () => import("@/src/components/dev/DevQuickLogin").then((m) => m.default),
        { ssr: false },
      )
    : () => null;

function LoginToolbar({ copy }: { copy: (typeof AUTH_LOGIN_COPY)["en"] }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-4 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <Link href="/" className="lg:hidden" aria-label="Gamlish home">
          <GamlishNavBrand showTagline={false} />
        </Link>
        <Link
          href="/"
          className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.backHome}
        </Link>
      </div>
    </header>
  );
}

export function LoginForm({ resetSuccess = false }: { resetSuccess?: boolean }) {
  const { handleLogin, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [showOtpLogin, setShowOtpLogin] = useState(false);
  const { locale } = useGuestLandingLocaleState();
  const copy = AUTH_LOGIN_COPY[locale];
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    clearLogoutLock();
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      setOauthError(formatAuthQueryError(err, locale));
    }
    setReturnTo(readAuthReturnPathFromSearch(params));
  }, [locale]);

  const recoveringSession = useLoginSessionRecovery();

  const registerHref = returnTo ? `/register?redirect=${encodeURIComponent(returnTo)}` : "/register";

  if (recoveringSession) {
    return (
      <div
        className={cn(
          "flex min-h-dvh w-full flex-col items-center justify-center gap-3 bg-background px-4 text-center",
          locale === "bn" && "font-bengali",
        )}
        lang={locale === "bn" ? "bn" : "en"}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden />
        <p className="text-base font-semibold text-slate-800">
          {locale === "bn" ? "আপনার সেশন ফিরিয়ে আনা হচ্ছে..." : "Restoring your session..."}
        </p>
      </div>
    );
  }

  const otpLoginLabel =
    locale === "bn" ? "পাসওয়ার্ড মনে নেই? SMS OTP দিয়ে লগইন করুন" : "Can't remember your password? Log in with SMS OTP";
  const otpHideLabel = locale === "bn" ? "পাসওয়ার্ড দিয়ে লগইন" : "Log in with password";

  return (
    <div
      className={cn("flex min-h-dvh w-full bg-background", locale === "bn" && "font-bengali")}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <AuthGamePanel locale={locale} />

      <div className="relative flex min-h-dvh min-w-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-10%,rgba(30,58,138,0.08),transparent_55%)]"
          aria-hidden
        />

        <LoginToolbar copy={copy} />

        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-14">
          <motion.div
            className="w-full max-w-[420px] space-y-5"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-3 text-center sm:text-left">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {copy.eyebrow}
              </p>
              <h1 className="text-balance text-[1.75rem] font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
                {copy.title}
              </h1>
              <p className="text-pretty text-[15px] font-medium leading-relaxed text-slate-700">{copy.subtitle}</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-[0_16px_48px_rgba(15,23,42,0.07)]">
              <div className="p-5 sm:p-6">
                {resetSuccess ? (
                  <div
                    className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900"
                    role="status"
                  >
                    {copy.resetSuccess}
                  </div>
                ) : null}

                {oauthError ? <AuthErrorAlert className="mb-4" message={oauthError} /> : null}

                <ContinueWithGoogleButton
                  returnTo={returnTo}
                  label={copy.googleCta}
                  tone="primary"
                  className={cn("h-13 rounded-2xl font-extrabold", locale === "bn" ? "text-[17px]" : "text-base")}
                />

                <div className="my-4">
                  <AuthMethodDivider label={copy.formDivider} />
                </div>

                <DevQuickLogin setEmail={setEmail} setPassword={setPassword} />

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin(email, password);
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className={AUTH_LABEL_CLASS}>
                      {copy.emailLabel}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="email"
                        type="text"
                        required
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={copy.emailPlaceholder}
                        className={AUTH_INPUT_CLASS}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="password" className={AUTH_LABEL_CLASS}>
                        {copy.passwordLabel}
                      </Label>
                      <Link href="/forgot-password" className="text-xs font-bold text-accent hover:underline">
                        {copy.forgotPassword}
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={copy.passwordPlaceholder}
                        className={AUTH_INPUT_CLASS}
                      />
                    </div>
                  </div>

                  {error ? <AuthErrorAlert message={error} /> : null}

                  <Button
                    type="submit"
                    variant="outline"
                    disabled={loading}
                    className="h-12 w-full rounded-2xl border-2 border-slate-300 text-[15px] font-bold text-slate-800"
                    size="lg"
                  >
                    {loading ? (
                      copy.submitting
                    ) : (
                      <>
                        {copy.submit}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-4">
                  {!showOtpLogin ? (
                    <button
                      type="button"
                      onClick={() => setShowOtpLogin(true)}
                      className="w-full text-center text-[13px] font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                    >
                      {otpLoginLabel}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-slate-800">
                          {locale === "bn" ? "SMS OTP লগইন" : "SMS OTP login"}
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowOtpLogin(false)}
                          className="text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
                        >
                          {otpHideLabel}
                        </button>
                      </div>
                      <PhoneOtpAuthPanel locale={locale} compact />
                    </div>
                  )}
                </div>

                <p className="mt-5 border-t border-border/50 pt-4 text-center text-sm">
                  <span className="text-slate-600">{copy.newPlayer} </span>
                  <Link href={registerHref} className="inline-flex items-center gap-1 font-bold text-accent hover:underline">
                    {copy.newPlayerCta}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
