"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PendingInstructorRequests } from "@/src/features/admin-approval/components/PendingInstructorRequests";
import { PendingSubscriptionRequests } from "@/src/features/admin-approval/components/PendingSubscriptionRequests";
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Gamepad2,
  MessageSquareHeart,
  MessagesSquare,
  PackageCheck,
  Shield,
  Smartphone,
  TrendingDown,
  Users,
} from "lucide-react";

export function EnglishAdminHome() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage English learning content, subscriptions, and people.
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
        </Link>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">New student enrollments</h2>
        </div>
        <Card className="p-6">
          <PendingSubscriptionRequests />
        </Card>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/admin/activity">
          <Card className="h-full p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <Shield className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Admin activity</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  See which admin approved, rejected, or unlocked access
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/demo-conversion">
          <Card className="h-full p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
                <TrendingDown className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Conversion funnel</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Why users leave after the demo  -  phone OTP & Google drop-off
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/english">
          <Card className="h-full p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Gamepad2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">English content</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Camps, missions, stories, videos, and quizzes
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/users">
          <Card className="h-full p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Students</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  View all learners, emails, and English mission progress
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/demo-feedback">
          <Card className="h-full p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <MessageSquareHeart className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Demo funnel</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Visits, drop-offs, signup conversion, and ratings
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/mission-feedback">
          <Card className="h-full p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
                <MessagesSquare className="h-5 w-5 text-sky-700 dark:text-sky-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Mission 1 feedback</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Experience, buy intent, objections, and auto insights
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/learner-feedback">
          <Card className="h-full p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                <MessageSquareHeart className="h-5 w-5 text-violet-700 dark:text-violet-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Learner stories</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Approve homepage testimonials from paid learners
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/pricing">
          <Card className="h-full p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                <PackageCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Pricing & payments</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Founder Launch price, bKash, and payment verification
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/weekly-challenge">
          <Card className="h-full p-5 transition-shadow hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <Smartphone className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">Weekly 20 TK</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Locked Top 3 phones · mark manual recharge done
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Instructor requests</h2>
        </div>
        <Card className="p-6">
          <PendingInstructorRequests />
        </Card>
      </section>
    </div>
  );
}
