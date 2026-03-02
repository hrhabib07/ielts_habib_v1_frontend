"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileSummarySection } from "@/src/components/profile/ProfileSummarySection";
import { BookOpen, ArrowRight } from "lucide-react";

/**
 * Reading hub: summary (band, level, streak, weaknesses, recent attempts)
 * and CTA to levels list. Data loads from GET /students/reading/dashboard and weakness analytics.
 */
export default function ProfileReadingPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reading</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your progress, band estimate, and analytics
          </p>
        </div>
        <Link href="/profile/reading/levels">
          <Button className="gap-2">
            <BookOpen className="h-4 w-4" />
            Reading levels
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <ProfileSummarySection />
    </div>
  );
}
