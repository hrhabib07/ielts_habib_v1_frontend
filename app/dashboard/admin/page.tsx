"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionRequestsTable } from "@/src/features/admin-approval/components/SubscriptionRequestsTable";
import { PendingInstructorRequests } from "@/src/features/admin-approval/components/PendingInstructorRequests";
import { Shield, CreditCard, Users, ArrowLeft } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Admin dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage subscription requests and instructor applications
          </p>
        </div>
        <Link href="/profile/reading">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Subscription requests
              </p>
              <p className="text-lg font-semibold text-foreground">
                Review & approve below
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Instructor requests
              </p>
              <p className="text-lg font-semibold text-foreground">
                Approve / reject below
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admin</p>
              <p className="text-lg font-semibold text-foreground">
                Full access
              </p>
            </div>
          </div>
        </Card>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Subscription requests
        </h2>
        <SubscriptionRequestsTable />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Instructor requests
        </h2>
        <Card className="p-6">
          <PendingInstructorRequests />
        </Card>
      </section>
    </div>
  );
}
