import type { Metadata } from "next";
import { Suspense } from "react";
import { MissionUnlockPage } from "@/src/features/learner/components/MissionPages";

export const metadata: Metadata = {
  title: "Unlock Gamlish v2",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MissionUnlockPage />
    </Suspense>
  );
}
