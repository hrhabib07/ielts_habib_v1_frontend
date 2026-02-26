"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Redirects /profile/reading to /profile/reading/levels so students
 * always land on the levels list when they open Reading.
 */
export function RedirectToLevels() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile/reading/levels");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading Reading levels…</p>
    </div>
  );
}
