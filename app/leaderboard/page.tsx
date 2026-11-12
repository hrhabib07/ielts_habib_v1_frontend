import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { XpLeaderboardView } from "@/src/components/leaderboard/XpLeaderboardView";
import { SHOW_XP_LEADERBOARD } from "@/src/lib/platform-config";

export const metadata: Metadata = {
  title: "XP Leaderboard · Gamlish",
  description: "Global Gamlish XP rankings. Find your rank, search players, open profiles.",
};

export default function LeaderboardPage() {
  if (!SHOW_XP_LEADERBOARD) redirect("/player");
  return <XpLeaderboardView />;
}
