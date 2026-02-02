"use client";

import { Button } from "@/components/ui/button";
import { useAdminInstructorRequests } from "../hooks";

export function PendingInstructorRequests() {
  const { requests, loading, error, approve, reject, actionLoadingId } =
    useAdminInstructorRequests();

  if (loading) {
    return <p>Loading pending requests...</p>;
  }

  if (requests.length === 0) {
    return <p>No pending instructor requests.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pending Instructor Requests</h2>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <ul className="space-y-3">
        {requests.map((req) => (
          <li
            key={req._id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div>
              <p className="text-sm font-medium">User ID: {req.userId}</p>
              <p className="text-xs text-muted-foreground">
                Requested at: {new Date(req.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={actionLoadingId === req._id}
                onClick={() => approve(req._id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={actionLoadingId === req._id}
                onClick={() => reject(req._id)}
              >
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
