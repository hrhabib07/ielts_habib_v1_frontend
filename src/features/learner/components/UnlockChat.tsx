"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { motion } from "framer-motion";
import { Building2, Check, Copy, ImagePlus, MessageCircle, ShieldCheck, Smartphone, Sparkles, X } from "lucide-react";
import { GuideRow, RichText, TypingIndicator, UserRow, UserBubble } from "@/src/features/chat-lesson/components/ChatPrimitives";
import { LanguageSwitch } from "@/src/features/chat-lesson/components/LessonChrome";
import { setLessonLanguage, useLessonLanguage } from "@/src/features/chat-lesson/hooks/useLessonLanguage";
import { LANG_FACE, pick, type LessonLanguage } from "@/src/features/chat-lesson/lib/uiCopy";
import type { Bilingual } from "@/src/features/chat-lesson/types";
import type { MissionShellContext } from "@/src/features/learner/components/MissionShell";
import { BANK_DETAILS, OFFER_UI, PAY_UI } from "@/src/features/learner/lib/copy";
import { earnsLegacyBadge, isDoubleDuration, PERSON_TASTE_ID } from "@/src/features/learner/lib/offer";
import { personalizeText, type Learner } from "@/src/features/learner/lib/personalize";
import { resizeReceipt } from "@/src/features/learner/lib/resizeReceipt";
import { claimChatMissionFreeAccess, submitChatMissionPayment, type ChatMissionPayment } from "@/src/lib/api/chatMission";
import { supportWhatsAppHrefWithText } from "@/src/lib/contact";
import { cn } from "@/lib/utils";

type Card = "price" | "bkash" | "bank";
type Entry = { id: number; from: "guide" | "me"; text?: Bilingual; card?: Card };
type Stage = "choose" | "bkash" | "bank" | "sending" | "sent" | "pending" | "free" | "claiming" | "claimed";

const EN_FACE = LANG_FACE.en;
const WHATSAPP_HREF = supportWhatsAppHrefWithText(PAY_UI.whatsAppMessage);
const asIs = (text: string): Bilingual => ({ en: text, bn: text });

function typingDelay(entry: Entry | undefined): number {
  if (!entry || entry.from === "me") return 250;
  if (entry.card) return 900;
  const length = entry.text ? entry.text.en.length : 40;
  return Math.min(1600, Math.max(650, length * 14));
}

function errorText(error: unknown): Bilingual {
  const message = isAxiosError(error) ? (error.response?.data as { message?: string } | undefined)?.message : undefined;
  return message ? asIs(message) : PAY_UI.sendFailed;
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);
  const copy = (key: string, value: string) => {
    void navigator.clipboard?.writeText(value).then(() => setCopied(key)).catch(() => undefined);
  };
  return { copied, copy };
}

function Bubble({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "note" }) {
  return (
    <div
      className={cn(
        "rounded-2xl rounded-tl-md border px-4 py-3 shadow-sm",
        tone === "note" ? "border-amber-200 bg-amber-50" : "border-slate-200/80 bg-white",
      )}
    >
      {children}
    </div>
  );
}

