"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Coins,
  Loader2,
  Moon,
  PartyPopper,
  Sparkles,
  Trophy,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlayerCampOutcome } from "@/src/lib/api/player";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { brandSurfaces } from "@/src/lib/brand-theme";
import { cn } from "@/lib/utils";
import {
  playGraduationCelebrateSfx,
  primeEvalSfx,
} from "@/src/lib/player-eval-sfx";

function ScoreCountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame = 0;
    const steps = 18;
    const tick = () => {
      frame += 1;
      setDisplay(Math.round((value * frame) / steps));
      if (frame < steps) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return (
    <span className="tabular-nums">
      {display}
      <span className="text-[0.55em] font-bold opacity-80">%</span>
    </span>
  );
}

const BADGE_VISUAL: Record<
  PlayerCampOutcome["badge"],
  { icon: typeof Trophy; ring: string; glow: string }
> = {
  master: {
    icon: Trophy,
    ring: "from-amber-400 via-amber-500 to-orange-600",
    glow: "shadow-amber-500/30",
  },
  explorer: {
    icon: Award,
    ring: "from-steel via-steel-deep to-primary",
    glow: "shadow-steel-deep/25",
  },
  apprentice: {
    icon: Sparkles,
    ring: "from-primary/80 via-primary to-steel-deep",
    glow: "shadow-primary/20",
  },
};

const CONFETTI_COLORS = [
  "#38bdf8",
  "#fbbf24",
  "#34d399",
  "#f472b6",
  "#a78bfa",
  "#fb923c",
];

