import MissionStagePageClient from "./MissionStagePageClient";
import { LegacyMissionGate } from "@/src/features/learner/components/LegacyMissionGate";

export default async function MissionStagePage({
  params,
}: {
  params: Promise<{ slug: string; order: string }>;
}) {
  const { slug, order } = await params;
  return (
    <LegacyMissionGate>
      <MissionStagePageClient missionSlug={slug} stageOrder={Number(order)} />
    </LegacyMissionGate>
  );
}
