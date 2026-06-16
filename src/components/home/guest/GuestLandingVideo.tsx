"use client";

import { GamlishEmbedVideo } from "@/src/components/shared/GamlishEmbedVideo";
import { usePlatformVideos } from "@/src/contexts/PlatformVideosContext";
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
  const { howItWorksVideoId } = usePlatformVideos();

  return (
    <GamlishEmbedVideo
      videoId={howItWorksVideoId}
      title={title}
      placeholderTitle={placeholderTitle}
      placeholderBody={placeholderBody}
      className={cn(className)}
    />
  );
}
