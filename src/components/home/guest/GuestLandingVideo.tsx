"use client";

import { GamlishEmbedVideo } from "@/src/components/shared/GamlishEmbedVideo";
import { GAMLISH_HOW_IT_WORKS_VIDEO_ID } from "@/src/lib/guest-landing-config";
import { cn } from "@/lib/utils";

interface GuestLandingVideoProps {
  title: string;
  placeholderTitle: string;
  placeholderBody: string;
  className?: string;
}

export function GuestLandingVideo({
  title,
  placeholderTitle,
  placeholderBody,
  className,
}: GuestLandingVideoProps) {
  return (
    <GamlishEmbedVideo
      videoId={GAMLISH_HOW_IT_WORKS_VIDEO_ID}
      title={title}
      placeholderTitle={placeholderTitle}
      placeholderBody={placeholderBody}
      className={cn(className)}
    />
  );
}
