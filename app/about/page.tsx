import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";

export const metadata: Metadata = {
  title: "About · Gamlish",
  description:
    "Gamlish is Bangladesh’s gamified English Foundations platform — camps, missions, and progress you can see.",
};

export default function AboutPage() {
  return <AboutContent />;
}
