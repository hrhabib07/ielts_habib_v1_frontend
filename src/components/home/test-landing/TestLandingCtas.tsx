"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import {
  TEST_LANDING_PRIMARY_HREF,
  TEST_LANDING_SECONDARY_HREF,
} from "@/src/lib/test-landing-copy";
import { cn } from "@/lib/utils";
import type { TestLandingCopy } from "@/src/lib/test-landing-copy";

export function TestLandingCtas({
  copy,
  align = "center",
  size = "hero",
}: {
  copy: Pick<TestLandingCopy, "ctaPrimary" | "ctaSecondary">;
  align?: "center" | "start";
  size?: "hero" | "block";
}) {
  const primaryClass =
    size === "hero"
      ? "h-auto min-h-14 w-full max-w-md whitespace-normal rounded-2xl px-5 py-3.5 text-base font-bold leading-snug sm:text-lg"
      : "h-auto min-h-12 w-full max-w-md whitespace-normal rounded-2xl px-5 py-3 text-base font-bold";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3",
        align === "start" ? "items-stretch" : "items-center",
      )}
    >
      <Button size="lg" className={cn(primaryClass, LANDING_CTA_CLASS)} asChild>
        <Link href={TEST_LANDING_PRIMARY_HREF}>{copy.ctaPrimary}</Link>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="h-12 w-full max-w-md rounded-2xl border-2 text-base font-semibold"
        asChild
      >
        <Link href={TEST_LANDING_SECONDARY_HREF}>{copy.ctaSecondary}</Link>
      </Button>
    </div>
  );
}
