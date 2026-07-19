"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Lock,
  Mail,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/src/auth/hooks";
import {
  AuthMethodDivider,
  ContinueWithGoogleButton,
} from "@/src/components/auth/ContinueWithGoogleButton";
import { GamlishNavBrand } from "@/src/components/shared/GamlishNavBrand";
import { GuestLandingLanguageToggle } from "@/src/components/home/guest/GuestLandingLocale";
import {
  LANDING_CTA_CLASS,
  LANDING_EYEBROW_CLASS,
  LANDING_REWARD_PILL_CLASS,
} from "@/src/components/home/guest/guest-landing-theme";
import { ThemeToggleButton } from "@/src/components/shared/ThemeToggleButton";
import { useGuestLandingLocaleState } from "@/src/hooks/useGuestLandingLocaleState";
import { AUTH_LOGIN_COPY } from "@/src/lib/auth-login-copy";
import { cn } from "@/lib/utils";

const DevQuickLogin =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () => import("@/src/components/dev/DevQuickLogin").then((m) => m.default),
        { ssr: false },
      )
    : () => null;

function LoginHeroPanel({ locale }: { locale: "en" | "bn" }) {
  const copy = AUTH_LOGIN_COPY[locale];
  const reduceMotion = useReducedMotion();

  return (
    <aside className="relative hidden w-[44%] shrink-0 flex-col justify-between overflow-hidden bg-slate-950 px-10 py-10 text-white xl:w-[48%] xl:px-12 xl:py-12 lg:flex">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_20%_0%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(ellipse_55%_45%_at_95%_100%,rgba(30,58,138,0.45),transparent_52%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
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
        <p className={cn(LANDING_REWARD_PILL_CLASS, "w-fit gap-1.5")}>
          <Flame className="h-3.5 w-3.5" aria-hidden />
          {copy.continueHint}
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
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 ring-1 ring-sky-400/25">
                {idx === 0 ? (
                  <Swords className="h-3.5 w-3.5 text-sky-300" />
                ) : idx === 1 ? (
                  <Trophy className="h-3.5 w-3.5 text-amber-300" />
                ) : (
                  <Zap className="h-3.5 w-3.5 text-sky-300" />
                )}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      <p className="relative z-10 text-sm text-slate-500">{copy.heroFootnote}</p>
    </aside>
  );
}

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
      <div className="flex items-center gap-1.5 sm:gap-2">
        <GuestLandingLanguageToggle />
        <ThemeToggleButton />
      </div>
    </header>
  );
}

export function LoginForm({ resetSuccess = false }: { resetSuccess?: boolean }) {
  const { handleLogin, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [oauthError, setOauthError] = useState<string | null>(null);
  const { locale } = useGuestLandingLocaleState();
  const copy = AUTH_LOGIN_COPY[locale];
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      setOauthError(decodeURIComponent(err));
    }
  }, []);

  return (
    <div
      className={cn(
        "flex min-h-dvh w-full bg-background",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <LoginHeroPanel locale={locale} />

      <div className="relative flex min-h-dvh min-w-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-10%,rgba(56,189,248,0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_70%_45%_at_50%_-10%,rgba(56,189,248,0.08),transparent_55%)]"
          aria-hidden
        />

        <LoginToolbar copy={copy} />

        <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10 xl:px-14">
          <motion.div
            className="w-full max-w-[420px] space-y-5"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-3">
              <p className={LANDING_EYEBROW_CLASS}>
                <Sparkles className="mr-1.5 inline h-3 w-3" aria-hidden />
                {copy.eyebrow}
              </p>
              <h1 className="text-[1.75rem] font-bold tracking-tight text-foreground sm:text-3xl">
                {copy.title}
              </h1>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                {copy.subtitle}
              </p>
            </div>

            {/* Loud register path — above the form so new users cannot miss it */}
            <Link
              href="/register"
              className="group flex items-center gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3.5 transition-colors hover:border-sky-500/45 hover:bg-sky-500/15 dark:border-sky-400/25 dark:bg-sky-400/10 dark:hover:bg-sky-400/15"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-700 dark:text-sky-300">
                <Zap className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-bold text-foreground">
                  {copy.newPlayerTitle}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground sm:text-[13px]">
                  {copy.newPlayerBody}
                </span>
              </span>
              <span className="hidden shrink-0 text-xs font-bold text-sky-700 group-hover:underline sm:inline dark:text-sky-300">
                {copy.newPlayerCta}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-sky-600 transition-transform group-hover:translate-x-0.5 dark:text-sky-400" />
            </Link>

            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_16px_48px_rgba(15,23,42,0.07)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.28)]">
              <div className="p-5 sm:p-6">
                {resetSuccess ? (
                  <div
                    className="mb-4 rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-2.5 text-sm text-sky-900 dark:text-sky-200"
                    role="status"
                  >
                    {copy.resetSuccess}
                  </div>
                ) : null}

                {oauthError ? (
                  <div
                    className="mb-4 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                    role="alert"
                  >
                    {oauthError}
                  </div>
                ) : null}

                <DevQuickLogin setEmail={setEmail} setPassword={setPassword} />

                <div className="mb-4 space-y-3">
                  <ContinueWithGoogleButton />
                  <AuthMethodDivider
                    label={locale === "bn" ? "অথবা ইমেইল" : "or email"}
                  />
                </div>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin(email, password);
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        {copy.passwordLabel}
                      </Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-sky-700 hover:underline dark:text-sky-300"
                      >
                        {copy.forgotPassword}
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={copy.passwordPlaceholder}
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
                    className={cn(
                      "h-11 w-full rounded-xl text-[15px] font-semibold",
                      LANDING_CTA_CLASS,
                    )}
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

                <div className="mt-5 border-t border-border/50 pt-4 sm:hidden">
                  <Button asChild variant="outline" className="h-11 w-full rounded-xl font-semibold">
                    <Link href="/register">{copy.newPlayerCta}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
