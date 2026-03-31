import type { Metadata } from "next";
import { TrialUpgradePageClient } from "@/src/components/trial-upgrade/TrialUpgradePageClient";

export const metadata: Metadata = {
  title: "Unlock Premium | Complete Your Band Score Journey",
  description:
    "Level 1 complete. Upgrade for the full 20-level premium IELTS reading course and structured prep to your target band.",
};

export default function PremiumUpgradePage() {
  return <TrialUpgradePageClient />;
}
