export interface PublicPricing {
  planId: string;
  planName: string;
  regularPriceBdt: number;
  finalPriceBdt: number;
  discountPercent: number;
  discountEnabled: boolean;
  preOrderEnabled: boolean;
  accessStartsAt: string;
  durationDays: number;
  bkashNumber: string;
  paymentInstructions: string;
  features: string[];
}

export interface AdminPricing extends PublicPricing {
  updatedAt?: string;
}

function unwrapPricing<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    throw new Error("No pricing data");
  }
  const body = payload as { data?: T; success?: boolean };
  if (body.data !== undefined && body.data !== null) {
    return body.data;
  }
  // Some callers may already pass the inner data object
  if ("finalPriceBdt" in body && "planId" in body) {
    return body as T;
  }
  throw new Error("No pricing data");
}

export async function getPublicPricing(): Promise<PublicPricing> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get("/pricing");
  return unwrapPricing<PublicPricing>(res.data);
}

export async function getAdminPricing(): Promise<AdminPricing> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get("/admin/pricing");
  return unwrapPricing<AdminPricing>(res.data);
}

export async function updateAdminPricing(
  payload: Partial<
    Pick<
      AdminPricing,
      | "regularPriceBdt"
      | "discountPercent"
      | "discountEnabled"
      | "preOrderEnabled"
      | "accessStartsAt"
      | "bkashNumber"
      | "paymentInstructions"
      | "durationDays"
      | "features"
    >
  >,
): Promise<AdminPricing> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.patch("/admin/pricing", payload);
  return unwrapPricing<AdminPricing>(res.data);
}

export function formatBdt(amount: number): string {
  return `${amount.toLocaleString("en-BD")} BDT`;
}

/** datetime-local value from ISO (local timezone). */
export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO string from datetime-local input. */
export function fromDatetimeLocalValue(local: string): string {
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return local;
  return d.toISOString();
}
