import MissionStagePageClient from "./MissionStagePageClient";

export default async function MissionStagePage({
  params,
}: {
  params: Promise<{ slug: string; order: string }>;
}) {
  const { slug, order } = await params;
  return <MissionStagePageClient missionSlug={slug} stageOrder={Number(order)} />;
}
