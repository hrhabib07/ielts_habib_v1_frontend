"use client";

import Image from "next/image";
import { BRAND } from "@/src/lib/constants";
import { GamlishWordmarkAnimation } from "./GamlishWordmarkAnimation";

type GamlishLogoProps = {
  showWordmark?: boolean;
  /** Header-only: Game + English → merge into Gamlish */
  animateWordmark?: boolean;
  className?: string;
  /** "default" for header/footer (compact), "hero" for large hero placement */
  variant?: "default" | "hero";
};

export function GamlishLogo({
  showWordmark = true,
  animateWordmark = false,
  className = "",
  variant = "default",
}: GamlishLogoProps) {
  const isHero = variant === "hero";
  const size = isHero ? { w: 160, h: 80 } : { w: 36, h: 36 };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      aria-label="Gamlish"
      suppressHydrationWarning
    >
      <Image
        src={BRAND.logoUrl}
        alt=""
        width={size.w}
        height={size.h}
        className={
          isHero
            ? "h-11 w-auto sm:h-12 md:h-14"
            : "h-7 w-auto max-h-7 shrink-0 object-contain object-center align-middle"
        }
        priority={isHero}
        unoptimized={false}
        suppressHydrationWarning
      />
      {showWordmark && !isHero && (
        animateWordmark ? (
          <GamlishWordmarkAnimation />
        ) : (
          <span className="text-lg font-semibold tracking-tight text-foreground leading-none">
            Gamlish
          </span>
        )
      )}
    </span>
  );
}
