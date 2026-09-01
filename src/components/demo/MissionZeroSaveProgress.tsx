"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Gift,
  Lock,
  Phone,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { ContinueWithGoogleButton } from "@/src/components/auth/ContinueWithGoogleButton";
import { PhoneOtpAuthPanel } from "@/src/components/auth/PhoneOtpAuthPanel";
import { DemoJoinedSocialProof } from "@/src/components/demo/DemoJoinedSocialProof";
import { SoftActiveOfferCountdown } from "@/src/components/demo/SoftActiveOfferCountdown";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import type { MissionZeroCopy } from "@/src/lib/mission-zero-copy";
import { cn } from "@/lib/utils";
import { trackFunnelEvent, trackFunnelEventBeacon } from "@/src/lib/api/analytics";

const EASE = [0.22, 1, 0.36, 1] as const;
const EN_FACE = "font-sans tabular-nums";

export type MissionZeroSaveLayout = "default" | "a";

type Props = {
  copy: MissionZeroCopy;
  totalXp: number;
  sessionId: string | null;
  onGoogleNavigate: () => void;
  onEmailNavigate: () => void;
  /** Kept for parent compatibility; exit/replay UI removed from this checkpoint. */
  onPlayAgain?: () => void;
  onSkip?: () => void;
  /**
   * default = phone-first + roadmap (live).
   * a = Google-first, phone collapsed, no roadmap (conversion test).
   */
  saveLayout?: MissionZeroSaveLayout;
  /** QA only · force active personal-offer countdown on this save screen. */
  forceActiveOfferCountdownMs?: number;
};

