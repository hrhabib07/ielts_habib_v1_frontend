"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ENABLE_READING } from "@/src/lib/platform-config";

/** Redirects away from parked IELTS Reading admin when the English pivot is active. */
export function ReadingAdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!ENABLE_READING) {
      router.replace("/dashboard/admin");
    }
  }, [router]);

  if (!ENABLE_READING) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirecting…</p>
      </div>
    );
  }

  return <>{children}</>;
}
