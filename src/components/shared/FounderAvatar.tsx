"use client";

import Image from "next/image";
import { FOUNDER_PROFILE } from "@/src/lib/founder-profile";
import { cn } from "@/lib/utils";

type FounderAvatarProps = {
  className?: string;
  size?: number;
};

/** Shared founder portrait (Cloudinary). Use instead of initials. */
export function FounderAvatar({ className, size = 44 }: FounderAvatarProps) {
  return (
    <Image
      src={FOUNDER_PROFILE.imageUrl}
      alt={FOUNDER_PROFILE.imageAlt}
      width={size}
      height={size}
      className={cn(
        "shrink-0 rounded-xl object-cover ring-2 ring-sky-400/30",
        className,
      )}
    />
  );
}
