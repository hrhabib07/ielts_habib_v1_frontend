"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Smartphone } from "lucide-react";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import { PROFILE_UI } from "@/src/features/learner/lib/copy";
import { requestCertificationLinkPhone, verifyCertificationLinkPhone } from "@/src/lib/api/certification";
import { cn } from "@/lib/utils";

/** The server refuses a new code sooner than this. */
const RESEND_COOLDOWN_S = 60;
const BD_PHONE = /^(?:\+?88)?01[3-9]\d{8}$/;

type Stage = "closed" | "number" | "code" | "done";

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Add or change the account's mobile number: type it, get a 6-digit SMS code, type the code.
 * The server limits codes (one per minute, five per hour) and merges an empty duplicate account.
 */
export function PhoneVerifyForm({
  lang,
  hasPhone,
  onVerified,
}: {
  lang: LessonLanguage;
  hasPhone: boolean;
  onVerified: () => void;
}) {
  const face = LANG_FACE[lang];
  const [stage, setStage] = useState<Stage>("closed");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mergeNote, setMergeNote] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (stage === "code") codeRef.current?.focus();
  }, [stage]);

  const cleanPhone = phone.replace(/[\s-]/g, "");
  const validPhone = BD_PHONE.test(cleanPhone);

  const send = async () => {
    if (!validPhone) {
      setError(pick(PROFILE_UI.badPhone, lang));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const sent = await requestCertificationLinkPhone(cleanPhone);
      setMergeNote(sent.willRemoveUnusedAccount === true);
      setStage("code");
      setCooldown(RESEND_COOLDOWN_S);
    } catch (err) {
      setError(errorMessage(err, pick(PROFILE_UI.badPhone, lang)));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(code)) return;
    setBusy(true);
    setError(null);
    try {
      await verifyCertificationLinkPhone(cleanPhone, code);
      setStage("done");
      onVerified();
    } catch (err) {
      setError(errorMessage(err, "Invalid or expired code."));
    } finally {
      setBusy(false);
    }
  };

  const input =
    "h-12 w-full rounded-2xl border-2 border-accent/20 bg-accent/5 px-4 font-sans text-lg font-bold tracking-wide text-slate-900 outline-none focus:border-accent focus:bg-white";
  const primary = cn(
    face,
    "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-primary bg-accent text-base font-extrabold text-white transition-all hover:bg-accent/90 active:translate-y-0.5 active:border-b-2 disabled:opacity-50",
  );

  if (stage === "done") {
    return (
      <p className={cn(face, "flex items-center gap-2 rounded-2xl bg-emerald-50 px-3.5 py-3 text-sm font-black text-emerald-700 ring-1 ring-emerald-200")}>
        <Check className="size-4" strokeWidth={3} aria-hidden />
        {pick(PROFILE_UI.phoneSaved, lang)}
      </p>
    );
  }

  if (stage === "closed") {
    return (
      <button
        type="button"
        onClick={() => setStage("number")}
        className={cn(
          face,
          "flex h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 text-sm font-black text-accent transition-colors hover:bg-accent/10",
        )}
      >
        <Smartphone className="size-4" aria-hidden />
        {pick(hasPhone ? PROFILE_UI.changePhone : PROFILE_UI.addPhone, lang)}
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      {stage === "number" ? (
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            void send();
          }}
        >
          <p className={cn(face, "text-xs font-semibold text-slate-500")}>{pick(PROFILE_UI.phoneHint, lang)}</p>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value.slice(0, 16))}
            inputMode="tel"
            autoComplete="tel"
            placeholder={pick(PROFILE_UI.phonePlaceholder, lang)}
            aria-label={pick(PROFILE_UI.mobile, lang)}
            className={input}
          />
          <button type="submit" disabled={busy || !cleanPhone} className={primary}>
            {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
            {pick(busy ? PROFILE_UI.sending : PROFILE_UI.sendCode, lang)}
          </button>
        </form>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            void verify();
          }}
        >
          <p className={cn(face, "text-xs font-bold text-emerald-700")}>{pick(PROFILE_UI.codeSent(cleanPhone), lang)}</p>
          {mergeNote ? (
            <p className={cn(face, "rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 ring-1 ring-amber-200")}>
              {pick(PROFILE_UI.mergeNote, lang)}
            </p>
          ) : null}
          <input
            ref={codeRef}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={pick(PROFILE_UI.codePlaceholder, lang)}
            aria-label={pick(PROFILE_UI.codePlaceholder, lang)}
            className={cn(input, "text-center tracking-[0.4em]")}
          />
          <button type="submit" disabled={busy || code.length !== 6} className={primary}>
            {busy ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
            {pick(busy ? PROFILE_UI.verifying : PROFILE_UI.verify, lang)}
          </button>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setStage("number");
                setCode("");
                setError(null);
              }}
              className={cn(face, "py-1 text-xs font-bold text-slate-500")}
            >
              {pick(PROFILE_UI.editNumber, lang)}
            </button>
            <button
              type="button"
              disabled={cooldown > 0 || busy}
              onClick={() => void send()}
              className={cn(face, "py-1 text-xs font-bold text-accent disabled:text-slate-400")}
            >
              {pick(cooldown > 0 ? PROFILE_UI.resendIn(cooldown) : PROFILE_UI.resend, lang)}
            </button>
          </div>
        </form>
      )}
      {error ? <p className={cn(face, "text-xs font-semibold text-rose-600")}>{error}</p> : null}
    </div>
  );
}
