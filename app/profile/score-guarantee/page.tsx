import type { Metadata } from "next";
import { ScoreGuaranteeMemberView } from "@/src/components/score-guarantee/ScoreGuaranteeMemberView";

export const metadata: Metadata = {
  title: "Score Guarantee | Gamlish",
  description:
    "Gamlish Score Guarantee™ — eligibility, Readiness Zone, and how your target band is backed.",
};

export default function ScoreGuaranteePage() {
  return <ScoreGuaranteeMemberView />;
}
