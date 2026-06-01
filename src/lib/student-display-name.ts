/** Preferred greeting name: nickname, else first token of legal name. */
export function getStudentDisplayName(
  profile: { nickname?: string | null; name?: string | null } | null | undefined,
): string | null {
  if (!profile) return null;
  const nick = profile.nickname?.trim();
  if (nick) return nick;
  const legal = profile.name?.trim();
  if (!legal) return null;
  const first = legal.split(/\s+/)[0];
  return first || null;
}
