/**
 * Sanitize user-facing text: no em/en dashes, no Bengali digits.
 * Gamlish never shows these characters on the website.
 */

const EM = "\u2014";
const EN = "\u2013";
const BN_DIGIT_CHARS = "\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF";
const LATIN_DIGIT_CHARS = "0123456789";

function toLatinDigits(value: string): string {
  let out = "";
  for (const ch of value) {
    const idx = BN_DIGIT_CHARS.indexOf(ch);
    out += idx >= 0 ? LATIN_DIGIT_CHARS[idx]! : ch;
  }
  return out;
}

export function stripEmDashes(value: string): string {
  return toLatinDigits(
    value
      .split(EM)
      .join(" · ")
      .split(EN)
      .join("-")
      .replace(/\s+·\s+/g, " · ")
      .replace(/ ·  · /g, " · ")
      .replace(/ {2,}/g, " ")
      .replace(/^ · /, "")
      .replace(/ · $/, "")
      .trim(),
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Deep-clone JSON-like values while stripping em/en dashes from every string.
 * Leaves Date, ObjectId, Buffer, and other class instances untouched.
 */
export function stripEmDashesDeep<T>(value: T): T {
  if (typeof value === "string") {
    return stripEmDashes(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripEmDashesDeep(item)) as T;
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = stripEmDashesDeep(nested);
    }
    return out as T;
  }
  return value;
}

export function containsEmDash(value: string): boolean {
  return value.includes(EM) || value.includes(EN);
}
