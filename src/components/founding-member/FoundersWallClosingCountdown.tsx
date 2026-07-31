"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Lock } from "lucide-react";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

const COPY = {
  bn: {
    eyebrow: "এক্সক্লুসিভ · প্রথম 100 জন",
    titleClosed: "ফাউন্ডারস ওয়াল বন্ধ",
    bodyClosed:
      "আমরা 100টি Founder সিট অফার করেছিলাম। তার মধ্যে মাত্র 40টি পূর্ণ হয়েছে। নতুন Founder Number আর ইস্যু হবে না।",
  },
  en: {
    eyebrow: "Exclusive · First 100",
    titleClosed: "Founders' Wall is closed",
    bodyClosed:
      "We offered 100 Founder seats. Only 40 were filled. No new Founder Numbers will be issued.",
  },
} as const;

/** Quiet closed-state notice for the Founders' Wall page. */
export function FoundersWallClosingCountdown({
  nextFounderNumber: _nextFounderNumber,
}: {
  nextFounderNumber?: number | null;
} = {}) {
  const { locale } = useUiLocale();
  const copy = COPY[locale === "bn" ? "bn" : "en"];
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative mx-auto mt-8 max-w-xl overflow-hidden rounded-3xl border p-5 sm:p-6",
        "border-border/60 bg-muted/40",
      )}
      aria-live="polite"
    >
      <div className="relative text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-background px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          <Lock className="h-3 w-3" aria-hidden />
          {copy.eyebrow}
        </p>

        <h2 className="mt-3 text-xl font-black tracking-tight text-muted-foreground sm:text-2xl">
          {copy.titleClosed}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-snug text-muted-foreground">
          {copy.bodyClosed}
        </p>
      </div>
    </motion.section>
  );
}
