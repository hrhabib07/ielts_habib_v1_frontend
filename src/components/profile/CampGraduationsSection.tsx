"use client";

import { Award, Lock, PartyPopper, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampGraduationView } from "@/src/lib/api/gamlish";
import { brandSurfaces } from "@/src/lib/brand-theme";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";

const BADGE_RING: Record<
  NonNullable<CampGraduationView["badge"]>,
  string
> = {
  master: "from-amber-400 via-amber-500 to-orange-600",
  explorer: "from-sky-400 via-blue-500 to-indigo-600",
  apprentice: "from-slate-400 via-slate-500 to-slate-700",
};

function CampBadgeCard({ camp }: { camp: CampGraduationView }) {
  const { locale } = useUiLocale();
  const isBn = locale === "bn";
  const title = isBn ? camp.campTitleBn || camp.campTitle : camp.campTitle;
  const Icon =
    camp.badge === "master" ? Trophy : camp.badge === "explorer" ? Award : Sparkles;

  if (!camp.unlocked) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-border/50 bg-muted/25 p-4 text-center opacity-70">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Lock className="h-6 w-6" />
        </span>
        <p className="mt-3 text-xs font-bold text-foreground">{title}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {isBn ? "লকড" : "Locked"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 text-center shadow-sm",
        brandSurfaces.featuredCard,
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg",
          BADGE_RING[camp.badge ?? "explorer"],
        )}
      >
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <p className="mt-3 text-xs font-bold text-foreground">{title}</p>
      <p className="mt-1 text-sm font-black text-primary">
        {camp.badgeTitle ?? "Graduate"}
      </p>
      {camp.scorePercent != null ? (
        <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
          {isBn ? "ফেয়ার স্কোর" : "Fair score"} {camp.scorePercent}%
        </p>
      ) : null}
    </div>
  );
}

export function CampGraduationsSection({
  camps,
}: {
  camps: CampGraduationView[];
}) {
  const { locale } = useUiLocale();
  const isBn = locale === "bn";
  if (camps.length === 0) return null;

  const unlockedCamps = camps.filter((c) => c.unlocked);
  const latest = unlockedCamps[unlockedCamps.length - 1] ?? null;
  const latestTitle = latest
    ? isBn
      ? latest.campTitleBn || latest.campTitle
      : latest.campTitle
    : null;

  return (
    <div className={cn(isBn && "font-bengali")}>
      {latest ? (
        <div
          className={cn(
            "mb-4 overflow-hidden rounded-2xl border px-4 py-3.5",
            brandSurfaces.premiumBanner,
          )}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300">
              <PartyPopper className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                {isBn
                  ? `অভিনন্দন! তুমি ${latestTitle} গ্র্যাজুয়েট করেছ`
                  : `Congratulations! You graduated ${latestTitle}`}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {latest.badgeTitle
                  ? isBn
                    ? `তোমার ${latest.badgeTitle} ব্যাজ প্রোফাইলে থাকবে। চার ক্যাম্পে Master = Intermediate ফ্রি পাথ।`
                    : `Your ${latest.badgeTitle} badge stays on your profile. Master on all 4 camps unlocks the free Intermediate path.`
                  : isBn
                    ? "তোমার গ্র্যাজুয়েশন ব্যাজ প্রোফাইলে থাকবে। এগোতে থাকো।"
                    : "Your graduation badge stays on your profile. Keep going."}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Trophy className="h-4 w-4 text-amber-500" />{" "}
        {isBn ? "ক্যাম্প গ্র্যাজুয়েশন ব্যাজ" : "Camp graduation badges"}
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        {isBn
          ? "ফেয়ার স্কোর = অনুশীলন মিশন + ইন্সপেকশন ফাইনাল। 90%+ = Master।"
          : "Fair score = practice missions + inspection final. 90%+ = Master."}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {camps.map((camp) => (
          <CampBadgeCard key={camp.campOrder} camp={camp} />
        ))}
      </div>
    </div>
  );
}
