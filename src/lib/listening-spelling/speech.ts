/** Browser TTS with British preference · Normal 0.85 · Slow 0.65. */

export const NORMAL_RATE = 0.85;
export const SLOW_RATE = 0.65;

const LETTER_NAMES: Record<string, string> = {
  A: "ay",
  B: "bee",
  C: "see",
  D: "dee",
  E: "ee",
  F: "eff",
  G: "jee",
  H: "aitch",
  I: "eye",
  J: "jay",
  K: "kay",
  L: "el",
  M: "em",
  N: "en",
  O: "oh",
  P: "pee",
  Q: "queue",
  R: "ar",
  S: "ess",
  T: "tee",
  U: "you",
  V: "vee",
  W: "double you",
  X: "ex",
  Y: "why",
  Z: "zed",
};

const DIGIT_NAMES: Record<string, string> = {
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
};

export type SpeakResult = {
  usedBritish: boolean;
  usedFile: boolean;
};

function scoreVoice(v: SpeechSynthesisVoice): number {
  const lang = v.lang.toLowerCase();
  const name = v.name.toLowerCase();
  let score = 0;
  if (lang.startsWith("en-gb") || lang === "en_gb") score += 100;
  else if (lang.startsWith("en")) score += 40;
  if (name.includes("uk") || name.includes("british") || name.includes("england")) score += 30;
  if (name.includes("google") || name.includes("microsoft") || name.includes("neural")) score += 15;
  if (name.includes("female") || name.includes("samantha") || name.includes("susan") || name.includes("hazel")) {
    score += 5;
  }
  return score;
}

function pickVoice(): { voice: SpeechSynthesisVoice | null; british: boolean } {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return { voice: null, british: false };
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return { voice: null, british: false };
  const ranked = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  const best = ranked[0] ?? null;
  const british = Boolean(best && scoreVoice(best) >= 100);
  return { voice: best, british };
}

function waitForVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve();
      return;
    }
    const onChange = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onChange);
    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      resolve();
    }, 1500);
  });
}

function cancelSpeech(): void {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // ignore
  }
}

async function playAudioFile(path: string, rate = 1): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio(path);
    audio.playbackRate = rate;
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false);
    void audio.play().catch(() => resolve(false));
  });
}

function speakUtterance(
  text: string,
  voice: SpeechSynthesisVoice | null,
  rate: number,
): Promise<void> {
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = 1;
    if (voice) u.voice = voice;
    u.lang = voice?.lang?.toLowerCase().startsWith("en-gb") ? voice.lang : "en-GB";
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => window.setTimeout(r, ms));
}

export async function speakWord(opts: {
  text: string;
  audioPath?: string;
  rate?: number;
}): Promise<SpeakResult> {
  const rate = opts.rate ?? NORMAL_RATE;
  cancelSpeech();
  if (opts.audioPath) {
    const fileRate = rate <= SLOW_RATE + 0.05 ? 0.75 : 1;
    const ok = await playAudioFile(opts.audioPath, fileRate);
    if (ok) return { usedBritish: true, usedFile: true };
  }
  await waitForVoices();
  const { voice, british } = pickVoice();
  await speakUtterance(opts.text, voice, rate);
  return { usedBritish: british, usedFile: false };
}

export async function speakSpellAloud(
  spoken: string,
  rate: number = NORMAL_RATE,
): Promise<SpeakResult> {
  cancelSpeech();
  await waitForVoices();
  const { voice, british } = pickVoice();
  const gap = rate <= SLOW_RATE + 0.05 ? 850 : 600;
  const tokens = spoken.trim().split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    const upper = token.toUpperCase();
    const named = LETTER_NAMES[upper] ?? DIGIT_NAMES[token] ?? token;
    await speakUtterance(named, voice, rate);
    await sleep(gap);
  }
  return { usedBritish: british, usedFile: false };
}

export { cancelSpeech };
