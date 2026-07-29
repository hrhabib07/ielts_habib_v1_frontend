"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gift,
  Lock,
  Phone,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { ContinueWithGoogleButton } from "@/src/components/auth/ContinueWithGoogleButton";
import { PhoneOtpAuthPanel } from "@/src/components/auth/PhoneOtpAuthPanel";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import type { MissionZeroCopy } from "@/src/lib/mission-zero-copy";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const EN_FACE = "font-sans tabular-nums";

type Props = {
  copy: MissionZeroCopy;
  totalXp: number;
  sessionId: string | null;
  onGoogleNavigate: () => void;
  onEmailNavigate: () => void;
  /** Kept for parent compatibility; exit/replay UI removed from this checkpoint. */
  onPlayAgain?: () => void;
  onSkip?: () => void;
};

export function MissionZeroSaveProgress({
  copy,
  totalXp,
  sessionId,
  onGoogleNavigate,
  onEmailNavigate,
}: Props) {
  const reduceMotion = useReducedMotion();
  const { locale } = useUiLocale();
  const s = copy.save;

  const registerHref = sessionId
    ? `/register?from=demo&sid=${encodeURIComponent(sessionId)}`
    : "/register?from=demo";

  const phoneTitle =
    locale === "bn"
      ? "মোবাইল দিয়ে 50 XP সেভ করুন"
      : "Save 50 XP with mobile";
  const googleCtaLabel =
    locale === "bn"
      ? "Google দিয়ে 50 XP সেভ করুন"
      : "Save 50 XP with Google";
  const emailLinkLabel =
    locale === "bn"
      ? "অথবা ইমেইল দিয়ে সেভ করুন"
      : "or save with email instead";
  const trustLine =
    locale === "bn"
      ? "ফ্রি · OTP দিয়ে ভেরিফাই · পাসওয়ার্ড সেট করুন"
      : "Free · Verify with OTP · Then set a password";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="space-y-3 pb-2 sm:space-y-4"
    >
      {/* Compact loss aversion */}
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

      {/* CTA hierarchy: Phone (primary) → Google (secondary) → Email (quiet) */}
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
        />

        <ul className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-4 sm:gap-y-1.5">
          <li className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground/80">
            <Shield className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
            <span>{s.perkFree}</span>
          </li>
          <li className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground/80">
            <Lock className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
            <span>{s.perkNoPassword}</span>
          </li>
          <li className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground/80">
            <Clock3 className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
            <span>{s.perkFast}</span>
          </li>
        </ul>

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
          onNavigate={onGoogleNavigate}
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

      {/* Curiosity roadmap */}
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
          <li className="flex gap-3 rounded-xl border border-sky-500/35 bg-sky-500/10 px-2.5 py-2.5 -mx-1 sm:mx-0">
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
