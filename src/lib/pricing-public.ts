import type { SubscriptionPlan } from "@/src/lib/api/subscription";
import { ENABLE_READING } from "@/src/lib/platform-config";

function planIncludesEnglish(plan: SubscriptionPlan): boolean {
  return plan.module === "ENGLISH" || plan.modulesIncluded.includes("ENGLISH");
}

function planIsReadingOnly(plan: SubscriptionPlan): boolean {
  const modules = plan.modulesIncluded ?? [];
  return (
    plan.module === "READING" ||
    (modules.length > 0 && modules.every((m) => m === "READING"))
  );
}

/** Public pricing page: English Foundations when Reading is parked. */
export function filterPublicPricingPlans(plans: SubscriptionPlan[]): SubscriptionPlan[] {
  if (ENABLE_READING) return plans;
  const englishPlans = plans.filter(planIncludesEnglish);
  if (englishPlans.length > 0) return englishPlans;
  return plans.filter((p) => !planIsReadingOnly(p));
}
