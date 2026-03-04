"use client";

import Image from "next/image";
import { BRAND } from "@/src/lib/constants";

type GamlishLogoProps = {
  showWordmark?: boolean;
  className?: string;
  /** "default" for header/footer (compact), "hero" for large hero placement */
  variant?: "default" | "hero";
};

export function GamlishLogo({
  showWordmark = true,
  className = "",
  variant = "default",
}: GamlishLogoProps) {
  const isHero = variant === "hero";
  const size = isHero ? { w: 160, h: 80 } : { w: 36, h: 36 };

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      aria-label="Gamlish"
    >
      <Image
        src={BRAND.logoUrl}
        alt=""
        width={size.w}
        height={size.h}
        className={
          isHero
            ? "h-16 w-auto md:h-20"
            : "h-7 w-auto max-h-7 shrink-0 object-contain object-center align-middle"
        }
        priority={isHero}
        unoptimized={false}
      />
      {showWordmark && !isHero && (
        <span className="text-lg font-semibold tracking-tight text-foreground leading-none">
          Gamlish
        </span>
      )}
    </span>
  );
}
