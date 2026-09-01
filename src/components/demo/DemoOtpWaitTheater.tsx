"use client";

import { useEffect, useState } from "react";
import { Gift, Sparkles, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Locale = "bn" | "en";

type Beat = {
  untilSec: number;
  icon: "zap" | "trophy" | "sparkles" | "gift";
  titleBn: string;
  titleEn: string;
  subBn: string;
  subEn: string;
  progress: number;
};

const BEATS: Beat[] = [
  {
    untilSec: 3,
    icon: "zap",
    titleBn: "তোমার 50 XP সুরক্ষিত করা হচ্ছে…",
    titleEn: "Securing your 50 XP…",
    subBn: "ডেমোর জয় এখন প্রোফাইলে লক হচ্ছে।",
    subEn: "Your demo win is locking onto your profile.",
    progress: 22,
  },
  {
    untilSec: 6,
    icon: "trophy",
    titleBn: "Level 2 প্রোফাইল তৈরি হচ্ছে…",
    titleEn: "Building your Level 2 profile…",
    subBn: "ব্যাজ ও প্রগ্রেস সেটআপ চলছে।",
    subEn: "Badge and progress setup in motion.",
    progress: 48,
  },
  {
    untilSec: 9,
    icon: "sparkles",
    titleBn: "Mission 01 আনলক প্রস্তুত হচ্ছে…",
    titleEn: "Preparing Mission 01 unlock…",
    subBn: "সেভ শেষ হলেই পরের মিশন খুলবে।",
    subEn: "Next mission opens once save finishes.",
    progress: 72,
  },
  {
    untilSec: 999,
    icon: "gift",
    titleBn: "OTP এলে নিচে লিখো · সিক্রেট বোনাস খুলবে",
    titleEn: "Enter OTP below · unlock your secret bonus",
    subBn: "কোড এসে গেলে পেস্ট করো। বক্সটা OTP দিয়ে খুলবে।",
    subEn: "Paste the code when it arrives. OTP opens the box.",
    progress: 100,
  },
];

function pickBeat(elapsedSec: number): Beat {
  return BEATS.find((b) => elapsedSec < b.untilSec) ?? BEATS[BEATS.length - 1]!;
}

/**
 * Demo save OTP wait · Profile-generation beats + soft mystery gift.
 * OTP field stays available underneath (parent owns the form).
 */
export function DemoOtpWaitTheater({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  const beat = pickBeat(elapsed);
  const title = locale === "bn" ? beat.titleBn : beat.titleEn;
  const sub = locale === "bn" ? beat.subBn : beat.subEn;
  const Icon =
    beat.icon === "zap"
      ? Zap
      : beat.icon === "trophy"
        ? Trophy
        : beat.icon === "sparkles"
          ? Sparkles
          : Gift;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-amber-500/35 bg-gradient-to-br from-amber-400/15 via-sky-500/10 to-transparent p-3.5",
        locale === "bn" && "font-bengali",
        className,
      )}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl text-amber-950 shadow-md",
              beat.icon === "gift"
                ? "animate-bounce bg-gradient-to-br from-amber-300 to-orange-400"
                : "bg-gradient-to-br from-amber-300 to-amber-500",
            )}
          >
            <Icon className="h-6 w-6" aria-hidden />
          </span>
          {beat.icon === "gift" ? (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-[9px] font-black text-white">
              !
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-black leading-snug text-foreground">
            {title}
          </p>
          <p className="mt-0.5 text-[11px] font-medium leading-snug text-muted-foreground">
            {sub}
          </p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-500/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-500 to-emerald-400 transition-[width] duration-500 ease-out"
          style={{ width: `${beat.progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-amber-900/70 dark:text-amber-100/70">
          {locale === "bn" ? "অ্যাকাউন্ট তৈরি হচ্ছে" : "Building your account"}
        </p>
        <p className="font-sans text-[10px] font-black tabular-nums text-foreground/70">
          {Math.min(elapsed, 15)}s
        </p>
      </div>
    </div>
  );
}
