export interface DialogueTurn {
  speaker: string;
  text: string;
}

const DIALOGUE_LINE =
  /^([A-Za-z][A-Za-z0-9 .'-]{0,40}?)\s*:\s*(.+)$/;

/**
 * Detects script-style dialogue (`Name: line`) and returns turns.
 * Returns null when the passage is a normal story/paragraph.
 */
export function parseDialoguePassage(passage: string): DialogueTurn[] | null {
  const lines = passage
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  const turns: DialogueTurn[] = [];
  for (const line of lines) {
    const match = DIALOGUE_LINE.exec(line);
    if (!match?.[1] || !match[2]) return null;
    turns.push({ speaker: match[1].trim(), text: match[2].trim() });
  }

  const speakers = new Set(turns.map((t) => t.speaker));
  if (speakers.size < 2) return null;

  return turns;
}
