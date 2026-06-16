/** Extract a Bangladesh mobile number from free-form payment instructions. */
export function extractBkashNumber(text: string | null | undefined): string | null {
  if (!text) return null;
  const normalized = text.replace(/[\s-]+/g, "");
  const match = normalized.match(/\b(?:\+?88)?01\d{9}\b/);
  if (!match) return null;
  const digits = match[0].replace(/^\+?88/, "");
  return digits.startsWith("0") ? digits : `0${digits}`;
}

/** Plan instructions first, then optional public env fallback for checkout. */
export function resolveBkashNumber(planInstructions?: string | null): string | null {
  const fromPlan = extractBkashNumber(planInstructions);
  if (fromPlan) return fromPlan;
  const fromEnv = process.env.NEXT_PUBLIC_BKASH_NUMBER?.trim();
  if (!fromEnv) return null;
  return extractBkashNumber(fromEnv) ?? fromEnv;
}
