type SpeechCtor = new () => {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  start: () => void;
};

function synthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  return window.speechSynthesis;
}

export function stopPlayerSpeech(): void {
  synthesis()?.cancel();
}

/** Speak a prompt or a Bangla explanation. Callers must not pass the answer key. */
export function speakPlayerLine(text: string, lang: "bn-BD" | "en-US"): void {
  const voice = synthesis();
  if (!voice) return;
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return;
  voice.cancel();
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = lang;
  utter.rate = 1;
  voice.speak(utter);
}

export function listenForEnglishAnswer(onText: (value: string) => void): boolean {
  if (typeof window === "undefined") return false;
  const host = window as Window & {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };
  const Ctor = host.SpeechRecognition ?? host.webkitSpeechRecognition;
  if (!Ctor) return false;
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.onresult = (event) => {
    const text = event.results[0]?.[0]?.transcript?.trim() ?? "";
    if (text) onText(text);
  };
  rec.start();
  return true;
}
