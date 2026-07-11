"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import {
  FOUNDER_SCHOLARSHIP_PERCENT,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_LIST_PRICE_BDT,
} from "@/src/lib/pricingOffer";
import { brandSurfaces } from "@/src/lib/brand-theme";
import { cn } from "@/lib/utils";

export function FounderScholarshipPromo() {
  return (
    <div className={cn("rounded-2xl border p-5 shadow-sm ring-1 ring-primary/10", brandSurfaces.premiumBanner)}>
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 space-y-2 text-sm">
          <p className="font-semibold text-foreground">
            New here? Get {FOUNDER_SCHOLARSHIP_PERCENT}% Founder scholarship
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Create your account and pay{" "}
            <strong className="text-foreground">{FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT</strong>{" "}
            instead of {PREMIUM_LIST_PRICE_BDT} BDT in your first{" "}
            <strong className="text-foreground">24 hours</strong>. Unlock the full English
            Foundations course. Priced like one month.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:text-primary/80 hover:underline"
          >
            See pricing and pay with bKash
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
