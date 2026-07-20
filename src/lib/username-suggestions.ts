/** Build visible username suggestion chips from nickname / email. */
export function buildUsernameSuggestions(input: {
  displayName?: string | null;
  email?: string | null;
  publicId?: string | null;
}): string[] {
  const seeds: string[] = [];

  const fromName = sanitizeHandle(input.displayName ?? "");
  const fromEmail = sanitizeHandle((input.email ?? "").split("@")[0] ?? "");
  const fromPublic = sanitizeHandle(input.publicId ?? "");

  if (fromName.length >= 3) seeds.push(fromName);
  if (fromEmail.length >= 3 && fromEmail !== fromName) seeds.push(fromEmail);

  if (fromName.length >= 2) {
    seeds.push(`${fromName}01`);
    seeds.push(`${fromName}_bd`);
    seeds.push(`gamer_${fromName}`.slice(0, 30));
  }
  if (fromEmail.length >= 2 && fromEmail !== fromName) {
    seeds.push(`${fromEmail}01`);
  }
  if (fromPublic.length >= 3) seeds.push(fromPublic);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of seeds) {
    const v = s.slice(0, 30);
    if (v.length < 3 || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
    if (out.length >= 6) break;
  }
  return out;
}

function sanitizeHandle(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
}
