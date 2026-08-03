"use client";

import Link from "next/link";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

/**
 * Limited-offer strip (no countdown) · First Week / First Month windows still
 * get badges from the API; this is urgency copy only.
 */
export function EarlyAdopterCountdown(props: {
  className?: string;
  showLink?: boolean;
}) {
  const { className, showLink = true } = props;
  const { locale } = useUiLocale();

  const inner = (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-sky-500/10 px-3 py-2 text-xs text-foreground ring-1 ring-amber-500/10",
        locale === "bn" && "font-bengali",
        className,
      )}
    >
      <span className="font-bold text-amber-900 dark:text-amber-200">
        {locale === "bn" ? "অফারটি সীমিত সময়ের জন্যে" : "Limited-time offer"}
      </span>
      <span className="text-muted-foreground">·</span>
      <span className="font-medium text-muted-foreground">
        {locale === "bn" ? "ফুল জার্নি অ্যাক্সেস · 690 টাকা" : "Full Journey Access · 690 BDT"}
      </span>
    </div>
  );

  if (!showLink) return inner;

  return (
    <Link href="/pricing" className="block transition-opacity hover:opacity-95">
      {inner}
    </Link>
  );
}
