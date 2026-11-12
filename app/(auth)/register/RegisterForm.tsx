"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Mail, Sparkles, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/src/auth/hooks";
import { GamlishNavBrand } from "@/src/components/shared/GamlishNavBrand";
import { AuthGamePanel } from "@/src/components/auth/AuthGamePanel";
import {
  AuthMethodDivider,
  ContinueWithGoogleButton,
} from "@/src/components/auth/ContinueWithGoogleButton";
import { PhoneOtpAuthPanel } from "@/src/components/auth/PhoneOtpAuthPanel";
import { AuthErrorAlert } from "@/src/components/auth/AuthErrorAlert";
import { PaidLearnersProofBar } from "@/src/components/pricing/PaidLearnersProofChip";
import { guestPath, useGuestWins } from "@/src/features/guest/guestPath";
import { useGuestLandingLocaleState } from "@/src/hooks/useGuestLandingLocaleState";
import { AUTH_REGISTER_COPY } from "@/src/lib/auth-register-copy";
import { readAuthReturnPathFromSearch } from "@/src/lib/auth-redirects";
import { writeDemoSessionId } from "@/src/lib/demo-session";
import { AUTH_INPUT_CLASS, AUTH_LABEL_CLASS } from "@/src/components/auth/authStyles";
import { cn } from "@/lib/utils";

function RegisterToolbar({ copy }: { copy: (typeof AUTH_REGISTER_COPY)["en"] }) {
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

export function RegisterForm() {
  const { handleRegister, loading, error } = useRegister();
  const [email, setEmail] = useState("");
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [otherWays, setOtherWays] = useState(false);
  const { locale } = useGuestLandingLocaleState();
  const copy = AUTH_REGISTER_COPY[locale];
  const reduceMotion = useReducedMotion();
  const wins = useGuestWins();
  const topic = guestPath(wins).topic;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("sid");
    if (sid) writeDemoSessionId(sid);
    setReturnTo(readAuthReturnPathFromSearch(params));
  }, []);

  const loginHref = returnTo ? `/login?redirect=${encodeURIComponent(returnTo)}` : "/login";

  return (
    <div
      className={cn("flex min-h-dvh w-full bg-background", locale === "bn" && "font-bengali")}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <AuthGamePanel locale={locale} />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <RegisterToolbar copy={copy} />
        <PaidLearnersProofBar locale={locale} />

        <div className="relative flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10 xl:px-14">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(30,58,138,0.08),transparent_58%)]"
            aria-hidden
          />
          <motion.div
            className="relative w-full max-w-[420px] space-y-5"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-3 text-center sm:text-left">
              <p className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-bold text-accent">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {copy.eyebrow}
              </p>
              <h1 className="text-balance text-[1.85rem] font-black leading-tight tracking-tight text-slate-900 sm:text-[2.1rem]">
                {copy.title}
              </h1>
              <p className="text-pretty text-[15px] font-medium leading-relaxed text-slate-700 sm:text-base">
                {copy.subtitle}
              </p>
              <ul className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
                {copy.chips.map((chip) => (
                  <li
                    key={chip}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                    {chip}
                  </li>
                ))}
              </ul>
            </div>

            {wins > 0 ? (
              <p className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-snug text-emerald-900">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                {copy.savedWins(wins, topic.en)}
              </p>
            ) : null}

            <div className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-card shadow-[0_20px_50px_-30px_rgba(30,58,138,0.45)]">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-accent/[0.04] px-4 py-3 sm:px-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
                  <Swords className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-sm font-bold text-slate-900">{copy.missionChip}</p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="mb-3 text-sm font-semibold text-slate-700">{copy.formLead}</p>

                <ContinueWithGoogleButton
                  returnTo={returnTo}
                  label={copy.googleCta}
                  tone="primary"
                  className={cn("h-13 rounded-2xl font-extrabold", locale === "bn" ? "text-[17px]" : "text-base")}
                />

                <button
                  type="button"
                  onClick={() => setOtherWays((open) => !open)}
                  aria-expanded={otherWays}
                  className="mx-auto mt-3 flex items-center gap-1 text-sm font-semibold text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
                >
                  {otherWays ? copy.hideOtherWays : copy.otherWays}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", otherWays && "rotate-180")} aria-hidden />
                </button>

                {otherWays ? (
                  <div className="mt-4 space-y-4">
                    <AuthMethodDivider label={copy.phoneDivider} />
                    <PhoneOtpAuthPanel locale={locale} compact />
                    <AuthMethodDivider label={copy.emailDivider} />
                    <form
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleRegister(email);
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
                            type="email"
                            data-telemetry-field="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={copy.emailPlaceholder}
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
                  </div>
                ) : null}

                <p className="mt-5 border-t border-border/50 pt-4 text-center text-sm">
                  <span className="text-slate-600">{copy.hasAccount} </span>
                  <Link href={loginHref} className="font-bold text-accent hover:underline">
                    {copy.signIn}
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
