"use client";

import { useState } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SubscriptionRequestItem } from "@/src/lib/api/admin";
import { fetchPaymentProofObjectUrl } from "@/src/lib/api/chatMission";

/** TrxID + bKash number, or for bank (NPSB) transfers the learner's note and the receipt screenshot. */
export function PaymentDetails({ request }: { request: SubscriptionRequestItem }) {
  const [opening, setOpening] = useState(false);
  const [failed, setFailed] = useState(false);
  const isBank = request.paymentMethod === "BANK";
  const proofUrl = request.screenshotUrl?.startsWith("/chat-mission/") ? request.screenshotUrl : null;

  const openProof = async () => {
    if (!proofUrl) return;
    const tab = window.open("", "_blank");
    setOpening(true);
    setFailed(false);
    try {
      const objectUrl = await fetchPaymentProofObjectUrl(proofUrl);
      if (tab) tab.location.href = objectUrl;
      else window.location.assign(objectUrl);
    } catch {
      tab?.close();
      setFailed(true);
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="space-y-1 text-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">
          {isBank ? "Bank (NPSB)" : "bKash"}
        </span>
        {request.offerCohort === "v2_early" ? (
          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 font-semibold text-indigo-700">
            v2 · {request.durationDaysApplied ?? 90} days
          </span>
        ) : null}
      </div>
      {isBank ? (
        <>
          {request.payerNote ? <p className="max-w-xs text-foreground">Note: {request.payerNote}</p> : null}
          {proofUrl ? (
            <Button size="sm" variant="outline" className="h-7 gap-1 px-2" disabled={opening} onClick={() => void openProof()}>
              {opening ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
              View receipt
            </Button>
          ) : null}
          {failed ? <p className="text-destructive">Could not open the receipt.</p> : null}
        </>
      ) : (
        <>
          <div className="font-mono font-semibold text-foreground">{request.transactionId?.trim() || "-"}</div>
          <div className="text-muted-foreground">{request.senderNumber ? `bKash ${request.senderNumber}` : "-"}</div>
        </>
      )}
    </div>
  );
}
