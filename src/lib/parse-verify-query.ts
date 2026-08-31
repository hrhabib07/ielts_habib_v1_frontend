/** Pull a certificate or learner ID from typed text or a pasted verify URL. */
export function parseVerifyQuery(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  let token = trimmed;
  const verifyIdx = trimmed.toLowerCase().indexOf("/verify/");
  if (verifyIdx >= 0) {
    token = trimmed.slice(verifyIdx + "/verify/".length);
    token = token.split(/[?#/]/)[0] ?? token;
  }

  try {
    token = decodeURIComponent(token);
  } catch {
    /* keep token */
  }

  return token.replace(/\s+/g, "").toUpperCase();
}
