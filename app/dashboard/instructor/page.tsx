"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Activity,
  FileText,
  Layers,
  ClipboardList,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  ClipboardCheck,
  ListChecks,
  MessageSquare,
} from "lucide-react";
import { getReadingLevels } from "@/src/lib/api/adminReadingVersions";
import {
  getFailedStudents,
  getRestartRequests,
  getPermanentLocks,
} from "@/src/lib/api/adminReadingMonitoring";

interface DashboardStats {
  levelsCount: number;
  failedStudentsCount: number;
  restartQueueCount: number;
  permanentLocksCount: number;
}

export default function InstructorDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getReadingLevels().catch(() => []),
      getFailedStudents(1, 1).catch(() => ({ meta: { total: 0 } })),
      getRestartRequests({ page: 1, limit: 1 }).catch(() => ({ meta: { total: 0 } })),
      getPermanentLocks(1, 1).catch(() => ({ meta: { total: 0 } })),
    ])
      .then(([levels, failed, restart, locks]) => {
        if (cancelled) return;
        setStats({
          levelsCount: levels.length,
          failedStudentsCount: failed.meta?.total ?? 0,
          restartQueueCount: restart.meta?.total ?? 0,
          permanentLocksCount: locks.meta?.total ?? 0,
        });
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load dashboard data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Reading Levels",
      value: stats?.levelsCount ?? 0,
      href: "/dashboard/instructor/reading-levels",
      icon: BookOpen,
      color: "indigo",
    },
    {
      label: "Failed Students",
      value: stats?.failedStudentsCount ?? 0,
      href: "/dashboard/instructor/reading-monitoring?tab=failed",
      icon: AlertCircle,
      color: "amber",
      urgent: (stats?.failedStudentsCount ?? 0) > 0,
    },
    {
      label: "Restart Queue",
      value: stats?.restartQueueCount ?? 0,
      href: "/dashboard/instructor/reading-monitoring?tab=restart",
      icon: Users,
      color: "emerald",
      urgent: (stats?.restartQueueCount ?? 0) > 0,
    },
    {
      label: "Permanent Locks",
      value: stats?.permanentLocksCount ?? 0,
      href: "/dashboard/instructor/reading-monitoring?tab=locks",
      icon: Activity,
      color: "rose",
    },
  ];

  const quickLinks = [
    {
      title: "Manage Reading Levels",
      description: "Create levels, add steps, configure group tests and evaluation",
      href: "/dashboard/instructor/reading-levels",
      icon: BookOpen,
    },
    {
      title: "Practice Test Manager",
      description: "Create and manage mini practice tests (one passage + questions). Unlimited attempts until pass.",
      href: "/dashboard/instructor/practice-tests",
      icon: ClipboardCheck,
    },
    {
      title: "Group Tests",
      description: "Configure level final evaluations (3 passage question sets per group test)",
      href: "/dashboard/instructor/group-tests",
      icon: ListChecks,
    },
    {
      title: "Reading Monitoring",
      description: "Review failed students, approve restart requests, view locks",
      href: "/dashboard/instructor/reading-monitoring",
      icon: Activity,
    },
    {
      title: "Level feedback",
      description: "View student feedback per level (quality, recommend, video) and analytics",
      href: "/dashboard/instructor/level-feedback",
      icon: MessageSquare,
    },
    {
      title: "Quiz Content",
      description: "Create quiz content for QUIZ and VOCABULARY_TEST steps",
      href: "/dashboard/instructor/quiz-content",
      icon: ClipboardList,
    },
    {
      title: "Passages & Questions",
      description: "Manage passages, question sets, and questions for group tests",
      href: "/dashboard/instructor/passages",
      icon: FileText,
    },
    {
      title: "Content Management",
      description: "Create instruction and video content for levels",
      href: "/dashboard/instructor/contents",
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage your Reading curriculum, monitor student progress, and handle restarts from this dashboard.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <div
                className={`flex items-center gap-4 rounded-2xl border bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:bg-zinc-900/50 dark:hover:border-indigo-800 ${
                  card.urgent ? "border-amber-200 dark:border-amber-800" : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    card.urgent ? "bg-amber-100 dark:bg-amber-900/40" : "bg-indigo-100 dark:bg-indigo-900/40"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      card.urgent ? "text-amber-600 dark:text-amber-400" : "text-indigo-600 dark:text-indigo-400"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {card.label}
                  </p>
                  <p className="mt-0.5 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {card.value}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-zinc-400" />
              </div>
            </Link>
          );
        })}
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Quick access
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-indigo-800">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
                    <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {link.title}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {link.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-zinc-400" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Workflow tips
        </h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>1. Create Passages and Question Sets, then add Questions to sets.</li>
          <li>2. Create Quiz Content for QUIZ / VOCABULARY_TEST steps.</li>
          <li>3. Create Practice Tests (Practice Test Manager) from one passage question set each; add a &quot;Practice Test&quot; step in Level Builder and attach one.</li>
          <li>4. Create Learning Content for INSTRUCTION / VIDEO steps.</li>
          <li>5. Create a Reading Level → Add Versions → Add Steps (link content) → Add Group Tests (link passages + question sets).</li>
          <li>6. Publish the version to make it live for students.</li>
        </ul>
      </section>
    </div>
  );
}
