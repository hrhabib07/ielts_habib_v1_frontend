"use client";

import { useEffect, useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SUBSCRIPTION_REJECTION_REASONS,
  type SubscriptionRejectionReasonCode,
} from "@/src/lib/subscription-rejection-reasons";
import { cn } from "@/lib/utils";

export interface RejectSubscriptionPayload {
  rejectionReasonCode: SubscriptionRejectionReasonCode;
  customRejectionReason?: string;
}

interface RejectSubscriptionDialogProps {
  open: boolean;
  userLabel: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (payload: RejectSubscriptionPayload) => void | Promise<void>;
}

export function RejectSubscriptionDialog({
  open,
  userLabel,
  busy = false,
  onClose,
  onConfirm,
}: RejectSubscriptionDialogProps) {
  const [code, setCode] = useState<SubscriptionRejectionReasonCode>("INVALID_TRX_ID");
  const [custom, setCustom] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCode("INVALID_TRX_ID");
    setCustom("");
    setLocalError(null);
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    setLocalError(null);
    if (code === "CUSTOM" && custom.trim().length < 5) {
      setLocalError("Write a custom reason (at least 5 characters).");
      return;
    }
    await onConfirm({
      rejectionReasonCode: code,
      customRejectionReason: code === "CUSTOM" ? custom.trim() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-payment-title"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="reject-payment-title" className="text-lg font-semibold text-foreground">
              Reject payment request
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Student: <span className="font-medium text-foreground">{userLabel}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              The selected reason will be emailed to the student in Bangla.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reject-reason-code">Reason</Label>
            <select
              id="reject-reason-code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value as SubscriptionRejectionReasonCode)
              }
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {SUBSCRIPTION_REJECTION_REASONS.map((reason) => (
                <option key={reason.code} value={reason.code}>
                  {reason.labelBn}
                </option>
              ))}
            </select>
          </div>

          {code === "CUSTOM" ? (
            <div className="space-y-2">
              <Label htmlFor="reject-custom-reason">Custom reason (Bangla preferred)</Label>
              <Textarea
                id="reject-custom-reason"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                rows={4}
                placeholder="যেমন: স্ক্রিনশট অস্পষ্ট, আবার পাঠান"
                className="font-bengali"
              />
            </div>
          ) : null}

          {localError ? (
            <p className="text-sm text-destructive" role="alert">
              {localError}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            onClick={() => void handleConfirm()}
            className="gap-2"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Reject and email student
          </Button>
        </div>
      </div>
    </div>
  );
}
