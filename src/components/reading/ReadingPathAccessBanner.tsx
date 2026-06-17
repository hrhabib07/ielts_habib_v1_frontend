"use client";

import Link from "next/link";
import { Clock3, CreditCard, Sparkles, XCircle } from "lucide-react";
import type { ReadingPathSummary } from "@/src/lib/api/readingStrictProgression";
import { cn } from "@/lib/utils";

export function ReadingPathAccessBanner(props: {
  pathSummary: ReadingPathSummary | null;
  className?: string;
}) {
  const { pathSummary, className } = props;

  if (!pathSummary || pathSummary.hasPremiumAccess) {
    return null;
  }

  if (pathSummary.paymentStatus === "pending") {
    return (
      <div
        className={cn(
          "animate-fade-up rounded-2xl border border-amber-500/35 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5",
          "ring-1 ring-amber-500/15",
          className,
        )}
        role="status"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
              <Clock3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Payment under review
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                You finished the free levels. great work. We are verifying your bKash
                payment now. Levels 3–21 unlock automatically once approved (usually
                within 24–48 hours).
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-500/20 dark:text-amber-100"
          >
            View payment status
          </Link>
        </div>
      </div>
    );
  }

  if (pathSummary.paymentStatus === "rejected") {
    return (
      <div
        className={cn(
          "animate-fade-up rounded-2xl border border-red-500/35 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent p-4 sm:p-5",
          "ring-1 ring-red-500/15",
          className,
        )}
        role="status"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Payment could not be verified
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Your free trial is complete. Please review the rejection reason on the
                pricing page and submit a new payment proof to unlock Level 3 and beyond.
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500"
          >
            Submit new payment
          </Link>
        </div>
      </div>
    );
  }

  if (!pathSummary.freeLevelsComplete) {
    return null;
  }

  return (
    <div
      className={cn(
        "animate-fade-up rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/12 via-primary/8 to-transparent p-4 sm:p-5",
        "ring-1 ring-accent/15",
        className,
      )}
      role="status"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Free levels complete. unlock the full course
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Levels 1 and 2 are done. Subscribe to unlock Level 3 through Level 21,
              all practice tests, and final evaluations on your path to your target band.
            </p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent/90 hover:shadow-md"
        >
          <CreditCard className="h-4 w-4" />
          Unlock premium access
        </Link>
      </div>
    </div>
  );
}
