"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, User, LogOut } from "lucide-react";
import { logout } from "@/src/lib/auth";
import { getInstructorPageTitle } from "./navigation";

interface InstructorTopbarProps {
  onOpenSidebar: () => void;
}

export default function InstructorTopbar({ onOpenSidebar }: InstructorTopbarProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent): void {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h1 className="text-lg font-semibold text-zinc-900">{getInstructorPageTitle(pathname)}</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
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
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
