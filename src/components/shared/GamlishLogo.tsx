"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND } from "@/src/lib/constants";
import { GamlishNavBrand } from "./GamlishNavBrand";

type GamlishLogoProps = {
  showWordmark?: boolean;
  /** Header nav: icon + animated wordmark (use this, not the wide logo asset). */
  animateWordmark?: boolean;
  /** Icon mark only (footer / compact surfaces). */
  iconMark?: boolean;
  className?: string;
  /** "default" for header/footer (compact), "hero" for large hero placement */
  variant?: "default" | "hero";
};

export function GamlishLogo({
  showWordmark = true,
  animateWordmark = false,
  iconMark: iconMarkProp,
  className = "",
  variant = "default",
}: GamlishLogoProps) {
  const isHero = variant === "hero";

  if (animateWordmark && !isHero) {
    return <GamlishNavBrand className={className} />;
  }

  const useIconMark = iconMarkProp ?? false;

  return (
    <span
      className={cn(
        "inline-flex flex-nowrap items-center gap-2",
        isHero ? "gap-2.5" : "h-7",
        className,
      )}
      aria-label="Gamlish"
      suppressHydrationWarning
    >
      {useIconMark && !isHero ? (
        <Image
          src={BRAND.iconMarkUrl}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 object-contain"
        />
      ) : (
        <Image
          src={BRAND.logoUrl}
          alt=""
          width={isHero ? 160 : 36}
          height={isHero ? 80 : 36}
          className={
            isHero
              ? "h-11 w-auto sm:h-12 md:h-14"
              : "h-7 w-auto max-h-7 shrink-0 object-contain object-center align-middle"
          }
          priority={isHero}
          unoptimized={false}
          suppressHydrationWarning
        />
      )}
      {showWordmark && !isHero && (
        <span className="text-lg font-semibold leading-none tracking-tight text-foreground">
          Gamlish
        </span>
      )}
    </span>
  );
}
