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

function unwrap<T>(res: { data?: { data?: T } }): T {
  const d = res.data?.data;
  if (d === undefined) throw new Error("No pricing data");
  return d;
}

export async function getPublicPricing(): Promise<PublicPricing> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: PublicPricing }>("/pricing");
  return unwrap(res);
}

export async function getAdminPricing(): Promise<AdminPricing> {
  const { default: apiClient } = await import("@/src/lib/api-client");
  const res = await apiClient.get<{ data: AdminPricing }>("/admin/pricing");
  return unwrap(res);
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
  const res = await apiClient.patch<{ data: AdminPricing }>("/admin/pricing", payload);
  return unwrap(res);
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
