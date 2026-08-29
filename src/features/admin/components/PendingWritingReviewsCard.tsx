"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminWritingPendingCount } from "@/src/lib/api/adminPlayerWriting";

const WRITING_REVIEWS_HREF = "/dashboard/admin/writing-reviews";

export function PendingWritingReviewsCard() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pending = await getAdminWritingPendingCount();
      setCount(pending);
    } catch {
      setCount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card className="border-amber-300/40 bg-gradient-to-br from-amber-50/80 via-background to-background p-6 dark:border-amber-800/30 dark:from-amber-950/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <PenLine className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">M21 writing reviews</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Students on Mission 21 Stage 9 cannot continue until you score their Final Pitch
              paragraph. Pass mark: 6/10.
            </p>
            {loading ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking queue...
              </p>
            ) : count != null ? (
              <p className="mt-2 text-sm font-medium text-foreground">
                {count === 0
                  ? "No pending submissions right now."
                  : `${count} student${count === 1 ? "" : "s"} waiting for your review.`}
              </p>
            ) : null}
          </div>
        </div>
        <Link href={WRITING_REVIEWS_HREF}>
          <Button size="lg" className="w-full sm:w-auto">
            {count && count > 0 ? `Review now (${count})` : "Open review queue"}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
