"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "gamlish-playground-auto-voice";
const CHANGE_EVENT = "gamlish-playground-auto-voice-change";

function read(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function setAutoVoice(on: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Reads each new question aloud in English. On by default; remembered per browser. */
export function useAutoVoice(): boolean {
  return useSyncExternalStore(subscribe, read, () => true);
}
