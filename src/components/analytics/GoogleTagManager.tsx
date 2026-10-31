"use client";

import { useEffect } from "react";

/** Google Tag Manager container ID (gamlish.com: GTM-5QCTC26K). */
export const GTM_ID = "GTM-5QCTC26K";

type DataLayerWindow = Window & {
  dataLayer?: Record<string, unknown>[];
};

/**
 * Download GTM after the page is visible.
 * The head snippet already created dataLayer, so purchase and page events
 * stay queued until this script arrives.
 */
export function DeferredGoogleTagManager() {
  useEffect(() => {
    const load = () => {
      if (document.getElementById("gtm-script")) return;
      const win = window as DataLayerWindow;
      win.dataLayer = win.dataLayer || [];
      const script = document.createElement("script");
      script.id = "gtm-script";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      document.head.appendChild(script);
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(load, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(load, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}

/**
 * GTM noscript fallback. First paint does not wait on this iframe.
 */
export function GoogleTagManagerBody() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        className="hidden"
        title="Google Tag Manager"
      />
    </noscript>
  );
}
