"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDecodedTokenClient } from "@/src/lib/auth";
import type { UserRole } from "@/src/lib/constants";
import { DashboardSidebar } from "@/src/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/src/components/dashboard/DashboardTopbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const decoded = getDecodedTokenClient();
    setRole(decoded?.role ?? null);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!role) {
      router.replace("/login");
    }
  }, [mounted, role, router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar
        role={role}
        isMobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:pl-64 flex min-h-screen flex-col">
        <DashboardTopbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
