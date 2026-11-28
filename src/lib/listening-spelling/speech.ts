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

function pickVoice(): { voice: SpeechSynthesisVoice | null; british: boolean } {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return { voice: null, british: false };
  }
  const voices = window.speechSynthesis.getVoices();
  const gb = voices.find((v) => v.lang.toLowerCase().startsWith("en-gb"));
  if (gb) return { voice: gb, british: true };
  const en = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
  return { voice: en ?? null, british: false };
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

async function playAudioFile(path: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio(path);
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false);
    void audio.play().catch(() => resolve(false));
  });
}

function speakUtterance(text: string, voice: SpeechSynthesisVoice | null): Promise<void> {
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? "en-GB";
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
}): Promise<SpeakResult> {
  cancelSpeech();
  if (opts.audioPath) {
    const ok = await playAudioFile(opts.audioPath);
    if (ok) return { usedBritish: true, usedFile: true };
  }
  await waitForVoices();
  const { voice, british } = pickVoice();
  await speakUtterance(opts.text, voice);
  return { usedBritish: british, usedFile: false };
}

export async function speakSpellAloud(spoken: string): Promise<SpeakResult> {
  cancelSpeech();
  await waitForVoices();
  const { voice, british } = pickVoice();
  const tokens = spoken.trim().split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    const upper = token.toUpperCase();
    const named =
      LETTER_NAMES[upper] ??
      DIGIT_NAMES[token] ??
      token;
    await speakUtterance(named, voice);
    await sleep(600);
  }
  return { usedBritish: british, usedFile: false };
}

export { cancelSpeech };
