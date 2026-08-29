"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminCertificationPendingCount } from "@/src/lib/api/certification";

export function PendingCertificationCard() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCount(await getAdminCertificationPendingCount());
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
    <Card className="border-primary/25 bg-gradient-to-br from-primary/5 via-background to-background p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Certification applications</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review learner identity and stories before issuing Fundamental English certificates.
            </p>
            {loading ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking...
              </p>
            ) : (
              <p className="mt-2 text-sm font-medium">
                {count === 0
                  ? "No pending applications."
                  : `${count} application${count === 1 ? "" : "s"} waiting.`}
              </p>
            )}
          </div>
        </div>
        <Link href="/dashboard/admin/certifications">
          <Button size="lg" className="w-full sm:w-auto">
            {count && count > 0 ? `Review (${count})` : "Open queue"}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
