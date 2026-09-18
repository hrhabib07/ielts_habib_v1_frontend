import { useEffect, useState } from "react";
import { getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";

const TTL_MS = 30_000;

let cached: PublicPricing | null = null;
let cachedAt = 0;
let inflight: Promise<PublicPricing> | null = null;

function loadPublicPricing(): Promise<PublicPricing> {
  const now = Date.now();
  if (cached && now - cachedAt < TTL_MS) {
    return Promise.resolve(cached);
  }
  if (!inflight) {
    inflight = getPublicPricing()
      .then((data) => {
        cached = data;
        cachedAt = Date.now();
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Shared public pricing with a short cache so landing cards do not stampede. */
export function usePublicPricing(): PublicPricing | null {
  const [pricing, setPricing] = useState<PublicPricing | null>(() => {
    if (cached && Date.now() - cachedAt < TTL_MS) return cached;
    return null;
  });

  useEffect(() => {
    let cancelled = false;
    void loadPublicPricing()
      .then((data) => {
        if (!cancelled) setPricing(data);
      })
      .catch(() => {
        if (!cancelled) setPricing(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return pricing;
}
