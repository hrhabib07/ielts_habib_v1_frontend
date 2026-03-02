"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, ChevronDown, User, LogOut } from "lucide-react";
import { logout } from "@/src/lib/auth";
import { getInstructorPageTitle } from "@/src/components/instructor/dashboard/navigation";

const DASHBOARD_TITLES: Record<string, string> = {
  "/dashboard/admin": "Admin",
  "/dashboard/admin/levels": "Level Management",
  "/dashboard/admin/levels/new": "New Level",
  "/dashboard/admin/content": "Content",
  "/dashboard/admin/weakness-tags": "Weakness Tags",
  "/dashboard/admin/subscription-plans": "Subscription Plans",
  "/admin/instructor-requests": "Instructor Requests",
};

function getPageTitle(pathname: string): string {
  if (DASHBOARD_TITLES[pathname]) return DASHBOARD_TITLES[pathname];
  const instructorTitle = getInstructorPageTitle(pathname);
  if (instructorTitle !== "Instructor") return instructorTitle;
  for (const [path, title] of Object.entries(DASHBOARD_TITLES)) {
    if (path !== "/dashboard/admin" && pathname.startsWith(path)) return title;
  }
  return "Dashboard";
}

interface DashboardTopbarProps {
  onOpenSidebar: () => void;
}

export function DashboardTopbar({ onOpenSidebar }: DashboardTopbarProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-zinc-900">{getPageTitle(pathname)}</h1>
        </div>
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((p) => !p)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            <span className="hidden sm:inline">Account</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-lg">
              <Link
                href="/dashboard/instructor/profile"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
                onClick={() => setProfileOpen(false)}
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
