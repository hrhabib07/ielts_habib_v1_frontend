"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getMyLatestSubscriptionRequest,
  type ActiveSubscription,
  type SubscriptionRequest,
} from "@/src/lib/api/subscription";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";

export function usePaymentApplicationStatus(enabled: boolean) {
  const { subscription, loading: sessionLoading } = useStudentSession();
  const [latestRequest, setLatestRequest] =
    useState<SubscriptionRequest | null>(null);
  const [requestLoading, setRequestLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setLatestRequest(null);
      setRequestLoading(false);
      return;
    }

    setRequestLoading(true);
    try {
      const request = await getMyLatestSubscriptionRequest();
      setLatestRequest(request);
    } catch {
      setLatestRequest(null);
    } finally {
      setRequestLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeSubscription: ActiveSubscription | null = enabled
    ? subscription
    : null;

  const loading = enabled && (sessionLoading || requestLoading);

  const hasActiveAccess =
    activeSubscription?.status === "ACTIVE" &&
    new Date(activeSubscription.endDate).getTime() > Date.now();

  const isPendingReview = latestRequest?.status === "PENDING";
  const isRejected = latestRequest?.status === "REJECTED";

  return {
    activeSubscription,
    latestRequest,
    loading,
    refresh,
    hasActiveAccess,
    isPendingReview,
    isRejected,
  };
}
