import type { Metadata } from "next";
import { LearnerFeedbackPageClient } from "@/src/components/feedback/LearnerFeedbackPageClient";

export const metadata: Metadata = {
  title: "Learner Feedback · Gamlish",
  description: "Share your Gamlish Full Journey experience.",
};

export default function FeedbackPage() {
  return <LearnerFeedbackPageClient />;
}
