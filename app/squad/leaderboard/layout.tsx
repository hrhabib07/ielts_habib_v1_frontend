import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { SHOW_XP_LEADERBOARD } from "@/src/lib/platform-config";

export default function SquadLeaderboardLayout({ children }: { children: ReactNode }) {
  if (!SHOW_XP_LEADERBOARD) redirect("/player");
  return children;
}
