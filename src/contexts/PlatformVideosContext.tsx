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
    const load = () => {
      getPublicPlatformVideos()
        .then((remote) => {
          if (!cancelled) {
            setVideos(mergePlatformVideos(remote));
          }
        })
        .catch(() => {
          /* keep env defaults */
        });
    };

    // Defer so homepage LCP/hydration isn't competing with this request.
    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      }
    ).requestIdleCallback;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof ric === "function") {
      idleId = ric(load, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(load, 1200);
    }

    return () => {
      cancelled = true;
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) clearTimeout(timeoutId);
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
