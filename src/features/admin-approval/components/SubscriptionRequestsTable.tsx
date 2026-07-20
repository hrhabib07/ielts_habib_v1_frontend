"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  listSubscriptionRequests,
  approveSubscriptionRequest,
  rejectSubscriptionRequest,
  type SubscriptionRequestItem,
} from "@/src/lib/api/admin";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  RejectSubscriptionDialog,
  type RejectSubscriptionPayload,
} from "./RejectSubscriptionDialog";

export function SubscriptionRequestsTable() {
  const [requests, setRequests] = useState<SubscriptionRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "">("PENDING");
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<SubscriptionRequestItem | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSubscriptionRequests(
        filter ? { status: filter } : undefined,
      );
      setRequests(data);
    } catch {
      setError("Failed to load subscription requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, [filter]);

  const userDisplay = (r: SubscriptionRequestItem): string => {
    if (typeof r.userId === "object" && r.userId && "_id" in r.userId) {
      const u = r.userId as { email?: string; _id: string };
      return u.email ?? String(u._id);
    }
    return String(r.userId);
  };
  const planName = (r: SubscriptionRequestItem) =>
    typeof r.planId === "object" && r.planId && "name" in r.planId
      ? (r.planId as { name?: string }).name
      : "—";

  const handleApprove = async (id: string) => {
    setActionId(id);
    setError(null);
    try {
      await approveSubscriptionRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch {
      setError("Failed to approve");
    } finally {
      setActionId(null);
    }
  };

  const handleRejectConfirm = async (payload: RejectSubscriptionPayload) => {
    if (!rejectTarget) return;
    const id = rejectTarget._id;
    setActionId(id);
    setError(null);
    try {
      await rejectSubscriptionRequest(id, payload);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setRejectTarget(null);
    } catch {
      setError("Failed to reject");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-3">
          <h3 className="font-semibold">Subscription requests</h3>
          <div className="flex gap-2">
            {(["PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status}
              </Button>
            ))}
            {filter ? (
              <Button variant="ghost" size="sm" onClick={() => setFilter("")}>
                All
              </Button>
            ) : null}
          </div>
        </div>
        {error ? (
          <div className="mx-4 mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Plan</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">TrxID / bKash</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                {(filter === "PENDING" || !filter) && (
                  <th className="p-4 text-right font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    No requests found.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r._id} className="border-b hover:bg-muted/20">
                    <td className="p-4">
                      <span className="font-medium text-foreground">{userDisplay(r)}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{planName(r)}</td>
                    <td className="p-4">{r.paidAmount} BDT</td>
                    <td className="p-4">
                      <div className="font-mono text-xs font-semibold text-foreground">
                        {r.transactionId?.trim() || "—"}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {r.senderNumber ? `bKash ${r.senderNumber}` : "—"}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.status === "APPROVED"
                            ? "bg-success/20 text-success"
                            : r.status === "REJECTED"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    {(filter === "PENDING" || !filter) && r.status === "PENDING" ? (
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            disabled={actionId === r._id}
                            onClick={() => void handleApprove(r._id)}
                            className="gap-1"
                          >
                            {actionId === r._id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionId === r._id}
                            onClick={() => setRejectTarget(r)}
                            className="gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <RejectSubscriptionDialog
        open={Boolean(rejectTarget)}
        userLabel={rejectTarget ? userDisplay(rejectTarget) : ""}
        busy={Boolean(rejectTarget && actionId === rejectTarget._id)}
        onClose={() => {
          if (!actionId) setRejectTarget(null);
        }}
        onConfirm={handleRejectConfirm}
      />
    </>
  );
}
