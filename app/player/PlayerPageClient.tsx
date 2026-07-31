"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerCourseMap, type PlayerCourseMap } from "@/src/lib/api/player";
import {
  getFounderCounter,
  type FounderTierLiveStat,
} from "@/src/lib/api/gamlish";
import { CampMapView } from "@/src/components/player/CampMapView";
import { UsernameClaimBanner } from "@/src/components/profile/UsernameClaimBanner";
import { FounderVipClaimCard } from "@/src/components/home/FounderVipClaimCard";
import { SeasonalOfferHomeCard } from "@/src/components/home/SeasonalOfferHomeCard";
import { isFoundingMemberWindowOpen } from "@/src/lib/foundingMember";
import { getDecodedTokenClient } from "@/src/lib/auth";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { USERNAME_CLAIM_HREF } from "@/src/lib/auth-redirects";
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
  const { profile, loading: profileLoading, isFoundingMember } =
    useStudentSession();
  const payment = usePaymentApplicationStatus(true);
  const [map, setMap] = useState<PlayerCourseMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [founderTiers, setFounderTiers] = useState<
    FounderTierLiveStat[] | undefined
  >(undefined);
  const [founderDeadline, setFounderDeadline] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (profileLoading) return;
    if (profile?.needsUsername === true) {
      router.replace(USERNAME_CLAIM_HREF);
    }
  }, [profileLoading, profile?.needsUsername, router]);

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
    if (profile?.needsUsername) return;
    const controller = new AbortController();
    void loadMap(controller.signal);
    return () => controller.abort();
  }, [loadMap, retryKey, profile?.needsUsername]);

  useEffect(() => {
    let cancelled = false;
    getFounderCounter()
      .then((counter) => {
        if (cancelled) return;
        if (Array.isArray(counter.tiers) && counter.tiers.length > 0) {
          setFounderTiers(counter.tiers);
        }
        if (counter.launchDateIso) setFounderDeadline(counter.launchDateIso);
      })
      .catch(() => {
        /* card falls back to default Gold progress */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const paymentBusy = profileLoading || payment.loading;
  const hasPaidOrPending =
    payment.hasPurchased ||
    isFoundingMember ||
    payment.latestRequest?.status === "PENDING" ||
    payment.latestRequest?.status === "APPROVED";
  const showFounderOffer = !paymentBusy && !hasPaidOrPending;

  if (profileLoading || profile?.needsUsername) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-10">
        <UsernameClaimBanner />
        <div className="flex justify-center py-8 text-sm text-muted-foreground">
          ইউজারনেম বাছাই পেজে নিয়ে যাওয়া হচ্ছে…
        </div>
      </div>
    );
  }

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

  return (
    <div>
      <div className="mx-auto max-w-lg px-4 pt-4 sm:max-w-2xl">
        {showFounderOffer ? (
          isFoundingMemberWindowOpen() ? (
            <FounderVipClaimCard
              tiers={founderTiers}
              deadlineIso={founderDeadline}
              className="mb-2"
              href="/checkout"
            />
          ) : (
            <SeasonalOfferHomeCard className="mb-2" />
          )
        ) : (
          <UsernameClaimBanner />
        )}
      </div>

      <CampMapView map={map} loading={loading} error={null} />
    </div>
  );
}
