"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/src/lib/constants";
import { GamlishWordmarkAnimation } from "./GamlishWordmarkAnimation";

/**
 * Nav identity: G mark (img) + “Gamlish” wordmark (+ optional tagline animation on large screens).
 */
export function GamlishNavBrand({
  className,
  showTagline = true,
}: {
  className?: string;
  /** Hide animated tagline (e.g. student home / narrow mobile headers). */
  showTagline?: boolean;
}) {
  const [logoSrc, setLogoSrc] = useState<string>(BRAND.navLogoUrl);

  return (
    <span
      className={cn(
        "inline-flex h-9 shrink-0 flex-nowrap items-center gap-2 sm:gap-2.5",
        className,
      )}
      aria-label="Gamlish"
    >
      <span
        className={cn(
          "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg",
          "bg-white shadow-sm ring-1 ring-border/50",
          "dark:bg-white dark:ring-white/20",
        )}
      >
        {/* Native img. reliable in nav; Next/Image was not painting for some users */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          width={32}
          height={32}
          className="h-7 w-7 object-contain"
          decoding="async"
          fetchPriority="high"
          onError={() => {
            if (logoSrc !== BRAND.navLogoRemoteUrl) {
              setLogoSrc(BRAND.navLogoRemoteUrl);
            }
          }}
        />
      </span>
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
