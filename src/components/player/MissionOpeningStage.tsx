"use client";

import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight } from "lucide-react";
import { usePlayerUiCopy } from "@/src/hooks/useLocalizedCopy";
import { brandSurfaces } from "@/src/lib/brand-theme";
import { cn } from "@/lib/utils";

export function MissionOpeningStage({
  storyHtml,
  submitting,
  onContinue,
}: {
  storyHtml?: string;
  submitting: boolean;
  onContinue: () => void;
}) {
  const PLAYER_UI = usePlayerUiCopy();
  return (
    <div className="space-y-6">
      <div className={cn("overflow-hidden rounded-2xl border p-5 shadow-sm", brandSurfaces.pricingCard)}>
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              {PLAYER_UI.missionOpeningEyebrow}
            </p>
            <p className="text-sm font-semibold text-foreground">{PLAYER_UI.missionOpeningKind}</p>
          </div>
        </div>
        <div
          className="prose prose-sm max-w-none text-[15px] leading-relaxed dark:prose-invert prose-ul:my-3 prose-li:my-1"
          dangerouslySetInnerHTML={{ __html: storyHtml ?? "" }}
        />
      </div>
      <Button className="w-full gap-2" size="lg" disabled={submitting} onClick={onContinue}>
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {PLAYER_UI.continue}
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
