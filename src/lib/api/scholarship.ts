export interface ScholarshipStatus {
  inTrialPhase: boolean;
  createdAt: string | null;
  level0CompletedAt: string | null;
  level1CompletedAt: string | null;
  basePrice: number;
  unlockedDiscountPercent: number;
  activeDiscountPercent: number;
  scholarshipExpiryDate: string | null;
  isOfferActive: boolean;
  currentTierPercent: number;
  nextTierPercent: number;
  nextTierDropAt: string | null;
  tierRemainingMs: number;
  offerRemainingMs: number;
  discountedPrice: number;
}

function unwrap<T>(res: { data?: { data?: T } }): T {
  const d = res.data?.data;
  if (d === undefined) throw new Error("No scholarship data");
  return d;
}

export async function getMyScholarshipStatus(): Promise<ScholarshipStatus> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: ScholarshipStatus }>("/scholarships/me");
  return unwrap(res);
}
