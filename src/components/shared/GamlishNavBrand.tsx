"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/src/lib/constants";
import { GamlishWordmarkAnimation } from "./GamlishWordmarkAnimation";

/**
 * Nav identity: G mark (img) + “Gamlish” wordmark (+ tagline animation on sm+).
 */
export function GamlishNavBrand({ className }: { className?: string }) {
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
        {/* Native img — reliable in nav; Next/Image was not painting for some users */}
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
      <span className="hidden shrink-0 items-center border-l border-border/40 pl-2.5 sm:inline-flex">
        <GamlishWordmarkAnimation variant="nav" className="min-w-0" />
      </span>
    </span>
  );
}
