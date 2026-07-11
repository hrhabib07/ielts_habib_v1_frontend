"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerCourseMap, type PlayerCourseMap } from "@/src/lib/api/player";
import { CampMapView } from "@/src/components/player/CampMapView";
import { getDecodedTokenClient } from "@/src/lib/auth";
import { Button } from "@/components/ui/button";
import { isAxiosError } from "axios";

function mapLoadErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    if (err.code === "ECONNABORTED" || err.code === "ERR_CANCELED") {
      return "Camp map timed out. Check that the backend is running, then retry.";
    }
    if (!err.response) {
      return "Cannot reach the API. Start the backend (port 5000), then retry.";
    }
    if (err.response.status === 401) {
      return "Session expired. Please log in again.";
    }
    const msg =
      typeof err.response.data === "object" &&
      err.response.data &&
      "message" in err.response.data
        ? String((err.response.data as { message?: string }).message)
        : null;
    return msg || `Failed to load camp map (${err.response.status}).`;
  }
  return err instanceof Error ? err.message : "Failed to load camp map";
}

export default function PlayerPageClient() {
  const router = useRouter();
  const [map, setMap] = useState<PlayerCourseMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const loadMap = useCallback(async (signal: AbortSignal) => {
    const token = getDecodedTokenClient();
    if (!token || token.role !== "STUDENT") {
      setLoading(false);
      router.replace("/login?next=/player");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getPlayerCourseMap({ signal });
      if (signal.aborted) return;
      setMap(data);
    } catch (err) {
      if (signal.aborted) return;
      setMap(null);
      setError(mapLoadErrorMessage(err));
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();
    void loadMap(controller.signal);
    return () => controller.abort();
  }, [loadMap, retryKey]);

  if (!loading && error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Backend should be at <code className="rounded bg-muted px-1">localhost:5000</code>
        </p>
        <Button
          className="mt-5 rounded-full"
          onClick={() => {
            setRetryKey((k) => k + 1);
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return <CampMapView map={map} loading={loading} error={null} />;
}
