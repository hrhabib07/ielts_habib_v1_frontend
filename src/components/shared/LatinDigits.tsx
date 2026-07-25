import type { ReactNode } from "react";
import { toLatinDigits } from "@/src/lib/ui-locale";

/**
 * Renders Bangla UI copy with Latin digits so Hind Siliguri’s thin
 * Bengali "1" never appears in product text.
 */
export function latinDigitsText(text: string): string {
  return toLatinDigits(text);
}

/** Optional wrapper when a whole string must be digit-normalized. */
export function LatinDigits({ children }: { children: string }): ReactNode {
  return toLatinDigits(children);
}
