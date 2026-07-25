"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  MessageSquareQuote,
  Rocket,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { ABOUT_PAGE_COPY } from "@/src/lib/about-page-copy";
import { FounderAvatar } from "@/src/components/shared/FounderAvatar";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import { cn } from "@/lib/utils";

const STEP_ICONS = [BookOpen, Target, CheckCircle2, Sparkles] as const;
const AUDIENCE_ICONS = [GraduationCap, Rocket, Users] as const;

export function AboutContent() {
  const { locale } = useUiLocale();
  const copy = ABOUT_PAGE_COPY[locale];

  return (
    <main
      className={cn(
        "relative isolate overflow-x-hidden",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,189,248,0.14),transparent_60%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 md:pt-14">
        <Button
          variant="ghost"
          size="sm"
          className="mb-8 -ml-2 gap-2 text-muted-foreground"
          asChild
        >
          <Link href="/">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {copy.back}
          </Link>
        </Button>

        {/* Hero / H1 */}
        <header className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
            Gamlish
          </p>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
            {copy.h1}
          </h1>
          <p className="max-w-2xl text-pretty text-lg font-medium leading-relaxed text-foreground/90 sm:text-xl">
            {copy.lead}
          </p>
          {copy.story.map((para) => (
            <p
              key={para.slice(0, 48)}
              className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground"
            >
              {para}
            </p>
          ))}
        </header>

        {/* Hesitation moment */}
        <aside
          className="mt-10 rounded-2xl border border-sky-500/20 bg-sky-500/[0.06] p-5 sm:p-6"
          aria-label={copy.hesitationPrompt}
        >
          <p className="text-sm text-muted-foreground">{copy.hesitationPrompt}</p>
          <p className="mt-2 font-bengali text-lg font-semibold text-foreground">
            &ldquo;{copy.hesitationBangla}&rdquo;
          </p>
          <p className="mt-3 font-mono text-sm font-medium text-sky-800 dark:text-sky-200">
            {copy.hesitationOptions}
          </p>
        </aside>

        <p className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          {copy.storyClose}
        </p>

        {/* What is Gamlish */}
        <section className="mt-14 space-y-4" aria-labelledby="about-what">
          <h2
            id="about-what"
            className="text-2xl font-semibold tracking-tight text-foreground"
          >
            {copy.whatTitle}
          </h2>
          {copy.whatBody.map((para) => (
            <p
              key={para.slice(0, 40)}
              className="text-pretty text-base leading-relaxed text-muted-foreground"
            >
              {para}
            </p>
          ))}
        </section>

        {/* Method + camps */}
        <section className="mt-14 space-y-5" aria-labelledby="about-method">
          <h2
            id="about-method"
            className="text-2xl font-semibold tracking-tight text-foreground"
          >
            {copy.methodTitle}
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            {copy.methodIntro}
          </p>
          <p className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm leading-relaxed text-foreground/85">
            {copy.methodExperienceNote}
          </p>
          <ol className="space-y-4">
            {copy.camps.map((camp, i) => (
              <li
                key={camp.title}
                className="rounded-2xl border border-border/80 bg-card/40 p-4 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-xs font-bold text-sky-700 dark:text-sky-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 space-y-1.5">
                    <Link
                      href={camp.href}
                      className="text-base font-semibold text-sky-700 underline-offset-4 hover:underline dark:text-sky-300"
                    >
                      {camp.title}
                    </Link>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {camp.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Why different */}
        <section className="mt-14 space-y-4" aria-labelledby="about-diff">
          <h2
            id="about-diff"
            className="text-2xl font-semibold tracking-tight text-foreground"
          >
            {copy.methodDiffTitle}
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            {copy.methodDiffBody}
          </p>
        </section>

        {/* Comparison */}
        <section className="mt-10" aria-labelledby="about-compare">
          <h3
            id="about-compare"
            className="mb-4 text-lg font-semibold text-foreground"
          >
            {copy.comparisonTitle}
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-border/80">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-3 font-semibold text-foreground sm:px-4">
                    {copy.comparisonHeaders.feature}
                  </th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground sm:px-4">
                    {copy.comparisonHeaders.traditional}
                  </th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground sm:px-4">
                    {copy.comparisonHeaders.apps}
                  </th>
                  <th className="px-3 py-3 font-semibold text-sky-700 dark:text-sky-300 sm:px-4">
                    {copy.comparisonHeaders.gamlish}
                  </th>
                </tr>
              </thead>
              <tbody>
                {copy.comparisonRows.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-border/70 last:border-0"
                  >
                    <th
                      scope="row"
                      className="px-3 py-3 align-top font-semibold text-foreground sm:px-4"
                    >
                      {row.feature}
                    </th>
                    <td className="px-3 py-3 align-top text-muted-foreground sm:px-4">
                      {row.traditional}
                    </td>
                    <td className="px-3 py-3 align-top text-muted-foreground sm:px-4">
                      {row.apps}
                    </td>
                    <td className="px-3 py-3 align-top font-medium text-foreground sm:px-4">
                      {row.gamlish}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mission cycle */}
        <section className="mt-14 space-y-5" aria-labelledby="about-cycle">
          <h2
            id="about-cycle"
            className="text-2xl font-semibold tracking-tight text-foreground"
          >
            {copy.missionCycleTitle}
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            {copy.missionCycleIntro}
          </p>
          <ol className="grid gap-3 sm:grid-cols-2">
            {copy.missionSteps.map((step, i) => {
              const Icon = STEP_ICONS[i] ?? Sparkles;
              return (
                <li
                  key={step.title}
                  className="rounded-2xl border border-border/80 bg-card/30 p-4"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/12 text-sky-700 dark:text-sky-300">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Audience */}
        <section className="mt-14 space-y-5" aria-labelledby="about-audience">
          <h2
            id="about-audience"
            className="text-2xl font-semibold tracking-tight text-foreground"
          >
            {copy.audienceTitle}
          </h2>
          <ul className="space-y-3">
            {copy.audience.map((item, i) => {
              const Icon = AUDIENCE_ICONS[i] ?? Users;
              return (
                <li
                  key={item.title}
                  className="flex gap-3 rounded-2xl border border-border/70 p-4"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/80">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Vision */}
        <section className="mt-14 space-y-4" aria-labelledby="about-vision">
          <h2
            id="about-vision"
            className="text-2xl font-semibold tracking-tight text-foreground"
          >
            {copy.visionTitle}
          </h2>
          {copy.visionBody.map((para) => (
            <p
              key={para.slice(0, 40)}
              className="text-pretty text-base leading-relaxed text-muted-foreground"
            >
              {para}
            </p>
          ))}
        </section>

        {/* Founder E-E-A-T */}
        <section
          className="mt-14 rounded-2xl border border-border/80 bg-muted/25 p-5 sm:p-7"
          aria-labelledby="about-founder"
        >
          <div className="flex items-start gap-4">
            <FounderAvatar size={56} className="rounded-2xl" />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">
                <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden />
                {copy.founderTitle}
              </p>
              <h2 id="about-founder" className="sr-only">
                {copy.founderTitle}
              </h2>
              {copy.founderQuote.map((para) => (
                <p
                  key={para.slice(0, 36)}
                  className="mt-3 text-sm leading-relaxed text-foreground/90 sm:text-[15px]"
                >
                  {para}
                </p>
              ))}
              <p className="mt-5 text-sm font-semibold text-foreground">
                - {copy.founderName}
              </p>
              <p className="text-sm text-muted-foreground">{copy.founderRole}</p>
              <p className="text-sm text-muted-foreground">
                {copy.founderLocation}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="mt-12 rounded-[1.75rem] border border-sky-500/25 bg-gradient-to-br from-sky-500/10 via-transparent to-blue-600/10 px-6 py-10 text-center sm:px-10"
          aria-labelledby="about-cta"
        >
          <h2
            id="about-cta"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {copy.ctaTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            {copy.ctaBody}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className={cn(
                "h-12 min-w-[12rem] rounded-2xl text-sm font-bold",
                LANDING_CTA_CLASS,
              )}
              asChild
            >
              <Link href="/demo">{copy.ctaPrimary}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 min-w-[11rem] rounded-2xl text-sm font-semibold"
              asChild
            >
              <Link href="/register">{copy.ctaSecondary}</Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16 space-y-4" aria-labelledby="about-faq">
          <h2
            id="about-faq"
            className="text-2xl font-semibold tracking-tight text-foreground"
          >
            {copy.faqTitle}
          </h2>
          <div className="divide-y divide-border/80 rounded-2xl border border-border/80">
            {copy.faq.map((item) => (
              <details
                key={item.question}
                className="group px-4 py-1 open:bg-muted/20 sm:px-5"
              >
                <summary className="cursor-pointer list-none py-4 text-left text-base font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start justify-between gap-3">
                    {item.question}
                    <span
                      className="mt-0.5 shrink-0 text-muted-foreground transition group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-12 text-xs leading-relaxed text-muted-foreground">
          {copy.disclaimer}
        </p>
      </div>
    </main>
  );
}
