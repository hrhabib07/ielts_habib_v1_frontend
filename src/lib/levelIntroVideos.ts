/**
 * Level intro videos (YouTube) — env-driven, same pattern as guest landing.
 *
 * IMPORTANT: Next.js only inlines NEXT_PUBLIC_* when accessed literally
 * (process.env.NEXT_PUBLIC_FOO), not via process.env[variable].
 *
 * Student-facing labels:
 * - Level 1 = Foundation / IELTS Reading Basics (DB order 0)
 * - Level 2 = Gamlish Scanning (DB order 1)
 * - Level 3 = Gamlish TFNG (DB order 2)
 */

import { displayLevelNumberFromOrder } from "@/src/lib/readingLevelOrder";

export interface LevelIntroVideoConfig {
  videoId: string;
  title: string;
  eyebrow: string;
  body: string;
  placeholderTitle: string;
  placeholderBody: string;
}

/** Accept bare ID or full YouTube / youtu.be URL from .env */
export function parseYouTubeVideoId(raw: string | undefined): string {
  const value = raw?.trim() ?? "";
  if (!value) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace(/^\//, "").split("/")[0] ?? "";
    }
    const v = url.searchParams.get("v");
    if (v) return v;
    const embed = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embed?.[1]) return embed[1];
  } catch {
    /* not a URL — fall through */
  }

  return value;
}

/** Literal env reads — required for Next.js client bundle inlining */
const LEVEL1_ENV_RAW = process.env.NEXT_PUBLIC_GAMLISH_LEVEL1_VIDEO_ID?.trim() ?? "";
const LEVEL2_ENV_RAW = process.env.NEXT_PUBLIC_GAMLISH_LEVEL2_VIDEO_ID?.trim() ?? "";
const HOW_IT_WORKS_ENV_RAW =
  process.env.NEXT_PUBLIC_GAMLISH_HOW_IT_WORKS_VIDEO_ID?.trim() ?? "";

export const GAMLISH_LEVEL1_INTRO_VIDEO_ID =
  parseYouTubeVideoId(LEVEL1_ENV_RAW) ||
  parseYouTubeVideoId(HOW_IT_WORKS_ENV_RAW);

export const GAMLISH_LEVEL2_INTRO_VIDEO_ID =
  parseYouTubeVideoId(LEVEL2_ENV_RAW) ||
  parseYouTubeVideoId(HOW_IT_WORKS_ENV_RAW);

function buildConfig(
  videoId: string,
  partial: Omit<LevelIntroVideoConfig, "videoId">,
): LevelIntroVideoConfig {
  return { videoId, ...partial };
}

const PLACEHOLDER_BODY =
  "Set NEXT_PUBLIC_GAMLISH_LEVEL1_VIDEO_ID in ielts-habib-frontend/.env.local, then restart the dev server.";

/** Key = student display level (1–21). */
function configForDisplayLevel(displayLevel: number): LevelIntroVideoConfig | undefined {
  if (displayLevel === 1 && GAMLISH_LEVEL1_INTRO_VIDEO_ID) {
    return buildConfig(GAMLISH_LEVEL1_INTRO_VIDEO_ID, {
      eyebrow: "Level 1 · IELTS Reading Basics",
      title: "How to complete this level",
      body: "Watch this first. You will learn how the level roadmap works, how practice tests unlock in order, and how to hit your target band on each passage before moving on.",
      placeholderTitle: "Level 1 intro video",
      placeholderBody: PLACEHOLDER_BODY,
    });
  }

  if (displayLevel === 2 && GAMLISH_LEVEL1_INTRO_VIDEO_ID) {
    return buildConfig(GAMLISH_LEVEL1_INTRO_VIDEO_ID, {
      eyebrow: "Level 2 · Scanning",
      title: "How to complete this level",
      body: "Watch this first. Learn how to use locator keywords, follow the passage in order, and pick the exact sentence that matches each statement — the core skill for Gamlish Scanning.",
      placeholderTitle: "Level 2 intro video",
      placeholderBody: PLACEHOLDER_BODY,
    });
  }

  if (displayLevel === 3 && GAMLISH_LEVEL2_INTRO_VIDEO_ID) {
    return buildConfig(GAMLISH_LEVEL2_INTRO_VIDEO_ID, {
      eyebrow: "Level 3 · True / False / Not Given",
      title: "How to complete this level",
      body: "Watch this first. Learn how to find the GPS anchor in the passage, unlock the text block, and decide whether each statement is True, False, or Not Given — without falling into keyword traps.",
      placeholderTitle: "Level 3 intro video",
      placeholderBody:
        "Set NEXT_PUBLIC_GAMLISH_LEVEL2_VIDEO_ID in ielts-habib-frontend/.env.local, then restart the dev server.",
    });
  }

  return undefined;
}

/** `levelOrder` = database ReadingLevel.order */
export function getLevelIntroVideo(levelOrder: number): LevelIntroVideoConfig | null {
  const displayLevel = displayLevelNumberFromOrder(levelOrder);
  return configForDisplayLevel(displayLevel) ?? null;
}

export function levelHasIntroVideo(levelOrder: number): boolean {
  return getLevelIntroVideo(levelOrder) != null;
}
