"use client";

import { Button } from "@/components/ui/button";
import { useInstructorRequest } from "../hooks";
import { logout } from "@/src/lib/auth";

export function InstructorRequestCard() {
  const { status, loading, error, apply } = useInstructorRequest();

  if (loading) {
    return <p>Loading instructor request...</p>;
  }

  return (
    <div className="max-w-md rounded-lg border p-4 space-y-3">
      <h2 className="text-lg font-semibold">Instructor Request</h2>

      {status === "NOT_APPLIED" && (
        <>
          <p className="text-sm text-muted-foreground">
            Apply to become an instructor on IELTS Habib.
          </p>
          <Button onClick={apply}>Apply as Instructor</Button>
        </>
      )}

      {status === "PENDING" && (
        <p className="text-sm text-yellow-600">
          Your request is pending admin review.
        </p>
      )}

      {status === "APPROVED" && (
        <div>
          <p className="text-sm text-green-600">
            Approved! Please log out and log in again.
          </p>
          <Button variant="outline" onClick={logout}>
            Log out now
          </Button>
        </div>
      )}

      {status === "REJECTED" && (
        <p className="text-sm text-red-600">Your request was rejected.</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
