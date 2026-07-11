import { PLAYER_UI_COPY } from "@/src/lib/player-ui-copy";
import type { UiLocale } from "@/src/lib/ui-locale";

export type PlayerStageKindLabelInput = {
  kind: "story" | "video" | "evaluation";
  order?: number;
  title?: string;
};

/** First-stage mission brief — not a narrative story. */
export function isMissionOpeningStage(stage: PlayerStageKindLabelInput): boolean {
  if (stage.kind !== "story") return false;
  if (stage.order === 1) return true;
  return /mission opening/i.test(stage.title ?? "");
}

export function resolveStageKindLabel(
  stage: PlayerStageKindLabelInput,
  locale: UiLocale = "bn",
): string {
  const copy = PLAYER_UI_COPY[locale];
  if (isMissionOpeningStage(stage)) {
    return copy.missionOpeningKind;
  }
  return copy.stageKind[stage.kind] ?? stage.kind;
}

/** @deprecated Use resolveStageKindLabel(stage, locale) */
export function resolveStageKindLabelBn(stage: PlayerStageKindLabelInput): string {
  return resolveStageKindLabel(stage, "bn");
}
