"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  setPasswordRequest,
  updatePasswordRequest,
} from "@/src/auth/api";
import { ChevronDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfilePasswordCopy } from "@/src/hooks/useLocalizedCopy";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";

export function ProfileChangePassword({
  hasPassword = true,
  onPasswordSet,
}: {
  /** False for Google-only accounts that have not set a password yet. */
  hasPassword?: boolean;
  onPasswordSet?: () => void;
}) {
  const copy = useProfilePasswordCopy();
  const { locale } = useUiLocale();
  const [modeHasPassword, setModeHasPassword] = useState(hasPassword);
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setModeHasPassword(hasPassword);
  }, [hasPassword]);

  const title = modeHasPassword ? copy.changeTitle : copy.setTitle;
  const submitLabel = modeHasPassword ? copy.updateCta : copy.setCta;
  const help = modeHasPassword ? copy.changeHelp : copy.setHelp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword.length < 8) {
      setError(copy.minLength);
      return;
    }
    if (newPassword !== confirm) {
      setError(copy.mismatch);
      return;
    }
    setLoading(true);
    try {
      if (modeHasPassword) {
        await updatePasswordRequest(currentPassword, newPassword);
        setSuccess(copy.updateSuccess);
      } else {
        await setPasswordRequest(newPassword);
        setSuccess(copy.setSuccess);
        setModeHasPassword(true);
        onPasswordSet?.();
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setOpen(false);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      setError(
        msg ?? (modeHasPassword ? copy.updateFail : copy.setFail),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-muted/[0.15]",
        locale === "bn" && "font-bengali",
      )}
      lang={locale === "bn" ? "bn" : "en"}
    >
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setError(null);
          setSuccess(null);
        }}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
      >
        <span className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span>{title}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 border-t border-border/60 px-4 py-4"
          autoComplete="off"
        >
          <p className="text-xs text-muted-foreground">{help}</p>
          {modeHasPassword ? (
            <div className="space-y-2">
              <Label htmlFor="current-password-profile">{copy.current}</Label>
              <Input
                id="current-password-profile"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="new-password-profile">
              {modeHasPassword ? copy.newPassword : copy.password}
            </Label>
            <Input
              id="new-password-profile"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password-profile">{copy.confirm}</Label>
            <Input
              id="confirm-password-profile"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400" role="status">
              {success}
            </p>
          ) : null}
          <Button type="submit" disabled={loading} size="sm">
            {loading ? copy.saving : submitLabel}
          </Button>
        </form>
      ) : null}
      {!open && success ? (
        <p className="border-t border-border/60 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {success}
        </p>
      ) : null}
    </div>
  );
}
