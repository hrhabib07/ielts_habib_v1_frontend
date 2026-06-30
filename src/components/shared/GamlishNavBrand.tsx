"use client";

import { cn } from "@/lib/utils";
import { BRAND } from "@/src/lib/constants";
import { GamlishWordmarkAnimation } from "./GamlishWordmarkAnimation";

/**
 * Nav identity: single logo image + “Gamlish” wordmark (+ optional tagline on large screens).
 */
export function GamlishNavBrand({
  className,
  showTagline = true,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 shrink-0 flex-nowrap items-center gap-2 sm:gap-2.5",
        className,
      )}
      aria-label="Gamlish"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BRAND.navLogoUrl}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 object-contain"
        decoding="async"
        fetchPriority="high"
      />
      <span className="whitespace-nowrap text-lg font-semibold leading-none tracking-tight text-foreground">
        Gamlish
      </span>
      {showTagline ? (
        <span className="hidden min-w-0 shrink items-center border-l border-border/40 pl-2.5 lg:inline-flex">
          <GamlishWordmarkAnimation variant="nav" className="min-w-0 max-w-[9.5rem] xl:max-w-none" />
        </span>
      ) : null}
    </span>
  );
}
