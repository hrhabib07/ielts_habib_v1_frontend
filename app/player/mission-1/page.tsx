import { Suspense } from "react";
import type { Metadata } from "next";
import { MissionMapPage } from "@/src/features/learner/components/MissionPages";

export const metadata: Metadata = {
  title: "Mission 1 · Gamlish",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** New chat-style Mission 1. Only accounts inside the rollout switch see it (checked by the API). */
export default function MissionOnePage() {
  return (
    <Suspense fallback={null}>
      <MissionMapPage />
    </Suspense>
  );
}
