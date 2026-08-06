import { MISSION_ZERO_COPY, type MissionZeroCopy } from "@/src/lib/mission-zero-copy";
import { MISSION_ZERO_TPS_COPY } from "@/src/lib/mission-zero-tps-copy";
import type { DemoProgressNs } from "@/src/lib/demo-session";
import type { UiLocale } from "@/src/lib/ui-locale";

export type MissionZeroVariantId = "did" | "third-person" | "third-person-a";

export type MissionZeroVerbParts = {
  readonly before: string;
  readonly verb: string;
  readonly after: string;
};

export type MissionZeroVariantConfig = {
  readonly id: MissionZeroVariantId;
  /** Funnel analytics path. Live ads stay on /demo. */
  readonly analyticsPath: string;
  readonly storageNs: DemoProgressNs;
  readonly copy: Record<UiLocale, MissionZeroCopy>;
  readonly q1Correct: "a" | "b";
  readonly optionA: MissionZeroVerbParts;
  readonly optionB: MissionZeroVerbParts;
  /** Left blank button id (copy.blankWent). */
  readonly blankWrong: "went";
  /** Right blank button id (copy.blankGo). */
  readonly blankCorrect: "go";
};

const THIRD_PERSON_BASE = {
  q1Correct: "b" as const,
  optionA: { before: "He ", verb: "eat", after: " rice." },
  optionB: { before: "He ", verb: "eats", after: " rice." },
  blankWrong: "went" as const,
  blankCorrect: "go" as const,
  copy: MISSION_ZERO_TPS_COPY,
};

/**
 * Live demo = DID rule. Test demos = third-person singular -s/-es.
 * Rejecting a test means keep shipping `did` only.
 */
export const MISSION_ZERO_VARIANTS: Record<
  MissionZeroVariantId,
  MissionZeroVariantConfig
> = {
  did: {
    id: "did",
    analyticsPath: "/demo",
    storageNs: "gamlish-demo",
    copy: MISSION_ZERO_COPY,
    q1Correct: "b",
    optionA: { before: "Did I ", verb: "called", after: " you?" },
    optionB: { before: "Did I ", verb: "call", after: " you?" },
    blankWrong: "went",
    blankCorrect: "go",
  },
  "third-person": {
    id: "third-person",
    analyticsPath: "/demo/test",
    storageNs: "gamlish-demo-tps",
    ...THIRD_PERSON_BASE,
  },
  "third-person-a": {
    id: "third-person-a",
    analyticsPath: "/demo/test-a",
    storageNs: "gamlish-demo-tps-a",
    ...THIRD_PERSON_BASE,
  },
};
