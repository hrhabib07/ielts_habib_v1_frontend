"use client";

import Link from "next/link";
import { AtSign, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { useUsernameFlowCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";

/**
 * Visible for purchased users who still need a permanent username,
 * and a lighter tip for anyone who already has a public handle.
 */
export function UsernameClaimBanner({ className }: { className?: string }) {
  const { profile, loading, isFoundingMember } = useStudentSession();
  const copy = useUsernameFlowCopy();
  const { locale } = useUiLocale();

  if (loading || !profile) return null;

  const handle = profile.publicHandle ?? profile.username ?? profile.publicId;
  const needsUsername = profile.needsUsername === true;
  const bn = locale === "bn";

  if (needsUsername) {
    return (
      <div
        className={cn(
          "rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-400/20 via-card to-card p-4 shadow-md ring-4 ring-amber-400/15 sm:p-5",
          bn && "font-bengali",
          className,
        )}
        lang={bn ? "bn" : "en"}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/25 text-amber-800 dark:text-amber-300">
              <AtSign className="h-5 w-5" />
            </span>
            <div>
              <p className="font-black text-foreground">{copy.bannerClaimTitle}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {copy.bannerClaimBody}
                {isFoundingMember ? copy.bannerClaimFounderExtra : ""}
              </p>
            </div>
          </div>
          <Button
            asChild
            className="h-12 shrink-0 rounded-full bg-amber-500 px-6 font-bold text-amber-950 hover:bg-amber-400"
          >
            <Link href="/username?next=/player">{copy.bannerClaimCta}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!handle) return null;

  const founderNum = String(profile.founderNumber ?? "").padStart(3, "0");

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm sm:p-5",
        bn && "font-bengali",
        className,
      )}
      lang={bn ? "bn" : "en"}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {isFoundingMember ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </span>
          <div>
            <p className="font-semibold text-foreground">
              {isFoundingMember
                ? copy.bannerFounderTitle(founderNum)
                : copy.bannerPublicTitle}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {copy.bannerSharePrefix}{" "}
              <span className="font-medium text-foreground">/u/{handle}</span>
              {isFoundingMember ? copy.bannerFounderBody : copy.bannerPublicBody}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/u/${handle}`}>{copy.viewPublic}</Link>
          </Button>
          {isFoundingMember ? (
            <Button asChild variant="secondary" className="rounded-full">
              <Link href="/founding-members">{copy.foundersWall}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
