"use client";

import { useEffect, useState } from "react";

type DocumentWithFullscreen = Document & {
  webkitFullscreenElement?: Element | null;
};

function getFullscreenElement(): Element | null {
  if (typeof document === "undefined") return null;
  const doc = document as DocumentWithFullscreen;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

/** Portal target that stays visible inside browser fullscreen (overlays must not use document.body alone). */
export function getPortalContainer(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const fs = getFullscreenElement();
  return (fs as HTMLElement | null) ?? document.body;
}

export function usePortalContainer(): HTMLElement | null {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const sync = () => setContainer(getPortalContainer());
    sync();
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  return container;
}
