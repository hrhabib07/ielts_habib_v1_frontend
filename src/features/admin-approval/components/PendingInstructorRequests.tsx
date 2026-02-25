"use client";

import { Button } from "@/components/ui/button";
import { useAdminInstructorRequests } from "../hooks";
import { CheckCircle2, XCircle, User, Clock } from "lucide-react";

export function PendingInstructorRequests() {
  const { requests, loading, error, approve, reject, actionLoadingId } =
    useAdminInstructorRequests();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading pending requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium">No pending requests</p>
          <p className="text-sm text-muted-foreground">
            All instructor applications have been reviewed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pending Requests ({requests.length})</h2>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {requests.map((req) => (
          <div
            key={req._id}
            className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {typeof req.userId === "object" && req.userId && "email" in req.userId
                    ? (req.userId as { email?: string }).email ?? req.userId
                    : String(req.userId)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={actionLoadingId === req._id}
                onClick={() => approve(req._id)}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={actionLoadingId === req._id}
                onClick={() => reject(req._id)}
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
