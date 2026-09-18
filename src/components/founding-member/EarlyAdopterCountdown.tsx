"use client";

import Link from "next/link";
import { PersonalOfferCountdown } from "@/src/components/pricing/PersonalOfferCountdown";
import { cn } from "@/lib/utils";

/**
 * Saved countdown strip. Live pages do not mount this.
 * Preview: /demo/countdown-test
 */
export function EarlyAdopterCountdown(props: {
  className?: string;
  showLink?: boolean;
}) {
  const { className, showLink = true } = props;

  const inner = (
    <PersonalOfferCountdown className={cn("w-full", className)} size="sm" />
  );

  if (!showLink) return inner;

  return (
    <Link href="/pricing" className="block transition-opacity hover:opacity-95">
      {inner}
    </Link>
  );
}
