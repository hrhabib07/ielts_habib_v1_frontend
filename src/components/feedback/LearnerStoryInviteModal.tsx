"use client";

import Link from "next/link";
import { Sparkles, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEARNER_FEEDBACK_REWARD_XP } from "@/src/lib/learner-feedback";

interface LearnerStoryInviteModalProps {
  isOpen: boolean;
  missionsCompleted: number;
  totalXp: number;
  rewardXp?: number;
  onLater: () => void;
}

/** Next round milestone above current XP (hot-streak target). */
function nextXpMilestone(totalXp: number): number {
  const step = 50;
  const next = Math.ceil((totalXp + 0.0001) / step) * step;
  return next <= totalXp ? totalXp + step : next;
}

/**
 * Soft CTA after Mission 3+ completion for paid learners who have not submitted yet.
 */
export function LearnerStoryInviteModal({
  isOpen,
  missionsCompleted,
  totalXp,
  rewardXp = LEARNER_FEEDBACK_REWARD_XP,
  onLater,
}: LearnerStoryInviteModalProps) {
  if (!isOpen) return null;

  const milestone = nextXpMilestone(totalXp);
  const xpAfter = Math.round((totalXp + rewardXp) * 10) / 10;
  const willCross = xpAfter >= milestone;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/30 bg-card shadow-2xl font-bengali">
        <div className="bg-gradient-to-br from-amber-400/20 via-card to-sky-500/10 px-5 pb-5 pt-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-amber-950 shadow-lg shadow-amber-500/35">
            <Trophy className="h-6 w-6" />
          </div>
          <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-200">
            বোনাস চ্যালেঞ্জ
          </p>
          <h2 className="mt-1 text-center text-xl font-black text-foreground">
            তুমি ইতিমধ্যে {missionsCompleted}টি মিশন শেষ করেছো
          </h2>
          <p className="mt-2 text-center text-sm font-medium leading-relaxed text-muted-foreground">
            দারুণ খেলছো!{" "}
            {willCross ? (
              <>
                এই বোনাস কমপ্লিট করে তোমার XP{" "}
                <span className="font-black tabular-nums text-amber-700 dark:text-amber-300">
                  {milestone}
                </span>{" "}
                পার করো!
              </>
            ) : (
              <>
                এই বোনাসে{" "}
                <span className="font-black text-amber-700 dark:text-amber-300">
                  +{rewardXp} XP
                </span>{" "}
                নিয়ে নেয়ো।
              </>
            )}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-background/80 px-3 py-2.5 text-center ring-1 ring-border">
              <Trophy className="mx-auto h-4 w-4 text-amber-500" />
              <p className="mt-1 text-[10px] font-bold uppercase text-muted-foreground">
                মিশন
              </p>
              <p className="text-lg font-black tabular-nums">{missionsCompleted}</p>
            </div>
            <div className="rounded-2xl bg-background/80 px-3 py-2.5 text-center ring-1 ring-border">
              <Zap className="mx-auto h-4 w-4 text-amber-500" />
              <p className="mt-1 text-[10px] font-bold uppercase text-muted-foreground">
                XP
              </p>
              <p className="text-lg font-black tabular-nums">{totalXp}</p>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            মাত্র 2 মিনিট লাগবে!
          </p>

          <Button
            asChild
            size="lg"
            className="mt-2 h-12 w-full rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-base font-black text-amber-950 shadow-lg shadow-amber-500/40 ring-4 ring-amber-400/40 transition hover:from-amber-300 hover:via-amber-400 hover:to-orange-400 hover:text-amber-950"
          >
            <Link href="/feedback">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>বোনাস চ্যালেঞ্জ আনলক করো</span>
              <span className="ml-1.5 font-black text-amber-950/90">
                (+{rewardXp} XP)
              </span>
            </Link>
          </Button>

          <button
            type="button"
            onClick={onLater}
            className="mt-3 w-full text-center text-xs font-semibold text-muted-foreground/90 underline-offset-2 hover:text-muted-foreground hover:underline"
          >
            না, আমি {rewardXp} XP চাই না
          </button>
        </div>
      </div>
    </div>
  );
}
