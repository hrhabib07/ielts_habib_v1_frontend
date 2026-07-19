"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Flame,
  Hand,
  Link2,
  Lock,
  Share2,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/src/lib/auth";
import {
  toggleProfileClap,
  toggleProfileFollow,
  type FounderTier,
  type GamlishPublicProfile,
  type MissionCard,
} from "@/src/lib/api/gamlish";
import { JoinedDateBadge } from "@/src/components/profile/JoinedDateBadge";

const TIER_STYLE: Record<
  FounderTier,
  { label: string; badge: string; ring: string }
> = {
  GOLD: {
    label: "Gold Founder",
    badge: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950",
    ring: "ring-amber-400/50",
  },
  SILVER: {
    label: "Silver Founder",
    badge: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900",
    ring: "ring-slate-300/60",
  },
  BRONZE: {
    label: "Bronze Founder",
    badge: "bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950",
    ring: "ring-orange-400/50",
  },
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return null;
  }
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border/50 bg-card/80 px-3 py-4 text-center shadow-sm">
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", accent)}>
        {icon}
      </span>
      <span className="mt-1 text-lg font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function MissionCardTile({ card }: { card: MissionCard }) {
  const number = String(card.order).padStart(2, "0");
  if (card.state === "completed") {
    return (
      <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 p-2 text-center shadow-sm ring-1 ring-amber-300/60">
        <Star className="h-4 w-4 fill-amber-900 text-amber-900" />
        <span className="text-[10px] font-bold text-amber-950">#{number}</span>
      </div>
    );
  }
  if (card.state === "current") {
    return (
      <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 p-2 text-center shadow-md ring-2 ring-emerald-300 animate-pulse">
        <Sparkles className="h-4 w-4 text-white" />
        <span className="text-[10px] font-bold text-white">#{number}</span>
        <span className="text-[8px] font-semibold uppercase text-white/90">Now</span>
      </div>
    );
  }
  return (
    <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl bg-muted p-2 text-center opacity-60 grayscale ring-1 ring-border/50">
      <Lock className="h-4 w-4 text-muted-foreground" />
      <span className="text-[10px] font-bold text-muted-foreground">#{number}</span>
    </div>
  );
}

