"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LoginPromptModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginPromptModal({ open, onClose }: LoginPromptModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
        <h2 id="login-prompt-title" className="text-lg font-semibold tracking-tight text-foreground">
          Sign in to interact
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Log in to like profiles, follow rivals, and cheer others on toward their IELTS goals.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Not now
          </Button>
          <Button type="button" asChild>
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
