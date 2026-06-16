"use client";

import { Button } from "@/components/ui/button";

interface ProfilePrivacyConfirmModalProps {
  open: boolean;
  busy?: boolean;
  onKeepPublic: () => void;
  onMakePrivate: () => void;
}

export function ProfilePrivacyConfirmModal({
  open,
  busy = false,
  onKeepPublic,
  onMakePrivate,
}: ProfilePrivacyConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-confirm-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={busy ? undefined : onKeepPublic}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
        <h2
          id="privacy-confirm-title"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Wait, are you sure?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Students who keep their journey public are proven to stay more accountable and hit their
          target band faster!
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onMakePrivate}
            className="text-muted-foreground"
          >
            {busy ? "Updating…" : "Make Private"}
          </Button>
          <Button type="button" disabled={busy} onClick={onKeepPublic}>
            Keep it Public
          </Button>
        </div>
      </div>
    </div>
  );
}
