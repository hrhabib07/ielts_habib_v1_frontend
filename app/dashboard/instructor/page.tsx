"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  BarChart3,
  FileText,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

export default function InstructorDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Instructor dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage reading content and track student progress
          </p>
        </div>
        <Link href="/profile/reading">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Reading module
              </p>
              <p className="text-lg font-semibold text-foreground">Content</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Passages & questions
              </p>
              <p className="text-lg font-semibold text-foreground">Manage</p>
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
                Students
              </p>
              <p className="text-lg font-semibold text-foreground">—</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Analytics
              </p>
              <p className="text-lg font-semibold text-foreground">—</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Reading module
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Access reading content, passages, and question sets. You have full
            access to create and edit content for the reading module.
          </p>
          <Link href="/profile/reading" className="mt-4 inline-flex">
            <Button variant="outline" size="sm" className="gap-2">
              View reading summary
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Content management
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage passages, question groups, and reading tests. Content
            management APIs are available; frontend tools can be added here.
          </p>
          <Button variant="outline" size="sm" className="mt-4" disabled>
            Coming soon
          </Button>
        </Card>
      </div>

      <Card className="border-muted bg-muted/20 p-6">
        <p className="text-sm text-muted-foreground">
          As an instructor you have elevated access to reading content. Student
          management and analytics dashboards will be available in a future
          update.
        </p>
      </Card>
    </div>
  );
}
