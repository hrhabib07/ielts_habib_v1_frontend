"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateProfilePrivacy } from "@/src/lib/api/profile";
import { ProfilePrivacyConfirmModal } from "@/src/components/profile/ProfilePrivacyConfirmModal";

interface ProfilePrivacySettingsProps {
  isPrivate: boolean;
  onPrivacyChange: (isPrivate: boolean) => void;
}

export function ProfilePrivacySettings({
  isPrivate,
  onPrivacyChange,
}: ProfilePrivacySettingsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const persistPrivacy = useCallback(
    async (nextPrivate: boolean) => {
      setUpdating(true);
      setError(null);
      try {
        const updated = await updateProfilePrivacy(nextPrivate);
        if (updated) {
          onPrivacyChange(updated.isPrivate ?? nextPrivate);
        } else {
          onPrivacyChange(nextPrivate);
        }
        return true;
      } catch {
        setError("Could not update profile visibility. Please try again.");
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [onPrivacyChange],
  );

  const handleToggle = (nextChecked: boolean) => {
    if (updating) return;

    if (nextChecked && !isPrivate) {
      setConfirmOpen(true);
      return;
    }

    if (!nextChecked && isPrivate) {
      void (async () => {
        const ok = await persistPrivacy(false);
        if (ok) {
          setToast("Your profile is now public! Great choice.");
        }
      })();
    }
  };

  const handleKeepPublic = () => {
    if (updating) return;
    setConfirmOpen(false);
  };

  const handleMakePrivate = async () => {
    const ok = await persistPrivacy(true);
    if (ok) {
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Card className="border-border/70 p-6 shadow-sm md:p-8">
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            Profile visibility
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Control what others see on your public Gamlish profile link.
          </p>
        </div>

        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-xl border border-border/70 px-4 py-3.5 transition-colors",
            isPrivate ? "bg-muted/20" : "bg-muted/10",
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            {isPrivate ? (
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            ) : (
              <Unlock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Private profile</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Hide progress and scores on your public page
              </p>
              <p className="mt-1.5 text-xs font-medium text-foreground/80">
                Currently: {isPrivate ? "Private" : "Public"}
              </p>
            </div>
          </div>
          <input
            id="profile-privacy-toggle"
            type="checkbox"
            role="switch"
            aria-checked={isPrivate}
            aria-label="Private profile. hide progress and scores on your public page"
            checked={isPrivate}
            disabled={updating}
            onChange={(e) => handleToggle(e.target.checked)}
            className="h-5 w-5 shrink-0 cursor-pointer rounded border-border accent-primary disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </Card>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[110] w-[min(100%-2rem,24rem)] -translate-x-1/2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm font-medium text-emerald-800 shadow-lg backdrop-blur-sm dark:text-emerald-300"
        >
          {toast}
        </div>
      )}

      <ProfilePrivacyConfirmModal
        open={confirmOpen}
        busy={updating}
        onKeepPublic={handleKeepPublic}
        onMakePrivate={() => void handleMakePrivate()}
      />
    </>
  );
}
