import type { Metadata } from "next";
import { HowItWorksContent } from "@/src/components/how-it-works/HowItWorksContent";

export const metadata: Metadata = {
  title: "How Gamlish Works",
  description:
    "Set your target band, follow the adaptive path through 20 levels, track readiness, and understand the score-or-refund guarantee — Gamlish.",
};

export default function HowItWorksPage() {
  return <HowItWorksContent />;
}
