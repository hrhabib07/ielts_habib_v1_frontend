export interface ScholarshipStatus {
  inTrialPhase: boolean;
  scholarshipStartTime: string | null;
  createdAt: string | null;
  level0CompletedAt: string | null;
  level1CompletedAt: string | null;
  basePrice: number;
  currentTierPercent: number;
  nextTierPercent: number;
  nextTierDropAt: string | null;
  tierRemainingMs: number;
  isFullyExpired: boolean;
  claimedDiscountPercent: number | null;
  claimExpirationTime: string | null;
  isClaimActive: boolean;
  claimRemainingMs: number;
  activeDiscountPercent: number;
  isOfferActive: boolean;
  offerRemainingMs: number;
  discountedPrice: number;
  /** @deprecated */
  unlockedDiscountPercent: number;
  /** @deprecated */
  scholarshipExpiryDate: string | null;
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

export async function claimMyScholarship(): Promise<ScholarshipStatus> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.post<{ data: ScholarshipStatus }>("/scholarships/me/claim");
  return unwrap(res);
}
