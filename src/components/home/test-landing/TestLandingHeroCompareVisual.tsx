"use client";

import { Sparkles } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { TestLandingMedia } from "@/src/components/home/test-landing/TestLandingMedia";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { cn } from "@/lib/utils";

export const TEST_LANDING_HERO_COMPARE_IMAGE =
  "https://res.cloudinary.com/daqvhd097/image/upload/v1789704610/Gamlish_hero_section_visual_story_1_jukkcb.png";

const SPARKLES = [
  { top: "16%", left: "18%", delay: "0s", size: "h-1.5 w-1.5" },
  { top: "28%", left: "78%", delay: "0.45s", size: "h-2 w-2" },
  { top: "58%", left: "12%", delay: "0.9s", size: "h-1.5 w-1.5" },
  { top: "46%", left: "86%", delay: "1.2s", size: "h-1 w-1" },
] as const;

export function TestLandingHeroCompareVisual({
  className,
  mediaClassName,
}: {
  className?: string;
  mediaClassName?: string;
}) {
  const reduceMotion = useReducedMotion();
  const { copy } = useTestLandingCopy();

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-xl overflow-hidden rounded-[1.5rem] shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)] lg:max-w-none",
        className,
      )}
    >
      <TestLandingMedia
        src={TEST_LANDING_HERO_COMPARE_IMAGE}
        alt={copy.heroCompareAlt}
        variant="hero"
        priority
        skeletonTone="light"
        className={mediaClassName}
        sizes="(min-width: 1024px) min(38rem, 42vw), (min-width: 640px) 36rem, calc(100vw - 2rem)"
      />

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-0 right-1/2 top-0 h-[20%] bg-gradient-to-b from-[#efe6d8] from-55% to-transparent"
          aria-hidden
        />
        <div
          className="absolute left-1/2 right-0 top-0 h-[20%] bg-gradient-to-b from-[#dff3fb] from-55% to-transparent"
          aria-hidden
        />

        <div className="absolute left-[3%] right-[51.5%] top-[1%] sm:left-[3.5%] sm:right-[52%] sm:top-[1.2%]">
          <div className="rounded-xl border border-stone-300/80 bg-[#f3ebe0] px-2 py-1 text-center shadow-[0_10px_24px_-16px_rgba(28,25,23,0.55)] sm:px-2.5 sm:py-1.5">
            <p className="text-[10px] font-black leading-tight tracking-tight text-stone-700 sm:text-xs">
              {copy.heroCompareWithoutTitle}
            </p>
            <p className="mt-0.5 text-[9px] font-semibold leading-tight text-stone-500 sm:text-[10px]">
              {copy.heroCompareWithoutSub}
            </p>
          </div>
        </div>

        <div className="absolute left-[51.5%] right-[3%] top-[1%] sm:left-[52%] sm:right-[3.5%] sm:top-[1.2%]">
          <div className="rounded-xl border border-sky-300/80 bg-sky-50 px-2 py-1 text-center shadow-[0_10px_24px_-14px_rgba(14,165,233,0.7)] sm:px-2.5 sm:py-1.5">
            <p className="text-[10px] font-black leading-tight tracking-tight text-sky-800 sm:text-xs">
              {copy.heroCompareWithTitle}
            </p>
            <p className="mt-0.5 text-[9px] font-semibold leading-tight text-sky-600 sm:text-[10px]">
              {copy.heroCompareWithSub}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 right-0 top-1/2 p-[3.5%] sm:p-[4.5%]">
          <div
            className={cn(
              "relative flex h-full w-full items-end justify-center rounded-[0.9rem] rounded-br-[1.05rem]",
              "bg-[radial-gradient(ellipse_at_center,rgba(125,211,252,0.28),rgba(14,165,233,0.12)_58%,transparent_78%)]",
              "ring-[3px] ring-sky-300",
              !reduceMotion && "test-landing-foundation-pulse",
            )}
          >
            <span
              className="absolute inset-0 rounded-[inherit] ring-[3px] ring-cyan-200/80"
              aria-hidden
            />
            {!reduceMotion ? (
              <span
                className="test-landing-foundation-ring absolute -inset-1 rounded-[inherit] border-2 border-sky-200/90"
                aria-hidden
              />
            ) : null}

            {!reduceMotion ? (
              <span
                className="absolute inset-0 overflow-hidden rounded-[inherit]"
                aria-hidden
              >
                <span className="test-landing-foundation-sheen absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent" />
              </span>
            ) : null}

            {!reduceMotion
              ? SPARKLES.map((sparkle) => (
                  <span
                    key={`${sparkle.top}-${sparkle.left}`}
                    className={cn(
                      "test-landing-foundation-sparkle absolute rounded-full bg-white shadow-[0_0_10px_3px_rgba(186,230,253,0.95)]",
                      sparkle.size,
                    )}
                    style={{
                      top: sparkle.top,
                      left: sparkle.left,
                      animationDelay: sparkle.delay,
                    }}
                    aria-hidden
                  />
                ))
              : null}

            <p
              className={cn(
                "relative z-[1] mb-1.5 flex w-[calc(100%-0.65rem)] items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 px-2 py-1.5 text-center text-[10px] font-black leading-none text-white sm:mb-2.5 sm:gap-1.5 sm:px-2.5 sm:text-[11px]",
                !reduceMotion && "test-landing-foundation-badge",
              )}
            >
              <Sparkles className="h-3 w-3 shrink-0 text-white" aria-hidden />
              {copy.heroFoundationLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
