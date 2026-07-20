"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/src/auth/hooks";
import { GamlishNavBrand } from "@/src/components/shared/GamlishNavBrand";
import {
  AuthMethodDivider,
  ContinueWithGoogleButton,
} from "@/src/components/auth/ContinueWithGoogleButton";
import { GuestLandingLanguageToggle } from "@/src/components/home/guest/GuestLandingLocale";
import { ThemeToggleButton } from "@/src/components/shared/ThemeToggleButton";
import { useGuestLandingLocaleState } from "@/src/hooks/useGuestLandingLocaleState";
import { AUTH_REGISTER_COPY } from "@/src/lib/auth-register-copy";
import { readAuthReturnPathFromSearch } from "@/src/lib/auth-redirects";
import { writeDemoSessionId } from "@/src/lib/demo-session";
import { cn } from "@/lib/utils";

function RegisterHeroPanel({ locale }: { locale: "en" | "bn" }) {
  const copy = AUTH_REGISTER_COPY[locale];
  const reduceMotion = useReducedMotion();

  return (
    <aside className="relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden bg-slate-950 px-10 py-10 text-white xl:w-[48%] xl:px-12 xl:py-12 lg:flex">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_15%_0%,rgba(15,23,42,0.55),transparent_58%),radial-gradient(ellipse_55%_45%_at_95%_100%,rgba(30,58,138,0.35),transparent_52%)]"
        aria-hidden
      />

      <Link href="/" className="relative z-10 inline-flex w-fit transition-opacity hover:opacity-90">
        <GamlishNavBrand className="[&_span]:text-white" />
      </Link>

      <motion.div
        className="relative z-10 max-w-lg space-y-7"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85">
          <Sparkles className="h-3.5 w-3.5 text-white/90" aria-hidden />
          {locale === "bn" ? "4 ক্যাম্প · 21 মিশন" : "4 camps · 21 missions"}
        </p>

        <div className="space-y-3">
          <h2 className="text-balance text-[2rem] font-bold leading-[1.12] tracking-tight xl:text-[2.35rem]">
            {copy.heroTitle}
          </h2>
          <p className="max-w-md text-pretty text-[15px] leading-relaxed text-slate-300">
            {copy.heroSubtitle}
          </p>
        </div>

        <ul className="space-y-2.5">
          {copy.heroBullets.map((item, idx) => (
            <li key={item} className="flex items-center gap-3 text-sm text-slate-200">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/12">
                {idx === 0 ? (
                  <Trophy className="h-3.5 w-3.5 text-white/90" />
                ) : idx === 1 ? (
                  <Swords className="h-3.5 w-3.5 text-white/80" />
                ) : (
                  <Zap className="h-3.5 w-3.5 text-white/75" />
                )}
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="grid max-w-sm grid-cols-3 gap-2">
          {[
            { label: locale === "bn" ? "ক্যাম্প" : "Camps", value: "4" },
            { label: locale === "bn" ? "মিশন" : "Missions", value: "21" },
            { label: locale === "bn" ? "ফ্রি" : "Free", value: "M01" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 px-2 py-2.5 text-center backdrop-blur-sm"
            >
              <p className="text-lg font-bold tabular-nums">{stat.value}</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      <p className="relative z-10 text-sm text-slate-500">{copy.heroFootnote}</p>
    </aside>
  );
}

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
      <div className="flex items-center gap-1.5 sm:gap-2">
        <GuestLandingLanguageToggle />
        <ThemeToggleButton />
      </div>
    </header>
  );
}

export function RegisterForm() {
  const { handleRegister, loading, error } = useRegister();
  const [email, setEmail] = useState("");
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const { locale } = useGuestLandingLocaleState();
  const copy = AUTH_REGISTER_COPY[locale];
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("sid");
    if (sid) writeDemoSessionId(sid);
    setReturnTo(readAuthReturnPathFromSearch(params));
  }, []);

  const loginHref = returnTo
    ? `/login?redirect=${encodeURIComponent(returnTo)}`
    : "/login";

  return (
    <div
      className={cn(
        "flex min-h-dvh w-full bg-background",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <RegisterHeroPanel locale={locale} />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <RegisterToolbar copy={copy} />

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10 xl:px-14">
          <motion.div
            className="w-full max-w-[420px] space-y-6"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-2">
              <h1 className="text-[1.75rem] font-bold tracking-tight text-foreground sm:text-3xl">
                {copy.title}
              </h1>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {copy.subtitle}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_16px_48px_rgba(15,23,42,0.07)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.28)]">
              <div className="p-5 sm:p-6">
                <div className="mb-4 space-y-3">
                  <ContinueWithGoogleButton returnTo={returnTo} />
                  <AuthMethodDivider
                    label={locale === "bn" ? "অথবা ইমেইল" : "or email"}
                  />
                </div>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRegister(email);
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {copy.emailLabel}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={copy.emailPlaceholder}
                        className="h-11 rounded-xl border-border/80 bg-background pl-11"
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
                    disabled={loading}
                    className="h-11 w-full rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground hover:bg-primary/90"
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

                <div className="mt-5 grid gap-2 border-t border-border/50 pt-4 text-[11px] text-muted-foreground sm:grid-cols-3">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {copy.trustOtp}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {copy.trustFree}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {copy.trustSecure}
                  </span>
                </div>

                <p className="mt-4 text-center text-sm">
                  <span className="text-muted-foreground">{copy.hasAccount} </span>
                  <Link href={loginHref} className="font-semibold text-primary hover:underline">
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
