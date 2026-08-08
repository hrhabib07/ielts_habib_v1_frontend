export const LEARNER_FEEDBACK_MAX_BODY = 300;
export const LEARNER_FEEDBACK_MIN_BODY = 20;
export const LEARNER_FEEDBACK_REWARD_XP = 50;
export const LEARNER_FEEDBACK_MIN_MISSION_ORDER = 3;

/** Ghost topic ideas only · never click-to-insert. */
export const LEARNER_FEEDBACK_TOPIC_HINTS_BN = [
  "মজার গেমপ্লে",
  "সহজ লেসন",
  "লিডারবোর্ড",
] as const;

export const LEARNER_TITLE_PRESETS_BN = [
  "স্কুল স্টুডেন্ট",
  "কলেজ স্টুডেন্ট",
  "মাদ্রাসা স্টুডেন্ট",
  "বিশ্ববিদ্যালয় স্টুডেন্ট",
  "জাতীয় বিশ্ববিদ্যালয় স্টুডেন্ট",
  "চাকরিজীবী",
] as const;

export const LEARNER_TITLE_OTHER = "অন্যান্য";

export type LearnerFeedbackStatus = "pending" | "approved" | "rejected";

export interface LearnerFeedbackPublicItem {
  id: string;
  title: string;
  rating: number;
  body: string;
  displayName: string;
  status?: LearnerFeedbackStatus;
  createdAt?: string | null;
  xpAwarded?: number;
  username?: string | null;
  publicId?: string | null;
  profileHandle?: string | null;
  avatarUrl?: string | null;
  totalXp?: number;
  missionsCompleted?: number;
  level?: number;
}

export interface LearnerFeedbackInviteStatus {
  alreadySubmitted: boolean;
  eligible: boolean;
  rewardXp: number;
  hasEnglishAccess: boolean;
  hasCompletedMission3: boolean;
  missionsCompleted: number;
  totalXp: number;
  currentMissionOrder: number;
}
