"use client";

import { useMemo, useState } from "react";
import { Copy, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MOCK_LEVEL_ORDERS,
  READING_MOCK_LEVELS_LAUNCH_PLACEHOLDER,
  buildInstructorMockLevelPublishDraft,
  type MockLevelOrder,
} from "@/src/lib/readingMockLevelsLaunch";
import type { ReadingLevel } from "@/src/lib/api/adminReadingVersions";
import { formatDisplayLevelLabel } from "@/src/lib/readingLevelOrder";

export function MockLevelsLaunchInstructorBanner(props: { levels: ReadingLevel[] }) {
  const { levels } = props;
  const [copiedOrder, setCopiedOrder] = useState<MockLevelOrder | null>(null);

  const statusByOrder = useMemo(() => {
    const map = new Map<number, ReadingLevel>();
    for (const lv of levels) map.set(lv.order, lv);
    return map;
  }, [levels]);

  if (!READING_MOCK_LEVELS_LAUNCH_PLACEHOLDER) return null;

  const handleCopyDraft = async (order: MockLevelOrder) => {
    const draft = buildInstructorMockLevelPublishDraft(order);
    try {
      await navigator.clipboard.writeText(JSON.stringify(draft, null, 2));
      setCopiedOrder(order);
      window.setTimeout(() => setCopiedOrder(null), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <Card className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Launch mode — Levels 18–21 (DB orders 17–20, mock placeholders)
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Students see locked previews until they reach each level, then &quot;Coming soon&quot; until
              real full mocks are published. Set{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                READING_MOCK_LEVELS_LAUNCH_PLACEHOLDER = false
              </code>{" "}
              after content is live.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <ul className="grid gap-2 sm:grid-cols-2">
          {MOCK_LEVEL_ORDERS.map((order) => {
            const existing = statusByOrder.get(order);
            const draft = buildInstructorMockLevelPublishDraft(order);
            const isPublished = existing?.status === "published";
            return (
              <li
                key={order}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card/80 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{draft.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDisplayLevelLabel(order)} · DB order {order} ·{" "}
                      {draft.placeholderSteps.length} placeholder steps
                    </p>
                  </div>
                  {existing ? (
                    isPublished ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-400">
                        Draft shell
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400">
                      <AlertCircle className="h-3 w-3" />
                      Frontend only
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-fit gap-1.5 text-xs"
                  onClick={() => handleCopyDraft(order)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedOrder === order ? "Copied!" : "Copy publish draft JSON"}
                </Button>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted-foreground">
          L19–L20 can stay unpublished on the backend for now. Upload full mocks via the Full Mock
          Bulk portal on each level edit page, then publish when ready.
        </p>
      </CardContent>
    </Card>
  );
}
