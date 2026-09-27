"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { getPublicLearnerFeedback } from "@/src/lib/api/learnerFeedback";
import type { LearnerFeedbackPublicItem } from "@/src/lib/learner-feedback";
import { CAMPUS_MISSIONS_TOTAL } from "@/src/components/feedback/LearnerFeedbackCard";
import {
  selectPlayingNowStories,
  TEST_LANDING_PLAYING_NOW_FALLBACK,
} from "@/src/lib/test-landing-playing-now";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { NameInitialAvatar } from "@/src/components/shared/NameInitialAvatar";
import { cn } from "@/lib/utils";

const AUTO_MS = 7000;
const SWIPE_PX = 56;

function PlayerAvatar({
  item,
  className,
  size = "md",
}: {
  item: LearnerFeedbackPublicItem;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  return (
    <NameInitialAvatar
      name={item.displayName}
      url={item.avatarUrl}
      size={size}
      className={className}
    />
  );
}

function StarRow({ stars, className }: { stars: number; className?: string }) {
  return (
    <span className={cn("flex shrink-0 items-center gap-0.5", className)} aria-hidden>
      {Array.from({ length: 5 }, (_, starIndex) => (
        <Star
          key={starIndex}
          className={cn(
            "h-3.5 w-3.5",
            starIndex < stars ? "fill-amber-400 text-amber-400" : "text-white/20",
          )}
        />
      ))}
    </span>
  );
}

export function TestLandingPlayingNow() {
  const reduceMotion = Boolean(useReducedMotion());
  const { copy } = useTestLandingCopy();
  const [items, setItems] = useState<LearnerFeedbackPublicItem[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getPublicLearnerFeedback(100)
      .then((rows) => {
        if (cancelled) return;
        const selected = selectPlayingNowStories(rows);
        setItems(
          selected.length > 0
            ? selected
            : [...TEST_LANDING_PLAYING_NOW_FALLBACK],
        );
      })
      .catch(() => {
        if (!cancelled) setItems([...TEST_LANDING_PLAYING_NOW_FALLBACK]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const count = items.length;
  const active = count > 0 ? items[index % count] : null;

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setIndex((current) => (current + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (reduceMotion || paused || count < 2) return;
    const timer = window.setInterval(() => go(1), AUTO_MS);
    return () => window.clearInterval(timer);
  }, [count, go, paused, reduceMotion]);

  if (!active) return null;

  const handle = (active.username || active.profileHandle || "").trim();
  const profileHref = handle ? `/u/${encodeURIComponent(handle)}` : null;
  const missions = Math.min(
    CAMPUS_MISSIONS_TOTAL,
    Math.max(0, active.missionsCompleted ?? active.highestCompletedMissionOrder ?? 0),
  );
  const missionPct = (missions / CAMPUS_MISSIONS_TOTAL) * 100;
  const stars = Math.max(0, Math.min(5, Math.round(active.rating)));
  const nameClass = cn(
    "block max-w-full font-bold text-white",
    profileHref && "hover:text-sky-200",
  );

  return (
    <section
      className="relative overflow-x-hidden bg-slate-950 pb-28 pt-12 text-white sm:py-20 md:py-24"
      aria-labelledby="test-landing-playing-now-title"
      tabIndex={count > 1 ? 0 : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(1);
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_18%_10%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(ellipse_50%_40%_at_88%_90%,rgba(16,185,129,0.12),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-200 sm:text-xs sm:tracking-[0.16em]">
            <span className="relative flex h-2 w-2">
              {!reduceMotion ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              ) : null}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {copy.playingNowEyebrow}
          </p>
          <h2
            id="test-landing-playing-now-title"
            className="mt-3 text-balance text-[1.7rem] font-bold leading-[1.2] tracking-tight sm:mt-4 sm:text-3xl md:text-4xl"
          >
            {copy.playingNowTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-[0.95rem] leading-relaxed text-sky-100/75 sm:mt-3 sm:text-base md:text-lg">
            {copy.playingNowSub}
          </p>
        </div>

        <div className="mt-6 grid w-full min-w-0 items-stretch gap-4 sm:mt-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.7fr)] lg:gap-6">
          <div className="relative w-full min-w-0 overflow-hidden rounded-[1.35rem] sm:rounded-[1.5rem] lg:min-h-[26rem] lg:rounded-[1.75rem]">
            <AnimatePresence mode="wait">
              <motion.figure
                key={active.id}
                drag={reduceMotion || count < 2 ? false : "x"}
                dragListener={!reduceMotion && count > 1}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                dragDirectionLock
                onDragStart={() => setPaused(true)}
                onDragEnd={(_, info) => {
                  setPaused(false);
                  if (info.offset.x < -SWIPE_PX) go(1);
                  else if (info.offset.x > SWIPE_PX) go(-1);
                }}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.32, ease: GUEST_EASE }}
                className="relative flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-white/12 bg-white/[0.05] px-4 py-5 shadow-[0_30px_90px_-42px_rgba(56,189,248,0.65)] sm:rounded-[1.5rem] sm:px-8 sm:py-8 lg:absolute lg:inset-0 lg:rounded-[1.75rem] lg:px-9 lg:py-9"
              >
                <Quote
                  className="pointer-events-none absolute -right-1 -top-2 hidden h-24 w-24 text-sky-400/15 sm:block sm:h-28 sm:w-28"
                  aria-hidden
                />
                <Quote className="h-7 w-7 shrink-0 text-sky-300 sm:h-8 sm:w-8" aria-hidden />
                <blockquote className="relative order-2 mt-4 max-w-full text-pretty break-words [overflow-wrap:anywhere] text-[1.5rem] font-semibold leading-[1.5] tracking-tight text-white sm:mt-5 sm:text-2xl sm:leading-snug md:text-[1.8rem] md:leading-[1.35] lg:order-none">
                  {active.body.trim()}
                </blockquote>
                <figcaption className="relative order-1 mt-3 min-w-0 overflow-hidden rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10 sm:mt-4 lg:order-none lg:hidden">
                  <div className="flex min-w-0 items-start gap-3">
                    <PlayerAvatar
                      item={active}
                      size="md"
                      className="h-11 w-11 ring-2 ring-sky-300/40"
                    />
                    <div className="min-w-0 flex-1 overflow-hidden">
                      {profileHref ? (
                        <Link
                          href={profileHref}
                          className={cn(
                            nameClass,
                            "line-clamp-2 break-words text-[1.05rem] leading-snug [overflow-wrap:anywhere]",
                          )}
                        >
                          {active.displayName}
                        </Link>
                      ) : (
                        <span
                          className={cn(
                            nameClass,
                            "line-clamp-2 break-words text-[1.05rem] leading-snug [overflow-wrap:anywhere]",
                          )}
                        >
                          {active.displayName}
                        </span>
                      )}
                      <span className="mt-1 block line-clamp-2 break-words text-[0.8rem] leading-snug text-sky-200/80 [overflow-wrap:anywhere]">
                        {active.title}
                      </span>
                      <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <StarRow stars={stars} />
                        {missions > 0 ? (
                          <span className="num text-xs font-bold tabular-nums text-sky-100/85">
                            {missions}/{CAMPUS_MISSIONS_TOTAL} {copy.playingNowMissions}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                  {missions > 0 ? (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        key={active.id}
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${missionPct}%` }}
                        transition={{ duration: 0.55, ease: GUEST_EASE }}
                      />
                    </div>
                  ) : null}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <aside className="hidden min-w-0 overflow-hidden rounded-[1.75rem] border border-white/12 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 lg:flex lg:flex-col lg:justify-between">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {copy.playingNowLive}
              </p>
              <div className="mt-5 flex min-w-0 items-center gap-4">
                <PlayerAvatar
                  item={active}
                  size="xl"
                  className="h-20 w-20 ring-2 ring-sky-300/35 shadow-lg shadow-sky-500/20"
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  {profileHref ? (
                    <Link
                      href={profileHref}
                      className={cn(nameClass, "truncate text-xl")}
                    >
                      {active.displayName}
                    </Link>
                  ) : (
                    <p className={cn(nameClass, "truncate text-xl")}>{active.displayName}</p>
                  )}
                  <p className="mt-1 truncate text-sm text-sky-200/80">{active.title}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1" aria-label={`${stars} star`}>
                <StarRow stars={stars} className="gap-1 [&_svg]:h-4 [&_svg]:w-4" />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-end justify-between gap-3">
                <p className="text-sm font-semibold text-sky-100/80">
                  {copy.playingNowMissions}
                </p>
                <p className="num text-sm font-black tabular-nums text-white">
                  {missions}/{CAMPUS_MISSIONS_TOTAL}
                </p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  key={active.id}
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${missionPct}%` }}
                  transition={{ duration: 0.55, ease: GUEST_EASE }}
                />
              </div>
            </div>
          </aside>
        </div>

        {count > 1 ? (
          <div className="mt-5 flex w-full min-w-0 flex-col items-center gap-3 sm:mt-8 sm:gap-5">
            <div className="flex w-full min-w-0 items-center gap-2 sm:max-w-lg sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/12 sm:h-12 sm:w-12"
                onClick={() => go(-1)}
                aria-label={copy.playingNowPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <ul className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {items.map((item, itemIndex) => {
                  const selected = itemIndex === index;
                  return (
                    <li key={item.id} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setIndex(itemIndex)}
                        aria-label={item.displayName}
                        aria-current={selected ? "true" : undefined}
                        className={cn(
                          "rounded-full p-0.5 transition-transform duration-300",
                          selected
                            ? "scale-105 ring-2 ring-sky-300 ring-offset-2 ring-offset-slate-950 sm:scale-110"
                            : "opacity-45 hover:opacity-80",
                        )}
                      >
                        <PlayerAvatar
                          item={item}
                          size="sm"
                          className="h-8 w-8 sm:h-11 sm:w-11 sm:text-sm"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/12 sm:h-12 sm:w-12"
                onClick={() => go(1)}
                aria-label={copy.playingNowNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <p className="num text-sm font-semibold tabular-nums text-sky-100/70">
              {index + 1} / {count}
            </p>

            {!reduceMotion ? (
              <div className="h-0.5 w-28 overflow-hidden rounded-full bg-white/10 sm:w-40">
                <motion.div
                  key={`${active.id}-${paused ? "p" : "r"}`}
                  className="h-full origin-left bg-sky-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: paused ? 0 : 1 }}
                  transition={{
                    duration: paused ? 0 : AUTO_MS / 1000,
                    ease: "linear",
                  }}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
