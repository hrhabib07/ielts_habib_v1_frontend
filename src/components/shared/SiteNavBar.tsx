"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart2,
  ChevronDown,
  FileQuestion,
  Flame,
  Layers,
  LogOut,
  Menu,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GamlishNavBrand } from "@/src/components/shared/GamlishNavBrand";
import { SiteMobileNav } from "@/src/components/shared/SiteMobileNav";
import { ThemeToggleButton } from "@/src/components/shared/ThemeToggleButton";
import { useStudentNavProgress } from "@/src/hooks/useStudentNavProgress";
import { journeyProgressBarStyle } from "@/src/lib/journeyVisualProgress";
import { getDecodedTokenClient, logout } from "@/src/lib/auth";
import type { CurrentUser } from "@/src/lib/auth-server";
import type { UserRole } from "@/src/lib/constants";
import { readingPathPremium } from "@/src/lib/readingPathPremium";
import { TOTAL_READING_PATH_LEVELS } from "@/src/lib/readingPathZones";
import { cn } from "@/lib/utils";
import { GuestLandingNavBar } from "@/src/components/home/guest/GuestLandingNavBar";
import { UiLanguageToggle } from "@/src/components/shared/UiLanguageToggle";
import { useSiteShellCopy } from "@/src/hooks/useLocalizedCopy";
import { shouldUseGuestLandingNav } from "@/src/lib/guest-nav-paths";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";

import {
  ENABLE_READING,
  PRIMARY_STUDENT_HREF,
  PRIMARY_STUDENT_LABEL,
} from "@/src/lib/platform-config";

const STUDENT_LINKS_READING = [
  { href: "/profile/reading", labelKey: "reading" as const },
  { href: "/profile", labelKey: "myProfile" as const },
] as const;

const STUDENT_LINKS_PLAYER = [
  { href: "/player", labelKey: "play" as const },
  { href: "/squad", labelKey: "squad" as const },
  { href: "/profile", labelKey: "myProfile" as const },
] as const;

const STUDENT_LINKS = ENABLE_READING ? STUDENT_LINKS_READING : STUDENT_LINKS_PLAYER;

