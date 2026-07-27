"use client";

import { useState, type ReactNode } from "react";
import type { UserRole } from "@/src/lib/constants";
import { DashboardSidebar } from "@/src/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/src/components/dashboard/DashboardTopbar";

/**
 * Client chrome for /dashboard*. Role comes from the server layout so the
 * first paint matches SSR (no mounted-gate hydration mismatch).
 */
export function DashboardShell({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-background text-foreground">
      <DashboardSidebar
        role={role}
        isMobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:pl-64">
        <DashboardTopbar onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
