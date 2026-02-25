"use client";

import { Button } from "@/components/ui/button";
import { useInstructorRequest } from "../hooks";
import { logout } from "@/src/lib/auth";
import { CheckCircle2, Clock, XCircle, Send } from "lucide-react";

export function InstructorRequestCard() {
  const { status, loading, error, apply } = useInstructorRequest();

  if (loading) {
    return (
      <div className="w-full max-w-md rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Loading instructor request status...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-6 space-y-4">
      <h2 className="text-xl font-semibold">Instructor Application Status</h2>

      {status === "NOT_APPLIED" && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Ready to share your expertise? Apply to become an instructor and help
            students excel in their IELTS preparation.
          </p>
          <Button onClick={apply} className="w-full" size="lg">
            <Send className="mr-2 h-4 w-4" />
            Apply as Instructor
          </Button>
        </div>
      )}

      {status === "PENDING" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                Application Pending
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Your request is under admin review. We'll notify you once a decision is made.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "APPROVED" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                Application Approved!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Congratulations! Please log out and log back in to access instructor features.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="w-full">
            Log out and refresh
          </Button>
        </div>
      )}

      {status === "REJECTED" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">
                Application Rejected
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Unfortunately, your application was not approved at this time.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