export function SiteNavBar(props: {
  initialUser?: CurrentUser | null;
  className?: string;
  embedded?: boolean;
}) {
  const { initialUser = null, className, embedded = false } = props;
  const pathname = usePathname() ?? "";
  const [clientUser, setClientUser] = useState<{ role: UserRole; userId: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isFoundingMember } = useStudentSession();
  const shell = useSiteShellCopy();
  const menuRef = useRef<HTMLDivElement>(null);

  const user = initialUser ?? clientUser;
  const isStudent = user?.role === "STUDENT";
  const isInstructor = user?.role === "INSTRUCTOR";
  const isAdmin = user?.role === "ADMIN";

  const {
    profileSummary,
    loading: progressLoading,
    overallProgressPct,
    journeyLabel,
    levelsCompletedCount,
  } = useStudentNavProgress(isStudent);

  const navProgressBarStyle = journeyProgressBarStyle(overallProgressPct);

  const isJourney = ENABLE_READING && pathname === "/profile/reading";
  const isLevelPage = ENABLE_READING && pathname.includes("/profile/reading/strict-levels/");
  const isReadingArea = ENABLE_READING && pathname.startsWith("/profile/reading");
  const isPlayerArea = !ENABLE_READING && pathname.startsWith("/player");

  useEffect(() => {
    const updateUser = () => {
      const decoded = getDecodedTokenClient();
      setClientUser(decoded ? { role: decoded.role, userId: decoded.userId } : null);
    };
    updateUser();
    window.addEventListener("auth-state-changed", updateUser);
    window.addEventListener("storage", updateUser);
    return () => {
      window.removeEventListener("auth-state-changed", updateUser);
      window.removeEventListener("storage", updateUser);
    };
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const isNavActive = (href: string) => {
    if (href === "/profile") {
      return pathname === "/profile" || pathname === "/profile/";
    }
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const logoHref = "/";
  const streak = profileSummary?.streakInfo;

  const progressLabel = isLevelPage
    ? "Level in progress"
    : isJourney
      ? "Your path"
      : isReadingArea
        ? "Reading journey"
        : isPlayerArea
          ? "English journey"
          : "Your path";

  const navLinkClass = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
      active
        ? "bg-accent/12 text-accent shadow-sm ring-1 ring-accent/10"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
    );

  if (shouldUseGuestLandingNav(pathname, Boolean(user))) {
    return <GuestLandingNavBar className={className} />;
  }

  const isStudentHome = pathname === "/" && isStudent;
  const navBrandCompact = isStudentHome;

  return (
    <header
      className={cn(
        "w-full shrink-0 overflow-visible border-b border-border/50 bg-background/92 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-md dark:bg-background/88",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-14 max-w-7xl flex-nowrap items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4 lg:px-6",
          navBrandCompact && "max-w-6xl",
        )}
      >
        <Link
          href={logoHref}
          data-nav-brand="single"
          className="flex h-9 min-w-0 shrink flex-nowrap items-center transition-opacity hover:opacity-90"
          aria-label="Gamlish home"
        >
          <GamlishNavBrand showTagline={!navBrandCompact} />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {isStudent &&
            STUDENT_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(isNavActive(link.href))}>
                {shell[link.labelKey]}
              </Link>
            ))}
          {(isInstructor || isAdmin) && (
            <Link
              href={isAdmin ? "/dashboard/admin" : "/dashboard/instructor"}
              className={navLinkClass(pathname.startsWith("/dashboard"))}
            >
              {shell.dashboard}
            </Link>
          )}
        </nav>

        {isStudent && ENABLE_READING ? (
          <div className="mx-auto hidden min-w-0 max-w-sm flex-1 px-2 lg:block lg:max-w-md">
            {progressLoading ? (
              <div className="h-[46px] animate-pulse rounded-xl bg-muted/40" />
            ) : (
              <div
                className={cn(
                  "rounded-xl border border-border/35 bg-muted/25 px-3 py-2 ring-1 ring-accent/[0.04]",
                  "dark:bg-muted/15 dark:ring-accent/10",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {progressLabel}
                  </span>
                  <span className="shrink-0 text-[10px] font-bold tabular-nums text-accent">
                    {levelsCompletedCount}/{TOTAL_READING_PATH_LEVELS} · {journeyLabel}
                  </span>
                </div>
                <div className={cn(readingPathPremium.progressTrack, "mt-1.5 h-1")}>
                  <div
                    className={cn(readingPathPremium.progressFill, "transition-all duration-700")}
                    style={navProgressBarStyle}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden flex-1 lg:block" aria-hidden />
        )}

        <div
          className={cn(
            "ml-auto flex shrink-0 items-center gap-1 overflow-visible sm:gap-1.5",
            navBrandCompact && "gap-1.5",
          )}
        >
          {isStudent && streak && (
            <div
              className="hidden items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-xs font-semibold text-accent ring-1 ring-accent/10 lg:flex"
              title="Stability streak"
            >
              <Flame className="h-3.5 w-3.5" />
              {streak.consecutivePassCount}/{streak.requiredStreak}
            </div>
          )}

          {isStudent && isFoundingMember && (
            <FoundingMemberBadge size="sm" compact className="hidden lg:inline-flex" />
          )}

          <UiLanguageToggle variant="auto" />

          <ThemeToggleButton />

          {user ? (
            <div className="relative hidden lg:block" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-9 items-center gap-1.5 rounded-full border border-border/50 bg-card px-2 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:border-accent/25 hover:text-accent sm:px-3"
                aria-label="Account menu"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{shell.account}</span>
                <ChevronDown className="hidden h-3.5 w-3.5 sm:block" />
              </button>
              {menuOpen && (
                <div className="animate-fade-up absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border/50 bg-card py-1 shadow-lg ring-1 ring-accent/[0.05]">
                  {isStudent && (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/[0.05]"
                        onClick={() => setMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        {shell.profileSettings}
                      </Link>
                      <Link
                        href="/pricing"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/[0.05]"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                        {shell.subscriptionPlans}
                      </Link>
                    </>
                  )}
                  {isInstructor && (
                    <>
                      <Link href="/dashboard/instructor/profile" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/[0.05]" onClick={() => setMenuOpen(false)}>
                        <User className="h-4 w-4 text-muted-foreground" /> My Profile
                      </Link>
                      <Link href="/dashboard/instructor/levels" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/[0.05]" onClick={() => setMenuOpen(false)}>
                        <Layers className="h-4 w-4 text-muted-foreground" /> Manage Levels
                      </Link>
                      <Link href="/dashboard/instructor/questions" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/[0.05]" onClick={() => setMenuOpen(false)}>
                        <FileQuestion className="h-4 w-4 text-muted-foreground" /> Manage Questions
                      </Link>
                      <Link href="/dashboard/instructor/weakness-tags" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/[0.05]" onClick={() => setMenuOpen(false)}>
                        <Tag className="h-4 w-4 text-muted-foreground" /> Weakness Tags
                      </Link>
                      <Link href="/dashboard/instructor" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/[0.05]" onClick={() => setMenuOpen(false)}>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" /> Analytics
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <Link href="/dashboard/admin" className="flex px-3 py-2 text-sm hover:bg-accent/[0.05]" onClick={() => setMenuOpen(false)}>
                      Admin dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent/[0.05]"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    {shell.logOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  {shell.login}
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button size="sm">{shell.getStarted}</Button>
              </Link>
            </>
          )}

          <SiteMobileNav
            open={mobileOpen}
            onOpenChange={setMobileOpen}
            pathname={pathname}
            user={user}
            isStudent={isStudent}
            isInstructor={isInstructor}
            isAdmin={isAdmin}
            isNavActive={isNavActive}
            progressLoading={progressLoading}
            progressLabel={progressLabel}
            levelsCompletedCount={levelsCompletedCount}
            overallProgressPct={overallProgressPct}
            journeyLabel={journeyLabel}
            navProgressBarStyle={navProgressBarStyle}
            streak={streak}
            shell={shell}
            trigger={
              <Button
                type="button"
                variant={navBrandCompact ? "outline" : "ghost"}
                size="icon"
                className={cn(
                  "h-9 w-9 shrink-0 lg:hidden",
                  navBrandCompact && "rounded-full border-border/60",
                )}
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>
    </header>
  );
}
