"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { DASHBOARD_MENU, UserRole } from "@/src/lib/constants";
import { logout } from "@/src/lib/auth";

interface SidebarProps {
  role: UserRole;
  onNavigate?: () => void;
}

export function Sidebar({ role, onNavigate }: SidebarProps) {
  return (
    <aside className="h-full w-64 bg-slate-900 text-white">
      <div className="p-4 text-xl font-bold">IELTS Habib</div>

      <nav className="space-y-1 px-2">
        {DASHBOARD_MENU.filter((item) => item.roles.includes(role)).map(
          (item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm hover:bg-slate-800",
              )}
              {...(onNavigate && {
                onClick: () => onNavigate(),
              })}
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>
      {/* logo */}
      {/* nav */}
      {/* logout */}
      <div className="mt-auto px-2 pb-4">
        <button
          onClick={logout}
          className="w-full rounded-md px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-800"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
