"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supportWhatsAppHrefWithText } from "@/src/lib/contact";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { cn } from "@/lib/utils";

export function ContentPauseNotice({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  const copy = PLAYER_UI.contentPause;
  const href = supportWhatsAppHrefWithText(copy.whatsappMessage);

  return (
    <div
      className={cn(
        "rounded-2xl border border-sky-500/35 bg-sky-500/10",
        compact ? "px-4 py-3.5" : "px-4 py-4 sm:px-5 sm:py-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-800 dark:text-sky-200">
          <MessageCircle className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 text-left">
          <p className="text-sm font-bold text-foreground sm:text-base">
            {copy.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {copy.body}
          </p>
          <Button
            asChild
            size={compact ? "default" : "lg"}
            className="mt-3 w-full rounded-xl sm:w-auto"
          >
            <a href={href} target="_blank" rel="noopener noreferrer">
              {copy.cta}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
