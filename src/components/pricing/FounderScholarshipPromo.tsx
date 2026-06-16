"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  FOUNDER_SCHOLARSHIP_PERCENT,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_BASE_PRICE_BDT,
} from "@/src/lib/pricingOffer";

export function FounderScholarshipPromo() {
  return (
    <div className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 via-card to-indigo-500/5 p-5 shadow-sm ring-1 ring-violet-500/10">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-2 text-sm">
          <p className="font-semibold text-foreground">
            New here? Get {FOUNDER_SCHOLARSHIP_PERCENT}% Founder scholarship
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Create your account and pay{" "}
            <strong className="text-foreground">{FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT</strong>{" "}
            instead of {PREMIUM_BASE_PRICE_BDT} BDT in your first{" "}
            <strong className="text-foreground">24 hours</strong>. Before 1 August 2026 you also
            get <strong className="text-foreground">6 months</strong> of premium Reading — priced
            like one month.
          </p>
          <Link
            href="/pricing"
            className="inline-flex text-xs font-semibold text-violet-600 underline underline-offset-2 hover:text-violet-500 dark:text-violet-400"
          >
            See pricing &amp; pay with bKash →
          </Link>
        </div>
      </div>
    </div>
  );
}
