"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ReadingMonitoringClient } from "@/app/dashboard/instructor/reading-monitoring/ReadingMonitoringClient";

export default function AdminReadingMonitoringPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/admin" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Admin dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Reading monitoring</h1>
      </div>
      <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>}>
        <ReadingMonitoringClient viewBasePath="/dashboard/admin/students" />
      </Suspense>
    </div>
  );
}
