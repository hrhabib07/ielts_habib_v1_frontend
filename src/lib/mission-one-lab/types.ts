/**
 * Mission 01 curriculum lab · shared types.
 * Live pack and test pack both use this shape.
 */

export type MissionOneLabRole = "subject" | "verb" | "object";

export type MissionOneLabMappedWord = {
  readonly en: string;
  readonly bn: string;
  readonly role?: MissionOneLabRole;
};

export type MissionOneLabOption = {
  /** Stable answer key (usually the English form). */
  readonly value: string;
  readonly en: string;
  readonly bn: string;
};

export type MissionOneLabQuestion = {
  readonly id: string;
  readonly prompt: string;
  readonly sentence?: string;
  readonly bangla: string;
  /** Default mcq. Use rearrange for Order / Final Boss. */
  readonly mode?: "mcq" | "rearrange";
  readonly options: readonly MissionOneLabOption[];
  readonly answer: string;
  readonly map: readonly MissionOneLabMappedWord[];
  /** Scrambled chips for rearrange (EN + BN on each tile). */
  readonly tiles?: readonly MissionOneLabMappedWord[];
  /** Expected English words in SVO order. */
  readonly correctOrder?: readonly string[];
  readonly tip: string;
};

export type MissionOneLabQuest = {
  readonly id: string;
  readonly label: string;
  readonly title: string;
  readonly emoji: string;
  readonly tone: string;
  readonly definitionBn: string;
  readonly definitionEn: string;
  readonly rule: string;
  readonly exampleBn: string;
  readonly example: readonly MissionOneLabMappedWord[];
  readonly rescue: readonly [string, string, string, string];
  readonly questions: readonly MissionOneLabQuestion[];
  /** Short help button on question screen, e.g. "Person কী?" */
  readonly explainLabel: string;
};

export type MissionOneLabPack = {
  readonly id: string;
  readonly badge: string;
  readonly progressKey: string;
  readonly openingEyebrow: string;
  readonly openingTitle: string;
  readonly openingBody: string;
  readonly openingExampleBn: string;
  readonly openingExample: readonly MissionOneLabMappedWord[];
  readonly partCountHint: string;
  readonly skillBadges: readonly string[];
  readonly victoryTitle: string;
  readonly victorySub: string;
  readonly cliffhangerTitle: string;
  readonly cliffhangerBody: string;
  readonly cliffhangerTeaser: readonly string[];
  readonly unlockClarity: string;
  readonly quests: readonly MissionOneLabQuest[];
  /** Optional Mission 01 teaching video (same as live course). */
  readonly videoUrl?: string;
  readonly videoTitle?: string;
  /**
   * Mission 2/3 style soft lock under the video.
   * Recommendation test only until approved for live.
   */
  readonly videoSoftLock?: boolean;
};

export function opt(value: string, en: string, bn: string): MissionOneLabOption {
  return { value, en, bn };
}

export function word(
  en: string,
  bn: string,
  role?: MissionOneLabRole,
): MissionOneLabMappedWord {
  return role ? { en, bn, role } : { en, bn };
}
