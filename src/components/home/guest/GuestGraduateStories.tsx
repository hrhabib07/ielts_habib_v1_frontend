"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Award, ChevronLeft, ChevronRight, Quote, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import {
  LANDING_CTA_CLASS,
  LANDING_EYEBROW_CLASS,
  LANDING_REWARD_PILL_CLASS,
} from "@/src/components/home/guest/guest-landing-theme";
import { getPublicGraduateStories, type PublicGraduateStory } from "@/src/lib/api/certification";
import { cn } from "@/lib/utils";

const COPY = {
  en: {
    eyebrow: "The finish line",
    title: "They finished. Your turn is next.",
    sub: "21 missions. A real certificate. Read what changed, then play the same game.",
    before: "Before",
    after: "After",
    journey: "How they did it",
    message: "Their advice to you",
    certified: "Certificate issued",
    verify: "View certificate",
    emptyTitle: "Your name can sit here.",
    emptyBody:
      "Finish 21 missions. Earn a digitally verifiable certificate. Your story becomes the proof for the next student.",
    prev: "Previous graduate",
    next: "Next graduate",
    cta: "I want this certificate",
    demo: "Play one free mission first",
    more: "More graduates",
  },
  bn: {
    eyebrow: "শেষ লাইন",
    title: "তারা শেষ করেছে। এবার আপনার পালা।",
    sub: "21টি মিশন। আসল সার্টিফিকেট। কী বদলেছে পড়ুন, তারপর একই গেম খেলুন।",
    before: "আগে",
    after: "এখন",
    journey: "কীভাবে করেছে",
    message: "আপনাকে তাদের কথা",
    certified: "সার্টিফিকেট ইস্যু হয়েছে",
    verify: "সার্টিফিকেট দেখুন",
    emptyTitle: "আপনার নাম এখানে থাকতে পারে।",
    emptyBody:
      "21টি মিশন শেষ করুন। যাচাইযোগ্য সার্টিফিকেট নিন। আপনার গল্পই হবে পরের শিক্ষার্থীর প্রমাণ।",
    prev: "আগের গ্র্যাজুয়েট",
    next: "পরের গ্র্যাজুয়েট",
    cta: "আমিও এই সার্টিফিকেট চাই",
    demo: "আগে একটা ফ্রি মিশন খেলুন",
    more: "আরও গ্র্যাজুয়েট",
  },
} as const;

function displayPersonName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return name;
  const hasLatin = /[A-Za-z]/.test(trimmed);
  if (!hasLatin) return trimmed;
  return trimmed
    .split(/\s+/)
    .map((part) => {
      if (!/^[A-Za-z]/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

function firstName(name: string): string {
  return displayPersonName(name).split(/\s+/)[0] ?? name;
}

function initialOf(name: string): string {
  return (Array.from(displayPersonName(name).trim())[0] ?? "?").toUpperCase();
}

function formatStoryDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Dhaka",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function CtaPair({
  cta,
  demo,
}: {
  cta: string;
  demo: string;
}) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <Button
        size="lg"
        className={cn(
          "h-auto min-h-14 w-full flex-1 whitespace-normal rounded-2xl px-5 py-3.5 text-base font-black leading-snug sm:w-auto",
          LANDING_CTA_CLASS,
        )}
        asChild
      >
        <Link href="/register">{cta}</Link>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="h-12 w-full rounded-2xl border-2 text-base font-bold sm:w-auto sm:min-w-[12rem]"
        asChild
      >
        <Link href="/demo">{demo}</Link>
      </Button>
    </div>
  );
}

