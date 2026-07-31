import { MissionHubView } from "@/src/components/player/MissionHubView";

export default async function MissionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Key by slug: mission-to-mission navigation reuses this route segment, so without
  // a remount the previous mission's celebration state leaks into the next one.
  return <MissionHubView key={slug} slug={slug} />;
}
