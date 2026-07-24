import type { Metadata } from "next";
import { PrivacyContent } from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy · Gamlish",
  description:
    "How Gamlish collects, uses, and protects account and usage data.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyContent />;
}
