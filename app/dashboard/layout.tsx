"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDecodedTokenClient } from "@/src/lib/auth";
import type { UserRole } from "@/src/lib/constants";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [mounted, setMounted] = useState(false);

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

  // Same structure on server and first client render to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
          <p className="text-muted-foreground">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {children}
    </div>
  );
}
