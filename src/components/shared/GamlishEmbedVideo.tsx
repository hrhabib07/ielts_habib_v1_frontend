"use client";

import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamlishEmbedVideoProps {
  videoId: string | null | undefined;
  title: string;
  placeholderTitle: string;
  placeholderBody: string;
  className?: string;
}

export function GamlishEmbedVideo({
  videoId,
  title,
  placeholderTitle,
  placeholderBody,
  className,
}: GamlishEmbedVideoProps) {
  const id = videoId?.trim() ?? "";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-muted/20 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] dark:bg-muted/10",
        className,
      )}
    >
      <div className="aspect-video w-full">
        {id ? (
          <iframe
            title={title}
            src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-muted/40 via-background to-accent/5 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border/60 bg-background/90 shadow-sm">
              <Play className="h-7 w-7 text-accent" aria-hidden />
            </div>
            <div className="max-w-md space-y-2">
              <p className="text-base font-semibold text-foreground">{placeholderTitle}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{placeholderBody}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
