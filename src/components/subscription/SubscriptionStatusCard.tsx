"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMySubscription, type ActiveSubscription } from "@/src/lib/api/subscription";
import { CalendarDays, CheckCircle2, AlertCircle, Zap, Loader2 } from "lucide-react";

function daysUntil(date: string): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SubscriptionStatusCard() {
  const [sub, setSub] = useState<ActiveSubscription | null | undefined>(undefined);

  useEffect(() => {
    getMySubscription()
      .then(setSub)
      .catch(() => setSub(null));
  }, []);

  if (sub === undefined) {
    return (
      <Card className="p-5 flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin shrink-0" />
        <span className="text-sm">Loading subscription…</span>
      </Card>
    );
  }

  if (!sub) {
    return (
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-foreground">No active subscription</p>
            <p className="text-xs text-muted-foreground">
              Subscribe to unlock full access to IELTS modules.
            </p>
          </div>
          <Link href="/pricing">
            <Button size="sm" className="gap-1.5 shrink-0">
              <Zap className="h-3.5 w-3.5" />
              Subscribe
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const remaining = daysUntil(sub.endDate);
  const isExpiringSoon = remaining <= 14;

  const planName =
    typeof sub.planId === "object" && sub.planId ? sub.planId.name : "Subscription";
  const modules =
    typeof sub.planId === "object" && sub.planId
      ? sub.planId.modulesIncluded
      : [];

  return (
    <Card className={`p-5 ${isExpiringSoon ? "border-amber-400 dark:border-amber-600" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{planName}</p>
          {modules.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Access: {modules.join(", ")}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span>
              Expires <strong className="text-foreground">{formatDate(sub.endDate)}</strong>
              {" "}·{" "}
              <span
                className={
                  isExpiringSoon
                    ? "font-medium text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                }
              >
                {remaining > 0 ? `${remaining} days left` : "Expired"}
              </span>
            </span>
          </div>
          {sub.isFounderUser && (
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400">
              Founder member
            </span>
          )}
        </div>
        {isExpiringSoon && (
          <Link href="/pricing" className="shrink-0">
            <Button size="sm" variant="outline" className="gap-1.5 border-amber-400 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30">
              <Zap className="h-3.5 w-3.5" />
              Renew
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
