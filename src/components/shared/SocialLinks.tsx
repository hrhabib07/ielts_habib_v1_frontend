"use client";

import type { ComponentType } from "react";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { GAMLISH_SOCIAL_LINKS, type GamlishSocialId } from "@/src/lib/social";
import { cn } from "@/lib/utils";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .56.04.82.12v-3.4a6.24 6.24 0 0 0-.82-.06A6.34 6.34 0 0 0 3.15 15.4a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.2 8.2 0 0 0 4.76 1.52V6.84a4.85 4.85 0 0 1-1-.15Z" />
    </svg>
  );
}

const ICONS: Record<GamlishSocialId, ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: TikTokIcon,
};

export function SocialLinks({
  className,
  label,
  size = "md",
}: {
  className?: string;
  /** Accessible group label, e.g. "Follow Gamlish". */
  label: string;
  size?: "sm" | "md";
}) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-[1.125rem] w-[1.125rem]";
  const hit = size === "sm" ? "h-9 w-9" : "h-10 w-10";

  return (
    <nav aria-label={label} className={cn("flex flex-col gap-2.5", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
        {label}
      </p>
      <ul className="flex flex-wrap items-center gap-2">
        {GAMLISH_SOCIAL_LINKS.map((item) => {
          const Icon = ICONS[item.id];
          return (
            <li key={item.id}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.label} · Gamlish`}
                title={item.label}
                className={cn(
                  "inline-flex items-center justify-center rounded-full border border-border/70 bg-card text-foreground/80",
                  "transition-colors hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-800",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50",
                  "dark:text-foreground/85 dark:hover:text-sky-200",
                  hit,
                )}
              >
                <Icon className={iconSize} />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
