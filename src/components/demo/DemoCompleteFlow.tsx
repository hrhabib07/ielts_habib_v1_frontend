"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getDemoHome,
  submitDemoFeedback,
  type DemoSession,
} from "@/src/lib/api/demo";
import { DEMO_COPY } from "@/src/lib/demo-copy";
import { readDemoSessionId } from "@/src/lib/demo-session";
import { localizeDigits } from "@/src/lib/ui-locale";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { ContinueWithGoogleButton } from "@/src/components/auth/ContinueWithGoogleButton";
import { cn } from "@/lib/utils";

type Step = "reward" | "feedback" | "continue";

export function DemoCompleteFlow() {
  const router = useRouter();
  const { locale } = useUiLocale();
  const copy = DEMO_COPY[locale];
  const reduceMotion = useReducedMotion();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [step, setStep] = useState<Step>("reward");
  const [rating, setRating] = useState(0);
  const [likedMost, setLikedMost] = useState("");
  const [lockedPeek, setLockedPeek] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const sid = readDemoSessionId();
    if (!sid) {
      router.replace("/demo");
      return;
    }
    getDemoHome(sid)
      .then((home) => {
        if (!home.session.demoComplete && home.session.status !== "completed") {
          router.replace("/demo/play");
          return;
        }
        setSession(home.session);
      })
      .catch(() => router.replace("/demo"));
  }, [router]);

  const startedAt = useMemo(
    () => (session ? new Date(session.startedAt).getTime() : Date.now()),
    [session],
  );

  if (!session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        {copy.loading}
      </div>
    );
  }

  const sendFeedback = async (skip: boolean) => {
    if (!skip && rating < 1) return;
    setSubmitting(true);
    try {
      if (!skip) {
        await submitDemoFeedback(session.sessionId, {
          rating,
          likedMost: likedMost.trim() || null,
          timeSpentMs: Math.max(0, Date.now() - startedAt),
        });
      }
      setStep("continue");
    } catch {
      setStep("continue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "mx-auto max-w-lg px-4 py-10",
        locale === "bn" && "font-bengali",
      )}
      lang={locale}
    >
      {step === "reward" ? (
        <motion.div
          className="text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg">
            <Sparkles className="h-9 w-9 text-amber-950" />
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight">
            {copy.rewardTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{copy.rewardSub}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4">
              <p className="text-2xl font-black text-amber-800 dark:text-amber-300">
                {copy.xpEarned(session.xpEarned)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {copy.xpStageHint}
              </p>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
              <p className="text-sm font-bold text-primary">{copy.badgeUnlocked}</p>
            </div>
          </div>

          <Button
            className="mt-8 h-12 w-full rounded-xl font-bold"
            size="lg"
            onClick={() => setStep("feedback")}
          >
            {copy.feedbackTitle}
          </Button>
        </motion.div>
      ) : null}

      {step === "feedback" ? (
        <div className="space-y-5">
          <h2 className="text-center text-xl font-black">{copy.feedbackTitle}</h2>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="rounded-xl p-2 transition hover:scale-110"
                aria-label={`${n} stars`}
              >
                <Star
                  className={cn(
                    "h-8 w-8",
                    n <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40",
                  )}
                />
              </button>
            ))}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              {copy.feedbackLiked}
            </label>
            <Textarea
              value={likedMost}
              onChange={(e) => setLikedMost(e.target.value)}
              placeholder={copy.feedbackPlaceholder}
              rows={3}
              className="rounded-xl"
            />
          </div>
          <Button
            className="h-12 w-full rounded-xl font-bold"
            disabled={rating < 1 || submitting}
            onClick={() => void sendFeedback(false)}
          >
            {copy.feedbackSubmit}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            disabled={submitting}
            onClick={() => void sendFeedback(true)}
          >
            {copy.feedbackSkip}
          </Button>
        </div>
      ) : null}

      {step === "continue" ? (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black">{copy.continueTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{copy.continueSub}</p>
            <ul className="mx-auto mt-4 max-w-xs space-y-2 text-left text-sm">
              {copy.continueBullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <ContinueWithGoogleButton
              variant="save"
              demoSessionId={session.sessionId}
              className="mt-6 h-12 rounded-xl font-bold shadow-sm"
            />
            <Button
              asChild
              variant="outline"
              className="mt-3 h-11 w-full rounded-xl font-semibold"
              size="lg"
            >
              <Link href={`/register?from=demo&sid=${session.sessionId}`}>
                {copy.createAccount}
              </Link>
            </Button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              {copy.orEmailSignup}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">{copy.thanks}</p>
          </div>

          <div>
            <h3 className="mb-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {copy.peekTitle}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {copy.peekItems.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setLockedPeek(item.title)}
                  className="relative rounded-2xl border border-border/50 bg-muted/30 p-3 text-left transition hover:border-primary/40"
                >
                    <Lock className="absolute right-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <p className="pr-5 text-sm font-bold">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {item.hint}
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {copy.lockedLabel}
                  </p>
                </button>
              ))}
            </div>
            {lockedPeek ? (
              <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-center text-xs text-primary">
                {copy.peekLocked}
              </p>
            ) : null}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {localizeDigits(session.xpEarned, locale)} XP ·{" "}
            {session.displayName}
          </p>
          <Button variant="outline" className="w-full rounded-xl" asChild>
            <Link href="/">{copy.backHome}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
