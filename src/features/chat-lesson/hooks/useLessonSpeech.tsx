"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { clipKey, namelessLine, spokenWords } from "@/src/features/chat-lesson/lib/speechText";
import { useLearner } from "@/src/features/learner/LearnerContext";
import { callName } from "@/src/features/learner/lib/personalize";
import {
  pickVoice,
  toSpeechChunks,
  type SpeechLang,
} from "@/src/features/chat-lesson/lib/voices";

const NO_VOICES: SpeechSynthesisVoice[] = [];
let cachedVoices = NO_VOICES;

function synth(): SpeechSynthesis | null {
  return typeof window !== "undefined" && "speechSynthesis" in window
    ? window.speechSynthesis
    : null;
}

function readVoices(): SpeechSynthesisVoice[] {
  const engine = synth();
  if (cachedVoices === NO_VOICES && engine) {
    const voices = engine.getVoices();
    if (voices.length) cachedVoices = voices;
  }
  return cachedVoices;
}

const VOICE_POLL_MS = 250;
const VOICE_POLL_LIMIT = 16;

/** Some browsers load voices late and never fire `voiceschanged`, so poll briefly as well. */
function subscribeVoices(onChange: () => void): () => void {
  const engine = synth();
  if (!engine) return () => {};
  const update = () => {
    const voices = engine.getVoices();
    const next = voices.length ? voices : NO_VOICES;
    if (next === NO_VOICES && cachedVoices === NO_VOICES) return;
    cachedVoices = next;
    onChange();
  };
  let polls = 0;
  const timer = window.setInterval(() => {
    polls += 1;
    if (cachedVoices !== NO_VOICES || polls > VOICE_POLL_LIMIT) {
      window.clearInterval(timer);
      return;
    }
    update();
  }, VOICE_POLL_MS);
  engine.addEventListener("voiceschanged", update);
  return () => {
    window.clearInterval(timer);
    engine.removeEventListener("voiceschanged", update);
  };
}

const serverVoices = () => NO_VOICES;

const RATE: Record<SpeechLang, number> = { en: 0.95, bn: 0.92 };
const PRELOAD_LIMIT = 12;

/** [startMs, endMs, wordIndex] for one clip, sorted by start. */
export type ClipWordTimings = readonly (readonly number[])[];

export type StepAudio = {
  clips: Readonly<Record<string, string>>;
  timings?: Readonly<Record<string, ClipWordTimings>>;
};

function playClip(audio: HTMLAudioElement, src: string, rate: number, onDone: () => void): void {
  audio.src = src;
  audio.playbackRate = rate;
  audio.onended = onDone;
  audio.onerror = onDone;
  void audio.play().catch(onDone);
}

/** A few milliseconds of silence, played inside a tap so later automatic playback is allowed (iOS). */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

export type SpeakOptions = {
  /** Playback speed, e.g. 0.7 for the slow (turtle) button. */
  rate?: number;
};

function wordAt(timings: ClipWordTimings, ms: number): number | null {
  for (const [start = 0, end = 0, index = 0] of timings) {
    if (ms < start) return null;
    if (ms < end) return index;
  }
  return null;
}

type LessonSpeech = {
  canSpeak: (text: string, lang: SpeechLang) => boolean;
  speak: (id: string, text: string, lang: SpeechLang, options?: SpeakOptions) => void;
  stop: () => void;
  /** Call from a tap handler before any automatic playback. */
  unlock: () => void;
  /** Starts downloading recorded clips that will be needed soon, so they play without a wait. */
  preload: (lines: readonly { text: string; lang: SpeechLang }[]) => void;
  speakingId: string | null;
  /** Index (per `spokenWords`) of the word being spoken in `speakingId`'s text. */
  activeWord: number | null;
};

const LessonSpeechContext = createContext<LessonSpeech | null>(null);

const NO_AUDIO: StepAudio = { clips: {} };

/**
 * Pre-generated clips (by `clipKey`) play first; the device voice covers anything missing
 * unless `clipsOnly` is set, in which case lines without a clip stay silent.
 */
