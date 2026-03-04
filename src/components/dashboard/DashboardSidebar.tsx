"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, X, BarChart3, BookOpen, Activity, FolderKanban, Hash, FileText, Layers, FileQuestion, Tag, LayoutDashboard, Settings, Users, ClipboardList, ListChecks } from "lucide-react";
import type { UserRole } from "@/src/lib/constants";

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

const INSTRUCTOR_MAIN: DashboardNavGroup = {
  title: "MAIN",
  roles: ["INSTRUCTOR", "ADMIN"],
  items: [
    { label: "Dashboard", href: "/dashboard/instructor", icon: BarChart3 },
    { label: "Reading Levels", href: "/dashboard/instructor/reading-levels", icon: BookOpen },
    { label: "Reading Monitoring", href: "/dashboard/instructor/reading-monitoring", icon: Activity },
  ],
};

const INSTRUCTOR_CONTENT: DashboardNavGroup = {
  title: "CONTENT",
  roles: ["INSTRUCTOR", "ADMIN"],
  items: [
    { label: "Content Management", href: "/dashboard/instructor/contents", icon: FolderKanban },
    { label: "Quiz Content", href: "/dashboard/instructor/quiz-content", icon: ClipboardList },
    { label: "Group Tests", href: "/dashboard/instructor/group-tests", icon: ListChecks },
    { label: "Passage Codes", href: "/dashboard/instructor/passage-codes", icon: Hash },
    { label: "Passages", href: "/dashboard/instructor/passages", icon: FileText },
    { label: "Question Sets", href: "/dashboard/instructor/question-sets", icon: Layers },
    { label: "Questions", href: "/dashboard/instructor/questions", icon: FileQuestion },
    { label: "Passage Question Sets", href: "/dashboard/instructor/passage-question-sets", icon: Layers },
    { label: "Weakness Tags", href: "/dashboard/instructor/weakness-tags", icon: Tag },
  ],
};

const ADMIN_NAV: DashboardNavGroup = {
  title: "ADMIN",
  roles: ["ADMIN"],
  items: [
    { label: "Admin Home", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Levels", href: "/dashboard/admin/levels", icon: BookOpen },
    { label: "Content", href: "/dashboard/admin/content", icon: FolderKanban },
    { label: "Weakness Tags", href: "/dashboard/admin/weakness-tags", icon: Tag },
    { label: "Subscription Plans", href: "/dashboard/admin/subscription-plans", icon: Settings },
    { label: "Instructor Requests", href: "/admin/instructor-requests", icon: Users },
  ],
};

const ALL_GROUPS = [INSTRUCTOR_MAIN, INSTRUCTOR_CONTENT, ADMIN_NAV];

interface DashboardSidebarProps {
  role: UserRole | null;
  isMobileOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ role, isMobileOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const groups = role ? ALL_GROUPS.filter((g) => !g.roles || g.roles.includes(role)) : [];

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
              <p className="text-sm font-semibold text-foreground">IELTS Habib</p>
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
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
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
