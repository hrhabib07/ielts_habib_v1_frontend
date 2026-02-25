import { Suspense } from "react";
import { ProfileSummarySection } from "@/src/components/profile/ProfileSummarySection";
import { ProfileSummarySkeleton } from "@/src/components/profile/ProfileSummarySkeleton";

/**
 * Profile summary (reading) — core intelligence screen.
 * Displays: target band, current band, streak, level, progress %, continue, weaknesses, recent attempts.
 */
export default function ProfileReadingPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">
        Reading summary
      </h1>
      <Suspense fallback={<ProfileSummarySkeleton />}>
        <ProfileSummarySection />
      </Suspense>
    </div>
  );
}
