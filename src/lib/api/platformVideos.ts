import apiClient from "../api-client";
import type { PlatformVideos } from "@/src/lib/youtubeVideoId";

export async function getPublicPlatformVideos(): Promise<PlatformVideos> {
  const res = await apiClient.get<{ success: boolean; data: PlatformVideos }>(
    "/platform/videos",
  );
  return res.data.data;
}
