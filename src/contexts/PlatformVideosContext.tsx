"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getPublicPlatformVideos } from "@/src/lib/api/platformVideos";
import {
  getEnvPlatformVideos,
  mergePlatformVideos,
  type PlatformVideos,
} from "@/src/lib/youtubeVideoId";

const PlatformVideosContext = createContext<PlatformVideos>(getEnvPlatformVideos());

export function PlatformVideosProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<PlatformVideos>(getEnvPlatformVideos());

  useEffect(() => {
    let cancelled = false;
    getPublicPlatformVideos()
      .then((remote) => {
        if (!cancelled) {
          setVideos(mergePlatformVideos(remote));
        }
      })
      .catch(() => {
        /* keep env defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PlatformVideosContext.Provider value={videos}>
      {children}
    </PlatformVideosContext.Provider>
  );
}

export function usePlatformVideos(): PlatformVideos {
  return useContext(PlatformVideosContext);
}
