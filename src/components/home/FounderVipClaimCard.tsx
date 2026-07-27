"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Crown, Lock, Shield, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFounderDashboardOfferCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

const EN_FACE = "font-sans tabular-nums";
const DEFAULT_REMAINING = 15;
const REGULAR = 1590;
const FOUNDER = 159;
const SAVE = 1431;

export function FounderVipClaimCard({
  remainingSeats,
  className,
  href = "/checkout",
}: {
  remainingSeats?: number;
  className?: string;
  href?: string;
}) {
  const copy = useFounderDashboardOfferCopy();
  const { locale } = useUiLocale();
  const reduceMotion = useReducedMotion();
  const seats =
    typeof remainingSeats === "number" && remainingSeats >= 0
      ? remainingSeats
      : DEFAULT_REMAINING;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "relative mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] border-2 border-amber-500/50",
        "bg-gradient-to-b from-amber-400/[0.18] via-card to-card",
        "shadow-[0_20px_50px_-24px_rgba(245,158,11,0.55)]",
        locale === "bn" && "font-bengali",
        className,
      )}
      lang={locale}
    >
      <div
        className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
        aria-hidden
      />

      <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-amber-950 dark:text-amber-100">
            <Crown className="h-3.5 w-3.5" aria-hidden />
            {copy.tag}
          </p>
          <h2 className="text-balance text-[1.25rem] font-black leading-snug tracking-tight text-foreground sm:text-2xl">
            {copy.headline}
          </h2>
          <p className="text-pretty text-[13px] font-medium leading-relaxed text-foreground/85 sm:text-sm">
            {copy.body}
          </p>
        </div>

        {/* Price gap: 1590 → 159, save 1431 */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-amber-500/35 bg-background/90 p-2.5 sm:gap-3 sm:p-3">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {copy.regularLabel}
            </p>
            <p
              className={cn(
                EN_FACE,
                "mt-0.5 text-sm font-bold text-muted-foreground line-through decoration-rose-500 sm:text-base",
              )}
            >
              {REGULAR} BDT
            </p>
          </div>
          <div className="rounded-xl bg-emerald-500/15 px-1 py-1 text-center ring-1 ring-emerald-500/30">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
              {copy.founderLabel}
            </p>
            <p
              className={cn(
                EN_FACE,
                "mt-0.5 text-base font-black text-emerald-700 dark:text-emerald-300 sm:text-lg",
              )}
            >
              {FOUNDER} BDT
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
              {copy.saveLabel}
            </p>
            <p
              className={cn(
                EN_FACE,
                "mt-0.5 text-sm font-black text-amber-800 dark:text-amber-200 sm:text-base",
              )}
            >
              {SAVE} BDT
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-3 py-2.5">
          <p className="flex items-start gap-2 text-[12px] font-bold leading-snug text-rose-900 dark:text-rose-100 sm:text-[13px]">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{copy.warning(seats)}</span>
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className={cn(
            "h-12 w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-[13px] font-black text-amber-950 shadow-lg shadow-orange-500/30",
            "hover:from-amber-300 hover:via-orange-400 hover:to-rose-400",
            "sm:h-14 sm:text-[15px]",
            !reduceMotion && "animate-[founderCtaGlow_2.4s_ease-in-out_infinite]",
          )}
        >
          <Link href={href}>{copy.cta}</Link>
        </Button>

        <ul className="grid gap-2 sm:grid-cols-3">
          <li className="flex items-center gap-2 text-[12px] font-semibold text-foreground/85">
            <Lock className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
            {copy.trustPayOnce}
          </li>
          <li className="flex items-center gap-2 text-[12px] font-semibold text-foreground/85">
            <Zap className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
            {copy.trustPayFast}
          </li>
          <li className="flex items-center gap-2 text-[12px] font-semibold text-foreground/85">
            <Shield className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
            {copy.trustLifetime}
          </li>
        </ul>
      </div>

      <style jsx global>{`
        @keyframes founderCtaGlow {
          0%,
          100% {
            box-shadow: 0 10px 28px -8px rgba(249, 115, 22, 0.45);
            filter: brightness(1);
          }
          50% {
            box-shadow: 0 14px 36px -6px rgba(244, 63, 94, 0.55);
            filter: brightness(1.05);
          }
        }
      `}</style>
    </motion.div>
  );
}
