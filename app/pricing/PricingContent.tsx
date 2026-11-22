"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Star } from "lucide-react";
import type { CurrentUser } from "@/src/lib/auth-server";
import { formatBdt, getPublicPricing, type PublicPricing } from "@/src/lib/api/pricing";
import { getPublicLearnerFeedback } from "@/src/lib/api/learnerFeedback";
import type { LearnerFeedbackPublicItem } from "@/src/lib/learner-feedback";
import { TEST_LANDING_GRADUATES } from "@/src/lib/test-landing-graduates";
import {
  purchaseOfferCardTitle,
  purchaseOfferCompareLine,
  purchaseOfferDeadlineLine,
  purchaseOfferIncludes,
} from "@/src/lib/purchase-offer-copy";
import {
  hasBlockingPaymentStatus,
  PaymentApplicationStatusCard,
} from "@/src/components/pricing/PaymentApplicationStatusCard";
import { PricingFaqSection } from "@/src/components/pricing/PricingFaqSection";
import { FoundingMemberBadge } from "@/src/components/founding-member/FoundingMemberBadge";
import {
  LANDING_CTA_CLASS,
  LANDING_EYEBROW_CLASS,
} from "@/src/components/home/guest/guest-landing-theme";
import { PlayALittleCtaContent } from "@/src/components/shared/PlayALittleCtaContent";
import { usePaymentApplicationStatus } from "@/src/hooks/usePaymentApplicationStatus";
import { useStudentSession } from "@/src/contexts/StudentSessionContext";
import { useUiLocale } from "@/src/contexts/UiLocaleContext";
import { Button } from "@/components/ui/button";
import { brandStatus } from "@/src/lib/brand-theme";
import { PLAY_A_LITTLE } from "@/src/lib/play-cta";
import { cn } from "@/lib/utils";

