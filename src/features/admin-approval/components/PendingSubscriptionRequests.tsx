"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePendingSubscriptionRequests } from "../hooks";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  User,
  XCircle,
} from "lucide-react";
import type { SubscriptionRequestItem } from "@/src/lib/api/admin";

function userDisplay(request: SubscriptionRequestItem): string {
  if (typeof request.userId === "object" && request.userId && "_id" in request.userId) {
    const user = request.userId as { email?: string; _id: string };
    return user.email ?? String(user._id);
  }
  return String(request.userId);
}

function planName(request: SubscriptionRequestItem): string {
  if (typeof request.planId === "object" && request.planId && "name" in request.planId) {
    return (request.planId as { name?: string }).name ?? "Premium plan";
  }
  return "Premium plan";
}

export function PendingSubscriptionRequests() {
  const { requests, loading, error, approve, reject, actionLoadingId } =
    usePendingSubscriptionRequests();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium">No pending enrollments</p>
          <p className="text-sm text-muted-foreground">
            New student payment requests will appear here for approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {requests.length} student{requests.length === 1 ? "" : "s"} waiting for access
        </p>
        <Link
          href="/dashboard/admin/pricing"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View all payment requests
        </Link>
      </div>

      {error ? (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      ) : null}

      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request._id}
            className="flex flex-col gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-medium">{userDisplay(request)}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" />
                    {planName(request)} · {request.paidAmount} BDT · {request.paymentMethod}
                  </span>
                  <span className="font-mono text-xs">{request.transactionId}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(request.createdAt).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 gap-2 sm:justify-end">
              <Button
                size="sm"
                disabled={actionLoadingId === request._id}
                onClick={() => approve(request._id)}
                className="gap-2"
              >
                {actionLoadingId === request._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={actionLoadingId === request._id}
                onClick={() => reject(request._id)}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
