"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

export type PremiumReadingLockContext =
  | "practice_test"
  | "step_content"
  | "final_evaluation"
  | "level";

interface PremiumReadingLockPanelProps {
  variant: "fullscreen" | "inline";
  levelId: string;
  context: PremiumReadingLockContext;
}

type LockLocale = "en" | "bn";

const MESSAGES: Record<
  PremiumReadingLockContext,
  Record<LockLocale, { eyebrow: string; body: string }>
> = {
  practice_test: {
    en: {
      eyebrow: "Free trial complete",
      body: "Thank you for completing the free part of your journey. You've reached the start of the paid tier on this step. On Level 1, the free track usually includes everything through Practice Test 1. This level isn't done until you unlock what follows (this test, later steps, and the final evaluation). Subscribe to continue without losing momentum toward your desired band score.",
    },
    bn: {
      eyebrow: "ফ্রি ট্রায়াল সম্পন্ন",
      body: "আপনার ফ্রি অংশ সম্পন্ন করার জন্য ধন্যবাদ। এই ধাপে আপনি পেইড টিয়ারের শুরুতে এসেছেন। লেভেল ১-এ ফ্রি ট্র্যাকে সাধারণত প্র্যাকটিস টেস্ট ১ পর্যন্ত থাকে। বাকি প্র্যাকটিস টেস্ট, পরবর্তী ধাপ ও ফাইনাল ইভ্যালুয়েশন আনলক না করলে এই লেভেল সম্পূর্ণ হয় না। আপনার কাঙ্ক্ষিত ব্যান্ড স্কোরের দিকে এগিয়ে যেতে সাবস্ক্রাইব করুন।",
    },
  },
  step_content: {
    en: {
      eyebrow: "Free trial complete",
      body: "Thank you for your progress. You've finished everything included in the free trial. The rest of this level and Levels 2–20 are for subscribed learners. Upgrade to keep your momentum and complete the structured path to your desired band.",
    },
    bn: {
      eyebrow: "ফ্রি ট্রায়াল সম্পন্ন",
      body: "আপনার অগ্রগতির জন্য ধন্যবাদ। ফ্রি ট্রায়ালে যা ছিল তা আপনি শেষ করেছেন। এই লেভেলের বাকি অংশ ও লেভেল ২–২০ সাবস্ক্রাইবড শিক্ষার্থীদের জন্য। আপনার লক্ষ্য ব্যান্ডের পথে গতি ধরে রাখতে আপগ্রেড করুন।",
    },
  },
  final_evaluation: {
    en: {
      eyebrow: "Free trial complete",
      body: "Thank you for completing the free steps on this level. The timed, full final evaluation and everything after it require an active Reading subscription. Unlock it to officially close this level and move forward.",
    },
    bn: {
      eyebrow: "ফ্রি ট্রায়াল সম্পন্ন",
      body: "এই লেভেলের ফ্রি ধাপগুলো সম্পন্ন করায় ধন্যবাদ। সময়সীমাসহ পূর্ণ ফাইনাল ইভ্যালুয়েশন ও তার পরের সবকিছুর জন্য সক্রিয় রিডিং সাবস্ক্রিপশন দরকার। লেভেলটি আনুষ্ঠানিকভাবে শেষ করে এগিয়ে যেতে আনলক করুন।",
    },
  },
  level: {
    en: {
      eyebrow: "Premium required",
      body: "You've reached the end of the free track. Full levels, all practice tests, and final evaluations ahead are built for Premium members. Subscribe to unlock this level and the complete 20-level course.",
    },
    bn: {
      eyebrow: "প্রিমিয়াম প্রয়োজন",
      body: "আপনি ফ্রি ট্র্যাকের শেষে এসেছেন। সম্পূর্ণ লেভেল, সব প্র্যাকটিস টেস্ট ও ফাইনাল ইভ্যালুয়েশন প্রিমিয়াম সদস্যদের জন্য। এই লেভেল ও সম্পূর্ণ ২০-লেভেল কোর্স আনলক করতে সাবস্ক্রাইব করুন।",
    },
  },
};

const BN_FONT = "[font-family:var(--font-hind-siliguri),sans-serif]";

const feedbackHref = (levelId: string) =>
  `/feedback/trial?levelId=${encodeURIComponent(levelId)}`;

export function PremiumReadingLockPanel({
  variant,
  levelId,
  context,
}: PremiumReadingLockPanelProps) {
  const [locale, setLocale] = useState<LockLocale>("en");
  const { eyebrow, body } = MESSAGES[context][locale];

  const inner = (
    <div
      className={cn(
        "w-full",
        variant === "fullscreen" ? "max-w-md px-4" : "max-w-md",
      )}
    >
      <div
        className={cn(
          "relative rounded-2xl border border-slate-200/90 bg-white shadow-md dark:border-slate-700/90 dark:bg-slate-900",
          variant === "fullscreen" ? "p-5 sm:p-6" : "p-4 sm:p-5",
        )}
      >
        <div className="absolute right-3 top-3 z-10 flex rounded-lg border border-slate-200/90 bg-slate-50 p-0.5 text-[11px] font-semibold dark:border-slate-600 dark:bg-slate-800/90">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={cn(
              "rounded-md px-2 py-1 transition-colors",
              locale === "en"
                ? "bg-[#0f172a] text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-700",
            )}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale("bn")}
            className={cn(
              "rounded-md px-2 py-1 transition-colors",
              locale === "bn"
                ? "bg-[#0f172a] text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-700",
              locale === "bn" && BN_FONT,
            )}
          >
            বাংলা
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 pr-14 text-center sm:gap-4 sm:pr-16">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700">
            <Lock
              className="h-5 w-5 text-[#0f172a] dark:text-slate-200"
              strokeWidth={2}
              aria-hidden
            />
          </div>
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1e3a8a] dark:text-blue-400",
              locale === "bn" && BN_FONT,
            )}
          >
            {eyebrow}
          </p>
          <p
            className={cn(
              "text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-400",
              locale === "bn" && BN_FONT,
            )}
          >
            {body}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#0f172a] px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1e293b] dark:bg-slate-100 dark:text-[#0f172a] dark:hover:bg-white sm:flex-none sm:text-sm"
          >
            Unlock premium
          </Link>
          <Link
            href={feedbackHref(levelId)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:flex-none sm:text-sm"
          >
            <MessageSquareText className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            Feedback
          </Link>
        </div>
      </div>
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 z-40 flex min-h-0 flex-col overflow-y-auto overscroll-y-contain bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-1 flex-col items-center justify-center py-8 sm:min-h-0 sm:py-10">
          {inner}
        </div>
      </div>
    );
  }

  return <div className="py-1">{inner}</div>;
}
