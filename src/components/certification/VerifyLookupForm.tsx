"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseVerifyQuery } from "@/src/lib/parse-verify-query";

export function VerifyLookupForm({
  initialValue = "",
  compact = false,
}: {
  initialValue?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const id = parseVerifyQuery(value);
    if (id.length < 8) {
      setError("Enter a Certificate ID or Learner ID from the PDF.");
      return;
    }
    setError(null);
    setSubmitting(true);
    router.push(`/verify/${encodeURIComponent(id)}`);
  };

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-3" : "space-y-4"}>
      <label className="block text-left">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Certificate ID or Learner ID
        </span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="GML-CERT-FE-2026-XXXXXX"
          autoComplete="off"
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-sm outline-none ring-sky-500/30 focus:ring-2"
        />
      </label>
      {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
      <Button type="submit" className="w-full gap-2 font-bold" disabled={submitting}>
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        Verify certificate
      </Button>
    </form>
  );
}
