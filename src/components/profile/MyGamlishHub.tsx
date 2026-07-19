"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Lock,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getGamlishProfile,
  type AchievementView,
  type GamlishPublicProfile,
  type MissionCard,
} from "@/src/lib/api/gamlish";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";

function MissionMini({ card }: { card: MissionCard }) {
  const n = String(card.order).padStart(2, "0");
  if (card.state === "completed") {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-[9px] font-bold text-amber-950 shadow-sm">
        #{n}
      </div>
    );
  }
  if (card.state === "current") {
    return (
      <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-emerald-300">
        #{n}
        <span className="text-[7px] uppercase">Now</span>
      </div>
    );
  }
  return (
    <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-lg bg-muted text-[9px] font-bold text-muted-foreground opacity-60 grayscale">
      <Lock className="mb-0.5 h-3 w-3" />
      #{n}
    </div>
  );
}

/**
 * Own-account gamified hub on /profile — works for existing users once
 * publicId is minted by GET /students/me.
 */
export function MyGamlishHub() {
  const { profile, loading: sessionLoading } = useStudentSession();
  const [data, setData] = useState<GamlishPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const handle =
    profile?.publicHandle ?? profile?.username ?? profile?.publicId ?? null;

  useEffect(() => {
    if (sessionLoading) return;
    if (!handle) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getGamlishProfile(handle)
      .then((p) => {
        if (!cancelled) setData(p);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [handle, sessionLoading]);

  if (sessionLoading || loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/40" />
        ))}
      </div>
    );
  }

  if (!handle) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Your public profile is being prepared. Refresh this page in a moment.
      </div>
    );
  }

  const stats = data?.stats;
  const cards = data?.missionCards ?? [];
  const allAchievements = data?.achievements ?? [];
  const unlockedCount = allAchievements.filter((a) => a.unlocked).length;
  const streakCurrent =
    stats?.streakCurrent ?? profile?.streak?.current ?? 0;
  const streakLongest =
    stats?.streakLongest ?? profile?.streak?.longest ?? 0;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Your rewards
          </h2>
          <p className="text-sm text-muted-foreground">
            Level, XP and streak — the dopamine loop. Keep playing to grow them.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={`/u/${handle}`}>Open public profile</Link>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat
          icon={<Sparkles className="h-5 w-5 text-white" />}
          label="Level"
          value={stats?.level ?? 1}
          accent="from-violet-400 to-purple-600"
          big
        />
        <Stat
          icon={<Zap className="h-5 w-5 text-white" />}
          label="XP"
          value={(stats?.totalXp ?? 0).toLocaleString()}
          accent="from-sky-400 to-blue-600"
          big
          highlight
        />
        <Stat
          icon={<Flame className="h-5 w-5 text-white" />}
          label="Streak"
          value={`${streakCurrent}d`}
          hint={streakLongest > 0 ? `Best ${streakLongest}d` : undefined}
          accent="from-orange-400 to-rose-600"
          big
        />
      </div>

      {profile?.isFoundingMember && profile.founderNumber ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
          <Trophy className="h-5 w-5 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              {profile.founderTier === "GOLD"
                ? "Gold"
                : profile.founderTier === "SILVER"
                  ? "Silver"
                  : "Bronze"}{" "}
              Founder · #{String(profile.founderNumber).padStart(3, "0")}
            </p>
            <p className="text-xs text-muted-foreground">
              Permanent badge — you appear on the Founders&apos; Wall.
            </p>
          </div>
          <Button asChild size="sm" variant="secondary" className="rounded-full">
            <Link href="/founding-members">View wall</Link>
          </Button>
        </div>
      ) : null}

      {cards.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Star className="h-4 w-4 text-amber-500" /> Mission cards
            </p>
            <span className="text-xs text-muted-foreground">
              {cards.filter((c) => c.state === "completed").length}/{cards.length}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-10">
            {cards.slice(0, 21).map((card) => (
              <MissionMini key={card.missionId} card={card} />
            ))}
          </div>
        </div>
      ) : null}

      {allAchievements.length > 0 ? (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Trophy className="h-4 w-4 text-amber-500" /> Achievements
            <span className="text-xs font-normal text-muted-foreground">
              ({unlockedCount}/{allAchievements.length})
            </span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {allAchievements.map((a: AchievementView) => (
              <div
                key={a.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3 shadow-sm",
                  a.unlocked
                    ? "border-amber-400/30 bg-amber-400/5"
                    : "border-border/50 bg-muted/30 opacity-60 grayscale",
                )}
              >
                <span className="text-2xl">{a.emoji}</span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {a.title}
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {a.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Complete Mission 01 to unlock your first achievement and start collecting
          cards.
        </p>
      )}
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  accent,
  big,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  accent: string;
  big?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-2xl border px-2 py-4 text-center shadow-sm",
        highlight
          ? "border-amber-400/40 bg-gradient-to-b from-amber-400/20 to-card ring-1 ring-amber-400/25"
          : "border-border/50 bg-card/80",
        big && "py-5",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-xl bg-gradient-to-br",
          accent,
          big ? "h-11 w-11" : "h-9 w-9",
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "mt-1 font-black tabular-nums text-foreground",
          big ? "text-2xl sm:text-3xl" : "text-lg",
        )}
      >
        {value}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {hint ? (
        <span className="text-[10px] text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}
