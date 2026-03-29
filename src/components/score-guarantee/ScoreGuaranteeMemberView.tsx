import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Award,
  ArrowLeft,
  Droplets,
  FileCheck,
  Scale,
  Shield,
  Timer,
} from "lucide-react";
import {
  SCORE_GUARANTEE_CRITERIA,
  SCORE_GUARANTEE_INTRO,
  SCORE_GUARANTEE_LEGAL_NOTE,
  SCORE_GUARANTEE_TAGLINE,
  SCORE_GUARANTEE_WHY_90_BODY,
  SCORE_GUARANTEE_WHY_90_TITLE,
} from "./scoreGuaranteeData";

const CRITERIA_ICONS = [Award, Droplets, Scale, Timer, FileCheck] as const;

export function ScoreGuaranteeMemberView() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-12 pb-12 pt-2 md:pt-4">
      <nav aria-label="Breadcrumb">
        <Button variant="ghost" size="sm" className="-ml-2 gap-2 text-muted-foreground" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>
        </Button>
      </nav>

      <header className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm md:p-10">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/[0.07] blur-3xl dark:bg-primary/15"
          aria-hidden
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            <Shield className="h-3.5 w-3.5" />
            Member assurance
          </div>
          <h1 className="mt-5 text-balance font-bold tracking-[-0.03em] text-foreground text-3xl leading-[1.12] md:text-4xl md:leading-[1.1]">
            Your target band is backed by the{" "}
            <span className="text-primary">Gamlish Score Guarantee™</span>
          </h1>
          <p className="mt-4 max-w-2xl font-medium text-foreground/90 text-lg leading-snug">
            {SCORE_GUARANTEE_TAGLINE}
          </p>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {SCORE_GUARANTEE_INTRO}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild>
              <Link href="/profile/reading">Continue your path</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">Plans &amp; billing</Link>
            </Button>
          </div>
        </div>
      </header>

      <section aria-labelledby="member-criteria-heading" className="space-y-6">
        <div>
          <h2
            id="member-criteria-heading"
            className="font-bold tracking-tight text-foreground text-xl md:text-2xl"
          >
            Eligibility checklist
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            All of the following must be true for a refund request to be
            considered. Our team will verify activity, timing, and official
            results.
          </p>
        </div>
        <ol className="space-y-4">
          {SCORE_GUARANTEE_CRITERIA.map((item, index) => {
            const Icon = CRITERIA_ICONS[index] ?? Award;
            return (
              <li
                key={item.title}
                className="flex gap-4 rounded-2xl border border-border/80 bg-muted/20 p-5 md:gap-5 md:p-6"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background font-bold text-primary text-sm shadow-sm ring-1 ring-border/60"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold tracking-tight text-foreground text-base md:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {item.description}
                  </p>
                </div>
                <span
                  className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex"
                  aria-hidden
                >
                  <Icon className="h-5 w-5" />
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section
        aria-labelledby="why-90-member"
        className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-background to-background p-8 md:p-10"
      >
        <h2
          id="why-90-member"
          className="font-bold tracking-tight text-foreground text-xl md:text-2xl"
        >
          {SCORE_GUARANTEE_WHY_90_TITLE}
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          {SCORE_GUARANTEE_WHY_90_BODY}
        </p>
      </section>

      <footer className="rounded-2xl border border-dashed border-border bg-muted/15 px-5 py-6 md:px-6">
        <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
          {SCORE_GUARANTEE_LEGAL_NOTE}
        </p>
      </footer>
    </div>
  );
}
