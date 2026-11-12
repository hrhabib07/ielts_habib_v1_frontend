"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Quote,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { LANDING_CTA_CLASS, LANDING_EYEBROW_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import {
  excerptGraduateMessage,
  TEST_LANDING_GRADUATES,
  type TestLandingGraduate,
} from "@/src/lib/test-landing-graduates";
import {
  TEST_LANDING_PRIMARY_HREF,
  type TestLandingCopy,
} from "@/src/lib/test-landing-copy";
import { TestLandingMedia } from "@/src/components/home/test-landing/TestLandingMedia";
import { useTestLandingCopy } from "@/src/components/home/test-landing/useTestLandingCopy";
import { cn } from "@/lib/utils";

export function TestLandingGraduates() {
  const { copy, locale } = useTestLandingCopy();
  const reduceMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(null);
  const openIndex = TEST_LANDING_GRADUATES.findIndex((g) => g.id === openId);
  const openGraduate = openIndex >= 0 ? TEST_LANDING_GRADUATES[openIndex] : null;

  const shiftStory = (delta: number) => {
    if (openIndex < 0) return;
    const next =
      (openIndex + delta + TEST_LANDING_GRADUATES.length) %
      TEST_LANDING_GRADUATES.length;
    const nextGraduate = TEST_LANDING_GRADUATES[next];
    if (!nextGraduate) return;
    setOpenId(nextGraduate.id);
  };

  return (
    <section
      className="relative py-12 sm:py-20 md:py-24"
      aria-labelledby="test-landing-graduates-title"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className={LANDING_EYEBROW_CLASS}>{copy.graduatesEyebrow}</p>
          <h2
            id="test-landing-graduates-title"
            className="mt-4 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            {copy.graduatesTitle}
          </h2>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-foreground/80">
            {copy.graduatesSub}
          </p>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: GUEST_EASE }}
          className="test-landing-graduates-viewport relative mt-10 -mx-4 sm:-mx-6 lg:mx-0"
        >
          <div className="test-landing-graduates-track flex w-max py-3">
            {[0, 1].map((copyIndex) => (
              <ul
                key={copyIndex}
                className="flex shrink-0"
                aria-hidden={copyIndex === 1 ? true : undefined}
              >
                {TEST_LANDING_GRADUATES.map((graduate) => (
                  <li
                    key={graduate.id}
                    className="w-[17rem] shrink-0 pl-5 sm:w-[19rem] lg:w-[20rem]"
                  >
                    <GraduateCard
                      graduate={graduate}
                      seeMore={copy.graduatesSeeMore}
                      program={copy.graduatesProgram}
                      quote={
                        locale === "bn"
                          ? graduate.cardQuoteBn
                          : graduate.storyMessage
                      }
                      onSeeMore={() => setOpenId(graduate.id)}
                      loopCopy={copyIndex === 1}
                    />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </motion.div>
      </div>

      <Sheet
        open={openGraduate != null}
        onOpenChange={(open) => {
          if (!open) setOpenId(null);
        }}
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          className={cn(
            "gap-0 border-l-0 bg-slate-950 p-0 text-white shadow-[0_0_80px_-20px_rgba(14,165,233,0.55)]",
            "w-full sm:max-w-xl",
          )}
        >
          {openGraduate ? (
            <GraduateStory
              graduate={openGraduate}
              copy={copy}
              index={openIndex}
              total={TEST_LANDING_GRADUATES.length}
              onPrev={() => shiftStory(-1)}
              onNext={() => shiftStory(1)}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </section>
  );
}

function GraduateCard({
  graduate,
  seeMore,
  program,
  quote,
  onSeeMore,
  loopCopy = false,
}: {
  graduate: TestLandingGraduate;
  seeMore: string;
  program: string;
  quote: string;
  onSeeMore: () => void;
  /** The second copy that keeps the marquee seamless: clickable, but skipped by keyboard and screen readers. */
  loopCopy?: boolean;
}) {
  const excerpt = excerptGraduateMessage(quote);

  return (
    <article className="h-full">
      <button
        type="button"
        onClick={onSeeMore}
        tabIndex={loopCopy ? -1 : undefined}
        className={cn(
          "group relative flex h-full w-full flex-col overflow-hidden rounded-[1.6rem] bg-slate-950 text-left",
          "outline outline-2 outline-sky-400/55",
          "shadow-[0_22px_60px_-28px_rgba(14,165,233,0.55)]",
          "transition-[transform,box-shadow] duration-300 ease-out",
          "hover:-translate-y-1 hover:outline-sky-300 hover:shadow-[0_28px_70px_-24px_rgba(56,189,248,0.7)]",
          "motion-reduce:transform-none motion-reduce:hover:translate-y-0",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400",
        )}
      >
        <div className="relative shrink-0">
          <TestLandingMedia
            src={graduate.imageUrl}
            alt={`${graduate.fullName}, Gamlish Fundamental English graduate`}
            variant="card"
            sizes="(min-width: 1024px) 20rem, (min-width: 640px) 19rem, 17rem"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-slate-950 to-transparent"
            aria-hidden
          />
        </div>
        <div className="relative z-10 -mt-3 flex flex-1 flex-col px-4 pb-4 sm:px-5 sm:pb-5">
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200">
            {graduate.district} · {program}
          </p>
          <h3 className="mt-1 line-clamp-2 text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
            {graduate.fullName}
          </h3>
          <blockquote className="mt-2">
            <p className="line-clamp-2 text-[15px] leading-relaxed text-white/90">
              {excerpt}
            </p>
          </blockquote>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-bold text-sky-200 transition-colors group-hover:text-white">
            {seeMore}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </button>
    </article>
  );
}

function GraduateStory({
  graduate,
  copy,
  index,
  total,
  onPrev,
  onNext,
}: {
  graduate: TestLandingGraduate;
  copy: TestLandingCopy;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const steps = useMemo(
    () => [
      {
        title: copy.graduatesBefore,
        body: graduate.storyBefore,
        icon: Quote,
        tone: "muted" as const,
      },
      {
        title: copy.graduatesJourney,
        body: graduate.storyJourney,
        icon: Gamepad2,
        tone: "play" as const,
      },
      {
        title: copy.graduatesAfter,
        body: graduate.storyTransformation,
        icon: Sparkles,
        tone: "win" as const,
      },
    ],
    [
      copy.graduatesAfter,
      copy.graduatesBefore,
      copy.graduatesJourney,
      graduate.storyBefore,
      graduate.storyJourney,
      graduate.storyTransformation,
    ],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950 text-white">
      <div className="relative shrink-0">
        <TestLandingMedia
          src={graduate.imageUrl}
          alt={graduate.fullName}
          variant="card"
          sizes="(min-width: 640px) 36rem, 100vw"
          className="h-52 aspect-auto sm:h-60"
          imageClassName="object-[center_18%]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-black/20"
          aria-hidden
        />
        <SheetClose className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-amber-950">
            <Award className="h-3.5 w-3.5" aria-hidden />
            {copy.graduatesVerified}
          </p>
          <SheetTitle className="mt-3 text-left text-3xl font-bold tracking-tight text-white">
            {graduate.fullName}
          </SheetTitle>
          <SheetDescription className="mt-1 text-left text-base text-sky-100">
            {graduate.district} · {copy.graduatesProgram}
          </SheetDescription>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-5">
        {graduate.storyMessage.trim() ? (
          <blockquote className="relative overflow-hidden rounded-[1.4rem] border border-sky-400/30 bg-gradient-to-br from-sky-500/20 via-slate-900 to-slate-950 px-5 py-5">
            <Quote className="mb-2 h-5 w-5 text-sky-300/80" aria-hidden />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200">
              {copy.graduatesMessage}
            </p>
            <p className="mt-2 text-lg font-semibold leading-snug tracking-tight text-white">
              {graduate.storyMessage}
            </p>
          </blockquote>
        ) : null}

        <ol className="relative mt-6 space-y-4 border-l border-sky-400/25 pl-5">
          {steps.map((step, stepIndex) => {
            if (!step.body.trim()) return null;
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative">
                <span
                  className={cn(
                    "absolute -left-[1.7rem] top-1 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold",
                    step.tone === "muted" &&
                      "border-white/20 bg-slate-800 text-slate-200",
                    step.tone === "play" &&
                      "border-sky-400/50 bg-sky-500/20 text-sky-100",
                    step.tone === "win" &&
                      "border-amber-300/60 bg-amber-400/20 text-amber-100",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200/80">
                  {stepIndex + 1}. {step.title}
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-white/90">
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>

        <Link
          href={`/verify/${encodeURIComponent(graduate.certificateId)}`}
          className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-sky-300/40 hover:bg-white/10"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-100">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-white">
              {copy.graduatesCertificate}
            </span>
            <span className="block truncate font-mono text-xs text-sky-200/80">
              {graduate.certificateId}
            </span>
          </span>
        </Link>
      </div>

      <div className="shrink-0 border-t border-white/10 bg-slate-950/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-white hover:bg-white/10"
            onClick={onPrev}
            aria-label={copy.graduatesPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <p className="text-sm font-semibold tabular-nums text-sky-100/80">
            {index + 1} / {total}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full text-white hover:bg-white/10"
            onClick={onNext}
            aria-label={copy.graduatesNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-center text-lg font-bold tracking-tight text-white">
          {copy.graduatesYourTurn}
        </p>
        <p className="mt-1 text-center text-sm leading-relaxed text-sky-100/85">
          {copy.graduatesYourTurnBody}
        </p>
        <Button
          size="lg"
          className={cn(
            "mt-3 h-12 w-full rounded-2xl text-base font-bold",
            LANDING_CTA_CLASS,
          )}
          asChild
        >
          <Link href={TEST_LANDING_PRIMARY_HREF}>{copy.ctaPrimary}</Link>
        </Button>
      </div>
    </div>
  );
}
