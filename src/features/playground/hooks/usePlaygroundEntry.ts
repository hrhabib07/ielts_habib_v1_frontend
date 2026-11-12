"use client";

import { useEffect, useState } from "react";
import { PLAYGROUNDS, type PlaygroundEntry } from "@/src/features/playground/content";
import { mergeGameAudio } from "@/src/features/playground/lib/voiceLines";
import { getPublishedGame } from "@/src/lib/api/gameContent";

type Loaded = { entry: PlaygroundEntry | null; source: "database" | "built-in" };

/** One fetch per game per page session: replays and back-and-forth navigation reuse it. */
const sessionCache = new Map<string, Promise<Loaded>>();

function load(playgroundId: string): Promise<Loaded> {
  const cached = sessionCache.get(playgroundId);
  if (cached) return cached;
  const shipped = PLAYGROUNDS[playgroundId] ?? null;
  const promise = getPublishedGame(playgroundId)
    .then(
      (published): Loaded => ({
        entry: {
          playground: { topic: shipped?.playground.topic, ...published.game },
          audio: mergeGameAudio(shipped?.audio ?? { clips: {} }, published.clipFiles),
        },
        source: "database",
      }),
    )
    .catch((): Loaded => {
      sessionCache.delete(playgroundId);
      return { entry: shipped, source: "built-in" };
    });
  sessionCache.set(playgroundId, promise);
  return promise;
}

/**
 * The game as admins last published it, with the version shipped in the app as the fallback
 * when the server is slow or down. `null` while loading.
 */
export function usePlaygroundEntry(playgroundId: string): Loaded | null {
  const [loaded, setLoaded] = useState<{ id: string; value: Loaded } | null>(null);

  useEffect(() => {
    let active = true;
    void load(playgroundId).then((value) => {
      if (active) setLoaded({ id: playgroundId, value });
    });
    return () => {
      active = false;
    };
  }, [playgroundId]);

  return loaded?.id === playgroundId ? loaded.value : null;
}
