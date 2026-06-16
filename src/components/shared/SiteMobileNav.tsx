"use client";

import Link from "next/link";
import {
  BarChart2,
  FileQuestion,
  Flame,
  Layers,
  LogOut,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { readingPathPremium } from "@/src/lib/readingPathPremium";
import { TOTAL_READING_PATH_LEVELS } from "@/src/lib/readingPathZones";
import { logout } from "@/src/lib/auth";
import type { CurrentUser } from "@/src/lib/auth-server";
import type { UserRole } from "@/src/lib/constants";
import { cn } from "@/lib/utils";

type NavUser = CurrentUser | { role: UserRole; userId: string } | null;

const PUBLIC_LINKS = [{ href: "/pricing", label: "Plans & pricing" }] as const;

const STUDENT_LINKS = [
  { href: "/profile/reading", label: "Reading" },
  { href: "/profile", label: "My profile" },
] as const;

function mobileLinkClass(active: boolean) {
  return cn(
    "rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
    active
      ? "bg-accent/12 text-accent"
      : "text-foreground hover:bg-muted/60",
  );
}

export function SiteMobileNav(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  user: NavUser;
  isStudent: boolean;
  isInstructor: boolean;
  isAdmin: boolean;
  isNavActive: (href: string) => boolean;
  progressLoading: boolean;
  progressLabel: string;
  levelsCompletedCount: number;
  overallProgressPct: number;
  journeyLabel: string;
  navProgressBarStyle: { width: string; minWidth?: string };
  streak?: { consecutivePassCount: number; requiredStreak: number } | null;
  trigger: React.ReactNode;
}) {
  const {
    open,
    onOpenChange,
    pathname,
    user,
    isStudent,
    isInstructor,
    isAdmin,
    isNavActive,
    progressLoading,
    progressLabel,
    levelsCompletedCount,
    overallProgressPct,
    journeyLabel,
    navProgressBarStyle,
    streak,
    trigger,
  } = props;

  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[min(100vw,20rem)] flex-col gap-0 p-0 sm:max-w-xs"
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-5 pb-8 pt-14 [-webkit-overflow-scrolling:touch]">
          {isStudent && (
            <div className="mb-6">
              {progressLoading ? (
                <div className="h-[52px] animate-pulse rounded-xl bg-muted/50" />
              ) : (
                <div className="rounded-xl border border-border/50 bg-muted/30 px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {progressLabel}
                    </span>
                    <span className="shrink-0 text-[10px] font-bold tabular-nums text-accent">
                      {levelsCompletedCount}/{TOTAL_READING_PATH_LEVELS} · {journeyLabel}
                    </span>
                  </div>
                  <div className={cn(readingPathPremium.progressTrack, "mt-2 h-1.5")}>
                    <div
                      className={cn(readingPathPremium.progressFill, "transition-all duration-700")}
                      style={navProgressBarStyle}
                    />
                  </div>
                  {streak && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                        <Flame className="h-3 w-3" />
                        {streak.consecutivePassCount}/{streak.requiredStreak} streak
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <nav className="flex flex-col gap-0.5" aria-label="Mobile navigation">
            {!user &&
              PUBLIC_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={mobileLinkClass(isNavActive(link.href))}
                >
                  {link.label}
                </Link>
              ))}

            {isStudent &&
              STUDENT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={mobileLinkClass(isNavActive(link.href))}
                >
                  {link.label}
                </Link>
              ))}

            {(isInstructor || isAdmin) && (
              <Link
                href={isAdmin ? "/dashboard/admin" : "/dashboard/instructor"}
                onClick={close}
                className={mobileLinkClass(pathname.startsWith("/dashboard"))}
              >
                Dashboard
              </Link>
            )}

            {user && (
              <div className="mt-4 space-y-0.5 border-t border-border/60 pt-4">
                {isStudent && (
                  <>
                    <Link
                      href="/profile"
                      onClick={close}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted/60"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Profile settings
                    </Link>
                    <Link
                      href="/pricing"
                      onClick={close}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted/60"
                    >
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      Subscription plans
                    </Link>
                  </>
                )}
                {isInstructor && (
                  <>
                    <Link
                      href="/dashboard/instructor/profile"
                      onClick={close}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted/60"
                    >
                      <User className="h-4 w-4 text-muted-foreground" /> My Profile
                    </Link>
                    <Link
                      href="/dashboard/instructor/levels"
                      onClick={close}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted/60"
                    >
                      <Layers className="h-4 w-4 text-muted-foreground" /> Manage Levels
                    </Link>
                    <Link
                      href="/dashboard/instructor/questions"
                      onClick={close}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted/60"
                    >
                      <FileQuestion className="h-4 w-4 text-muted-foreground" /> Manage Questions
                    </Link>
                    <Link
                      href="/dashboard/instructor/weakness-tags"
                      onClick={close}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted/60"
                    >
                      <Tag className="h-4 w-4 text-muted-foreground" /> Weakness Tags
                    </Link>
                    <Link
                      href="/dashboard/instructor"
                      onClick={close}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-muted/60"
                    >
                      <BarChart2 className="h-4 w-4 text-muted-foreground" /> Analytics
                    </Link>
                  </>
                )}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted/60"
                  onClick={() => {
                    close();
                    logout();
                  }}
                >
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  Log out
                </button>
              </div>
            )}

            {!user && (
              <div className="mt-6 space-y-3 border-t border-border/60 pt-6">
                <Link href="/login" onClick={close} className="block">
                  <Button variant="outline" className="h-11 w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={close} className="block">
                  <Button className="h-11 w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
