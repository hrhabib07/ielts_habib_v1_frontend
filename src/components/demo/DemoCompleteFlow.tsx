"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
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

type Step = "rate" | "continue";

export function DemoCompleteFlow() {
  const router = useRouter();
  const { locale } = useUiLocale();
  const copy = DEMO_COPY[locale];
  const reduceMotion = useReducedMotion();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [step, setStep] = useState<Step>("rate");
  const [rating, setRating] = useState(0);
  const [likedMost, setLikedMost] = useState("");
  const [showMore, setShowMore] = useState(false);
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

  const selectOption = (value: number, labelEn: string, labelBn: string) => {
    setRating(value);
    setLikedMost(`${labelEn} (${labelBn})`);
  };

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
        "mx-auto max-w-lg px-4 py-8 sm:py-10",
        locale === "bn" && "font-bengali",
      )}
      lang={locale}
    >
      {step === "rate" ? (
        <motion.div
          className="space-y-6"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <motion.div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg shadow-amber-500/30"
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.06, 1], rotate: [0, -4, 4, 0] }
              }
              transition={{ duration: 1.4, repeat: 1 }}
            >
              <Sparkles className="h-8 w-8 text-amber-950" />
            </motion.div>
            <h1 className="mt-4 text-3xl font-black tracking-tight">
              {copy.rewardTitle}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{copy.rewardSub}</p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3.5">
                <p className="text-xl font-black text-amber-800 dark:text-amber-300">
                  {copy.xpEarned(session.xpEarned)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {copy.xpStageHint}
                </p>
              </div>
              <div className="flex items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 p-3.5">
                <p className="text-sm font-bold leading-snug text-primary">
                  {copy.badgeUnlocked}
                </p>
              </div>
            </div>
          </div>

          {/* Form-style rating — bilingual radio list */}
          <div
            className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-md"
            role="radiogroup"
            aria-labelledby="demo-feedback-question"
          >
            <div
              className="absolute inset-y-0 left-0 w-1 bg-sky-500"
              aria-hidden
            />
            <div className="px-5 py-5 pl-6 sm:px-6 sm:pl-7">
              <div className="flex items-start justify-between gap-3">
                <div id="demo-feedback-question" className="min-w-0 space-y-1">
                  <p className="font-sans text-[15px] font-semibold leading-snug text-foreground sm:text-base">
                    {copy.feedbackTitle}
                  </p>
                  <p className="font-bengali text-sm leading-snug text-muted-foreground sm:text-[15px]">
                    {copy.feedbackTitleBn}
                  </p>
                </div>
                <span className="shrink-0 text-base font-bold text-rose-500" aria-hidden>
                  *
                </span>
              </div>

              <div className="mt-5 space-y-1">
                {copy.feedbackOptions.map((option) => {
                  const selected = rating === option.rating;
                  return (
                    <label
                      key={option.rating}
                      className={cn(
                        "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 transition touch-manipulation",
                        selected
                          ? "bg-sky-500/10 ring-1 ring-sky-500/30"
                          : "hover:bg-muted/50 active:bg-muted/70",
                      )}
                    >
                      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                        <input
                          type="radio"
                          name="demo-rating"
                          value={option.rating}
                          checked={selected}
                          onChange={() =>
                            selectOption(option.rating, option.en, option.bn)
                          }
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "h-5 w-5 rounded-full border-2 transition",
                            selected
                              ? "border-sky-500"
                              : "border-muted-foreground/40 peer-focus-visible:border-sky-500",
                          )}
                          aria-hidden
                        />
                        <span
                          className={cn(
                            "absolute h-2.5 w-2.5 rounded-full bg-sky-500 transition",
                            selected ? "scale-100 opacity-100" : "scale-0 opacity-0",
                          )}
                          aria-hidden
                        />
                      </span>
                      <span className="min-w-0 text-[15px] leading-snug text-foreground">
                        <span className="font-sans font-medium tabular-nums">
                          {option.rating}: {option.en}
                        </span>{" "}
                        <span className="font-bengali text-muted-foreground">
                          ({option.bn})
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {rating < 1 ? (
                <p className="mt-4 text-xs text-muted-foreground">
                  {copy.feedbackTapHint}
                </p>
              ) : (
                <motion.p
                  className="mt-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                  initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {copy.feedbackThanks}
                </motion.p>
              )}

              {rating >= 1 ? (
                <div className="mt-4 space-y-3">
                  {!showMore ? (
                    <button
                      type="button"
                      onClick={() => setShowMore(true)}
                      className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
                    >
                      {copy.feedbackLiked}
                    </button>
                  ) : (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        {copy.feedbackLiked}
                      </label>
                      <Textarea
                        value={likedMost}
                        onChange={(e) => setLikedMost(e.target.value)}
                        placeholder={copy.feedbackPlaceholder}
                        rows={2}
                        className="rounded-xl"
                        autoFocus
                      />
                    </div>
                  )}

                  <Button
                    className="h-12 w-full rounded-xl text-base font-bold"
                    size="lg"
                    disabled={submitting}
                    onClick={() => void sendFeedback(false)}
                  >
                    {copy.feedbackSubmit}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={() => void sendFeedback(true)}
            className="mx-auto block text-center text-xs text-muted-foreground/70 underline-offset-2 hover:text-muted-foreground hover:underline disabled:opacity-50"
          >
            {copy.feedbackSkip}
          </button>
        </motion.div>
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
            {localizeDigits(session.xpEarned, locale)} XP · {session.displayName}
          </p>
          <Button variant="outline" className="w-full rounded-xl" asChild>
            <Link href="/">{copy.backHome}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
