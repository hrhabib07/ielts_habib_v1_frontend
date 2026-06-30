"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerCourseMap, type PlayerCourseMap } from "@/src/lib/api/player";
import { CampMapView } from "@/src/components/player/CampMapView";
import { getDecodedTokenClient } from "@/src/lib/auth";

export default function PlayerPageClient() {
  const router = useRouter();
  const [map, setMap] = useState<PlayerCourseMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getDecodedTokenClient();
    if (!token || token.role !== "STUDENT") {
      router.replace("/login?next=/player");
      return;
    }
    let cancelled = false;
    getPlayerCourseMap()
      .then((data) => {
        if (!cancelled) setMap(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load camp map");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return <CampMapView map={map} loading={loading} error={error} />;
}
