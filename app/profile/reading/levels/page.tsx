"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Legacy route: redirect to Reading hub (which auto-redirects to correct level).
 * Sidebar is the single source of navigation; no separate "All Levels" page.
 */
export default function ReadingLevelsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/profile/reading");
  }, [router]);
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