export function GamlishProfileContent({
  initialProfile,
  handle,
}: {
  initialProfile: GamlishPublicProfile;
  handle: string;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [clapBusy, setClapBusy] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [clapBurst, setClapBurst] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const { identity, stats, squad, missionCards, achievements, social, recentActivity } =
    profile;

  const isLoggedIn = typeof window !== "undefined" && Boolean(getAccessToken());

  const shareUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/u/${profile.canonicalHandle}`;
    }
    return `https://gamlish.com/u/${profile.canonicalHandle}`;
  }, [profile.canonicalHandle]);

  const shareText = `Check out ${identity.displayName}'s Gamlish progress! 🎮📚`;

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const completedCards = missionCards.filter((c) => c.state === "completed").length;

  const handleClap = async () => {
    if (!isLoggedIn) {
      setNotice("Log in to clap for this profile.");
      return;
    }
    if (social.isOwnProfile || clapBusy) return;
    if (!social.canClap && !social.hasClapped) {
      setNotice("Complete Mission 1 before you can clap.");
      return;
    }
    setClapBusy(true);
    const wasClapped = social.hasClapped;
    setProfile((p) => ({
      ...p,
      social: {
        ...p.social,
        hasClapped: !wasClapped,
        totalClaps: wasClapped
          ? Math.max(0, p.social.totalClaps - 1)
          : p.social.totalClaps + 1,
      },
    }));
    if (!wasClapped) setClapBurst((n) => n + 1);
    try {
      const res = await toggleProfileClap(handle);
      setProfile((p) => ({
        ...p,
        social: { ...p.social, totalClaps: res.totalClaps, hasClapped: res.hasClapped },
      }));
    } catch (err) {
      setProfile(initialProfile);
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setNotice(msg ?? "Could not clap right now.");
    } finally {
      setClapBusy(false);
    }
  };

  const handleFollow = async () => {
    if (!isLoggedIn) {
      setNotice("Log in to follow this learner.");
      return;
    }
    if (social.isOwnProfile || followBusy) return;
    setFollowBusy(true);
    const wasFollowing = social.isFollowing;
    setProfile((p) => ({ ...p, social: { ...p.social, isFollowing: !wasFollowing } }));
    try {
      const res = await toggleProfileFollow(handle);
      setProfile((p) => ({ ...p, social: { ...p.social, isFollowing: res.isFollowing } }));
    } catch {
      setProfile(initialProfile);
      setNotice("Could not update follow.");
    } finally {
      setFollowBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setNotice("Could not copy the link.");
    }
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const tier = identity.founderTier ? TIER_STYLE[identity.founderTier] : null;
  const avatarLetter = identity.displayName.charAt(0).toUpperCase() || "G";

  const shareTargets = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Messenger",
      href: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=0&redirect_uri=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      {/* Header / share card */}
      <section
        id="gamlish-share-card"
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card to-card/60 p-6 shadow-sm sm:p-8"
      >
        <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-accent/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col items-center text-center">
          <div
            className={cn(
              "flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold ring-4",
              tier ? tier.badge : "bg-accent/15 text-accent",
              tier ? tier.ring : "ring-accent/20",
            )}
          >
            {identity.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={identity.avatarUrl}
                alt={identity.displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              avatarLetter
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            {identity.displayName}
          </h1>
          {identity.username ? (
            <p className="text-sm text-muted-foreground">@{identity.username}</p>
          ) : null}

          {identity.isFoundingMember && identity.founderNumber ? (
            <div
              className={cn(
                "mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold shadow-sm",
                tier?.badge,
              )}
            >
              <Trophy className="h-4 w-4" />
              {tier?.label} · Founder #{String(identity.founderNumber).padStart(3, "0")}
            </div>
          ) : null}

          <div className="mt-3 flex flex-col items-center gap-2">
            <JoinedDateBadge joinedAt={identity.joinDate} />
            {identity.isFoundingMember && identity.memberSince ? (
              <span className="text-xs text-muted-foreground">
                Founder since {formatDate(identity.memberSince)}
              </span>
            ) : null}
          </div>

          {/* Clap + follow */}
          {!social.isOwnProfile ? (
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleClap}
                disabled={clapBusy}
                className={cn(
                  "relative inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-all active:scale-95",
                  social.hasClapped
                    ? "border-amber-400/40 bg-amber-400/15 text-amber-700 dark:text-amber-300"
                    : "border-border bg-card text-foreground hover:border-amber-400/40",
                )}
              >
                <Hand
                  className={cn(
                    "h-4 w-4 transition-transform",
                    social.hasClapped && "scale-110 fill-current text-amber-500",
                  )}
                  key={clapBurst}
                />
                <span className="tabular-nums">{social.totalClaps}</span>
                {clapBurst > 0 ? (
                  <span
                    key={`burst-${clapBurst}`}
                    className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 animate-[clapfloat_0.7s_ease-out] text-lg"
                    aria-hidden
                  >
                    👏
                  </span>
                ) : null}
              </button>

              <button
                type="button"
                onClick={handleFollow}
                disabled={followBusy}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-all active:scale-95",
                  social.isFollowing
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border bg-card text-foreground hover:border-accent/40",
                )}
              >
                {social.isFollowing ? (
                  <UserCheck className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {social.isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-4 py-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                <Hand className="h-4 w-4 fill-current" /> {social.totalClaps} claps
              </span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{social.followingCount} following</span>
            <span>{social.totalViews.toLocaleString()} profile views</span>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShareOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent/40"
            >
              <Share2 className="h-4 w-4" /> Share profile
            </button>
          </div>

          {shareOpen ? (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {shareTargets.map((t) => (
                <a
                  key={t.name}
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/40"
                >
                  {t.name}
                </a>
              ))}
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/40"
              >
                <Link2 className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {notice ? (
        <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-center text-xs font-medium text-amber-700 dark:text-amber-300">
          {notice}
        </p>
      ) : null}

      {identity.isPrivate && !social.isOwnProfile ? (
        <p className="mt-8 rounded-2xl border border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          This profile is private.
        </p>
      ) : (
        <>
          {/* Core stats */}
          {stats ? (
            <section className="mt-6 grid grid-cols-3 gap-3">
              <StatCard
                icon={<Sparkles className="h-4 w-4 text-white" />}
                label="Level"
                value={stats.level}
                accent="bg-gradient-to-br from-violet-400 to-purple-600"
              />
              <StatCard
                icon={<Zap className="h-4 w-4 text-white" />}
                label="XP"
                value={stats.totalXp.toLocaleString()}
                accent="bg-gradient-to-br from-sky-400 to-blue-600"
              />
              <StatCard
                icon={<Flame className="h-4 w-4 text-white" />}
                label="Streak"
                value={`${stats.streakCurrent}d`}
                accent="bg-gradient-to-br from-orange-400 to-rose-600"
              />
            </section>
          ) : null}

          {/* Squad */}
          {squad ? (
            <section className="mt-6">
              <Link
                href={`/squad/${squad.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/80 p-4 shadow-sm transition hover:border-accent/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-2xl">
                  {squad.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-foreground">
                    {squad.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> {squad.memberCount} members
                  </span>
                </span>
                {squad.weeklyRank ? (
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                    Rank #{squad.weeklyRank}
                  </span>
                ) : null}
              </Link>
            </section>
          ) : null}

          {/* Mission cards */}
          {missionCards.length > 0 ? (
            <section className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Star className="h-4 w-4 text-amber-500" /> Mission Cards
                </h2>
                <span className="text-xs text-muted-foreground">
                  {completedCards}/{missionCards.length} collected
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                {missionCards.map((card) => (
                  <MissionCardTile key={card.missionId} card={card} />
                ))}
              </div>
            </section>
          ) : null}

          {/* Achievements */}
          {achievements.length > 0 ? (
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Trophy className="h-4 w-4 text-amber-500" /> Achievements
                <span className="text-xs font-normal text-muted-foreground">
                  ({unlockedAchievements.length}/{achievements.length})
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {achievements.map((a) => (
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
            </section>
          ) : null}

          {/* Recent activity */}
          {recentActivity.length > 0 ? (
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Activity className="h-4 w-4 text-accent" /> Recent Activity
              </h2>
              <ul className="space-y-2">
                {recentActivity.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 px-4 py-2.5 text-sm"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="flex-1 text-foreground">{item.title}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <style jsx global>{`
        @keyframes clapfloat {
          0% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.6);
          }
          40% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -28px) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
