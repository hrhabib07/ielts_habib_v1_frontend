"use client";

import { resolveVideoEmbed } from "@/lib/video-embed";
import { cn } from "@/lib/utils";

interface PlayerVideoEmbedProps {
  videoUrl?: string | null;
  title?: string;
  className?: string;
  emptyMessage?: string;
  invalidMessage?: string;
}

export function PlayerVideoEmbed({
  videoUrl,
  title = "Learning video",
  className,
  emptyMessage = "Video coming soon. Tap Continue when ready.",
  invalidMessage = "This video link could not be loaded. Ask your admin to paste a valid YouTube or Vimeo link.",
}: PlayerVideoEmbedProps) {
  const trimmed = videoUrl?.trim() ?? "";
  const embed = resolveVideoEmbed(trimmed);

  if (!trimmed) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  if (!embed) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 px-6 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        {invalidMessage}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "aspect-video overflow-hidden rounded-2xl border border-border bg-black",
        className,
      )}
    >
      {embed.type === "iframe" ? (
        <iframe
          src={embed.src}
          title={title}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <video src={embed.src} controls className="h-full w-full" playsInline>
          <track kind="captions" />
        </video>
      )}
    </div>
  );
}
