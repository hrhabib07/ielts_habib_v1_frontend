import type { Level } from "@/src/lib/api/levels";

/** Strip repeated leading "Level N" prefixes (colon, dash, em dash, etc.). */
export function stripLevelTitlePrefix(title: string): string {
  let name = title.trim();
  const prefixRe = /^Level\s+\d+\s*(?:[—–\-:]\s*|\s+)/i;
  while (prefixRe.test(name)) {
    name = name.replace(prefixRe, "").trim();
  }
  return name;
}

/** Zone / path list label — always exactly one "Level N:" prefix. */
export function formatLevelDisplayTitle(level: Level, displayNumber: number): string {
  const name = stripLevelTitlePrefix(level.title || "");
  if (name) return `Level ${displayNumber}: ${name}`;
  return `Level ${displayNumber}`;
}
