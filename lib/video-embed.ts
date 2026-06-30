import { parseYouTubeVideoId } from "@/src/lib/youtubeVideoId";

export type VideoEmbed = { type: "iframe" | "video"; src: string };

/**
 * Turn a pasted watch/share link (or direct file URL) into something the player can render.
 * YouTube watch URLs cannot load inside an iframe — they must use /embed/.
 */
export function resolveVideoEmbed(url: string | undefined | null): VideoEmbed | null {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return null;

  const youtubeId = parseYouTubeVideoId(trimmed);
  if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
    return {
      type: "iframe",
      src: `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`,
    };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch?.[1]) {
    return {
      type: "iframe",
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  if (
    trimmed.includes("youtube.com/embed/") ||
    trimmed.includes("player.vimeo.com/video/")
  ) {
    return { type: "iframe", src: trimmed };
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(trimmed)) {
    return { type: "video", src: trimmed };
  }

  return null;
}

export function isKnownVideoHost(url: string | undefined | null): boolean {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return false;
  return Boolean(resolveVideoEmbed(trimmed));
}
