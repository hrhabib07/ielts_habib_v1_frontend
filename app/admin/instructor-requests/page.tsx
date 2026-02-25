"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PendingInstructorRequests } from "@/src/features/admin-approval/components/PendingInstructorRequests";
import { getDecodedTokenClient } from "@/src/lib/auth";
import { Shield } from "lucide-react";

export default function AdminInstructorRequestsPage() {
  const router = useRouter();

  useEffect(() => {
    const decoded = getDecodedTokenClient();
    if (!decoded) {
      router.replace("/login");
      return;
    }
    if (decoded.role !== "ADMIN") {
      router.replace("/");
      return;
    }
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Instructor Requests</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Review and manage instructor applications. Approve qualified candidates
            to help build our instructor community.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <PendingInstructorRequests />
        </div>
      </div>
    </div>
  );
}
