"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PersonalOfferCountdown } from "@/src/components/pricing/PersonalOfferCountdown";
import { EarlyAdopterCountdown } from "@/src/components/founding-member/EarlyAdopterCountdown";
import { Button } from "@/components/ui/button";
import { fetchPersonalOffer } from "@/src/lib/api/visitor-offer";

const SIX_HOURS = 6 * 60 * 60 * 1000;
const FORTY_FIVE_MIN = 45 * 60 * 1000;

function newPreviewVisitorId(): string {
  return `preview_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Isolated visual QA for the personal offer countdown.
 * Does not replace live landing/pricing. Safe to keep or ignore forever.
 */
export default function CountdownTestPage() {
  const [nonce, setNonce] = useState(0);
  const [liveNote, setLiveNote] = useState<string | null>(null);
  const previewVisitorId = useMemo(() => newPreviewVisitorId(), [nonce]);

  const refreshLive = async () => {
    setLiveNote("Checking…");
    try {
      const offer = await fetchPersonalOffer();
      setLiveNote(
        offer.isExpired
          ? `Your real browser/IP clock is EXPIRED · price ${offer.offerPriceBdt} (this is why home may hide the ticking timer).`
          : `Your real clock is ACTIVE · ${Math.round(offer.remainingMs / 60000)} min left · price ${offer.offerPriceBdt}.`,
      );
    } catch {
      setLiveNote("Could not load live offer. Is the backend running?");
    }
  };

  return (
    <main className="min-h-dvh bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
            Test only · not linked from main nav
          </p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Personal countdown preview
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Live product uses the exact same <code className="rounded bg-muted px-1">PersonalOfferCountdown</code>{" "}
            component (690 while active · 699 after). If your phone/laptop already burnt the visitor/IP window,
            home will show the expired state · use the forced demos below to see the active UI again.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to home</Link>
          </Button>
        </header>

        <section className="space-y-3 rounded-3xl border border-border p-4 sm:p-5">
          <h2 className="text-sm font-black">1 · Forced active UI (exact look)</h2>
          <p className="text-xs text-muted-foreground">
            Local demo clock · ignores your real visitor/IP · same amber cells / motion / copy.
          </p>
          <PersonalOfferCountdown key={`lg-${nonce}`} size="lg" demoRemainingMs={SIX_HOURS} />
          <PersonalOfferCountdown key={`md-${nonce}`} size="md" demoRemainingMs={FORTY_FIVE_MIN} />
          <div className="max-w-md">
            <p className="mb-2 text-[11px] font-bold text-muted-foreground">Landing size (sm)</p>
            <PersonalOfferCountdown key={`sm-${nonce}`} size="sm" demoRemainingMs={SIX_HOURS} />
          </div>
          <Button type="button" size="sm" onClick={() => setNonce((n) => n + 1)}>
            Restart demo clocks
          </Button>
        </section>

        <section className="space-y-3 rounded-3xl border border-border p-4 sm:p-5">
          <h2 className="text-sm font-black">2 · Live EarlyAdopter strip (real visitor id)</h2>
          <p className="text-xs text-muted-foreground">
            Same widget as the guest landing. May already be expired on your network.
          </p>
          <EarlyAdopterCountdown showLink={false} />
          <Button type="button" size="sm" variant="outline" onClick={() => void refreshLive()}>
            Check my real offer status
          </Button>
          {liveNote ? (
            <p className="text-xs font-semibold leading-relaxed text-foreground">{liveNote}</p>
          ) : null}
        </section>

        <section className="space-y-3 rounded-3xl border border-dashed border-amber-500/40 p-4 sm:p-5">
          <h2 className="text-sm font-black">3 · Fresh preview visitorId (API)</h2>
          <p className="text-xs text-muted-foreground">
            Tries a new id <span className="font-mono">{previewVisitorId.slice(0, 28)}…</span>.
            On the same home/office IP, backend may still inherit your old expired clock (by design).
          </p>
          <PersonalOfferCountdown key={previewVisitorId} size="lg" visitorId={previewVisitorId} />
          <Button type="button" size="sm" variant="outline" onClick={() => setNonce((n) => n + 1)}>
            Try another preview id
          </Button>
        </section>
      </div>
    </main>
  );
}
