import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  GitBranch,
  ShieldCheck,
  LineChart,
  Check,
  Sparkles,
} from "lucide-react";
import { HomeHero } from "@/src/components/home/HomeHero";
import { getCurrentUser } from "@/src/lib/auth-server";
import { getRedirectPathForRole } from "@/src/lib/auth-redirects";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialUser = await getCurrentUser();
  const roleCtaHref = initialUser ? getRedirectPathForRole(initialUser.role) : null;
  const roleCtaLabel =
    initialUser?.role === "STUDENT"
      ? "Go to Practice"
      : initialUser?.role === "ADMIN"
        ? "Go to Admin Panel"
        : initialUser?.role === "INSTRUCTOR"
          ? "Go to Dashboard"
          : null;

  return (
    <main className="flex flex-col">
      <HomeHero
        initialUser={initialUser}
        roleCtaHref={roleCtaHref}
        roleCtaLabel={roleCtaLabel}
      >
        {/* The Architecture of Advancement */}
        <section className="border-t bg-muted/30 py-24 md:py-32">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80 mb-3">
                System Philosophy
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
                The Architecture of Advancement
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                Gamlish is built on the principle of Controlled Friction. Learning happens best when the challenge matches the skill, and mastery is only real when it can be replicated under pressure.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <ArchitectureCard
                icon={<GitBranch className="h-7 w-7" />}
                title="Skill Trees"
                description="Granular nodes of language utility. Progress isn't linear—it's a verified path."
              />
              <ArchitectureCard
                icon={<ShieldCheck className="h-7 w-7" />}
                title="Performance Thresholds"
                description="Automated gates that prevent failing upward. Clearance is earned, not given."
              />
              <ArchitectureCard
                icon={<LineChart className="h-7 w-7" />}
                title="Readiness Forecasting"
                description="Algorithmic analysis of your performance to predict real-world test results with 95%+ accuracy."
              />
            </div>

            <p className="mt-14 text-center text-muted-foreground max-w-xl mx-auto">
              We don't teach you English. We provide the infrastructure for you to master it.
            </p>
          </div>
        </section>

        {/* Manifesto — soft contrast block (dark in light mode, muted in dark) */}
        <section className="bg-primary py-24 md:py-32 text-primary-foreground dark:bg-muted dark:text-foreground">
          <div className="container mx-auto max-w-4xl px-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/70 dark:text-muted-foreground mb-8">
              The Gamlish Manifesto
            </p>
            <ul className="space-y-5 text-left md:text-center md:max-w-2xl md:mx-auto">
              {[
                "Stop studying. Start performing.",
                "Fluency is not a gift; it is a measurable output of a consistent system.",
                "We do not believe in participation. We believe in Clearance.",
                "We do not offer \"lessons.\" We provide Missions.",
                "Knowledge without execution is noise.",
                "If the data doesn't prove you can do it, you haven't learned it.",
                "The era of \"guessing\" your readiness is over.",
                "The era of the Skill Tree has begun.",
                "English is a skill. Skills have levels. Levels require proof.",
              ].map((line, i) => (
                <li key={i} className="flex gap-3 items-start md:justify-center">
                  <Check className="h-5 w-5 shrink-0 text-primary-foreground/80 dark:text-muted-foreground mt-0.5" />
                  <span className="text-base md:text-lg font-medium">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Calibration: Before / After */}
        <section className="border-t bg-muted/30 py-24 md:py-32">
          <div className="container mx-auto max-w-5xl px-6">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80 mb-3">
                The Calibration
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                From Fog to Signal
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] border border-border rounded-lg overflow-hidden bg-card">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-semibold text-foreground">Variable</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Before Gamlish (The Fog)</th>
                    <th className="text-left p-4 font-semibold text-primary">After Gamlish (The Signal)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    {
                      variable: "Confidence",
                      before: "Based on \"feeling\" ready.",
                      after: "Based on verified performance data.",
                    },
                    {
                      variable: "Progression",
                      before: "Linear, boring, and invisible.",
                      after: "Adaptive, high-stakes, and visual.",
                    },
                    {
                      variable: "IELTS Prep",
                      before: "Expensive guesswork.",
                      after: "Predictive readiness intelligence.",
                    },
                    {
                      variable: "Feedback",
                      before: "Subjective teacher opinions.",
                      after: "Objective System Clearance.",
                    },
                    {
                      variable: "Identity",
                      before: "A passive student.",
                      after: "A High-Performance Operator.",
                    },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{row.variable}</td>
                      <td className="p-4 text-muted-foreground">{row.before}</td>
                      <td className="p-4 text-primary font-medium">{row.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 md:py-32 text-center">
          <div className="container mx-auto max-w-3xl px-6 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Data-Backed Mastery
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              The Game of English
            </h2>
            <p className="text-lg text-muted-foreground">
              {roleCtaHref
                ? "Continue to your dashboard and keep proving your level."
                : "Begin your initial calibration. No videos to watch—only levels to clear."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {roleCtaHref && roleCtaLabel ? (
                <Link href={roleCtaHref}>
                  <Button size="lg" className="gap-2 shadow-lg">
                    {roleCtaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="gap-2 shadow-lg">
                      Begin Initial Calibration
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline">
                      Login
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/about">
                <Button size="lg" variant="ghost">
                  The Architecture
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </HomeHero>
    </main>
  );
}

function ArchitectureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:shadow-md hover:border-primary/30">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}
