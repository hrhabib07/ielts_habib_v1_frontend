"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useModules, useAssessmentByModule } from "../hooks/useAssessment";
import { isActivationLevel } from "../lib/rules";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Loader2,
  FileQuestion,
  ClipboardList,
} from "lucide-react";
import type { AssessmentModule } from "@/src/lib/api/assessment";

function ActivationBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
      Activation Level
    </span>
  );
}

function AssessmentSummary({ hasAssessment }: { hasAssessment: boolean }) {
  if (!hasAssessment) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
      <FileQuestion className="h-3.5 w-3.5" />
      Set
    </span>
  );
}

export function AssessmentLevelList({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) {
  const router = useRouter();
  const { data: modules, loading, error, fetch } = useModules();

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => fetch()}>
          Retry
        </Button>
      </Card>
    );
  }

  const list = modules ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Assessment levels
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage onboarding and checkpoint levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={backHref} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/instructor/levels/create" className="gap-2">
              <Plus className="h-4 w-4" />
              New level
            </Link>
          </Button>
        </div>
      </div>

      {list.length === 0 ? (
        <Card className="p-12 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No levels yet.</p>
          <Button size="sm" className="mt-4 gap-2" asChild>
            <Link href="/dashboard/instructor/levels/create">
              <Plus className="h-4 w-4" />
              Create first level
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Order
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Title
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Access
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Assessment
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list
                .sort((a, b) => a.order - b.order)
                .map((level) => (
                  <LevelRow key={level._id} level={level} />
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LevelRow({ level }: { level: AssessmentModule }) {
  const router = useRouter();
  const { data: assessment, fetch: fetchAssessment } = useAssessmentByModule(level._id);
  useEffect(() => {
    fetchAssessment();
  }, [level._id, fetchAssessment]);
  const activation = isActivationLevel(level);

  return (
    <tr className="transition-colors hover:bg-muted/20">
      <td className="px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {level.order}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{level.title}</p>
          {activation && <ActivationBadge />}
        </div>
        {level.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {level.description}
          </p>
        )}
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        {level.isFree ? (
          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
            Free
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Paid
          </span>
        )}
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <AssessmentSummary hasAssessment={assessment != null} />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => router.push(`/dashboard/instructor/levels/${level._id}/edit`)}
            title="Edit level"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
