import apiClient from "@/src/lib/api-client";
import { getOrCreateVisitorId } from "@/src/lib/analytics-visitor";

export type PersonalOfferView = {
  visitorId: string;
  listPriceBdt: number;
  offerPriceBdt: number;
  startedAt: string;
  endsAt: string;
  isExpired: boolean;
  remainingMs: number;
};

function unwrapOffer(payload: unknown): PersonalOfferView {
  if (!payload || typeof payload !== "object") {
    throw new Error("No offer data");
  }
  const body = payload as { data?: PersonalOfferView };
  if (body.data) return body.data;
  if ("offerPriceBdt" in body && "endsAt" in body) {
    return body as PersonalOfferView;
  }
  throw new Error("No offer data");
}

/** Get or create the personal 690→699 forever countdown for this browser. */
export async function fetchPersonalOffer(
  visitorId = getOrCreateVisitorId(),
): Promise<PersonalOfferView> {
  const res = await apiClient.get("/visitor-offers", {
    params: { visitorId },
    headers: { "X-Visitor-Id": visitorId },
  });
  return unwrapOffer(res.data);
}
