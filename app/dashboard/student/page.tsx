"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InstructorRequestCard } from "@/src/features/instructor-request/components/InstructorRequestCard";
import { BookOpen, TrendingUp, Target } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your IELTS preparation hub
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Reading Module</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Practice tests and exercises coming soon
          </p>
          <Button variant="outline" size="sm" disabled>
            Coming Soon
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Progress Tracking</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Monitor your improvement over time
          </p>
          <Button variant="outline" size="sm" disabled>
            Coming Soon
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Mock Tests</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Full-length practice exams
          </p>
          <Button variant="outline" size="sm" disabled>
            Coming Soon
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Instructor Request</h2>
        <InstructorRequestCard />
      </div>
    </div>
  );
}
