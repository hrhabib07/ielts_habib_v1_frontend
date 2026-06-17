/**
 * Level intro videos — IDs from admin platform config (API) with env fallback.
 * Student display Level 1 = Foundation, Level 2 = TFNG. No Level 3 intro yet.
 */

import { displayLevelNumberFromOrder } from "@/src/lib/readingLevelOrder";
import type { PlatformVideos } from "@/src/lib/youtubeVideoId";

export interface LevelIntroVideoConfig {
  videoId: string;
  title: string;
  eyebrow: string;
  body: string;
  placeholderTitle: string;
  placeholderBody: string;
}

function buildConfig(
  videoId: string,
  partial: Omit<LevelIntroVideoConfig, "videoId">,
): LevelIntroVideoConfig {
  return { videoId, ...partial };
}

const PLACEHOLDER_BODY =
  "Ask your admin to set this video in Admin → Subscription Plans → YouTube videos.";

/** Key = student display level (1–21). */
function configForDisplayLevel(
  displayLevel: number,
  videos: PlatformVideos,
): LevelIntroVideoConfig | undefined {
  if (displayLevel === 1 && videos.level1IntroVideoId) {
    return buildConfig(videos.level1IntroVideoId, {
      eyebrow: "Level 1 · Foundation",
      title: "How to complete this level",
      body: "Watch this first. You will learn how the level roadmap works, how practice tests unlock in order, and how to hit your target band on each passage before moving on.",
      placeholderTitle: "Level 1 intro video",
      placeholderBody: PLACEHOLDER_BODY,
    });
  }

  if (displayLevel === 2 && videos.level2IntroVideoId) {
    return buildConfig(videos.level2IntroVideoId, {
      eyebrow: "Level 2 · True / False / Not Given",
      title: "How to complete this level",
      body: "Watch this first. Learn how to find the GPS anchor in the passage, unlock the text block, and decide whether each statement is True, False, or Not Given without falling into keyword traps.",
      placeholderTitle: "Level 2 intro video",
      placeholderBody: PLACEHOLDER_BODY,
    });
  }

  return undefined;
}

/** `levelOrder` = database ReadingLevel.order */
export function getLevelIntroVideo(
  levelOrder: number,
  videos: PlatformVideos,
): LevelIntroVideoConfig | null {
  const displayLevel = displayLevelNumberFromOrder(levelOrder);
  return configForDisplayLevel(displayLevel, videos) ?? null;
}

export function levelHasIntroVideo(
  levelOrder: number,
  videos: PlatformVideos,
): boolean {
  return getLevelIntroVideo(levelOrder, videos) != null;
}
