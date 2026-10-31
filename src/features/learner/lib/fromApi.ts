import { learnerPhotoSrc, type ChatMissionLearner } from "@/src/lib/api/chatMission";
import type { Learner } from "@/src/features/learner/lib/personalize";

/** Only a photo the learner uploaded in the mission is shown; otherwise the avatar uses their initial. */
export function toLearner(data: ChatMissionLearner | null): Learner | null {
  if (!data) return null;
  return {
    nicknameEn: data.nicknameEn,
    nicknameBn: data.nicknameBn,
    addressAs: data.addressAs,
    district: data.district,
    country: data.country,
    photoSrc: learnerPhotoSrc(data.photoUrl),
  };
}
