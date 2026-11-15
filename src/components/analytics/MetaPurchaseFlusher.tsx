"use client";

import { useEffect, useRef } from "react";
import {
  ackMetaPurchasePixel,
  getMyLatestSubscriptionRequest,
} from "@/src/lib/api/subscription";
import {
  isMetaPixelConfigured,
  trackPurchase,
} from "@/src/lib/meta-pixel";
import { getAccessToken } from "@/src/lib/auth";

/**
 * After admin approval, Purchase waits until the learner opens the app again.
 * Fires once per order, then clears purchasePendingPixel on the server.
 */
export function MetaPurchaseFlusher() {
  const firedOrderId = useRef<string | null>(null);

  useEffect(() => {
    if (!isMetaPixelConfigured()) return;

    let cancelled = false;

    const run = async () => {
      if (!getAccessToken()) return;
      try {
        const latest = await getMyLatestSubscriptionRequest();
        if (cancelled || !latest) return;
        if (latest.status !== "APPROVED") return;
        if (!latest.purchasePendingPixel) return;
        if (firedOrderId.current === latest._id) return;

        const orderId = latest._id;
        const value =
          typeof latest.finalPayableAmount === "number"
            ? latest.finalPayableAmount
            : latest.paidAmount;

        firedOrderId.current = orderId;
        trackPurchase({ orderId, value });
        await ackMetaPurchasePixel(orderId);
      } catch {
        /* never block UX on pixel */
      }
    };

    void run();
    const onAuth = () => {
      void run();
    };
    window.addEventListener("auth-state-changed", onAuth);
    const retry = window.setTimeout(() => {
      void run();
    }, 2500);

    return () => {
      cancelled = true;
      window.removeEventListener("auth-state-changed", onAuth);
      window.clearTimeout(retry);
    };
  }, []);

  return null;
}
