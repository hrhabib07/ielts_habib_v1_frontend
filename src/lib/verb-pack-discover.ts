export interface VerbTrio {
  readonly v1: string;
  readonly bn: string;
  readonly v2: string;
  readonly v3: string;
}

export interface VerbPackDiscover {
  readonly packNumber: number;
  readonly verbs: VerbTrio[];
}

const TITLE_RE = /verb\s*pack\s*0*(\d+)/i;
const DISCOVER_RE = /discover/i;
const ITEM_RE = /<li>\s*<strong>([^<]+)<\/strong>\s*\(([^)]*)\)\s*([\s\S]*?)<\/li>/g;
const FORM_SEPARATOR_RE = /→|➝|·|-&gt;|->/;

function clean(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/**
 * Verb Pack "Discover" stages ship as generated HTML. Parse the V1/V2/V3 trios so the
 * stage can render as cards; returns null for any stage that is not a parseable pack.
 */
export function parseVerbPackDiscover(
  title: string | null | undefined,
  storyHtml: string | null | undefined,
): VerbPackDiscover | null {
  if (!title || !storyHtml) return null;
  if (!DISCOVER_RE.test(title)) return null;

  const packMatch = TITLE_RE.exec(title);
  if (!packMatch?.[1]) return null;
  const packNumber = Number.parseInt(packMatch[1], 10);
  if (!Number.isFinite(packNumber)) return null;

  const verbs: VerbTrio[] = [];
  ITEM_RE.lastIndex = 0;
  let match = ITEM_RE.exec(storyHtml);
  while (match) {
    const v1 = clean(match[1] ?? "");
    const bn = clean(match[2] ?? "");
    const forms = clean(match[3] ?? "")
      .split(FORM_SEPARATOR_RE)
      .map((part) => part.trim())
      .filter(Boolean);
    if (v1 && forms.length >= 2) {
      verbs.push({ v1, bn, v2: forms[0] ?? "", v3: forms[1] ?? "" });
    }
    match = ITEM_RE.exec(storyHtml);
  }

  if (verbs.length < 3) return null;
  return { packNumber, verbs };
}
