"use client";

import { ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getDecodedTokenClient } from "@/src/lib/auth";
import type { UserRole } from "@/src/lib/constants";
import { Sidebar } from "@/src/components/shared/Sidebar";
import { MobileSidebar } from "@/src/components/shared/MobileSidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // ✅ ESLint-safe, SSR-safe, hydration-safe
  const role = useMemo<UserRole | null>(() => {
    if (typeof window === "undefined") return null;

    const decoded = getDecodedTokenClient();
    return decoded?.role ?? null;
  }, []);

  // ✅ Redirect using Router component (allowed)
  if (!role && typeof window !== "undefined") {
    router.replace("/login");
    return <p className="p-4">Redirecting to login...</p>;
  }

  // ✅ Prevent server mismatch
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar role={role!} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex items-center gap-2 border-b px-4 py-2 md:hidden">
          <MobileSidebar role={role!} />
          <h1 className="font-semibold">Dashboard</h1>
        </header>

        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
