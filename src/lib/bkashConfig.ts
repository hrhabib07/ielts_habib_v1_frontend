/** Public bKash Send Money number — set NEXT_PUBLIC_BKASH_NUMBER in production. */
export const PUBLIC_BKASH_NUMBER =
  process.env.NEXT_PUBLIC_BKASH_NUMBER?.trim() || null;

export function extractBkashNumber(text: string | null | undefined): string | null {
  if (!text) return null;
  const normalized = text.replace(/[\s-]+/g, "");
  const match = normalized.match(/\b(?:\+?88)?01\d{9}\b/);
  if (!match) return null;
  const digits = match[0].replace(/^\+?88/, "");
  return digits.startsWith("0") ? digits : `0${digits}`;
}

export function resolveBkashNumber(planInstructions?: string | null): string | null {
  return extractBkashNumber(planInstructions) ?? PUBLIC_BKASH_NUMBER;
}
