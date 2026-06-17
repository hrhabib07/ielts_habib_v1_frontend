"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PublicProfile } from "@/src/lib/api/types";
import {
  getOrCreateProfileViewerKey,
  recordPublicProfileView,
  togglePublicProfileFollow,
  togglePublicProfileLike,
} from "@/src/lib/api/publicProfile";
import { getDecodedTokenClient, hasUsableClientToken } from "@/src/lib/auth";
import { PublicProfileHero } from "./PublicProfileHero";
import { PublicProfileTrophyRoom } from "./PublicProfileTrophyRoom";
import { Lock, Trophy } from "lucide-react";

interface PublicProfilePageContentProps {
  initialProfile: PublicProfile;
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function PublicProfilePageContent({ initialProfile }: PublicProfilePageContentProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);

  useEffect(() => {
    setIsLoggedIn(hasUsableClientToken());
    const onAuth = () => setIsLoggedIn(hasUsableClientToken());
    window.addEventListener("auth-state-changed", onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener("auth-state-changed", onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, []);

  useEffect(() => {
    if (profile.isPrivate) return;
    let cancelled = false;
    const viewerKey = getOrCreateProfileViewerKey();
    if (!viewerKey) return;

    recordPublicProfileView(profile.username, viewerKey)
      .then((result) => {
        if (cancelled || !result.recorded) return;
        setProfile((prev) => ({
          ...prev,
          social: {
            ...prev.social,
            totalViews: result.totalViews,
          },
        }));
      })
      .catch(() => {
        /* view tracking is best-effort */
      });

    return () => {
      cancelled = true;
    };
  }, [profile.isPrivate, profile.username]);

  const handleLike = useCallback(async () => {
    const decoded = getDecodedTokenClient();
    if (!decoded || decoded.role !== "STUDENT") return;
    setSocialBusy(true);
    try {
      const result = await togglePublicProfileLike(profile.username);
      setProfile((prev) => ({
        ...prev,
        social: {
          ...prev.social,
          totalLikes: result.totalLikes,
          hasLiked: result.hasLiked,
        },
      }));
    } finally {
      setSocialBusy(false);
    }
  }, [profile.username]);

  const handleFollow = useCallback(async () => {
    const decoded = getDecodedTokenClient();
    if (!decoded || decoded.role !== "STUDENT") return;
    setSocialBusy(true);
    try {
      const result = await togglePublicProfileFollow(profile.username);
      setProfile((prev) => ({
        ...prev,
        social: {
          ...prev.social,
          isFollowing: result.isFollowing,
        },
      }));
    } finally {
      setSocialBusy(false);
    }
  }, [profile.username]);

  if (profile.isPrivate) {
    return (
      <div className="relative min-h-[calc(100dvh-4rem)] overflow-x-hidden bg-background">
        <div className="mx-auto w-full max-w-lg space-y-6 px-4 py-16 md:py-20">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Gamlish profile
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              {profile.displayName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">@{profile.username}</p>
          </div>
          <Card className="border-border/70 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Lock className="h-7 w-7" />
            </div>
            <p className="text-lg font-semibold text-foreground">This account is private.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {profile.displayName} has chosen to hide their IELTS progress and test scores.
            </p>
          </Card>
          <div className="text-center">
            <Button asChild variant="outline">
              <Link href="/">Explore Gamlish</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progress = profile.progress;

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-x-hidden bg-background">
      <PublicProfileHero
        profile={profile}
        isLoggedIn={isLoggedIn}
        onLike={handleLike}
        onFollow={handleFollow}
        socialBusy={socialBusy}
      />

      {progress ? (
        <div className="relative mx-auto w-full max-w-4xl space-y-8 px-4 pb-16 pt-4 md:px-6">
          {(progress.analytics.strengths.length > 0 ||
            progress.analytics.weaknesses.length > 0) && (
            <Card className="border-border/70 p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Trophy className="h-5 w-5 text-primary" />
                Achievements & focus areas
              </h2>
              {progress.analytics.strengths.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Strengths
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {progress.analytics.strengths.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                      >
                        {s.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {progress.analytics.weaknesses.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Focus areas
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {progress.analytics.weaknesses.map((w) => (
                      <span
                        key={w}
                        className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-300"
                      >
                        {w.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {progress.recentAttempts.length > 0 && (
            <Card className="border-border/70 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">Recent attempts</h2>
              <ul className="mt-4 divide-y divide-border/60">
                {progress.recentAttempts.map((attempt) => (
                  <li
                    key={attempt._id}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {attempt.readingTestType ?? "Reading"} · {formatDate(attempt.createdAt)}
                    </span>
                    <span className="font-semibold tabular-nums text-foreground">
                      Band {attempt.bandScore ?? ""}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <PublicProfileTrophyRoom
            scholarship={profile.scholarship}
            levelZones={profile.levelZones}
          />
        </div>
      ) : null}

      <div className="pb-12 text-center">
        <Button asChild variant="outline">
          <Link href="/">Explore Gamlish</Link>
        </Button>
      </div>
    </div>
  );
}
