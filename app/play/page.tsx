import type { Metadata } from "next";
import { GuestPlay } from "@/src/features/guest/GuestPlay";

export const metadata: Metadata = {
  title: "Play Gamlish free · The Game of English",
  description: "Play the first English games free, no account needed. Level 1 starts easy and gets harder as you play.",
};

export default function PlayPage() {
  return <GuestPlay />;
}
