"use client";

import { motion } from "framer-motion";
import { ChevronRight, Play, Video } from "lucide-react";
import { GamlishEmbedVideo } from "@/src/components/shared/GamlishEmbedVideo";
import type { LevelIntroVideoConfig } from "@/src/lib/levelIntroVideos";
import { readingPathPremium } from "@/src/lib/readingPathPremium";
import { cn } from "@/lib/utils";

interface LevelIntroVideoStepProps {
  config: LevelIntroVideoConfig;
  stepIndex: number;
  totalSteps: number;
  onContinue: () => void;
}

export function LevelIntroVideoStep({
  config,
  stepIndex,
  totalSteps,
  onContinue,
}: LevelIntroVideoStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto w-full max-w-xl"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          readingPathPremium.cardActive,
          "bg-card/95 backdrop-blur-sm",
        )}
      >
        <div className={cn(readingPathPremium.cardActiveGlow, "-z-10")} aria-hidden />
        <div
          className="h-1 w-full bg-gradient-to-r from-primary via-accent to-accent/80"
          aria-hidden
        />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-accent ring-1 ring-accent/15">
              <Video className="h-3 w-3" />
              Start here
            </span>
            <span className={readingPathPremium.microLabel}>
              Step {stepIndex} of {totalSteps}
            </span>
            <span className={readingPathPremium.microLabel}>· {config.eyebrow}</span>
          </div>

          <h1 className={cn(readingPathPremium.heroTitle, "mt-5 text-xl sm:text-2xl")}>
            {config.title}
          </h1>
          <p className={cn(readingPathPremium.heroBody, "mt-2")}>{config.body}</p>

          <div className="mt-6">
            <GamlishEmbedVideo
              videoId={config.videoId}
              title={config.title}
              placeholderTitle={config.placeholderTitle}
              placeholderBody={config.placeholderBody}
            />
          </div>

          <div className="mt-7 sm:mt-8">
            <button
              type="button"
              onClick={onContinue}
              className={cn(
                "group/btn relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-sm",
                "bg-primary transition-all duration-200 hover:bg-primary/90 hover:shadow-md",
                "dark:bg-accent dark:text-primary-foreground dark:hover:bg-accent/90",
                "active:scale-[0.992]",
              )}
            >
              <span
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.12)_50%,transparent_70%)] opacity-0 transition-opacity group-hover/btn:opacity-100"
                aria-hidden
              />
              <span className="relative z-10 inline-flex items-center gap-2">
                <Play className="h-4 w-4" />
                Continue to practice
                <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </span>
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              You can rewatch this anytime from the level roadmap
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
