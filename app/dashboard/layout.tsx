"use client";

import { ReactNode, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDecodedTokenClient } from "@/src/lib/auth";
import type { UserRole } from "@/src/lib/constants";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // ✅ ESLint-safe, SSR-safe, hydration-safe
  const role = useMemo<UserRole | null>(() => {
    if (typeof window === "undefined") return null;

    const decoded = getDecodedTokenClient();
    return decoded?.role ?? null;
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !role) {
      router.replace("/login");
    }
  }, [role, router]);

  // ✅ Prevent server mismatch
  if (typeof window === "undefined") {
    return null;
  }

  if (!role) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {children}
    </div>
  );
}
