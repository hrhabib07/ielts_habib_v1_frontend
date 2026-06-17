"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ChevronRight } from "lucide-react";
import {
  FOUNDER_SCHOLARSHIP_PERCENT,
  FOUNDER_SCHOLARSHIP_PRICE_BDT,
  PREMIUM_LIST_PRICE_BDT,
} from "@/src/lib/pricingOffer";
import { isReadingExamSimulationPath } from "@/src/lib/siteScrollPolicy";

/** Sticky promo for guests: create account to unlock 24h Founder scholarship. */
export function GuestScholarshipBanner() {
  const pathname = usePathname();

  if (isReadingExamSimulationPath(pathname)) {
    return null;
  }

  if (pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/verify-otp")) {
    return null;
  }

  return (
    <Link
      href="/register"
      className="group block border-b border-violet-500/25 bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-950 px-4 py-2.5 text-center text-sm text-violet-50 transition-colors hover:from-violet-900 hover:via-indigo-900"
      role="status"
    >
      <span className="mx-auto inline-flex max-w-4xl flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <Sparkles className="h-4 w-4 shrink-0 text-amber-300" aria-hidden />
        <span className="font-semibold">
          New students: {FOUNDER_SCHOLARSHIP_PERCENT}% off · pay only{" "}
          <span className="text-white">{FOUNDER_SCHOLARSHIP_PRICE_BDT} BDT</span>{" "}
          <span className="text-violet-300/80 line-through">{PREMIUM_LIST_PRICE_BDT} BDT</span> in
          your first <span className="text-amber-200">24 hours</span>
        </span>
        <span className="inline-flex items-center gap-0.5 text-xs font-bold uppercase tracking-wide text-amber-200 group-hover:text-white">
          Join free
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </span>
    </Link>
  );
}