function GraduationCelebrationFx() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 5) % 100}%`,
        delay: `${(i % 12) * 0.08}s`,
        duration: `${2.4 + (i % 6) * 0.25}s`,
        size: 6 + (i % 5) * 2,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
        drift: `${(i % 2 === 0 ? -1 : 1) * (12 + (i % 8) * 4)}px`,
        round: i % 3 === 0,
      })),
    [],
  );

  const bubbles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${8 + ((i * 23) % 84)}%`,
        delay: `${(i % 7) * 0.35}s`,
        duration: `${3.5 + (i % 5) * 0.4}s`,
        size: 10 + (i % 4) * 6,
      })),
    [],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-3xl"
      aria-hidden
    >
      {pieces.map((p) => (
        <span
          key={`c-${p.id}`}
          className="camp-grad-confetti absolute top-[-12px]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * (p.round ? 1 : 1.4),
            backgroundColor: p.color,
            borderRadius: p.round ? "999px" : "2px",
            animationDelay: p.delay,
            animationDuration: p.duration,
            ["--camp-grad-drift" as string]: p.drift,
          }}
        />
      ))}
      {bubbles.map((b) => (
        <span
          key={`b-${b.id}`}
          className="camp-grad-bubble absolute bottom-[-20px] rounded-full border border-sky-300/50 bg-sky-200/25 dark:border-sky-400/40 dark:bg-sky-400/15"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
            animationDuration: b.duration,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes camp-grad-fall {
          0% {
            transform: translate3d(0, -10px, 0) rotate(0deg);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--camp-grad-drift, 20px), 520px, 0)
              rotate(260deg);
            opacity: 0;
          }
        }
        @keyframes camp-grad-rise {
          0% {
            transform: translate3d(0, 0, 0) scale(0.7);
            opacity: 0;
          }
          20% {
            opacity: 0.7;
          }
          100% {
            transform: translate3d(0, -420px, 0) scale(1.15);
            opacity: 0;
          }
        }
        :global(.camp-grad-confetti) {
          animation-name: camp-grad-fall;
          animation-timing-function: ease-out;
          animation-iteration-count: infinite;
        }
        :global(.camp-grad-bubble) {
          animation-name: camp-grad-rise;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.camp-grad-confetti),
          :global(.camp-grad-bubble) {
            animation: none !important;
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export function CampGraduationStage({
  outcome,
  submitting,
  onContinue,
}: {
  outcome: PlayerCampOutcome;
  submitting: boolean;
  onContinue: () => void;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  const { locale } = useUiLocale();
  const isBn = locale === "bn";
  const BadgeIcon = BADGE_VISUAL[outcome.badge].icon;
  const visual = BADGE_VISUAL[outcome.badge];
  const badgeTitle = isBn ? outcome.badgeTitleBn : outcome.badgeTitleEn;
  const coachNote = isBn ? outcome.coachNoteBn : outcome.coachNoteEn;
  const skills = isBn ? outcome.skillsUnlockedBn : outcome.skillsUnlockedEn;
  const hasScore = outcome.scorePercent != null;
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const play = async () => {
      if (soundPlayedRef.current) return;
      await primeEvalSfx();
      if (cancelled) return;
      await playGraduationCelebrateSfx();
      soundPlayedRef.current = true;
    };
    void play();

    const unlock = () => {
      void play();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", unlock);
    };
  }, []);

  const campTitle = isBn
    ? (outcome.campTitleBn ?? "Camp 01: The Foundation")
    : (outcome.campTitleEn ?? "Camp 01: The Foundation");
  const campOrder = outcome.campOrder ?? 1;
  const nextCamp =
    campOrder >= 4
      ? null
      : isBn
        ? `Camp 0${campOrder + 1}`
        : `Camp 0${campOrder + 1}`;

  const congratsTitle = isBn
    ? `অভিনন্দন ${outcome.displayName}!`
    : `Congratulations ${outcome.displayName}!`;
  const congratsBody = isBn
    ? `তুমি ${campTitle} থেকে গ্র্যাজুয়েট হয়েছ। যেকোনো ব্যাজই জয়। তোমার এই মুহূর্তটা উদযাপনের যোগ্য।`
    : `You graduated from ${campTitle}. Every badge is a win. This moment is worth celebrating.`;

  const headline = isBn
    ? `${outcome.displayName}, তুমি ${campTitle} শেষ করেছ`
    : `${outcome.displayName}, you finished ${campTitle}`;

  const subline = isBn
    ? "এটা তোমার নিজের অর্জন। Master বাজে Intermediate এর পথে সাহায্য করে।"
    : "This win is yours. A Master badge helps unlock free Intermediate later.";

  const scoreLabel = isBn ? "তোমার স্কোর" : "Your score";
  const badgeLabel = isBn ? "তোমার Graduation Badge" : "Your Graduation Badge";
  const skillsTitle = isBn ? "এখন তুমি পারো" : "You can now";
  const rewardTitle = isBn ? "তোমার রিওয়ার্ড" : "Your reward";
  const unlockTitle = outcome.rest
    ? isBn
      ? "গ্র্যাজুয়েশন বিরতি"
      : "Graduation rest"
    : nextCamp
      ? isBn
        ? `${nextCamp} আনলক হয়েছে`
        : `${nextCamp} unlocked`
      : isBn
        ? "Foundations সম্পন্ন"
        : "Foundations complete";
  const unlockBody = outcome.rest
    ? PLAYER_UI.campRest.graduationBody(outcome.rest.hoursLeft ?? 24)
    : nextCamp
      ? isBn
        ? "পরের ক্যাম্পে নতুন চ্যালেঞ্জ অপেক্ষা করছে। এগোও।"
        : "New challenges are waiting in the next camp. Keep going."
      : isBn
        ? "চারটি ক্যাম্পেই Master হলে Intermediate ফ্রি পাওয়ার পথে তুমি।"
        : "Master on all four camps puts you on the free Intermediate path.";

  const restNote =
    outcome.rest && nextCamp
      ? PLAYER_UI.campRest.unlockLater(nextCamp)
      : null;
  return (
    <div className={cn("relative space-y-5", isBn && "font-bengali")}>
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border p-6 shadow-lg",
          brandSurfaces.midnightCard,
        )}
      >
        <GraduationCelebrationFx />
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-amber-400/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-6 h-36 w-36 rounded-full bg-steel/30 blur-3xl"
          aria-hidden
        />

        <div className="relative z-20 animate-in fade-in zoom-in-95 duration-500">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
            <PartyPopper className="h-3.5 w-3.5" aria-hidden />
            {isBn ? "Celebration" : "Celebration"}
          </div>
          <p
            className="text-3xl leading-none sm:text-4xl"
            aria-hidden
          >
            🎉 🥳 ✨ 🏆 🎊
          </p>
          <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-primary-foreground sm:text-3xl">
            {congratsTitle}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
            {congratsBody}
          </p>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/60">
            Camp Outcome
          </p>
          <p className="mt-1 text-lg font-bold text-primary-foreground/95">
            {headline}
          </p>
          <p className="mt-1 text-sm text-primary-foreground/75">{subline}</p>
        </div>
      </div>

      {hasScore ? (
        <div
          className={cn(
            "animate-in fade-in zoom-in-95 duration-500 rounded-3xl border p-5 text-center",
            brandSurfaces.pricingCard,
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {scoreLabel}
          </p>
          <p className="mt-1 text-5xl font-black text-foreground">
            <ScoreCountUp value={outcome.scorePercent!} />
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isBn
              ? "তোমার ফেয়ার ক্যাম্প স্কোর (অনুশীলন + মিশন 5)"
              : "Your fair camp score (practice + Mission 5)"}
          </p>
          {outcome.scoreBreakdown ? (
            <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs sm:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-background/60 px-3 py-2">
                <p className="text-muted-foreground">
                  {isBn ? "অনুশীলন M1-4" : "Practice M1-4"}{" "}
                  ({outcome.scoreBreakdown.practiceWeightPercent}%)
                </p>
                <p className="mt-0.5 font-bold tabular-nums text-foreground">
                  {outcome.scoreBreakdown.practiceAvg != null
                    ? `${outcome.scoreBreakdown.practiceAvg}%`
                    : isBn
                      ? "নেই"
                      : "N/A"}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/60 px-3 py-2">
                <p className="text-muted-foreground">
                  {isBn ? "মিশন 5" : "Mission 5"}{" "}
                  ({outcome.scoreBreakdown.inspectionWeightPercent}%)
                </p>
                <p className="mt-0.5 font-bold tabular-nums text-foreground">
                  {outcome.scoreBreakdown.inspectionScore}%
                </p>
              </div>
              <div className="col-span-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 sm:col-span-1">
                <p className="text-amber-800 dark:text-amber-200">
                  Graduation Challenge
                </p>
                <p className="mt-0.5 font-bold tabular-nums text-foreground">
                  {outcome.scoreBreakdown.graduationChallengePercent}%
                </p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "animate-in fade-in slide-in-from-bottom-3 duration-700 rounded-3xl border p-5",
          brandSurfaces.featuredCard,
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {badgeLabel}
        </p>
        <div className="mt-4 flex flex-col items-center text-center">
          <div
            className={cn(
              "flex h-24 w-24 animate-in zoom-in-95 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-xl duration-700",
              visual.ring,
              visual.glow,
            )}
          >
            <BadgeIcon className="h-11 w-11" strokeWidth={1.75} />
          </div>
          <p className="mt-4 text-xl font-black tracking-tight text-foreground">
            {badgeTitle}
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {coachNote}
          </p>
        </div>
      </div>

      <div className={cn("rounded-3xl border p-5", brandSurfaces.pricingCard)}>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {skillsTitle}
        </p>
        <ul className="mt-3 space-y-2.5">
          {skills.map((skill) => (
            <li key={skill} className="flex gap-2.5 text-sm leading-snug text-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{skill}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 dark:bg-amber-400/10">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
            {rewardTitle}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-lg font-black text-amber-900 dark:text-amber-100">
            <Sparkles className="h-4 w-4" aria-hidden />+{outcome.rewardXp}{" "}
            {PLAYER_UI.xpLabel}
          </p>
        </div>
        <div className="rounded-2xl border border-primary/25 bg-primary/8 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {PLAYER_UI.coinsLabel}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-lg font-black text-foreground">
            <Coins className="h-4 w-4 text-primary" aria-hidden />+
            {outcome.rewardCoins}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex items-start gap-3 rounded-2xl border px-4 py-3.5",
          outcome.rest ? "border-amber-500/30 bg-amber-500/10" : brandSurfaces.premiumBanner,
        )}
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
          {outcome.rest ? (
            <Moon className="h-4 w-4" aria-hidden />
          ) : (
            <Unlock className="h-4 w-4" aria-hidden />
          )}
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">{unlockTitle}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{unlockBody}</p>
          {restNote ? (
            <p className="mt-2 text-xs font-semibold text-amber-800 dark:text-amber-200">
              {restNote}
            </p>
          ) : null}
        </div>
      </div>

      <Button
        className={cn("w-full gap-2", brandSurfaces.ctaButton)}
        size="lg"
        disabled={submitting}
        onClick={() => {
          void playGraduationCelebrateSfx();
          onContinue();
        }}
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {PLAYER_UI.continue}
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

/** @deprecated Use CampGraduationStage */
export const Camp01GraduationStage = CampGraduationStage;