export function MissionZeroSaveProgress({
  copy,
  totalXp,
  sessionId,
  onGoogleNavigate,
  onEmailNavigate,
  saveLayout = "default",
  forceActiveOfferCountdownMs,
}: Props) {
  const reduceMotion = useReducedMotion();
  const { locale } = useUiLocale();
  const s = copy.save;
  const isLayoutA = saveLayout === "a";
  const [phoneOpen, setPhoneOpen] = useState(false);

  const mountedAtRef = useRef(Date.now());

  useEffect(() => {
    void trackFunnelEvent({
      event: "phone_otp_method_selected",
      demoSessionId: sessionId,
      screen: "demo_step_4_signup",
      step: 4,
      metadata: {
        xpEarned: totalXp,
        save_layout: saveLayout,
        google_primary: isLayoutA,
      },
    });
    const mountedAt = mountedAtRef.current;
    return () => {
      const timeSpentSeconds = Math.round((Date.now() - mountedAt) / 1000);
      if (timeSpentSeconds >= 10) {
        trackFunnelEventBeacon({
          event: "save_screen_abandoned",
          demoSessionId: sessionId,
          screen: "demo_step_4_signup",
          step: 4,
          metadata: {
            timeSpentSeconds,
            signup_dwell_seconds: timeSpentSeconds,
            save_layout: saveLayout,
          },
        });
      }
    };
  }, [sessionId, totalXp, saveLayout, isLayoutA]);

  const registerHref = sessionId
    ? `/register?from=demo&sid=${encodeURIComponent(sessionId)}`
    : "/register?from=demo";

  const phoneTitle =
    locale === "bn"
      ? "মোবাইল দিয়ে 50 XP সেভ করুন"
      : "Save 50 XP with mobile";
  const googleCtaLabel = isLayoutA
    ? locale === "bn"
      ? "Google দিয়ে সেভ করো"
      : "Save with Google"
    : locale === "bn"
      ? "Google দিয়ে 50 XP সেভ করুন"
      : "Save 50 XP with Google";
  const emailLinkLabel =
    locale === "bn"
      ? "অথবা ইমেইল দিয়ে সেভ করুন"
      : "or save with email instead";
  const trustLine =
    locale === "bn"
      ? "ফ্রি · কয়েক সেকেন্ড · Mission 01 আনলক"
      : "Free · a few seconds · unlock Mission 01";
  const layoutAHeadline =
    locale === "bn" ? "তোমার 50 XP এখনই সেভ করো" : "Save your 50 XP now";
  const layoutASub =
    locale === "bn"
      ? "সেভ করলেই Mission 01 আনলক। না করলে XP মুছে যেতে পারে।"
      : "Save to unlock Mission 01. Skip and your XP can disappear.";
  const layoutATrust =
    locale === "bn" ? "ফ্রি · কয়েক সেকেন্ড · সবাই জয়েন করছে" : "Free · seconds · others are joining";
  const phoneExpandLabel =
    locale === "bn" ? "মোবাইল নম্বর দিয়ে সেভ" : "Save with mobile number";

  if (isLayoutA) {
    return (
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="space-y-4 pb-2"
      >
        <div className="rounded-2xl border border-amber-500/35 bg-gradient-to-b from-amber-400/15 to-transparent px-4 py-4 text-center">
          <div className="mb-2.5 flex flex-wrap justify-center gap-1.5">
            <span
              className={cn(
                EN_FACE,
                "inline-flex items-center gap-1 rounded-lg border border-amber-500/35 bg-background/90 px-2.5 py-1 text-xs font-black text-amber-950 dark:text-amber-100",
              )}
            >
              <Sparkles className="h-3 w-3 text-amber-600" aria-hidden />
              {s.xpChip(totalXp)}
            </span>
            <span
              className={cn(
                EN_FACE,
                "inline-flex items-center gap-1 rounded-lg border border-amber-500/35 bg-background/90 px-2.5 py-1 text-xs font-black text-amber-950 dark:text-amber-100",
              )}
            >
              <Zap className="h-3 w-3 text-amber-600" aria-hidden />
              {s.levelChip}
            </span>
          </div>
          <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:text-amber-100">
            <AlertTriangle className="h-3 w-3" aria-hidden />
            {s.unsavedEyebrow}
          </p>
          <h2 className="mt-1.5 text-balance text-xl font-black leading-snug tracking-tight text-foreground sm:text-2xl">
            {layoutAHeadline}
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-pretty font-bengali text-[13px] font-medium leading-snug text-foreground/80 sm:text-sm">
            {layoutASub}
          </p>
          <SoftActiveOfferCountdown
            className="mx-auto mt-3 max-w-md"
            forceDemoRemainingMs={forceActiveOfferCountdownMs}
          />
        </div>

        <div className="space-y-3">
          <ContinueWithGoogleButton
            variant="save"
            demoSessionId={sessionId}
            returnTo="/player"
            className={cn(
              "h-14 min-h-14 rounded-2xl border-2 border-sky-500/40 bg-sky-600 px-3",
              "text-[15px] font-black text-white shadow-lg shadow-sky-500/25",
              "hover:bg-sky-500 hover:text-white sm:text-base",
            )}
            label={googleCtaLabel}
            onNavigate={() => {
              void trackFunnelEvent({
                event: "clicked_google_save_button",
                demoSessionId: sessionId,
                screen: "demo_step_4_signup",
                step: 4,
                metadata: { save_layout: "a", method: "google" },
              });
              onGoogleNavigate();
            }}
          />
          <DemoJoinedSocialProof
            locale={locale}
            className="mt-0"
            line={s.socialProofJoined}
          />
          <p className="text-center text-[12px] font-semibold text-muted-foreground">
            {layoutATrust}
          </p>

          {!phoneOpen ? (
            <button
              type="button"
              onClick={() => {
                setPhoneOpen(true);
                void trackFunnelEvent({
                  event: "phone_otp_method_selected",
                  demoSessionId: sessionId,
                  screen: "demo_step_4_signup",
                  step: 4,
                  metadata: { save_layout: "a", expanded: true },
                });
              }}
              className="mx-auto flex w-full items-center justify-center gap-2 rounded-2xl border border-border/80 bg-background px-3 py-3 text-[14px] font-bold text-foreground hover:bg-muted/40"
            >
              <Phone className="h-4 w-4 text-sky-600" aria-hidden />
              {phoneExpandLabel}
            </button>
          ) : (
            <div className="rounded-2xl border border-sky-500/30 bg-sky-500/[0.06] p-3.5 sm:p-4">
              <p className="mb-2.5 text-[14px] font-black text-foreground">{phoneTitle}</p>
              <PhoneOtpAuthPanel
                locale={locale}
                forceReturnTo="/player"
                compact
                ctaMode="saveXp"
              />
            </div>
          )}

          <p className="text-center">
            <Link
              href={registerHref}
              onClick={onEmailNavigate}
              className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {emailLinkLabel}
            </Link>
          </p>
        </div>

        <p className="flex items-start justify-center gap-2 px-1 text-center text-[11px] font-medium leading-relaxed text-muted-foreground">
          <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
          <span>{s.trustBadge}</span>
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="space-y-3 pb-2 sm:space-y-4"
    >
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-400/15 to-amber-400/[0.04] px-3 py-3 sm:px-4 sm:py-3.5">
        <p className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 dark:text-amber-100">
          <AlertTriangle className="h-3 w-3" aria-hidden />
          {s.unsavedEyebrow}
        </p>
        <h2 className="mt-1.5 text-balance text-[1.2rem] font-black leading-snug tracking-tight text-foreground sm:text-xl">
          {s.unsavedTitle}
        </h2>
        <p className="mt-1.5 text-pretty text-[13px] font-medium leading-snug text-foreground/80 sm:text-[14px]">
          {s.unsavedBody(totalXp)}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span
            className={cn(
              EN_FACE,
              "inline-flex items-center gap-1 rounded-lg border border-amber-500/35 bg-background/80 px-2.5 py-1 text-xs font-black text-amber-950 dark:text-amber-100",
            )}
          >
            <Sparkles className="h-3 w-3 text-amber-600" aria-hidden />
            {s.xpChip(totalXp)}
          </span>
          <span
            className={cn(
              EN_FACE,
              "inline-flex items-center gap-1 rounded-lg border border-amber-500/35 bg-background/80 px-2.5 py-1 text-xs font-black text-amber-950 dark:text-amber-100",
            )}
          >
            <Zap className="h-3 w-3 text-amber-600" aria-hidden />
            {s.levelChip}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-500/35 bg-sky-500/[0.07] p-3.5 sm:p-4">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <Phone className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-black leading-snug text-foreground sm:text-base">
              {phoneTitle}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              {trustLine}
            </p>
          </div>
        </div>

        <PhoneOtpAuthPanel
          locale={locale}
          forceReturnTo="/player"
          compact
          ctaMode="saveXp"
        />

        <DemoJoinedSocialProof locale={locale} line={s.socialProofJoined} />
        <SoftActiveOfferCountdown
          forceDemoRemainingMs={forceActiveOfferCountdownMs}
        />

        <div className="my-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/70" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {locale === "bn" ? "অথবা" : "or"}
          </span>
          <div className="h-px flex-1 bg-border/70" />
        </div>

        <ContinueWithGoogleButton
          variant="save"
          demoSessionId={sessionId}
          returnTo="/player"
          className={cn(
            "h-12 min-h-12 rounded-2xl border border-border/80 bg-background px-3",
            "text-[14px] font-bold text-foreground shadow-sm",
            "hover:bg-muted/50 hover:text-foreground sm:text-[15px]",
          )}
          label={googleCtaLabel}
          onNavigate={() => {
            void trackFunnelEvent({
              event: "clicked_google_save_button",
              demoSessionId: sessionId,
              screen: "demo_step_4_signup",
              step: 4,
            });
            onGoogleNavigate();
          }}
        />

        <p className="mt-3 text-center">
          <Link
            href={registerHref}
            onClick={onEmailNavigate}
            className="text-[12px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {emailLinkLabel}
          </Link>
        </p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/25 px-3.5 py-4 sm:px-4">
        <h3 className="text-[15px] font-bold text-foreground sm:text-base">
          {s.roadmapTitle}
        </h3>
        <ol className="mt-3 space-y-3">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
            </span>
            <p className="pt-0.5 text-[13px] font-medium leading-snug text-foreground/85 sm:text-sm">
              {s.roadmapStep1(totalXp)}
            </p>
          </li>
          <li className="flex gap-3 -mx-1 rounded-xl border border-sky-500/35 bg-sky-500/10 px-2.5 py-2.5 sm:mx-0">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white">
              <Lock className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-bold leading-snug text-foreground sm:text-sm">
                {s.roadmapStep2}
              </p>
              <p className="mt-1 inline-flex rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {s.roadmapStep2Here}
              </p>
            </div>
          </li>
          <li className="flex gap-3 opacity-90">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300">
              <Gift className="h-4 w-4" aria-hidden />
            </span>
            <p className="pt-0.5 text-[13px] font-medium leading-snug text-foreground/85 sm:text-sm">
              {s.roadmapStep3}
            </p>
          </li>
        </ol>
      </div>

      <p className="flex items-start justify-center gap-2 px-1 text-center text-[11px] font-medium leading-relaxed text-muted-foreground sm:text-xs">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
        <span>{s.trustBadge}</span>
      </p>
    </motion.div>
  );
}
