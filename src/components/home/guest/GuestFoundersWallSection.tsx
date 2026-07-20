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
import { cn } from "@/lib/utils";

/** Home teaser: up to 4 real founders + 1 long “you” invite. Full wall is /founding-members. */
const MEMBER_PREVIEW_LIMIT = 4;

const TIER_BADGE: Record<FounderTier, string> = {
  GOLD: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950",
  SILVER: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900",
  BRONZE: "bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950",
};

type PreviewSlot =
  | { kind: "member"; member: FounderWallMember }
  | { kind: "you"; founderNumber: number };

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

  // Newest first (e.g. 70, 68)
  push(latest[0]);
  push(latest[1]);

  // One early pioneer when the wall has grown (e.g. ~15)
  if (byNumber.length >= 10) {
    const earlyTarget = Math.max(1, Math.round(byNumber.length * 0.2));
    const early =
      byNumber.find((m) => m.founderNumber >= earlyTarget) ?? byNumber[0];
    push(early);
  } else if (byNumber.length >= 3) {
    push(byNumber[0]);
  }

  // Fill remaining from newest
  for (const m of latest) {
    push(m);
    if (picked.length >= MEMBER_PREVIEW_LIMIT) break;
  }

  return picked.sort((a, b) => a.founderNumber - b.founderNumber);
}

function buildPreviewSlots(
  members: FounderWallMember[],
  filled: number,
  isOpen: boolean,
): PreviewSlot[] {
  const memberSlots: PreviewSlot[] = pickMemberPreview(members).map((member) => ({
    kind: "member",
    member,
  }));

  if (!isOpen || filled >= 100) return memberSlots;

  const youNumber = filled + 1;
  const youSlot: PreviewSlot = { kind: "you", founderNumber: youNumber };

  // Put “you” in the middle so it reads as the next open story, not a fake profile.
  const firstMember = memberSlots[0];
  if (!firstMember) return [youSlot];
  if (memberSlots.length === 1) return [firstMember, youSlot];
  const mid = Math.min(2, memberSlots.length);
  return [
    ...memberSlots.slice(0, mid),
    youSlot,
    ...memberSlots.slice(mid),
  ];
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

/** Long invite row — not a fake profile (no @handle / display name to copy). */
function YouCanBeHereBanner({
  founderNumber,
  title,
  href,
  numberLabel,
}: {
  founderNumber: number;
  title: string;
  href: string;
  numberLabel: string;
}) {
  return (
    <Link
      href={href}
      className="flex w-full flex-col gap-2 rounded-2xl border border-dashed border-amber-500/55 bg-gradient-to-r from-amber-400/15 via-amber-400/10 to-transparent px-4 py-4 transition-colors hover:from-amber-400/25 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-5"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-sm font-black tabular-nums text-amber-950 shadow-sm">
        #{String(founderNumber).padStart(3, "0")}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-base font-bold tracking-tight text-amber-950 dark:text-amber-100 sm:text-lg">
          {numberLabel}
        </span>
        <span className="mt-0.5 block text-sm text-amber-900/80 dark:text-amber-200/80">
          {title}
        </span>
      </span>
      <span className="hidden text-sm font-bold text-amber-800 dark:text-amber-300 sm:inline">
        →
      </span>
    </Link>
  );
}

/**
 * Compact Founders' Wall teaser for logged-out landing (right after hero).
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

  const slots = useMemo(() => {
    if (!wall) return [];
    return buildPreviewSlots(
      wall.members,
      wall.counter.slotsFilled,
      wall.counter.isOpen,
    );
  }, [wall]);

  if (!ready || !wall) return null;

  const filled = wall.counter.slotsFilled;
  const max = wall.counter.maxSlots;
  const isOpen = wall.counter.isOpen;
  const filledLabel = filled.toLocaleString(locale === "bn" ? "bn-BD" : "en-US");
  const maxLabel = max.toLocaleString(locale === "bn" ? "bn-BD" : "en-US");

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
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-400">
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
          <p className="mx-auto mt-3 max-w-lg text-sm font-semibold text-amber-800 dark:text-amber-300">
            {content.urgency}
          </p>
          <p className="mt-4 text-sm font-bold tabular-nums text-foreground">
            {content.slotsLine(filledLabel, maxLabel)}
          </p>
          <div
            className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={filled}
            aria-valuemin={0}
            aria-valuemax={max}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-[width] duration-700"
              style={{ width: `${Math.min(100, (filled / Math.max(max, 1)) * 100)}%` }}
            />
          </div>
        </motion.div>

        {slots.length > 0 ? (
          <ul className="mt-8 space-y-2.5">
            {slots.map((slot, i) => (
              <motion.li
                key={
                  slot.kind === "you"
                    ? `you-${slot.founderNumber}`
                    : `m-${slot.member.founderNumber}`
                }
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: reduceMotion ? 0 : i * 0.04,
                  ease: GUEST_EASE,
                }}
                className={cn(slot.kind === "member" && "sm:max-w-md sm:mx-auto")}
              >
                {slot.kind === "you" ? (
                  <YouCanBeHereBanner
                    founderNumber={slot.founderNumber}
                    title={content.youCanBeHere}
                    href="/pricing#pay-now"
                    numberLabel={content.youCanBeNumber(
                      String(slot.founderNumber).padStart(3, "0"),
                    )}
                  />
                ) : (
                  <MemberChip member={slot.member} />
                )}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {content.emptyBody}
          </p>
        )}

        {!isOpen ? (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {content.closedNote}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="outline" className="h-11 rounded-xl">
            <Link href="/founding-members">{content.viewWall}</Link>
          </Button>
          <Button asChild className={cn("h-11 rounded-xl font-bold", LANDING_CTA_CLASS)}>
            <Link href="/pricing#pay-now">
              {isOpen ? content.claimSpot : copy.ctaPreOrder}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
