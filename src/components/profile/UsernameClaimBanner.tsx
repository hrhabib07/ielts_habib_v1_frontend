"use client";

import Link from "next/link";
import { AtSign, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";

/**
 * Visible for purchased users who still need a permanent username,
 * and a lighter tip for anyone who already has a public handle.
 */
export function UsernameClaimBanner({ className }: { className?: string }) {
  const { profile, loading, isFoundingMember } = useStudentSession();

  if (loading || !profile) return null;

  const handle = profile.publicHandle ?? profile.username ?? profile.publicId;
  const needsUsername = profile.needsUsername === true;

  if (needsUsername) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-400/15 via-card to-card p-4 shadow-sm sm:p-5",
          className,
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-700 dark:text-amber-300">
              <AtSign className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground">
                Claim your permanent username
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Your purchase is approved. Choose a unique username for your public
                profile — you can change it once within 48 hours, then it locks forever.
                {isFoundingMember ? " Founders get a permanent badge on that profile too." : ""}
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 rounded-full">
            <Link href="/username">Choose username</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!handle) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {isFoundingMember ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </span>
          <div>
            <p className="font-semibold text-foreground">
              {isFoundingMember
                ? `You're Founder #${String(profile.founderNumber ?? "").padStart(3, "0")}`
                : "Your public Gamlish profile"}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Share{" "}
              <span className="font-medium text-foreground">/u/{handle}</span>
              {isFoundingMember
                ? " — your Founder badge, tier, and progress live there."
                : " — level, XP, streak, mission cards, and achievements."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/u/${handle}`}>View public profile</Link>
          </Button>
          {isFoundingMember ? (
            <Button asChild variant="secondary" className="rounded-full">
              <Link href="/founding-members">Founders&apos; Wall</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
