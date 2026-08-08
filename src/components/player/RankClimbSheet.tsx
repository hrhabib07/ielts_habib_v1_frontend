"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RankClimbSheetProps {
  isOpen: boolean;
  fromRank: number;
  toRank: number;
  onContinue: () => void;
}

/**
 * Soft post-mission sheet only. Never mounts mid-stage.
 */
export function RankClimbSheet({
  isOpen,
  fromRank,
  toRank,
  onContinue,
}: RankClimbSheetProps) {
  const reduce = useReducedMotion();
  if (!isOpen) return null;

  const jumped = Math.max(0, fromRank - toRank);

  return (
    <div className="fixed inset-0 z-[72] flex items-end justify-center bg-black/45 p-4 sm:items-center">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/35 bg-card shadow-2xl font-bengali"
      >
        <div className="bg-gradient-to-br from-amber-400/20 via-card to-sky-500/10 px-5 pb-5 pt-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-amber-950 shadow-lg shadow-amber-500/30">
            <Trophy className="h-6 w-6" />
          </div>
          <p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-200">
            র‍্যাঙ্ক আপ
          </p>
          <h2 className="mt-1 text-center text-xl font-black text-foreground">
            তুমি এগোচ্ছো!
          </h2>
          <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
            {jumped > 1
              ? `${jumped} ধাপ উপরে উঠেছো`
              : "এক ধাপ উপরে উঠেছো"}
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="rounded-2xl bg-muted/80 px-4 py-3 text-center">
              <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                আগে
              </span>
              <span className="text-2xl font-black tabular-nums text-muted-foreground">
                #{fromRank}
              </span>
            </span>
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="rounded-2xl bg-amber-400/20 px-4 py-3 text-center ring-1 ring-amber-400/40">
              <span className="block text-[10px] font-bold uppercase text-amber-800 dark:text-amber-200">
                এখন
              </span>
              <span className="text-2xl font-black tabular-nums text-amber-800 dark:text-amber-200">
                #{toRank}
              </span>
            </span>
          </div>

          <Button
            asChild
            size="lg"
            className="mt-5 h-12 w-full rounded-2xl text-base font-black"
          >
            <Link href="/leaderboard">
              পুরো লিডারবোর্ড দেখো
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <button
            type="button"
            onClick={onContinue}
            className="mt-3 w-full text-center text-xs font-bold text-muted-foreground underline-offset-2 hover:underline"
          >
            খেলা চালিয়ে যাও
          </button>
        </div>
      </motion.div>
    </div>
  );
}
