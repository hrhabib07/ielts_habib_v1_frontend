"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Lock, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDemoHome, type DemoHome } from "@/src/lib/api/demo";
import { DEMO_COPY } from "@/src/lib/demo-copy";
import { readDemoSessionId } from "@/src/lib/demo-session";
import { localizeDigits } from "@/src/lib/ui-locale";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { cn } from "@/lib/utils";

export function DemoHomeView() {
  const router = useRouter();
  const { locale } = useUiLocale();
  const copy = DEMO_COPY[locale];
  const [home, setHome] = useState<DemoHome | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sid = readDemoSessionId();
    if (!sid) {
      router.replace("/demo");
      return;
    }
    getDemoHome(sid)
      .then((data) => {
        if (data.session.demoComplete) {
          router.replace("/demo/complete");
          return;
        }
        setHome(data);
      })
      .catch(() => setError(copy.errorGeneric));
  }, [router, copy.errorGeneric]);

  if (error) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-destructive">{error}</p>
        <Button className="mt-4" asChild>
          <Link href="/demo">{copy.backHome}</Link>
        </Button>
      </div>
    );
  }

  if (!home) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        {copy.loading}
      </div>
    );
  }

  const mission = home.camps
    .flatMap((c) => c.missions)
    .find((m) => m.isDemo);

  return (
    <div
      className={cn(
        "mx-auto max-w-lg px-4 py-8",
        locale === "bn" && "font-bengali",
      )}
      lang={locale}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            {copy.homeEyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">
            {copy.homeTitle(home.player.displayName)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.homeSub}</p>
        </div>
        <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-center">
          <p className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300">
            XP
          </p>
          <p className="text-lg font-black tabular-nums">
            {localizeDigits(home.player.xp, locale)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {home.camps.map((camp) => (
          <div
            key={camp.id}
            className={cn(
              "rounded-2xl border p-4",
              camp.locked
                ? "border-border/40 bg-muted/30 opacity-70"
                : "border-primary/25 bg-gradient-to-br from-primary/8 via-card to-card",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  {camp.title}
                </p>
                {camp.subtitle ? (
                  <p className="text-sm font-bold text-foreground">
                    {camp.subtitle}
                  </p>
                ) : null}
              </div>
              {camp.locked ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  {copy.lockedLabel}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                  <Sparkles className="h-3 w-3" />
                  {copy.demoBadge}
                </span>
              )}
            </div>

            {!camp.locked && mission ? (
              <>
                <p className="mt-3 text-xs font-semibold text-primary">
                  {copy.missionUnlocked}
                </p>
                <Button
                  className="mt-3 h-12 w-full rounded-xl font-bold"
                  size="lg"
                  asChild
                >
                  <Link href={`/demo/play/stage/${home.nextStageOrder}`}>
                    <Play className="mr-2 h-4 w-4" />
                    {copy.playMission}
                  </Link>
                </Button>
              </>
            ) : camp.locked ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {copy.otherCampsHint}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border/50 bg-muted/20 p-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <Crown className="h-3.5 w-3.5" />
          Mission path
        </p>
        <ol className="space-y-2">
          {home.demoStages.map((stage, idx) => (
            <li
              key={stage.order}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm",
                stage.completed
                  ? "border-primary/30 bg-primary/5"
                  : stage.order === home.nextStageOrder
                    ? "border-amber-400/40 bg-amber-400/10"
                    : "border-border/40 bg-card/50",
              )}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-xs font-bold">
                {localizeDigits(idx + 1, locale)}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {stage.title ?? `Stage ${stage.order}`}
              </span>
              {stage.completed ? (
                <span className="text-[11px] font-semibold text-primary">OK</span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
