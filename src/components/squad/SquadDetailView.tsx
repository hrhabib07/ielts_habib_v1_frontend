"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Crown,
  Copy,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SQUAD_BADGE_LABELS, SQUAD_UI } from "@/src/lib/squad-ui-copy";
import type { SquadDetail } from "@/src/lib/api/squad";
import {
  deleteSquad,
  leaveSquad,
  removeSquadMember,
  transferSquadLeadership,
} from "@/src/lib/api/squad";
import { cn } from "@/lib/utils";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-3 text-center shadow-sm">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>
      <p className="text-lg font-black tabular-nums text-foreground">{value}</p>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

function MemberCard({
  member,
  canManage,
  onRemove,
  onTransfer,
}: {
  member: SquadDetail["members"][number];
  canManage: boolean;
  onRemove?: () => void;
  onTransfer?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/70 p-3">
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
          member.isWeeklyChampion
            ? "bg-gradient-to-br from-amber-400 to-orange-500"
            : "bg-gradient-to-br from-indigo-500 to-violet-600",
        )}
      >
        {member.avatarLetter}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="font-semibold text-foreground">{member.displayName}</p>
          {member.isLeader ? (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
              Leader
            </span>
          ) : null}
          {member.isWeeklyChampion ? (
            <span className="text-[10px] font-bold text-amber-600">{SQUAD_UI.weeklyChampion}</span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {SQUAD_UI.missionLabel(member.missionOrder)} · {member.totalXp} XP
        </p>
        <p className="text-[11px] text-muted-foreground">
          সাপ্তাহিক {member.weeklyXp} · লাইফটাইম {member.lifetimeContribution}
        </p>
        {canManage && !member.isLeader ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={onTransfer}>
              {SQUAD_UI.transferLead}
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={onRemove}>
              {SQUAD_UI.removeMember}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SquadDetailView({
  squad,
  showManage = false,
  onRefresh,
}: {
  squad: SquadDetail;
  showManage?: boolean;
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const copyCode = async () => {
    if (!squad.inviteCode) return;
    await navigator.clipboard.writeText(squad.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    if (!confirm(SQUAD_UI.confirmLeave)) return;
    setBusy(true);
    try {
      await leaveSquad();
      router.push("/squad");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(SQUAD_UI.confirmDelete)) return;
    setBusy(true);
    try {
      await deleteSquad();
      router.push("/squad");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 font-bengali">
      <div className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-indigo-600/90 to-violet-700/90 p-5 text-white shadow-lg">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">{SQUAD_UI.title}</p>
        <h1 className="mt-1 text-2xl font-black">{squad.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {squad.highestBadge ? (
            <span className="rounded-full bg-white/15 px-3 py-1 font-semibold">
              {SQUAD_BADGE_LABELS[squad.highestBadge] ?? squad.highestBadge}
            </span>
          ) : null}
          {squad.weeklyRank ? (
            <span className="rounded-full bg-white/15 px-3 py-1 font-semibold">
              {SQUAD_UI.weeklyRank} #{squad.weeklyRank}
            </span>
          ) : null}
          <span className="rounded-full bg-white/15 px-3 py-1 font-semibold">
            {squad.memberCount}/{squad.maxMembers} {SQUAD_UI.members}
          </span>
        </div>
        {squad.inviteCode ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-white/85">{SQUAD_UI.inviteCode}:</span>
            <code className="rounded-lg bg-black/25 px-3 py-1.5 text-lg font-black tracking-widest">
              {squad.inviteCode}
            </code>
            <Button type="button" size="sm" variant="secondary" className="h-8" onClick={copyCode}>
              <Copy className="mr-1 h-3.5 w-3.5" />
              {copied ? SQUAD_UI.copied : SQUAD_UI.copyCode}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={SQUAD_UI.weeklyXp} value={squad.weeklyXp} icon={<Zap className="h-4 w-4" />} />
        <StatCard label={SQUAD_UI.lifetimeXp} value={squad.lifetimeXp} icon={<Trophy className="h-4 w-4" />} />
        <StatCard
          label={SQUAD_UI.weeklyRank}
          value={squad.weeklyRank ?? "—"}
          icon={<Crown className="h-4 w-4" />}
        />
        <StatCard label={SQUAD_UI.members} value={squad.memberCount} icon={<Users className="h-4 w-4" />} />
      </div>

      {squad.badges.length > 0 ? (
        <section className="rounded-2xl border border-border/60 bg-card/60 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <Shield className="h-4 w-4 text-indigo-500" />
            {SQUAD_UI.badges}
          </h2>
          <div className="flex flex-wrap gap-2">
            {squad.badges.map((id) => (
              <span
                key={id}
                className="rounded-full border border-indigo-300/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
              >
                {SQUAD_BADGE_LABELS[id] ?? id}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-sm font-bold">{SQUAD_UI.members}</h2>
        <div className="space-y-2">
          {squad.members.map((member) => (
            <MemberCard
              key={member.userId}
              member={member}
              canManage={showManage && squad.isLeader}
              onRemove={async () => {
                setBusy(true);
                try {
                  await removeSquadMember(member.userId);
                  onRefresh?.();
                } finally {
                  setBusy(false);
                }
              }}
              onTransfer={async () => {
                setBusy(true);
                try {
                  await transferSquadLeadership(member.userId);
                  onRefresh?.();
                } finally {
                  setBusy(false);
                }
              }}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/60 p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Sparkles className="h-4 w-4 text-violet-500" />
          {SQUAD_UI.activity}
        </h2>
        {squad.activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">এখনো কোনো কার্যক্রম নেই।</p>
        ) : (
          <ul className="space-y-2">
            {squad.activities.map((a) => (
              <li key={a.id} className="rounded-xl bg-muted/40 px-3 py-2 text-sm">
                {a.messageBn}
              </li>
            ))}
          </ul>
        )}
      </section>

      {showManage ? (
        <div className="flex flex-wrap gap-2 border-t border-border/50 pt-4">
          {!squad.isLeader ? (
            <Button type="button" variant="outline" disabled={busy} onClick={handleLeave}>
              {SQUAD_UI.leaveSquad}
            </Button>
          ) : (
            <Button type="button" variant="destructive" disabled={busy} onClick={handleDelete}>
              {SQUAD_UI.deleteSquad}
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/squad/leaderboard">{SQUAD_UI.weeklyLeaderboard}</Link>
          </Button>
        </div>
      ) : (
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/squad/leaderboard">{SQUAD_UI.weeklyLeaderboard}</Link>
        </Button>
      )}
    </div>
  );
}