export function PricingContent({
  initialUser,
  initialPricing = null,
}: {
  initialUser: CurrentUser | null;
  initialPricing?: PublicPricing | null;
}) {
  const router = useRouter();
  const [pricing, setPricing] = useState<PublicPricing | null>(initialPricing);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingLoading, setPricingLoading] = useState(!initialPricing);
  const [feedback, setFeedback] = useState<LearnerFeedbackPublicItem[]>([]);
  const { locale } = useUiLocale();
  const bn = locale === "bn";

  const isLoggedIn = Boolean(initialUser);
  const { isFoundingMember } = useStudentSession({
    profile: true,
    subscription: true,
  });
  const payment = usePaymentApplicationStatus(isLoggedIn);
  const hasActiveAccess = payment.hasActiveAccess;
  const hasPurchased = payment.hasPurchased;
  const blocked = hasBlockingPaymentStatus(
    payment.activeSubscription,
    payment.latestRequest,
  );

  const loadPricing = useCallback(
    async (silent = false) => {
      if (!silent) {
        setPricingLoading(true);
        setPricingError(null);
      }
      try {
        const data = await getPublicPricing();
        setPricing(data);
        setPricingError(null);
      } catch {
        if (!silent) {
          setPricingError(
            bn
              ? "মূল্য লোড করা যায়নি। ব্যাকএন্ড চালু আছে কিনা দেখুন, তারপর আবার চেষ্টা করুন।"
              : "Could not load pricing. Check the backend is running, then try again.",
          );
        }
      } finally {
        if (!silent) setPricingLoading(false);
      }
    },
    [bn],
  );

  useEffect(() => {
    if (initialPricing) {
      void loadPricing(true);
      return;
    }
    void loadPricing(false);
  }, [initialPricing, loadPricing]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const items = await getPublicLearnerFeedback(12);
        if (!cancelled) setFeedback(items.filter((i) => i.body?.trim()));
      } catch {
        if (!cancelled) setFeedback([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "1" || checkout === "founder") {
      router.replace("/checkout");
    }
    if (window.location.hash === "#pay-now") {
      router.replace("/pricing");
    }
  }, [router]);

  const handleUpgrade = () => {
    if (blocked || hasPurchased) return;
    router.push("/checkout");
  };

  if (pricingLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (pricingError || !pricing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center font-bengali">
        <p className="text-destructive">
          {pricingError ?? (bn ? "মূল্য পাওয়া যায়নি" : "Pricing unavailable")}
        </p>
        <Button className="mt-4 rounded-xl" onClick={() => void loadPricing(false)}>
          {bn ? "আবার চেষ্টা করুন" : "Try again"}
        </Button>
      </div>
    );
  }

  const price = pricing.finalPriceBdt;
  const regular = pricing.regularPriceBdt;
  const discount =
    pricing.discountEnabled && regular > price
      ? Math.round(((regular - price) / regular) * 100)
      : pricing.discountPercent;
  const includes = purchaseOfferIncludes(bn, pricing.durationDays);
  const deadline = purchaseOfferDeadlineLine(bn, pricing.durationDays);
  const graduateStories = TEST_LANDING_GRADUATES.slice(0, 4);
  const liveStories = feedback.slice(0, 6);
  const canBuy = !hasPurchased && !blocked;

  return (
    <div
      className={cn(
        "relative isolate min-h-[70vh] overflow-x-hidden bg-[radial-gradient(120%_80%_at_50%_-10%,#dbeafe_0%,transparent_42%)]",
        bn && "font-bengali",
      )}
      lang={locale}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:28px_28px] opacity-50"
      />

      <div className="mx-auto max-w-3xl space-y-8 px-4 pb-28 pt-8 sm:px-6 sm:pt-10">
        {isFoundingMember ? (
          <div className="flex justify-center">
            <FoundingMemberBadge />
          </div>
        ) : null}

        {isLoggedIn ? (
          <PaymentApplicationStatusCard
            activeSubscription={payment.activeSubscription}
            latestRequest={payment.latestRequest}
            onApplyAgain={() => router.push("/checkout")}
          />
        ) : null}

        {hasActiveAccess ? (
          <div className={cn("rounded-3xl border p-8 text-center", brandStatus.success.card)}>
            <h2 className="text-xl font-bold text-foreground">
              {bn ? "আপনার প্রিমিয়াম অ্যাক্সেস সক্রিয়" : "Your premium access is active"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {bn
                ? "সব ক্যাম্প ও লেভেল উপভোগ করতে প্লেয়ারে ফিরে যান।"
                : "Head back to the player to enjoy every camp and level."}
            </p>
            <Button asChild className="mt-4 rounded-xl">
              <Link href="/player">{bn ? "খেলা চালিয়ে যান" : "Continue playing"}</Link>
            </Button>
          </div>
        ) : null}

        {canBuy ? (
          <>
            <section className="text-center">
              <p className={cn(LANDING_EYEBROW_CLASS, "mb-4")}>
                {bn ? "খেলে দেখুন, বা আনলক করুন" : "Try it, or unlock"}
              </p>
              <h1 className="text-balance text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
                {bn ? (
                  <>
                    ইংরেজি ভয় কাটান,
                    <br />
                    <span className="text-sky-700 dark:text-sky-300">খেলার ছলেই শিখুন</span>
                  </>
                ) : (
                  <>
                    Stop fearing English,
                    <br />
                    <span className="text-sky-700 dark:text-sky-300">learn while you play</span>
                  </>
                )}
              </h1>
              <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                {bn
                  ? "হাজার বইয়ের বদলে একটা গেম। প্রতিদিন ছোট প্র্যাকটিস। বাস্তব শিক্ষার্থীদের ফলাফল নিচে।"
                  : "One game instead of stacks of books. Small daily practice. Real learner results below."}
              </p>
            </section>

            <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-center text-xs font-semibold text-slate-600 sm:text-sm dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                {purchaseOfferCardTitle(bn, pricing.durationDays)}
              </div>

              <div className="px-5 py-8 text-center sm:px-8">
                {discount > 0 && regular > price ? (
                  <p className="text-sm font-medium text-slate-500">
                    <span className="line-through">{formatBdt(regular)}</span>
                    <span className="ml-2 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      {bn ? `${discount}% ছাড়` : `${discount}% off`}
                    </span>
                  </p>
                ) : null}
                <p className="mt-2 text-5xl font-black tracking-tight text-slate-900 sm:text-6xl dark:text-slate-50">
                  {formatBdt(price)}
                </p>
                <p className="mt-2 text-sm font-semibold text-sky-800 dark:text-sky-300">
                  {purchaseOfferCompareLine(bn, pricing.durationDays)}
                </p>
                {deadline ? (
                  <p className="mt-1 text-xs font-medium text-amber-800 sm:text-sm dark:text-amber-300">
                    {deadline}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {bn ? "একবার পেমেন্ট · পুরো অ্যাক্সেস" : "One payment · full access"}
                </p>

                <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
                  {includes.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm text-slate-700 sm:text-[15px] dark:text-slate-200"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-2.5">
                  <Link
                    href="/play"
                    className={cn(
                      LANDING_CTA_CLASS,
                      "group inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-base font-bold",
                    )}
                  >
                    <PlayALittleCtaContent
                      label={bn ? PLAY_A_LITTLE.bn : PLAY_A_LITTLE.en}
                      size="sm"
                      badge={false}
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-base font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    {bn ? "এখনই কিনুন" : "Buy now"}
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {bn
                    ? "আগে খেলুন, পছন্দ হলে কিনুন · অথবা সরাসরি আনলক করুন"
                    : "Play first, buy when you like it · or unlock now"}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl dark:text-slate-50">
                  {bn ? "যারা শেষ করেছেন" : "People who finished"}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {bn
                    ? "সার্টিফিকেট পাওয়া শিক্ষার্থীদের নিজের কথা"
                    : "In their own words · certified graduates"}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {graduateStories.map((g) => (
                  <figure
                    key={g.id}
                    className="flex gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <Image
                        src={g.imageUrl}
                        alt={g.fullName}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <blockquote className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-100">
                        “{bn ? g.cardQuoteBn : g.storyMessage}”
                      </blockquote>
                      <figcaption className="mt-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {g.fullName}
                        </span>
                        {" · "}
                        {g.district}
                      </figcaption>
                    </div>
                  </figure>
                ))}
              </div>
            </section>

            {liveStories.length > 0 ? (
              <section className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-black text-slate-900 sm:text-2xl dark:text-slate-50">
                    {bn ? "খেলোয়াড়দের ফিডব্যাক" : "Player feedback"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {bn
                      ? "অ্যাপ্রুভড রিভিউ · আসল শিক্ষার্থী"
                      : "Approved reviews from real learners"}
                  </p>
                </div>
                <div className="space-y-3">
                  {liveStories.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                          {item.displayName}
                          {item.title ? (
                            <span className="ml-2 font-medium text-slate-500">
                              · {item.title}
                            </span>
                          ) : null}
                        </p>
                        <span className="inline-flex items-center gap-0.5 text-amber-500">
                          {Array.from({
                            length: Math.min(5, Math.max(1, item.rating || 5)),
                          }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                        {item.body}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <PricingFaqSection id="pricing-faq" className="pt-2" />
          </>
        ) : null}
      </div>

      {canBuy ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 p-3 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-950/95">
          <div className="mx-auto flex w-full max-w-md gap-2">
            <Link
              href="/play"
              className="group inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <PlayALittleCtaContent
                label={bn ? PLAY_A_LITTLE.bn : PLAY_A_LITTLE.en}
                size="sm"
                badge={false}
              />
            </Link>
            <button
              type="button"
              onClick={handleUpgrade}
              className={cn(
                LANDING_CTA_CLASS,
                "inline-flex h-12 flex-[1.2] items-center justify-center rounded-xl text-sm font-bold",
              )}
            >
              {bn ? `${formatBdt(price)} · কিনুন` : `${formatBdt(price)} · Buy`}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
