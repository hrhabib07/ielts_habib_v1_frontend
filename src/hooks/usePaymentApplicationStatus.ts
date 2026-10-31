"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getMyLatestSubscriptionRequest,
  type ActiveSubscription,
  type SubscriptionRequest,
} from "@/src/lib/api/subscription";
import { runWhenIdle, useStudentSession } from "@/src/contexts/StudentSessionContext";
import {
  hasPurchasedSubscription,
  hasUsablePremiumAccess,
  isPreorderAwaitingAccess,
} from "@/src/lib/subscription-access";

export function usePaymentApplicationStatus(enabled: boolean, defer = false) {
  const { subscription, loading: sessionLoading } = useStudentSession(
    enabled ? { subscription: true, defer } : undefined,
  );
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
    if (!enabled || !defer) {
      void refresh();
      return;
    }
    return runWhenIdle(() => {
      void refresh();
    });
  }, [defer, enabled, refresh]);

  const activeSubscription: ActiveSubscription | null = enabled
    ? subscription
    : null;

  const loading = enabled && (sessionLoading || requestLoading);

  const hasActiveAccess = hasUsablePremiumAccess(activeSubscription);
  const hasPurchased = hasPurchasedSubscription(activeSubscription);
  const isPreorderPending = isPreorderAwaitingAccess(activeSubscription);

  const isPendingReview = latestRequest?.status === "PENDING";
  const isRejected = latestRequest?.status === "REJECTED";

  return {
    activeSubscription,
    latestRequest,
    loading,
    refresh,
    hasActiveAccess,
    hasPurchased,
    isPreorderPending,
    isPendingReview,
    isRejected,
  };
}
