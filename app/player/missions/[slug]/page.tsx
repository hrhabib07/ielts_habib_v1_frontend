import { MissionHubView } from "@/src/components/player/MissionHubView";

export default async function MissionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <MissionHubView slug={slug} />;
}
