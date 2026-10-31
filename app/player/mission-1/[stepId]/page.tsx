import type { Metadata } from "next";
import { MissionStepPage } from "@/src/features/learner/components/MissionPages";

export const metadata: Metadata = {
  title: "Mission 1 · Gamlish",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ stepId: string }> };

export default async function MissionOneStepPage({ params }: Params) {
  const { stepId } = await params;
  return <MissionStepPage stepId={stepId} />;
}
