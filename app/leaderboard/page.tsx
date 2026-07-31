import type { Metadata } from "next";
import { XpLeaderboardView } from "@/src/components/leaderboard/XpLeaderboardView";

export const metadata: Metadata = {
  title: "XP Leaderboard · Gamlish",
  description: "Global Gamlish XP rankings. Find your rank, search players, open profiles.",
};

export default function LeaderboardPage() {
  return <XpLeaderboardView />;
}
