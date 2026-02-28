import type {
  AssessmentModule,
  AssessmentType,
} from "@/src/lib/api/assessment";

export function isActivationLevel(module: AssessmentModule | null): boolean {
  return module?.order === 0 || module?.unlockCondition?.type === "none";
}

export function defaultPassingScoreForActivation(): number {
  return 60;
}

export function canPublishWithoutAssessment(module: AssessmentModule | null): boolean {
  return isActivationLevel(module) && (module?.unlockCondition?.type === "none");
}

export function requiresAssessmentToPublish(module: AssessmentModule | null): boolean {
  return !canPublishWithoutAssessment(module);
}

export function assessmentTypeForLevel(
  order: number,
  unlockType: "none" | "module_passed",
): AssessmentType {
  if (order === 0 || unlockType === "none") return "activation";
  return "checkpoint";
}

export function forceAssessmentType(module: AssessmentModule | null): AssessmentType | null {
  if (!module) return null;
  if (isActivationLevel(module)) return "activation";
  return null;
}