function PriceCard({ payment, lang }: { payment: ChatMissionPayment; lang: LessonLanguage }) {
  const face = LANG_FACE[lang];
  const double = isDoubleDuration(payment.offer);
  const perks = double
    ? [...PAY_UI.doublePerks, ...PAY_UI.perks]
    : earnsLegacyBadge(payment.offer)
      ? [PAY_UI.legacyPerk, ...PAY_UI.perks]
      : PAY_UI.perks;
  return (
    <div className="overflow-hidden rounded-2xl rounded-tl-md border-b-4 border-primary bg-gradient-to-br from-accent to-indigo-700 p-4 text-white shadow-md">
      <p className={cn(face, "text-2xl font-black")}>{pick(PAY_UI.priceTitle(payment.priceBdt, payment.accessDays), lang)}</p>
      <p
        className={cn(
          face,
          "mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold",
          double ? "bg-amber-300 text-amber-950" : "bg-white/20",
        )}
      >
        {pick(double ? OFFER_UI.name : PAY_UI.noDiscount, lang)}
      </p>
      <ul className="mt-3 space-y-2">
        {perks.map((perk) => (
          <li key={perk.en} className={cn(face, "flex items-start gap-2 text-[14.5px] font-semibold leading-snug")}>
            <Check className="mt-0.5 size-4 shrink-0" strokeWidth={3} aria-hidden />
            {pick(perk, lang)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
  lang,
  large = false,
}: {
  label: Bilingual;
  value: string;
  copied: boolean;
  onCopy: () => void;
  lang: LessonLanguage;
  large?: boolean;
}) {
  const face = LANG_FACE[lang];
  return (
    <button
      type="button"
      onClick={onCopy}
      className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-left ring-1 ring-slate-200 transition-colors hover:bg-sky-50 hover:ring-sky-300"
    >
      <span className="min-w-0 flex-1">
        <span className={cn(face, "block text-[11px] font-bold uppercase tracking-wider text-slate-400")}>{pick(label, lang)}</span>
        <span className={cn(EN_FACE, "block break-all font-black text-slate-900", large ? "text-xl tracking-wide" : "text-[15px]")}>
          {value}
        </span>
      </span>
      <span
        className={cn(
          face,
          "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
          copied ? "bg-emerald-500 text-white" : "bg-white text-sky-700 ring-1 ring-sky-200",
        )}
      >
        {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        {pick(copied ? PAY_UI.copied : PAY_UI.copy, lang)}
      </span>
    </button>
  );
}

function WhatsAppButton({ lang, className }: { lang: LessonLanguage; className?: string }) {
  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        LANG_FACE[lang],
        "flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-emerald-200 bg-white font-extrabold text-emerald-700 hover:bg-emerald-50",
        className,
      )}
    >
      <MessageCircle className="size-5" aria-hidden />
      {pick(PAY_UI.messageUs, lang)}
    </a>
  );
}

function openingScript(ctx: MissionShellContext): { entries: Omit<Entry, "id">[]; stage: Stage } {
  const { payment } = ctx.state;
  if (payment.latest?.status === "PENDING") {
    return { entries: [{ from: "guide", text: PAY_UI.pending }], stage: "pending" };
  }
  if (payment.freeClaimable) {
    return {
      entries: [
        { from: "guide", text: PAY_UI.freeHello },
        { from: "guide", text: PAY_UI.freePrice(payment.priceBdt, payment.freeAccessDays) },
      ],
      stage: "free",
    };
  }
  const rejected =
    payment.latest?.status === "REJECTED" && payment.latest.rejectionReason
      ? [{ from: "guide" as const, text: PAY_UI.rejected(payment.latest.rejectionReason) }]
      : [];
  const double = isDoubleDuration(payment.offer);
  const wonTaste = Boolean(ctx.state.results[PERSON_TASTE_ID]);
  return {
    entries: [
      ...rejected,
      { from: "guide", text: wonTaste ? PAY_UI.trialDone : PAY_UI.hello },
      { from: "guide", text: PAY_UI.ifYouLike },
      { from: "guide", card: "price" },
      { from: "guide", text: PAY_UI.honest(double) },
      ...(double
        ? [{ from: "guide" as const, text: PAY_UI.urgency }]
        : earnsLegacyBadge(payment.offer)
          ? [{ from: "guide" as const, text: PAY_UI.legacyUrgency }]
          : []),
      { from: "guide", text: PAY_UI.askMethod },
    ],
    stage: "choose",
  };
}

/**
 * The payment step as a Gamlish chat: price, honest note, then bKash (number + TrxID) or bank
 * transfer by NPSB (receipt screenshot). Learners who paid before v2 unlock for free instead.
 */
export function UnlockChat({ ctx, learner, backHref }: { ctx: MissionShellContext; learner: Learner; backHref: string }) {
  const router = useRouter();
  const lang = useLessonLanguage();
  const face = LANG_FACE[lang];
  const { payment } = ctx.state;
  const [opening] = useState(() => openingScript(ctx));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [queue, setQueue] = useState<Entry[]>(() => opening.entries.map((entry, i) => ({ ...entry, id: i + 1 })));
  const [stage, setStage] = useState<Stage>(opening.stage);
  const [error, setError] = useState<Bilingual | null>(null);
  const [sender, setSender] = useState("");
  const [trx, setTrx] = useState("");
  const [proof, setProof] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const nextId = useRef(opening.entries.length + 1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { copied, copy } = useCopy();

  const typing = queue.length > 0;

  useEffect(() => {
    const [next, ...rest] = queue;
    if (!next) return;
    const timer = window.setTimeout(() => {
      setEntries((list) => [...list, next]);
      setQueue(rest);
    }, typingDelay(next));
    return () => window.clearTimeout(timer);
  }, [queue]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries.length, typing, stage]);

  const say = (...items: Omit<Entry, "id">[]) => {
    setQueue((list) => [...list, ...items.map((item) => ({ ...item, id: nextId.current++ }))]);
  };

  const fill = (text: Bilingual) => personalizeText(text, learner);

  const choose = (method: "bkash" | "bank") => {
    setError(null);
    if (method === "bkash") {
      say(
        { from: "me", text: PAY_UI.bkash },
        { from: "guide", text: payment.bkashNumber ? PAY_UI.bkashSteps(payment.priceBdt) : PAY_UI.bkashMissing },
        ...(payment.bkashNumber ? [{ from: "guide" as const, card: "bkash" as const }, { from: "guide" as const, text: PAY_UI.bkashThen }] : []),
      );
    } else {
      say(
        { from: "me", text: PAY_UI.bank },
        { from: "guide", text: PAY_UI.bankSteps(payment.priceBdt) },
        { from: "guide", card: "bank" },
        { from: "guide", text: PAY_UI.bankThen },
      );
    }
    setStage(method);
  };

  const backToChoose = () => {
    setError(null);
    say({ from: "me", text: PAY_UI.back }, { from: "guide", text: PAY_UI.askMethod });
    setStage("choose");
  };

  const pickProof = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      setProof(await resizeReceipt(file));
    } catch {
      setError(PAY_UI.needProof);
    }
  };

  const submit = async () => {
    setError(null);
    if (stage === "bkash") {
      const number = sender.replace(/[\s-]/g, "");
      if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(number)) return setError(PAY_UI.badSender);
      if (!/^[A-Za-z0-9]{8,24}$/.test(trx.replace(/\s+/g, ""))) return setError(PAY_UI.badTrx);
    } else if (!proof) {
      return setError(PAY_UI.needProof);
    }
    const method = stage === "bkash" ? "bkash" : "bank";
    setStage("sending");
    try {
      const latest = await submitChatMissionPayment(
        method === "bkash"
          ? { method, senderNumber: sender, transactionId: trx }
          : { method, proofDataUrl: proof ?? "", note: note.trim() },
      );
      ctx.paymentSubmitted(latest);
      say(
        { from: "me", text: method === "bkash" ? asIs(`bKash · ${trx.replace(/\s+/g, "").toUpperCase()}`) : PAY_UI.bank },
        { from: "guide", text: PAY_UI.sent },
      );
      setStage("sent");
    } catch (err) {
      setError(errorText(err));
      setStage(method);
    }
  };

  const claim = async () => {
    setError(null);
    setStage("claiming");
    try {
      const { freeAccessUntil } = await claimChatMissionFreeAccess();
      ctx.freeClaimed(freeAccessUntil);
      say({ from: "me", text: PAY_UI.claimFree }, { from: "guide", text: PAY_UI.claimed });
      setStage("claimed");
    } catch (err) {
      setError(errorText(err));
      setStage("free");
    }
  };

  const renderCard = (card: Card) => {
    if (card === "price") return <PriceCard payment={payment} lang={lang} />;
    if (card === "bkash") {
      return (
        <Bubble>
          <CopyRow
            label={PAY_UI.bkash}
            value={payment.bkashNumber}
            copied={copied === "bkash"}
            onCopy={() => copy("bkash", payment.bkashNumber)}
            lang={lang}
            large
          />
          <p className={cn(face, "mt-2 text-sm font-bold text-slate-600")}>
            {pick(PAY_UI.priceTitle(payment.priceBdt, payment.accessDays), lang)}
          </p>
        </Bubble>
      );
    }
    return (
      <Bubble>
        <p className={cn(face, "mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-sky-700")}>
          <Building2 className="size-4" aria-hidden />
          BRAC Bank · NPSB
        </p>
        <div className="space-y-1.5">
          {BANK_DETAILS.map((row) => (
            <CopyRow
              key={row.value}
              label={row.label}
              value={row.value}
              copied={copied === row.value}
              onCopy={() => copy(row.value, row.value)}
              lang={lang}
              large={row.value === BANK_DETAILS[0]?.value}
            />
          ))}
        </div>
      </Bubble>
    );
  };

  const inputClass = cn(
    EN_FACE,
    "h-12 w-full rounded-2xl border-2 border-accent/20 bg-accent/5 px-4 text-lg font-semibold text-slate-900 outline-none focus:border-accent focus:bg-white",
  );
  const primary = cn(
    face,
    "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-primary bg-accent text-base font-extrabold text-white transition-all hover:bg-accent/90 active:translate-y-0.5 active:border-b-2 disabled:opacity-50",
    lang === "en" && "uppercase tracking-wide",
  );

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-50 bg-gradient-to-b from-accent/[0.06] via-slate-50 to-slate-50">
      <header className="shrink-0 border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href={backHref}
            aria-label={pick(PAY_UI.backToMap, lang)}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="size-5" aria-hidden />
          </Link>
          <p className={cn(face, "flex min-w-0 flex-1 items-center gap-1.5 text-base font-black text-slate-900")}>
            <ShieldCheck className="size-5 shrink-0 text-emerald-500" aria-hidden />
            <span className="truncate">Gamlish v2</span>
          </p>
          <LanguageSwitch lang={lang} onChange={setLessonLanguage} />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-2xl space-y-3 px-3 pb-6 pt-5 sm:px-4">
          {entries.map((entry, i) =>
            entry.from === "me" ? (
              <UserRow key={entry.id}>
                <UserBubble lang={lang}>
                  <span className={cn(face, "text-[15.5px] font-semibold")}>{pick(entry.text ?? asIs(""), lang)}</span>
                </UserBubble>
              </UserRow>
            ) : (
              <GuideRow key={entry.id} showAvatar={entries[i - 1]?.from !== "guide"}>
                {entry.card ? (
                  renderCard(entry.card)
                ) : (
                  <Bubble tone={entry.text && PAY_UI.honestNotes.includes(entry.text) ? "note" : "plain"}>
                    <p className={cn(face, "leading-relaxed text-slate-800", lang === "en" ? "text-[15.5px]" : "text-[16.5px]")}>
                      <RichText text={pick(fill(entry.text ?? asIs("")), lang)} />
                    </p>
                  </Bubble>
                )}
              </GuideRow>
            ),
          )}
          {typing ? <TypingIndicator showAvatar={entries[entries.length - 1]?.from !== "guide"} /> : null}
          <div ref={bottomRef} className="h-px" aria-hidden />
        </div>
      </main>

      {typing ? null : (
        <motion.footer
          className="shrink-0 border-t border-slate-200 bg-white px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="mx-auto w-full max-w-2xl space-y-2">
            {error ? <p className={cn(face, "text-sm font-semibold text-rose-600")}>{pick(error, lang)}</p> : null}

            {stage === "choose" ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => choose("bkash")}
                    className={cn(face, "flex h-14 items-center justify-center gap-2 rounded-2xl border-b-4 border-pink-700 bg-pink-600 text-base font-black text-white")}
                  >
                    <Smartphone className="size-5" aria-hidden />
                    {pick(PAY_UI.bkash, lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => choose("bank")}
                    className={cn(face, "flex h-14 items-center justify-center gap-2 rounded-2xl border-b-4 border-primary bg-accent px-2 text-sm font-black leading-tight text-white active:translate-y-0.5 active:border-b-2")}
                  >
                    <Building2 className="size-5 shrink-0" aria-hidden />
                    {pick(PAY_UI.bank, lang)}
                  </button>
                </div>
                <WhatsAppButton lang={lang} className="w-full" />
              </>
            ) : null}

            {stage === "bkash" ? (
              <form
                className="space-y-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submit();
                }}
              >
                <input
                  value={sender}
                  onChange={(event) => setSender(event.target.value.slice(0, 16))}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={pick(PAY_UI.senderPlaceholder, lang)}
                  aria-label={pick(PAY_UI.senderLabel, lang)}
                  className={inputClass}
                />
                <input
                  value={trx}
                  onChange={(event) => setTrx(event.target.value.slice(0, 30))}
                  autoCapitalize="characters"
                  autoComplete="off"
                  placeholder={pick(PAY_UI.trxPlaceholder, lang)}
                  aria-label={pick(PAY_UI.trxLabel, lang)}
                  className={cn(inputClass, "uppercase")}
                />
                <button type="submit" className={primary} disabled={!sender.trim() || !trx.trim()}>
                  {pick(PAY_UI.submit, lang)}
                </button>
                <button type="button" onClick={backToChoose} className={cn(face, "w-full py-1 text-sm font-bold text-slate-500")}>
                  {pick(PAY_UI.back, lang)}
                </button>
              </form>
            ) : null}

            {stage === "bank" ? (
              <div className="space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    void pickProof(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    face,
                    "flex h-14 w-full items-center gap-3 rounded-2xl border-2 border-dashed px-3 text-left font-bold",
                    proof ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-sky-300 bg-sky-50 text-sky-800",
                  )}
                >
                  {proof ? (
                    // Local preview of the learner's own screenshot (a data URL), so a plain img is enough.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proof} alt="" className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-emerald-200" />
                  ) : (
                    <ImagePlus className="size-6 shrink-0" aria-hidden />
                  )}
                  {pick(proof ? PAY_UI.changeProof : PAY_UI.uploadProof, lang)}
                </button>
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value.slice(0, 300))}
                  placeholder={pick(PAY_UI.notePlaceholder, lang)}
                  aria-label={pick(PAY_UI.notePlaceholder, lang)}
                  className={cn(inputClass, face, "text-base")}
                />
                <button type="button" onClick={() => void submit()} className={primary} disabled={!proof}>
                  {pick(PAY_UI.submit, lang)}
                </button>
                <button type="button" onClick={backToChoose} className={cn(face, "w-full py-1 text-sm font-bold text-slate-500")}>
                  {pick(PAY_UI.back, lang)}
                </button>
              </div>
            ) : null}

            {stage === "sending" || stage === "claiming" ? (
              <p className={cn(face, "py-3 text-center text-sm font-semibold text-slate-500")}>{pick(PAY_UI.sending, lang)}</p>
            ) : null}

            {stage === "sent" || stage === "pending" ? (
              <>
                <Link href={backHref} className={primary}>
                  {pick(PAY_UI.backToMap, lang)}
                </Link>
                <WhatsAppButton lang={lang} className="w-full" />
              </>
            ) : null}

            {stage === "free" ? (
              <button
                type="button"
                onClick={() => void claim()}
                className={cn(primary, "border-emerald-700 bg-emerald-500")}
              >
                <Sparkles className="size-5" aria-hidden />
                {pick(PAY_UI.claimFree, lang)}
              </button>
            ) : null}

            {stage === "claimed" ? (
              <button
                type="button"
                onClick={() => router.push(backHref)}
                className={cn(primary, "border-emerald-700 bg-emerald-500")}
              >
                {pick(PAY_UI.keepLearning, lang)}
              </button>
            ) : null}
          </div>
        </motion.footer>
      )}
    </div>
  );
}
