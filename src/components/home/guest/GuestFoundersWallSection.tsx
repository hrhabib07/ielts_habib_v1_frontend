"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuestLandingLocale } from "@/src/components/home/guest/GuestLandingLocale";
import { GUEST_EASE } from "@/src/components/home/guest/guest-landing-motion";
import { LANDING_CTA_CLASS } from "@/src/components/home/guest/guest-landing-theme";
import {
  getFoundersWall,
  type FounderTier,
  type FoundersWall,
  type FounderWallMember,
} from "@/src/lib/api/gamlish";
import { localizeDigits } from "@/src/lib/ui-locale";
import { cn } from "@/lib/utils";

/** Home teaser: up to 4 real founders. Full wall is /founding-members. */
const MEMBER_PREVIEW_LIMIT = 4;

const TIER_BADGE: Record<FounderTier, string> = {
  GOLD: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950",
  SILVER: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900",
  BRONZE: "bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950",
};

/**
 * Mix recent + one early pioneer so the wall feels alive at every fill level.
 * Example @2: #1, #2. Example @70: #70, #68, #15 (and maybe #1).
 */
function pickMemberPreview(members: FounderWallMember[]): FounderWallMember[] {
  if (members.length === 0) return [];
  const byNumber = [...members].sort((a, b) => a.founderNumber - b.founderNumber);
  const latest = [...byNumber].reverse();

  const picked: FounderWallMember[] = [];
  const seen = new Set<number>();

  const push = (m: FounderWallMember | undefined) => {
    if (!m || seen.has(m.founderNumber) || picked.length >= MEMBER_PREVIEW_LIMIT) return;
    seen.add(m.founderNumber);
    picked.push(m);
  };

  push(latest[0]);
  push(latest[1]);

  if (byNumber.length >= 10) {
    const earlyTarget = Math.max(1, Math.round(byNumber.length * 0.2));
    const early =
      byNumber.find((m) => m.founderNumber >= earlyTarget) ?? byNumber[0];
    push(early);
  } else if (byNumber.length >= 3) {
    push(byNumber[0]);
  }

  for (const m of latest) {
    push(m);
    if (picked.length >= MEMBER_PREVIEW_LIMIT) break;
  }

  return picked.sort((a, b) => a.founderNumber - b.founderNumber);
}

function MemberChip({ member }: { member: FounderWallMember }) {
  const href = member.handle ? `/u/${member.handle}` : "/founding-members";
  return (
    <Link
      href={href}
      className="group flex min-w-0 items-center gap-2.5 rounded-2xl border border-border/50 bg-card/80 px-3 py-2.5 transition-colors hover:border-amber-400/40"
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-black tabular-nums",
          TIER_BADGE[member.founderTier],
        )}
      >
        #{String(member.founderNumber).padStart(3, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {member.displayName}
        </span>
        {member.username ? (
          <span className="block truncate text-xs text-muted-foreground">
            @{member.username}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

/**
 * Quiet Founders' Wall teaser near the bottom of the logged-out landing.
 * Hidden entirely if the public API is unavailable.
 */
export function GuestFoundersWallSection() {
  const reduceMotion = useReducedMotion();
  const { copy, locale } = useGuestLandingLocale();
  const content = copy.foundersWall;
  const [wall, setWall] = useState<FoundersWall | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFoundersWall()
      .then((data) => {
        if (!cancelled) setWall(data);
      })
      .catch(() => {
        if (!cancelled) setWall(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const members = useMemo(
    () => (wall ? pickMemberPreview(wall.members) : []),
    [wall],
  );

  if (!ready || !wall) return null;

  const filled = wall.counter.slotsFilled;
  const max = wall.counter.maxSlots;
  const filledLabel = localizeDigits(filled, locale);
  const maxLabel = localizeDigits(max, locale);

  return (
    <section
      id="founders-wall"
      className="scroll-mt-24 border-t border-border/30 px-4 py-12 sm:px-6 sm:py-14"
      aria-labelledby="founders-wall-heading"
    >
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5, ease: GUEST_EASE }}
        >
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-600 dark:text-slate-300">
            <Trophy className="h-3.5 w-3.5" aria-hidden />
            {content.eyebrow}
          </p>
          <h2
            id="founders-wall-heading"
            className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {content.title}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {content.sub}
          </p>
          <p className="mt-4 text-sm font-medium tabular-nums text-muted-foreground">
            {content.slotsLine(filledLabel, maxLabel)}
          </p>
          <div
            className="mx-auto mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={filled}
            aria-valuemin={0}
            aria-valuemax={max}
          >
            <div
              className="h-full rounded-full bg-foreground/40 transition-[width] duration-700"
              style={{ width: `${Math.min(100, (filled / Math.max(max, 1)) * 100)}%` }}
            />
          </div>
        </motion.div>

        {members.length > 0 ? (
          <ul className="mt-8 space-y-2.5">
            {members.map((member, i) => (
              <motion.li
                key={`m-${member.founderNumber}`}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: reduceMotion ? 0 : i * 0.04,
                  ease: GUEST_EASE,
                }}
                className="mx-auto sm:max-w-md"
              >
                <MemberChip member={member} />
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {content.emptyBody}
          </p>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {content.closedNote}
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="outline" className="h-11 rounded-xl">
            <Link href="/founding-members">{content.viewWall}</Link>
          </Button>
          <Button asChild className={cn("h-11 rounded-xl font-bold", LANDING_CTA_CLASS)}>
            <Link href="/pricing">{content.claimSpot}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
