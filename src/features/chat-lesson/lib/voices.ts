import { toSpokenText, type SpeechLang } from "@/src/features/chat-lesson/lib/speechText";

export type { SpeechLang };

/** Legacy offline Windows/SAPI voices: understandable but flat and robotic. */
const LEGACY_VOICE = /\b(david|zira|mark|george|hazel|susan|heera|ravi|kalpana|hemant)\b/i;
const NOVELTY_VOICE = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox)\b/i;

function normalizedLang(voice: SpeechSynthesisVoice): string {
  return voice.lang.toLowerCase().replace("_", "-");
}

/** Higher is more natural. `null` means the voice cannot speak this language. */
function scoreVoice(voice: SpeechSynthesisVoice, lang: SpeechLang): number | null {
  const code = normalizedLang(voice);
  if (!code.startsWith(lang)) return null;
  const name = voice.name;
  if (NOVELTY_VOICE.test(name)) return null;

  let score = 0;
  if (/natural|neural/i.test(name)) score += 100;
  if (/premium|enhanced|siri/i.test(name)) score += 70;
  if (/google/i.test(name)) score += 60;
  if (/online/i.test(name)) score += 30;
  if (!voice.localService) score += 10;
  if (LEGACY_VOICE.test(name)) score -= 50;

  if (lang === "en") {
    if (code === "en-us") score += 15;
    else if (code === "en-gb") score += 12;
    else if (code === "en-au" || code === "en-ca") score += 6;
    if (/\b(ava|aria|jenny|emma|samantha|libby|sonia|female)\b/i.test(name)) score += 8;
  } else {
    if (code === "bn-bd") score += 15;
    else if (code === "bn-in") score += 10;
    if (/\b(nabanita|tanishaa|female)\b/i.test(name)) score += 8;
  }
  return score;
}

export function pickVoice(
  voices: readonly SpeechSynthesisVoice[],
  lang: SpeechLang,
): SpeechSynthesisVoice | null {
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const voice of voices) {
    const score = scoreVoice(voice, lang);
    if (score !== null && score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return best;
}

/** Sentence-sized chunks give natural pauses and avoid Chrome cutting off long utterances. */
export function toSpeechChunks(text: string, lang: SpeechLang): string[] {
  const clean = toSpokenText(text, lang);
  if (!clean) return [];
  return clean
    .split(/(?<=[.!?।])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
