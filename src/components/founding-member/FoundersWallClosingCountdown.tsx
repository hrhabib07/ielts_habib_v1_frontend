"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Crown, Lock } from "lucide-react";
import {
  formatFoundingCountdown,
  isFoundingMemberWindowOpen,
  msUntilFoundingMemberCutoff,
} from "@/src/lib/foundingMember";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

const COPY = {
  bn: {
    eyebrow: "এক্সক্লুসিভ · প্রথম 100 জন",
    titleOpen: "ফাউন্ডারস ওয়াল বন্ধ হচ্ছে",
    titleClosed: "ফাউন্ডারস ওয়াল বন্ধ",
    bodyOpen:
      "31 July · 11:59 PM (বাংলাদেশ সময়)-এ এই সুযোগ চিরকালের জন্য শেষ। এখনই গর্বিত ফাউন্ডার হোন।",
    bodyClosed: "নতুন Founder Number আর ইস্যু হবে না।",
    days: "দিন",
    hours: "ঘণ্টা",
    minutes: "মিনিট",
    seconds: "সেকেন্ড",
    cta: "গর্বিত ফাউন্ডার হোন",
    closesAt: "শেষ সময় · 31 July · 11:59 PM (BD)",
    benefitsTitle: "গর্বিত ফাউন্ডার হিসেবে আপনি পাবেন",
    benefits: [
      "আজীবন Founder ব্যাজ ও স্থায়ী নম্বর",
      "Founders' Wall-এ স্থায়ী স্থান",
      "Founder মূল্য লক",
      "1 August থেকে প্রিমিয়াম অ্যাক্সেস",
    ],
    nextOpen: (n: string) => `এখনই যোগ দিলে আপনি হতে পারেন Founder #${n}`,
    nextClosed: "Founder স্পট আর খোলা নেই।",
    nextCtaHint: "প্রতি সেকেন্ডে স্পট কমে যাচ্ছে। এখনই লক করুন।",
  },
  en: {
    eyebrow: "Exclusive · First 100 only",
    titleOpen: "Founders' Wall closes in",
    titleClosed: "Founders' Wall is closed",
    bodyOpen:
      "This window ends forever on 31 July at 11:59 PM Bangladesh time. Become a proud Founder now.",
    bodyClosed: "No new Founder Numbers will be issued.",
    days: "Days",
    hours: "Hours",
    minutes: "Mins",
    seconds: "Secs",
    cta: "Become a proud Founder",
    closesAt: "Closes · 31 July · 11:59 PM BD",
    benefitsTitle: "As a proud Founder you get",
    benefits: [
      "Lifetime Founder badge and permanent number",
      "A permanent place on the Founders' Wall",
      "Founder price locked",
      "Premium access from 1 August",
    ],
    nextOpen: (n: string) => `Join now and you can be Founder #${n}`,
    nextClosed: "No Founder spots left.",
    nextCtaHint: "Spots are filling every second. Lock yours now.",
  },
} as const;

function Unit({
  value,
  label,
  pulse,
}: {
  value: number;
  label: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex min-w-[4.25rem] flex-1 flex-col items-center rounded-2xl border border-amber-500/35 bg-background/90 px-2 py-3 shadow-sm sm:min-w-[5rem] sm:px-3 sm:py-3.5">
      <span
        className={cn(
          "font-sans text-2xl font-black tabular-nums tracking-tight text-amber-950 dark:text-amber-50 sm:text-3xl",
          pulse && "animate-pulse",
        )}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800/75 dark:text-amber-200/70">
        {label}
      </span>
    </div>
  );
}

/** High-urgency countdown  -  wall closes 31 July 2026, 11:59 PM BD. */
export function FoundersWallClosingCountdown({
  nextFounderNumber,
}: {
  nextFounderNumber?: number | null;
}) {
  const { locale } = useUiLocale();
  const copy = COPY[locale === "bn" ? "bn" : "en"];
  const reduceMotion = useReducedMotion();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      if (!isFoundingMemberWindowOpen()) {
        setRemainingMs(0);
        return;
      }
      setRemainingMs(msUntilFoundingMemberCutoff());
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (remainingMs === null) {
    return (
      <div className="mx-auto mt-8 h-[9.5rem] max-w-xl animate-pulse rounded-3xl border border-amber-500/20 bg-amber-500/10" />
    );
  }

  const closed = remainingMs <= 0;
  const { days, hours, minutes, seconds } = formatFoundingCountdown(remainingMs);
  const critical = !closed && remainingMs < 24 * 60 * 60 * 1000;
  const nextPadded =
    nextFounderNumber != null && nextFounderNumber > 0 && nextFounderNumber <= 100
      ? String(nextFounderNumber).padStart(3, "0")
      : null;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative mx-auto mt-8 max-w-xl overflow-hidden rounded-3xl border p-5 sm:p-6",
        closed
          ? "border-border/60 bg-muted/40"
          : "border-amber-500/45 bg-gradient-to-b from-amber-400/20 via-amber-400/10 to-background shadow-[0_0_0_1px_rgba(245,158,11,0.12),0_18px_50px_-28px_rgba(180,83,9,0.55)]",
      )}
      aria-live="polite"
    >
      {!closed ? (
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-400/25 blur-3xl"
          aria-hidden
        />
      ) : null}

      <div className="relative text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-900 dark:text-amber-100">
          {closed ? (
            <Lock className="h-3 w-3" aria-hidden />
          ) : (
            <Crown className="h-3 w-3" aria-hidden />
          )}
          {copy.eyebrow}
        </p>

        <h2
          className={cn(
            "mt-3 text-xl font-black tracking-tight sm:text-2xl",
            closed ? "text-muted-foreground" : "text-amber-950 dark:text-amber-50",
          )}
        >
          {closed ? copy.titleClosed : copy.titleOpen}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-snug text-amber-950/75 dark:text-amber-100/75">
          {closed ? copy.bodyClosed : copy.bodyOpen}
        </p>

        {!closed ? (
          <>
            <div className="mt-5 flex gap-2 sm:gap-3">
              <Unit value={days} label={copy.days} />
              <Unit value={hours} label={copy.hours} />
              <Unit value={minutes} label={copy.minutes} />
              <Unit value={seconds} label={copy.seconds} pulse={critical && !reduceMotion} />
            </div>

            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-amber-800/70 dark:text-amber-200/65">
              {copy.closesAt}
            </p>

            <ul className="mx-auto mt-5 max-w-md space-y-2 text-left">
              <li className="mb-1 text-center text-[11px] font-bold uppercase tracking-wide text-amber-900/80 dark:text-amber-100/80">
                {copy.benefitsTitle}
              </li>
              {copy.benefits.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm font-medium text-amber-950/85 dark:text-amber-50/85"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-2xl border border-dashed border-amber-500/50 bg-amber-500/10 px-4 py-4">
              {nextPadded ? (
                <p className="font-sans text-base font-black tracking-tight text-amber-950 dark:text-amber-50 sm:text-lg">
                  {copy.nextOpen(nextPadded)}
                </p>
              ) : (
                <p className="text-sm font-bold text-amber-950 dark:text-amber-50">
                  {copy.nextClosed}
                </p>
              )}
              <p className="mt-1 text-xs font-semibold text-amber-900/75 dark:text-amber-100/75">
                {copy.nextCtaHint}
              </p>
              <Link
                href="/checkout"
                className={cn(
                  "mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-amber-500 px-5 text-sm font-black text-amber-950 shadow-sm transition-colors hover:bg-amber-400",
                  critical && !reduceMotion && "animate-pulse",
                )}
              >
                {copy.cta}
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </motion.section>
  );
}
