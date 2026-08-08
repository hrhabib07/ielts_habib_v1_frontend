"use client";

import { useEffect, useState } from "react";
import { getDemoStats } from "@/src/lib/api/demo";
import {
  DEMO_JOINED_STUDENT_FLOOR,
  floorJoinedStudentCount,
} from "@/src/lib/demo-social-proof";
import { localizeDigits } from "@/src/lib/ui-locale";
import { cn } from "@/lib/utils";

type Props = {
  locale: "bn" | "en";
  className?: string;
  line: (countLabel: string) => string;
};

/** Abstract learner chips · initials only (no fake stock faces). */
const AVATARS_BN = [
  { initial: "র", tone: "bg-sky-600" },
  { initial: "স", tone: "bg-emerald-600" },
  { initial: "ম", tone: "bg-amber-500 text-amber-950" },
] as const;

const AVATARS_EN = [
  { initial: "R", tone: "bg-sky-600" },
  { initial: "S", tone: "bg-emerald-600" },
  { initial: "M", tone: "bg-amber-500 text-amber-950" },
] as const;

/**
 * Live student count · floored to tens · never below 150+.
 * Overlapping initials make the crowd feel real without inventing portraits.
 */
export function DemoJoinedSocialProof({ locale, className, line }: Props) {
  const [count, setCount] = useState(DEMO_JOINED_STUDENT_FLOOR);

  useEffect(() => {
    let cancelled = false;
    void getDemoStats()
      .then((s) => {
        if (cancelled) return;
        const raw =
          typeof s.registeredStudents === "number"
            ? s.registeredStudents
            : DEMO_JOINED_STUDENT_FLOOR;
        setCount(floorJoinedStudentCount(raw));
      })
      .catch(() => {
        if (!cancelled) setCount(DEMO_JOINED_STUDENT_FLOOR);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const countLabel = `${localizeDigits(count, locale)}+`;
  const avatars = locale === "bn" ? AVATARS_BN : AVATARS_EN;

  return (
    <div
      className={cn(
        "mt-3 flex items-center justify-center gap-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2.5",
        className,
      )}
      role="status"
    >
      <div className="flex shrink-0 -space-x-2" aria-hidden>
        {avatars.map((avatar) => (
          <span
            key={avatar.initial}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-sky-50 text-[11px] font-black text-white shadow-sm dark:border-sky-950",
              avatar.tone,
              locale === "bn" && "font-bengali",
            )}
          >
            {avatar.initial}
          </span>
        ))}
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-sky-50 bg-slate-800 px-1.5 font-sans text-[10px] font-black tabular-nums text-white shadow-sm dark:border-sky-950">
          {localizeDigits(count, locale)}+
        </span>
      </div>
      <p
        className={cn(
          "min-w-0 text-left text-[12px] font-bold leading-snug text-sky-950 dark:text-sky-100 sm:text-[13px]",
          locale === "bn" && "font-bengali",
        )}
      >
        {line(countLabel)}
      </p>
    </div>
  );
}
