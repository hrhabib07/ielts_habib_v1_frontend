"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { GAMLISH_XP_EVENT } from "@/src/lib/xp-events";
import { cn } from "@/lib/utils";

interface Burst {
  id: number;
  amount: number;
  source: "answer" | "stage";
}

/**
 * Floating +XP popups — fires on correct answers and stage clears.
 */
export function XpGainToaster() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    const onGain = (e: Event) => {
      const detail = (e as CustomEvent<{ amount: number; source: "answer" | "stage" }>)
        .detail;
      if (!detail?.amount || detail.amount <= 0) return;
      const id = Date.now() + Math.random();
      setBursts((prev) => [...prev.slice(-4), { id, amount: detail.amount, source: detail.source }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 1400);
    };
    window.addEventListener(GAMLISH_XP_EVENT, onGain);
    return () => window.removeEventListener(GAMLISH_XP_EVENT, onGain);
  }, []);

  if (bursts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[4.5rem] z-[60] flex flex-col items-center gap-2"
      aria-live="polite"
    >
      {bursts.map((b) => (
        <div
          key={b.id}
          className={cn(
            "animate-[xpfloat_1.35s_ease-out_forwards] inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-black shadow-lg",
            b.source === "stage"
              ? "bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950"
              : "bg-gradient-to-r from-sky-400 to-blue-600 text-white",
          )}
        >
          <Zap className="h-4 w-4 fill-current" />
          +{b.amount} XP
        </div>
      ))}
      <style jsx global>{`
        @keyframes xpfloat {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.7);
          }
          18% {
            opacity: 1;
            transform: translateY(0) scale(1.08);
          }
          70% {
            opacity: 1;
            transform: translateY(-18px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
