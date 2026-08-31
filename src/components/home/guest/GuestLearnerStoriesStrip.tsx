"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPublicLearnerFeedback } from "@/src/lib/api/learnerFeedback";
import type { LearnerFeedbackPublicItem } from "@/src/lib/learner-feedback";
import { LearnerFeedbackCard } from "@/src/components/feedback/LearnerFeedbackCard";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { cn } from "@/lib/utils";

function StoryCard({
  item,
  rank,
}: {
  item: LearnerFeedbackPublicItem;
  rank: number;
}) {
  return (
    <div className="relative h-full">
      <span
        className="absolute right-3 top-3 z-20 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-sky-600 px-2 text-[11px] font-black tabular-nums text-white shadow-sm"
        aria-label={`Rank ${rank}`}
      >
        {rank}
      </span>
      <LearnerFeedbackCard
        displayName={item.displayName}
        title={item.title}
        rating={item.rating}
        body={item.body}
        username={item.username}
        profileHandle={item.profileHandle}
        avatarUrl={item.avatarUrl}
        totalXp={item.totalXp}
        missionsCompleted={item.missionsCompleted}
        interactive
        className="h-full"
      />
    </div>
  );
}

function sortStoriesByMission(
  rows: LearnerFeedbackPublicItem[],
): LearnerFeedbackPublicItem[] {
  return [...rows].sort((a, b) => {
    const aLevel = a.highestCompletedMissionOrder ?? a.missionsCompleted ?? 0;
    const bLevel = b.highestCompletedMissionOrder ?? b.missionsCompleted ?? 0;
    if (bLevel !== aLevel) return bLevel - aLevel;
    const aDone = a.missionsCompleted ?? 0;
    const bDone = b.missionsCompleted ?? 0;
    if (bDone !== aDone) return bDone - aDone;
    return (b.totalXp ?? 0) - (a.totalXp ?? 0);
  });
}

export function GuestLearnerStoriesStrip() {
  const { locale } = useGuestLandingLocale();
  const [items, setItems] = useState<LearnerFeedbackPublicItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    void getPublicLearnerFeedback(100)
      .then((rows) => {
        if (!cancelled) setItems(sortStoriesByMission(rows));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const syncActiveFromScroll = useCallback(() => {
    const root = scrollerRef.current;
    if (!root || items.length === 0) return;

    const center = root.scrollLeft + root.clientWidth / 2;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const mid = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(mid - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });

    setActiveIndex(best);
  }, [items.length]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    syncActiveFromScroll();
    root.addEventListener("scroll", syncActiveFromScroll, { passive: true });
    window.addEventListener("resize", syncActiveFromScroll);
    return () => {
      root.removeEventListener("scroll", syncActiveFromScroll);
      window.removeEventListener("resize", syncActiveFromScroll);
    };
  }, [syncActiveFromScroll, items.length]);

  const scrollToIndex = (index: number) => {
    const el = slideRefs.current[index];
    const root = scrollerRef.current;
    if (!el || !root) return;
    const left = el.offsetLeft - (root.clientWidth - el.offsetWidth) / 2;
    root.scrollTo({ left, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  const isBn = locale === "bn";

  return (
    <section
      className={cn(
        "relative border-y border-border/50 bg-muted/20 py-10 sm:px-4 sm:py-12",
        isBn && "font-bengali",
      )}
      lang={locale}
      aria-label={isBn ? "লার্নার স্টোরিজ" : "Learner stories"}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
            {isBn ? "রিয়েল লার্নার স্টোরি" : "Real learner stories"}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {isBn ? "যারা আগেই জয়েন করেছেন" : "Learners who already joined"}
          </h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {isBn
              ? `${items.length}টি স্টোরি · যারা সবচেয়ে বেশি মিশন শেষ করেছে, তারা আগে`
              : `${items.length} stories · furthest mission first`}
          </p>
        </div>

        {/* Mobile · premium peek carousel */}
        <div className="relative mt-6 sm:hidden">
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollPaddingInline: "1rem" }}
            role="region"
            aria-roledescription="carousel"
            aria-label={isBn ? "লার্নার স্টোরি ক্যারোসেল" : "Learner stories carousel"}
          >
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={item.id}
                  ref={(node) => {
                    slideRefs.current[index] = node;
                  }}
                  className={cn(
                    "w-[min(86vw,22rem)] shrink-0 snap-center transition-all duration-300",
                    isActive
                      ? "scale-[1.01] opacity-100"
                      : "scale-[0.97] opacity-70",
                  )}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={
                    isBn
                      ? `স্টোরি ${index + 1} / ${items.length}`
                      : `Story ${index + 1} of ${items.length}`
                  }
                  aria-current={isActive ? "true" : undefined}
                >
                  <StoryCard item={item} rank={index + 1} />
                </div>
              );
            })}
          </div>

          <div
            className="mt-4 flex items-center justify-center gap-1.5 px-4"
            role="tablist"
            aria-label={isBn ? "স্লাইড ন্যাভিগেশন" : "Slide navigation"}
          >
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={
                    isBn
                      ? `স্টোরি ${index + 1}`
                      : `Go to story ${index + 1}`
                  }
                  onClick={() => scrollToIndex(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    isActive
                      ? "w-6 bg-sky-500"
                      : "w-1.5 bg-sky-500/25 hover:bg-sky-500/40",
                  )}
                />
              );
            })}
          </div>

          <p className="mt-2 text-center text-[11px] font-medium tabular-nums text-muted-foreground">
            {activeIndex + 1} / {items.length}
            <span className="mx-1.5 text-border">·</span>
            {isBn ? "সোয়াইপ করুন" : "Swipe"}
          </p>
        </div>

        {/* Tablet / desktop grid */}
        <div className="mt-6 hidden gap-3 px-4 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
          {items.map((item, index) => (
            <StoryCard key={item.id} item={item} rank={index + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
