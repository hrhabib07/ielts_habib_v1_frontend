import type { Metadata } from "next";
import { ScoreGuaranteeMemberView } from "@/src/components/score-guarantee/ScoreGuaranteeMemberView";

export const metadata: Metadata = {
  title: "Score Guarantee™ | Gamlish",
  description:
    "Gamlish Score Guarantee™ — eligibility checklist, Readiness Zone, and refund conditions in full.",
};

export default function PublicScoreGuaranteePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
      <ScoreGuaranteeMemberView variant="public" />
    </div>
  );
}
