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

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEST_LANDING_GRADUATES.map((graduate, index) => (
            <li key={graduate.id}>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: GUEST_EASE,
                }}
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
                />
              </motion.div>
            </li>
          ))}
        </ul>
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
}: {
  graduate: TestLandingGraduate;
  seeMore: string;
  program: string;
  quote: string;
  onSeeMore: () => void;
}) {
  const excerpt = excerptGraduateMessage(quote);

  return (
    <article className="h-full">
      <button
        type="button"
        onClick={onSeeMore}
        className={cn(
          "group relative block w-full overflow-hidden rounded-[1.6rem] text-left",
          "outline outline-2 outline-sky-400/55",
          "shadow-[0_22px_60px_-28px_rgba(14,165,233,0.55)]",
          "transition-[transform,box-shadow] duration-300 ease-out",
          "hover:-translate-y-1 hover:outline-sky-300 hover:shadow-[0_28px_70px_-24px_rgba(56,189,248,0.7)]",
          "motion-reduce:transform-none motion-reduce:hover:translate-y-0",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400",
        )}
      >
        <TestLandingMedia
          src={graduate.imageUrl}
          alt={`${graduate.fullName}, Gamlish Fundamental English graduate`}
          variant="card"
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, calc(100vw - 2.5rem)"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 from-10% via-slate-950/75 via-40% to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200">
            {graduate.district} · {program}
          </p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
            {graduate.fullName}
          </h3>
          <blockquote className="mt-2.5">
            <p className="line-clamp-2 text-[15px] leading-relaxed text-white/90">
              {excerpt}
            </p>
          </blockquote>
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-sky-200 transition-colors group-hover:text-white">
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
