"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Unlink } from "lucide-react";

export type DeleteMode = "detach" | "permanent";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (mode: DeleteMode) => void | Promise<void>;
  /** Display name of the item (e.g. practice test title, group test label) */
  itemName: string;
  /** e.g. "practice test", "group test" */
  itemType?: string;
  /** For permanent delete: user must type this exactly. Defaults to itemName if ≤40 chars, else "delete permanently". */
  confirmPhrase?: string;
  /** When true, confirm button is disabled and loading shown */
  busy?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  itemName,
  itemType = "item",
  confirmPhrase,
  busy = false,
}: DeleteConfirmDialogProps) {
  const [mode, setMode] = useState<"choose" | "permanent">("choose");
  const [typedPhrase, setTypedPhrase] = useState("");
  const [internalBusy, setInternalBusy] = useState(false);

  const phrase =
    confirmPhrase ?? (itemName.length <= 40 ? itemName : "delete permanently");
  const isValid = typedPhrase.trim() === phrase.trim();
  const isBusy = busy || internalBusy;

  const reset = useCallback(() => {
    setMode("choose");
    setTypedPhrase("");
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const handleDetach = async () => {
    setInternalBusy(true);
    try {
      await onConfirm("detach");
      onClose();
    } finally {
      setInternalBusy(false);
    }
  };

  const handlePermanent = async () => {
    if (!isValid || isBusy) return;
    setInternalBusy(true);
    try {
      await onConfirm("permanent");
      onClose();
    } finally {
      setInternalBusy(false);
    }
  };

  const handleBack = () => {
    setMode("choose");
    setTypedPhrase("");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && (mode === "choose" ? onClose() : handleBack())}
        tabIndex={-1}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        <h2
          id="delete-dialog-title"
          className="text-lg font-semibold text-stone-900 dark:text-stone-100"
        >
          Delete {itemType}
        </h2>

        {mode === "choose" ? (
          <>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              &ldquo;{itemName}&rdquo;
            </p>
            <div className="mt-4 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-3 text-left"
                onClick={handleDetach}
                disabled={isBusy}
              >
                <Unlink className="h-4 w-4 shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Remove from level</span>
                  <span className="text-xs font-normal text-stone-500 dark:text-stone-400">
                    Unlink from this level. Passage and questions stay on the backend. You can re-add later.
                  </span>
                </div>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-3 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setMode("permanent")}
                disabled={isBusy}
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Delete permanently</span>
                  <span className="text-xs font-normal opacity-90">
                    Remove passage, questions, and all related data. Cannot be undone.
                  </span>
                </div>
              </Button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              To permanently delete, type <code className="rounded bg-stone-200 px-1.5 py-0.5 text-xs font-mono dark:bg-stone-700">{phrase}</code> below.
            </p>
            <div className="mt-4 space-y-2">
              <Label htmlFor="delete-confirm-input">Confirm</Label>
              <Input
                id="delete-confirm-input"
                type="text"
                value={typedPhrase}
                onChange={(e) => setTypedPhrase(e.target.value)}
                placeholder={`Type "${phrase.length > 30 ? phrase.slice(0, 30) + "…" : phrase}"`}
                className="font-mono"
                disabled={isBusy}
                autoFocus
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={handleBack} disabled={isBusy}>
                Back
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handlePermanent}
                disabled={!isValid || isBusy}
              >
                {isBusy ? "Deleting…" : "Delete permanently"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