export function LessonSpeechProvider({
  children,
  audio = NO_AUDIO,
  clipsOnly = false,
}: {
  children: ReactNode;
  audio?: StepAudio;
  clipsOnly?: boolean;
}) {
  const voices = useSyncExternalStore(subscribeVoices, readVoices, serverVoices);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const { clips, timings } = audio;
  const learner = useLearner();
  const names = useMemo(() => {
    const call = callName(learner);
    return [call.en, call.bn, learner.nicknameEn, learner.nicknameBn]
      .filter((name) => name.trim().length > 0)
      .sort((a, b) => b.length - a.length);
  }, [learner]);

  /** The clip for this text, or the nameless recording of a line that shows the learner's name. */
  const clipFor = useCallback(
    (text: string, lang: SpeechLang): { key: string; exact: boolean } | null => {
      const key = clipKey(text, lang);
      if (clips[key]) return { key, exact: true };
      const nameless = namelessLine(text, names);
      const fallback = nameless ? clipKey(nameless, lang) : null;
      return fallback && clips[fallback] ? { key: fallback, exact: false } : null;
    },
    [clips, names],
  );

  const voiceFor = useMemo(
    () => ({ en: pickVoice(voices, "en"), bn: pickVoice(voices, "bn") }),
    [voices],
  );

  const stopTracking = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  const silence = useCallback(() => {
    stopTracking();
    synth()?.cancel();
    audioRef.current?.pause();
  }, [stopTracking]);

  const stop = useCallback(() => {
    silence();
    setSpeakingId(null);
    setActiveWord(null);
  }, [silence]);

  const speak = useCallback(
    (id: string, text: string, lang: SpeechLang, options?: SpeakOptions) => {
      const rate = options?.rate ?? 1;
      silence();
      setActiveWord(null);
      if (speakingId === id) {
        setSpeakingId(null);
        return;
      }
      const finish = () => {
        stopTracking();
        setSpeakingId((current) => (current === id ? null : current));
        setActiveWord(null);
      };

      const found = clipFor(text, lang);
      const clip = found ? clips[found.key] : undefined;
      if (found && clip) {
        audioRef.current ??= new Audio();
        const player = audioRef.current;
        const words = found.exact ? timings?.[found.key] : undefined;
        setSpeakingId(id);
        playClip(player, clip, rate, finish);
        if (words?.length) {
          const tick = () => {
            const next = wordAt(words, player.currentTime * 1000);
            setActiveWord((current) => (current === next ? current : next));
            frameRef.current = requestAnimationFrame(tick);
          };
          frameRef.current = requestAnimationFrame(tick);
        }
        return;
      }

      if (clipsOnly) {
        setSpeakingId(null);
        return;
      }
      const engine = synth();
      const voice = voiceFor[lang];
      if (!engine || !voice) return;
      const chunks = toSpeechChunks(text, lang);
      if (!chunks.length) return;
      setSpeakingId(id);
      let wordOffset = 0;
      chunks.forEach((chunk, index) => {
        const offset = wordOffset;
        wordOffset += spokenWords(chunk).length;
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = RATE[lang] * rate;
        utterance.pitch = 1;
        utterance.onboundary = (event) => {
          if (event.name !== "word") return;
          setActiveWord(offset + spokenWords(chunk.slice(0, event.charIndex)).length);
        };
        if (index === chunks.length - 1) utterance.onend = finish;
        utterance.onerror = finish;
        engine.speak(utterance);
      });
    },
    [clips, clipFor, timings, voiceFor, speakingId, silence, stopTracking, clipsOnly],
  );

  const unlock = useCallback(() => {
    audioRef.current ??= new Audio();
    const player = audioRef.current;
    if (player.src && !player.paused) return;
    player.src = SILENT_WAV;
    void player.play().catch(() => undefined);
  }, []);

  const preloadedRef = useRef(new Map<string, HTMLAudioElement>());
  const preload = useCallback(
    (lines: readonly { text: string; lang: SpeechLang }[]) => {
      const cache = preloadedRef.current;
      for (const { text, lang } of lines) {
        const found = clipFor(text, lang);
        const src = found ? clips[found.key] : undefined;
        if (!src || cache.has(src)) continue;
        const audio = new Audio();
        audio.preload = "auto";
        audio.src = src;
        cache.set(src, audio);
        if (cache.size > PRELOAD_LIMIT) {
          const oldest = cache.keys().next().value;
          if (oldest !== undefined) cache.delete(oldest);
        }
      }
    },
    [clips, clipFor],
  );

  useEffect(() => silence, [silence]);

  const value = useMemo<LessonSpeech>(
    () => ({
      canSpeak: (text, lang) => clipFor(text, lang) !== null || (!clipsOnly && voiceFor[lang] !== null),
      speak,
      stop,
      unlock,
      preload,
      speakingId,
      activeWord,
    }),
    [clipFor, voiceFor, clipsOnly, speak, stop, unlock, preload, speakingId, activeWord],
  );

  return <LessonSpeechContext.Provider value={value}>{children}</LessonSpeechContext.Provider>;
}

export function useLessonSpeech(): LessonSpeech {
  const ctx = useContext(LessonSpeechContext);
  if (!ctx) throw new Error("useLessonSpeech must be used inside LessonSpeechProvider");
  return ctx;
}
