"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TONES = [
  "bg-gradient-to-br from-sky-500 to-blue-700",
  "bg-gradient-to-br from-violet-500 to-indigo-700",
  "bg-gradient-to-br from-emerald-500 to-teal-700",
  "bg-gradient-to-br from-cyan-500 to-sky-700",
  "bg-gradient-to-br from-indigo-500 to-blue-800",
  "bg-gradient-to-br from-teal-500 to-cyan-800",
] as const;

/** First visible letter of a display name (Unicode-safe). */
export function nameInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return (Array.from(trimmed)[0] ?? "?").toUpperCase();
}

export function isUsableAvatarUrl(url: string | null | undefined): boolean {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed === "null" || trimmed === "undefined") return false;
  return /^https?:\/\//i.test(trimmed) || trimmed.startsWith("/");
}

function toneForName(name: string): string {
  const trimmed = name.trim();
  let hash = 0;
  for (let i = 0; i < trimmed.length; i += 1) {
    hash = (hash * 31 + trimmed.charCodeAt(i)) >>> 0;
  }
  return TONES[hash % TONES.length] ?? TONES[0];
}

const SIZE_TEXT = {
  xs: "text-[0.7rem]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-xl",
  xl: "text-3xl",
} as const;

type NameInitialAvatarProps = {
  name: string;
  url?: string | null;
  className?: string;
  /** Override the hashed gradient tone. */
  toneClassName?: string;
  size?: keyof typeof SIZE_TEXT;
  alt?: string;
};

/**
 * Profile photo when available; otherwise a strong first-letter mark.
 * Broken / empty URLs fall back to the letter (no broken-image icon).
 */
export function NameInitialAvatar({
  name,
  url = null,
  className,
  toneClassName,
  size = "md",
  alt,
}: NameInitialAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const label = name.trim() || "Learner";
  const initial = nameInitial(label);
  const usable = isUsableAvatarUrl(url);
  const showImage = usable && url != null && failedUrl !== url.trim();
  const tone = toneClassName ?? toneForName(label);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-black leading-none text-white select-none",
        !showImage && tone,
        SIZE_TEXT[size],
        className,
      )}
      aria-hidden={alt ? undefined : true}
      role={alt ? "img" : undefined}
      aria-label={alt}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url.trim()}
          alt=""
          onError={() => setFailedUrl(url.trim())}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="relative z-[1] translate-y-px tracking-tight">{initial}</span>
      )}
    </span>
  );
}
