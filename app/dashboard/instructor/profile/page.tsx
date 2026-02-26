"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileQuestion,
  Layers,
  Tag,
  BarChart2,
  ArrowRight,
  Loader2,
  Calendar,
} from "lucide-react";
import { getMyWeaknessTags } from "@/src/lib/api/weaknessTags";

export default function InstructorProfilePage() {
  const [tagCount, setTagCount] = useState<number | null>(null);

  useEffect(() => {
    getMyWeaknessTags()
      .then((tags) => setTagCount(tags.length))
      .catch(() => setTagCount(0));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Instructor profile
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Overview and quick access to core management tools.
        </p>
      </div>

      {/* Instructor Overview Card */}
      <Card className="overflow-hidden rounded-2xl border-stone-200 bg-stone-50/50 shadow-sm dark:border-stone-800 dark:bg-stone-900/30">
        <div className="border-b border-stone-200 bg-white px-6 py-4 dark:border-stone-800 dark:bg-stone-900/50">
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">
            Overview
          </h2>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            Your contribution summary (counts may reflect available data).
          </p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/50">
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <FileQuestion className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Questions created
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-100">
              —
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/50">
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <Layers className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Levels managed
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-100">
              —
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/50">
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <Tag className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Weakness tags created
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-100">
              {tagCount === null ? (
                <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
              ) : (
                tagCount
              )}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/50">
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Joined
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-100">
              —
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Access Panel */}
      <Card className="overflow-hidden rounded-2xl border-stone-200 bg-stone-50/50 shadow-sm dark:border-stone-800 dark:bg-stone-900/30">
        <div className="border-b border-stone-200 bg-white px-6 py-4 dark:border-stone-800 dark:bg-stone-900/50">
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">
            Quick access
          </h2>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            Direct links to core management screens.
          </p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <Link href="/dashboard/instructor/questions">
            <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900/50 dark:hover:border-stone-700 dark:hover:bg-stone-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800">
                  <FileQuestion className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                </div>
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    Create Question
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Add questions to question sets
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-stone-400" />
            </div>
          </Link>
          <Link href="/dashboard/instructor/levels">
            <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900/50 dark:hover:border-stone-700 dark:hover:bg-stone-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800">
                  <Layers className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                </div>
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    Create Level
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Manage learning levels and steps
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-stone-400" />
            </div>
          </Link>
          <Link href="/dashboard/instructor/weakness-tags">
            <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900/50 dark:hover:border-stone-700 dark:hover:bg-stone-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                  <Tag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    Create Weakness Tag
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Submit and manage weakness/trap tags
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-stone-400" />
            </div>
          </Link>
          <Link href="/dashboard/instructor">
            <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900/50 dark:hover:border-stone-700 dark:hover:bg-stone-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800">
                  <BarChart2 className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                </div>
                <div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">
                    View Analytics
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Dashboard and content overview
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-stone-400" />
            </div>
          </Link>
        </div>
      </Card>

      <div className="flex justify-end">
        <Link href="/dashboard/instructor">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Back to dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