export function GuestGraduateStories() {
  const { locale } = useGuestLandingLocale();
  const copy = COPY[locale];
  const reduceMotion = useReducedMotion();
  const [stories, setStories] = useState<PublicGraduateStory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getPublicGraduateStories()
      .then((rows) => {
        if (!cancelled) setStories(rows);
      })
      .catch(() => {
        if (!cancelled) setStories([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const story = stories[index] ?? null;
  const go = useCallback(
    (delta: number) => {
      if (stories.length < 2) return;
      setIndex((current) => (current + delta + stories.length) % stories.length);
    },
    [stories.length],
  );

  useEffect(() => {
    if (stories.length < 2) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, stories.length]);

  const before = story?.storyBefore.trim() ?? "";
  const after = story?.storyTransformation.trim() ?? "";
  const journey = story?.storyJourney.trim() ?? "";
  const advice = story?.storyMessage.trim() ?? "";
  const quote = advice || after;
  const showBeforeAfter = Boolean(before && after && advice);
  const showBeforeOnly = Boolean(before && !showBeforeAfter);

  return (
    <section
      className="relative isolate overflow-hidden border-b border-border/40 py-12 sm:py-16 md:py-20"
      aria-labelledby="guest-graduate-stories-title"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(56,189,248,0.14),transparent_58%),linear-gradient(180deg,hsl(var(--muted)/0.45)_0%,hsl(var(--background))_100%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className={LANDING_EYEBROW_CLASS}>{copy.eyebrow}</p>
          <h2
            id="guest-graduate-stories-title"
            className="mt-4 text-balance text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            {copy.title}
          </h2>
          <p className="mt-3 text-pretty text-base font-medium text-muted-foreground sm:text-lg">
            {copy.sub}
          </p>
        </div>

        {!loaded ? (
          <div
            className="mt-10 h-[28rem] animate-pulse rounded-[1.75rem] border border-border/40 bg-background/70"
            aria-hidden
          />
        ) : story ? (
          <div className="mt-10">
            <AnimatePresence mode="wait">
              <motion.article
                key={story.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: GUEST_EASE }}
                className="overflow-hidden rounded-[1.75rem] border border-sky-500/20 bg-background shadow-[0_24px_80px_-36px_rgba(14,165,233,0.45)]"
                onTouchStart={(event) => {
                  touchX.current = event.changedTouches[0]?.clientX ?? null;
                }}
                onTouchEnd={(event) => {
                  if (touchX.current == null) return;
                  const x = event.changedTouches[0]?.clientX;
                  if (x == null) return;
                  const dx = x - touchX.current;
                  if (dx > 56) go(-1);
                  if (dx < -56) go(1);
                  touchX.current = null;
                }}
              >
                <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)]">
                  <aside className="relative border-b border-border/50 bg-gradient-to-b from-sky-500/12 via-background to-background px-5 py-6 sm:px-7 sm:py-8 lg:border-b-0 lg:border-r">
                    <div className="flex items-start gap-4">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-2xl font-black text-white shadow-lg shadow-sky-500/30">
                        {initialOf(story.officialName)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                          {displayPersonName(story.officialName)}
                        </p>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                          {[story.district, formatStoryDate(story.issuedAt)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {story.username ? (
                          <Link
                            href={`/u/${encodeURIComponent(story.username)}`}
                            className="mt-1 inline-block text-sm font-semibold text-sky-800 hover:underline dark:text-sky-200"
                          >
                            @{story.username}
                          </Link>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span className={LANDING_REWARD_PILL_CLASS}>
                        <Award className="h-3.5 w-3.5" aria-hidden />
                        {copy.certified}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-900 dark:text-sky-100">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                        {story.programName}
                      </span>
                    </div>

                    {story.certificateId ? (
                      <Link
                        href={`/verify/${encodeURIComponent(story.certificateId)}`}
                        className="mt-4 inline-flex text-sm font-bold text-sky-800 underline-offset-4 hover:underline dark:text-sky-200"
                      >
                        {copy.verify}
                      </Link>
                    ) : null}

                    {stories.length > 1 ? (
                      <div className="mt-8 hidden items-center gap-2 lg:flex">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 rounded-full"
                          onClick={() => go(-1)}
                          aria-label={copy.prev}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <p className="text-sm font-semibold tabular-nums text-muted-foreground">
                          {index + 1} / {stories.length}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 rounded-full"
                          onClick={() => go(1)}
                          aria-label={copy.next}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    ) : null}
                  </aside>

                  <div className="px-5 py-6 sm:px-7 sm:py-8">
                    {quote ? (
                      <blockquote>
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-800 dark:text-amber-200">
                          {advice ? copy.message : copy.after}
                        </p>
                        <div className="relative mt-2">
                          <Quote
                            className="absolute left-0 top-0.5 h-6 w-6 text-sky-400/45"
                            aria-hidden
                          />
                          <p className="pl-8 text-pretty text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-[1.65rem] sm:leading-[1.35]">
                            {quote}
                          </p>
                        </div>
                      </blockquote>
                    ) : null}

                    {showBeforeAfter ? (
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                            {copy.before}
                          </p>
                          <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
                            {before}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-800 dark:text-sky-200">
                            {copy.after}
                          </p>
                          <p className="mt-2 text-[15px] font-medium leading-relaxed text-foreground">
                            {after}
                          </p>
                        </div>
                      </div>
                    ) : showBeforeOnly ? (
                      <div className="mt-6 rounded-2xl border border-border/70 bg-muted/40 px-4 py-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                          {copy.before}
                        </p>
                        <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
                          {before}
                        </p>
                      </div>
                    ) : null}

                    {journey ? (
                      <div className="mt-5">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-800 dark:text-sky-200">
                          {copy.journey}
                        </p>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                          {journey}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-7">
                      <CtaPair cta={copy.cta} demo={copy.demo} />
                    </div>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>

            {stories.length > 1 ? (
              <div className="mt-5">
                <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {copy.more}
                </p>
                <div className="flex justify-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {stories.map((item, i) => {
                    const active = i === index;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIndex(i)}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold transition-colors",
                          active
                            ? "border-sky-500 bg-sky-500 text-white"
                            : "border-border bg-background text-foreground hover:border-sky-400/60 hover:bg-sky-500/10",
                        )}
                        aria-current={active ? "true" : undefined}
                        aria-label={displayPersonName(item.officialName)}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black",
                            active ? "bg-white/20 text-white" : "bg-sky-500/15 text-sky-800 dark:text-sky-100",
                          )}
                        >
                          {initialOf(item.officialName)}
                        </span>
                        {firstName(item.officialName)}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center justify-center gap-3 lg:hidden">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-full"
                    onClick={() => go(-1)}
                    aria-label={copy.prev}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <p className="text-sm font-semibold tabular-nums text-muted-foreground">
                    {index + 1} / {stories.length}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 rounded-full"
                    onClick={() => go(1)}
                    aria-label={copy.next}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-10 rounded-[1.75rem] border border-dashed border-sky-500/35 bg-background/80 px-5 py-10 text-center sm:px-10">
            <span className={cn(LANDING_REWARD_PILL_CLASS, "mx-auto")}>
              <Award className="h-3.5 w-3.5" aria-hidden />
              {copy.certified}
            </span>
            <p className="mt-4 text-xl font-black text-foreground sm:text-2xl">
              {copy.emptyTitle}
            </p>
            <p className="mx-auto mt-2 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {copy.emptyBody}
            </p>
            <div className="mx-auto mt-7 max-w-lg">
              <CtaPair cta={copy.cta} demo={copy.demo} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
