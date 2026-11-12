"use client";

import { LegacyProfilePage } from "@/src/components/profile/LegacyProfilePage";
import { NameStep } from "@/src/features/guest/components/GuestScreens";
import { useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { MissionShell, type MissionShellContext } from "@/src/features/learner/components/MissionShell";
import { ProfileScreen } from "@/src/features/learner/components/ProfileScreen";

function ProfileOrName({ ctx }: { ctx: MissionShellContext }) {
  const lang = useLessonLanguage();
  if (!ctx.learner) {
    return (
      <NameStep
        lang={lang}
        suggested={ctx.state.suggestedNameEn}
        onSave={async (nicknameEn) => {
          await ctx.saveProfile({ nicknameEn });
        }}
      />
    );
  }
  return <ProfileScreen ctx={ctx} />;
}

export default function ProfilePage() {
  return <MissionShell fallback={<LegacyProfilePage />}>{(ctx) => <ProfileOrName ctx={ctx} />}</MissionShell>;
}
