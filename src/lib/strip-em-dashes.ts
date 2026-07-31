/**
 * Strip em dashes (U+2014) and en dashes (U+2013) from user-facing text.
 * Gamlish never shows these characters on the website.
 */

const EM = "\u2014";
const EN = "\u2013";

export function stripEmDashes(value: string): string {
  return value
    .split(EM)
    .join(" · ")
    .split(EN)
    .join("-")
    .replace(/\s+·\s+/g, " · ")
    .replace(/ ·  · /g, " · ")
    .replace(/ {2,}/g, " ")
    .replace(/^ · /, "")
    .replace(/ · $/, "")
    .trim();
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
