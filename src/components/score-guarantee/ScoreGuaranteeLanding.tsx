import {
  Award,
  Droplets,
  FileCheck,
  Scale,
  ShieldCheck,
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

export function ScoreGuaranteeLandingSection() {
  return (
    <section
      id="score-guarantee"
      aria-labelledby="score-guarantee-heading"
      className="relative overflow-hidden border-t bg-gradient-to-b from-background via-muted/20 to-background py-24 md:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, hsl(var(--primary)) 0, transparent 50%), radial-gradient(circle at 80% 60%, hsl(var(--primary)) 0, transparent 45%)",
        }}
      />
      <div className="container relative mx-auto max-w-6xl px-6">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/85 md:text-xs">
            The Gamlish Score Guarantee™
          </p>
          <h2
            id="score-guarantee-heading"
            className="mt-4 text-balance font-bold tracking-[-0.02em] text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
          >
            Measured readiness.
            <span className="block text-primary">Backed by a full refund.</span>
          </h2>
          <p className="mt-6 font-medium text-foreground/90 text-lg leading-snug md:text-xl md:leading-snug">
            {SCORE_GUARANTEE_TAGLINE}
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg md:leading-relaxed">
            {SCORE_GUARANTEE_INTRO}
          </p>
        </header>

        <div className="mt-16 md:mt-20">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            How to qualify
          </p>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
            The guarantee is reserved for our most committed learners. Every
            condition below must be satisfied.
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SCORE_GUARANTEE_CRITERIA.map((item, i) => {
              const Icon = CRITERIA_ICONS[i] ?? ShieldCheck;
              return (
                <li
                  key={item.title}
                  className="group flex h-full flex-col rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/25 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary/15">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">
                        {item.shortLabel}
                      </p>
                      <h3 className="mt-1 font-semibold tracking-tight text-foreground text-lg leading-tight">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mx-auto mt-16 max-w-4xl rounded-3xl border border-primary/15 bg-primary/[0.04] p-8 md:p-10 dark:bg-primary/[0.07]">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <ShieldCheck className="h-7 w-7" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold tracking-tight text-foreground text-2xl md:text-3xl">
                {SCORE_GUARANTEE_WHY_90_TITLE}
              </h3>
              <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg md:leading-relaxed">
                {SCORE_GUARANTEE_WHY_90_BODY}
              </p>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-12 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground/90 md:text-sm">
          {SCORE_GUARANTEE_LEGAL_NOTE}
        </p>
      </div>
    </section>
  );
}
