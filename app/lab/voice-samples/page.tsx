import type { Metadata } from "next";
import samples from "@/src/features/chat-lesson/content/voiceSamples.json";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Voice samples lab",
  robots: { index: false, follow: false, nocache: true },
};

type SampleVoice = {
  id: string;
  label: string;
  lang: string;
  clips?: string[];
  error?: string;
};

const LANG_TITLE: Record<string, string> = { en: "English voices", bn: "Bangla voices" };

function VoiceCard({ voice, lines }: { voice: SampleVoice; lines: string[] }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="font-sans text-base font-bold text-slate-900">{voice.label}</h3>
      <p className="font-mono text-[11px] text-slate-400">{voice.id}</p>
      {voice.clips ? (
        <div className="mt-3 space-y-3">
          {voice.clips.map((src, i) => (
            <div key={src} className="space-y-1.5">
              <p
                className={cn(
                  "text-[13.5px] leading-relaxed text-slate-600",
                  voice.lang === "bn" ? "font-bengali font-medium" : "font-sans",
                )}
              >
                {lines[i]?.replace(/\*\*/g, "")}
              </p>
              <audio controls preload="none" src={src} className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          Not available: {voice.error}
        </p>
      )}
    </article>
  );
}

/** Internal page for choosing the Gamlish guide voice. Not linked anywhere. */
export default function VoiceSamplesLabPage() {
  const voices = samples.voices as SampleVoice[];

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-1">
          <p className="font-sans text-xs font-black uppercase tracking-[0.16em] text-amber-700">
            Test only · not linked anywhere
          </p>
          <h1 className="font-sans text-2xl font-black text-slate-900">Choose the Gamlish voice</h1>
          <p className="font-sans text-sm text-slate-500">
            Same two lesson lines in each voice. Pick one English and one Bangla voice.
          </p>
        </header>

        {(["en", "bn"] as const).map((lang) => (
          <section key={lang} className="space-y-3">
            <h2 className="font-sans text-lg font-black text-slate-800">{LANG_TITLE[lang]}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {voices
                .filter((v) => v.lang === lang)
                .map((voice) => (
                  <VoiceCard
                    key={voice.id}
                    voice={voice}
                    lines={samples.lines.map((line) => line[lang])}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
