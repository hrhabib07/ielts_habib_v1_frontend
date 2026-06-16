export interface PlatformVideos {
  howItWorksVideoId: string;
  level1IntroVideoId: string;
  level2IntroVideoId: string;
}

/** Parse bare YouTube ID or youtu.be / watch / embed URL. */
export function parseYouTubeVideoId(raw: string | undefined | null): string {
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
    /* not a URL */
  }

  return value;
}

const HOW_IT_WORKS_ENV =
  process.env.NEXT_PUBLIC_GAMLISH_HOW_IT_WORKS_VIDEO_ID?.trim() ?? "";
const LEVEL1_ENV = process.env.NEXT_PUBLIC_GAMLISH_LEVEL1_VIDEO_ID?.trim() ?? "";
const LEVEL2_ENV = process.env.NEXT_PUBLIC_GAMLISH_LEVEL2_VIDEO_ID?.trim() ?? "";

/** Env fallback when API has no value (local dev). */
export function getEnvPlatformVideos(): PlatformVideos {
  const howItWorks = parseYouTubeVideoId(HOW_IT_WORKS_ENV);
  const level1 =
    parseYouTubeVideoId(LEVEL1_ENV) || howItWorks;
  const level2 =
    parseYouTubeVideoId(LEVEL2_ENV) || howItWorks;
  return {
    howItWorksVideoId: howItWorks,
    level1IntroVideoId: level1,
    level2IntroVideoId: level2,
  };
}

export const EMPTY_PLATFORM_VIDEOS: PlatformVideos = {
  howItWorksVideoId: "",
  level1IntroVideoId: "",
  level2IntroVideoId: "",
};

export function mergePlatformVideos(
  remote: Partial<PlatformVideos> | null | undefined,
): PlatformVideos {
  const env = getEnvPlatformVideos();
  return {
    howItWorksVideoId:
      remote?.howItWorksVideoId?.trim() || env.howItWorksVideoId,
    level1IntroVideoId:
      remote?.level1IntroVideoId?.trim() || env.level1IntroVideoId,
    level2IntroVideoId:
      remote?.level2IntroVideoId?.trim() || env.level2IntroVideoId,
  };
}
