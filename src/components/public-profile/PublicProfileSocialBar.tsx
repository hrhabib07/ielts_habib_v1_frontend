"use client";

import { useEffect, useState } from "react";
import { Heart, UserPlus, UserCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicProfileSocialStats } from "@/src/lib/api/types";
import { HeartConfettiBurst } from "./HeartConfettiBurst";
import { LoginPromptModal } from "./LoginPromptModal";

interface PublicProfileSocialBarProps {
  username: string;
  social: PublicProfileSocialStats;
  isLoggedIn: boolean;
  onLike: () => Promise<void>;
  onFollow: () => Promise<void>;
  busy?: boolean;
}

export function PublicProfileSocialBar({
  social,
  isLoggedIn,
  onLike,
  onFollow,
  busy = false,
}: PublicProfileSocialBarProps) {
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [localSocial, setLocalSocial] = useState(social);

  useEffect(() => {
    setLocalSocial(social);
  }, [social]);

  const handleLike = async () => {
    if (!isLoggedIn) {
      setLoginPromptOpen(true);
      return;
    }
    if (localSocial.isOwnProfile) return;

    const wasLiked = localSocial.hasLiked;
    setLocalSocial((prev) => ({
      ...prev,
      hasLiked: !wasLiked,
      totalLikes: wasLiked ? Math.max(0, prev.totalLikes - 1) : prev.totalLikes + 1,
    }));

    try {
      await onLike();
      if (!wasLiked) setConfettiTrigger((n) => n + 1);
    } catch {
      setLocalSocial(social);
    }
  };

  const handleFollow = async () => {
    if (!isLoggedIn) {
      setLoginPromptOpen(true);
      return;
    }
    if (localSocial.isOwnProfile) return;

    const wasFollowing = localSocial.isFollowing;
    setLocalSocial((prev) => ({ ...prev, isFollowing: !wasFollowing }));

    try {
      await onFollow();
    } catch {
      setLocalSocial(social);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/80 px-4 py-4 shadow-sm ring-1 ring-accent/[0.06] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-start">
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-muted-foreground">Total Views</span>
              <span className="font-bold tabular-nums text-foreground">
                {localSocial.totalViews.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-rose-500" aria-hidden />
              <span className="text-muted-foreground">Total Likes</span>
              <span className="font-bold tabular-nums text-foreground">
                {localSocial.totalLikes.toLocaleString()}
              </span>
            </div>
          </div>

          {!localSocial.isOwnProfile ? (
            <div className="flex items-center justify-center gap-2">
              <div className="relative">
                <HeartConfettiBurst trigger={confettiTrigger} />
                <Button
                  type="button"
                  size="sm"
                  variant={localSocial.hasLiked ? "default" : "outline"}
                  disabled={busy}
                  onClick={handleLike}
                  className={cn(
                    "gap-2 rounded-full",
                    localSocial.hasLiked &&
                      "border-rose-500/30 bg-rose-500/10 text-rose-700 hover:bg-rose-500/15 dark:text-rose-300",
                  )}
                >
                  <Heart
                    className={cn("h-4 w-4", localSocial.hasLiked && "fill-current")}
                  />
                  {localSocial.hasLiked ? "Liked" : "Like"}
                </Button>
              </div>
              <Button
                type="button"
                size="sm"
                variant={localSocial.isFollowing ? "secondary" : "outline"}
                disabled={busy}
                onClick={handleFollow}
                className="gap-2 rounded-full"
              >
                {localSocial.isFollowing ? (
                  <UserCheck className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {localSocial.isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <LoginPromptModal open={loginPromptOpen} onClose={() => setLoginPromptOpen(false)} />
    </>
  );
}
