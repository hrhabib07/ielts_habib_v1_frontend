let audioContext: AudioContext | null = null;

function isSfxEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

async function getAudioContext(): Promise<AudioContext | null> {
  if (!isSfxEnabled()) return null;

  const AudioCtx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!audioContext) {
    audioContext = new AudioCtx();
  }

  if (audioContext.state === "suspended") {
    try {
      await audioContext.resume();
    } catch {
      return null;
    }
  }

  return audioContext;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  options?: { type?: OscillatorType; volume?: number },
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const volume = options?.volume ?? 0.12;

  oscillator.type = options?.type ?? "sine";
  oscillator.frequency.setValueAtTime(frequency, startAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

/** Unlock audio on a user gesture (e.g. answer-check button click). */
export async function primeEvalSfx(): Promise<void> {
  await getAudioContext();
}

/** Short upbeat chime for a correct answer. */
export async function playCorrectEvalSfx(): Promise<void> {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.14, { type: "sine", volume: 0.1 });
  playTone(ctx, 659.25, now + 0.09, 0.16, { type: "sine", volume: 0.11 });
  playTone(ctx, 783.99, now + 0.18, 0.22, { type: "triangle", volume: 0.09 });
}

/** Gentle nudge when the first attempt is wrong — encourages another try. */
export async function playThinkAgainEvalSfx(): Promise<void> {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playTone(ctx, 392, now, 0.1, { type: "sine", volume: 0.06 });
  playTone(ctx, 349.23, now + 0.12, 0.12, { type: "sine", volume: 0.05 });
}

/** Soft low tone for a wrong answer — noticeable but not harsh. */
export async function playWrongEvalSfx(): Promise<void> {
  const ctx = await getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(196, now);
  oscillator.frequency.exponentialRampToValueAtTime(146.83, now + 0.22);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.1, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.32);
}
