"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, X } from "lucide-react";
import type { UserRole } from "@/src/lib/constants";
import { ENABLE_READING } from "@/src/lib/platform-config";
import { getDashboardNavGroups } from "@/src/lib/dashboard-nav";

function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard/instructor" || href === "/dashboard/admin") return pathname === href;
  return pathname.startsWith(`${href}/`);
}

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface DashboardNavGroup {
  title: string;
  items: DashboardNavItem[];
  roles?: UserRole[];
}

interface DashboardSidebarProps {
  role: UserRole | null;
  isMobileOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ role, isMobileOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const groups = role ? getDashboardNavGroups(role, ENABLE_READING) : [];
  const versionEditCtx = pathname.match(
    /^\/dashboard\/instructor\/reading-levels\/([^/]+)\/versions\/([^/]+)\/edit$/,
  );
  const ctxLevelId = versionEditCtx?.[1];
  const ctxVersionId = versionEditCtx?.[2];

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar overlay"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${
          isMobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 lg:z-30 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">GAMLISH</p>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          {groups.map((group) => (
            <div key={group.title} className="mb-6">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isNavItemActive(pathname, item.href);
                  const Icon = item.icon;
                  const resolvedHref =
                    item.href === "/dashboard/instructor/practice-tests" && ctxLevelId && ctxVersionId
                      ? `${item.href}?levelId=${encodeURIComponent(ctxLevelId)}&versionId=${encodeURIComponent(ctxVersionId)}`
                      : item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={resolvedHref}
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-accent/15 text-accent"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
