"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Loader2, Save, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatBdt,
  fromDatetimeLocalValue,
  getAdminPricing,
  toDatetimeLocalValue,
  updateAdminPricing,
  type AdminPricing,
} from "@/src/lib/api/pricing";
import { formatAccessDate } from "@/src/lib/subscription-access";
import { SubscriptionRequestsTable } from "@/src/features/admin-approval/components/SubscriptionRequestsTable";

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<AdminPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [regularPriceBdt, setRegularPriceBdt] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountEnabled, setDiscountEnabled] = useState(true);
  const [preOrderEnabled, setPreOrderEnabled] = useState(true);
  const [accessStartsAtLocal, setAccessStartsAtLocal] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [featuresText, setFeaturesText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminPricing();
      setPricing(data);
      setRegularPriceBdt(String(data.regularPriceBdt));
      setDiscountPercent(String(data.discountPercent));
      setDiscountEnabled(data.discountEnabled);
      setPreOrderEnabled(data.preOrderEnabled ?? true);
      setAccessStartsAtLocal(toDatetimeLocalValue(data.accessStartsAt));
      setBkashNumber(data.bkashNumber);
      setPaymentInstructions(data.paymentInstructions);
      setDurationDays(String(data.durationDays));
      setFeaturesText(data.features.join("\n"));
    } catch {
      setError("Failed to load pricing configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const previewAccessIso = useMemo(() => {
    if (!accessStartsAtLocal) return pricing?.accessStartsAt ?? "";
    try {
      return fromDatetimeLocalValue(accessStartsAtLocal);
    } catch {
      return pricing?.accessStartsAt ?? "";
    }
  }, [accessStartsAtLocal, pricing?.accessStartsAt]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateAdminPricing({
        regularPriceBdt: Number(regularPriceBdt),
        discountPercent: Number(discountPercent),
        discountEnabled,
        preOrderEnabled,
        accessStartsAt: fromDatetimeLocalValue(accessStartsAtLocal),
        bkashNumber,
        paymentInstructions,
        durationDays: Number(durationDays),
        features: featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
      });
      setPricing(updated);
      setAccessStartsAtLocal(toDatetimeLocalValue(updated.accessStartsAt));
      setSuccess("Pricing updated. Website and checkout will reflect changes immediately.");
    } catch {
      setError("Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const previewFinal = (() => {
    const regular = Number(regularPriceBdt) || 0;
    const percent = Number(discountPercent) || 0;
    if (!discountEnabled) return regular;
    return Math.round(regular * (100 - percent) / 100);
  })();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pricing & payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Single source of truth for Gamlish Premium pricing, August pre-order, bKash, and payment verification.
          </p>
        </div>
        <Link href="/dashboard/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Admin home
          </Button>
        </Link>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Pricing configuration</h2>
          </div>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="regularPrice">Regular price (BDT)</Label>
                <Input
                  id="regularPrice"
                  type="number"
                  min={0}
                  value={regularPriceBdt}
                  onChange={(e) => setRegularPriceBdt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPercent">Discount (%)</Label>
                <Input
                  id="discountPercent"
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border/70 p-4">
              <input
                id="discountEnabled"
                type="checkbox"
                checked={discountEnabled}
                onChange={(e) => setDiscountEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <div>
                <Label htmlFor="discountEnabled" className="font-medium">
                  Pre-launch discount
                </Label>
                <p className="text-sm text-muted-foreground">Show discounted price on website</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border/70 p-4">
              <input
                id="preOrderEnabled"
                type="checkbox"
                checked={preOrderEnabled}
                onChange={(e) => setPreOrderEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <div>
                <Label htmlFor="preOrderEnabled" className="font-medium">
                  August pre-order mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Buyers purchase now; access starts on the date below (not immediately).
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessStartsAt">Access starts at</Label>
              <Input
                id="accessStartsAt"
                type="datetime-local"
                value={accessStartsAtLocal}
                onChange={(e) => setAccessStartsAtLocal(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Approved pre-orders unlock premium play from this moment for the duration below.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationDays">Subscription duration (days)</Label>
              <Input
                id="durationDays"
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bkashNumber">bKash number</Label>
              <Input
                id="bkashNumber"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentInstructions">Payment instructions</Label>
              <Textarea
                id="paymentInstructions"
                rows={4}
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Premium features (one per line)</Label>
              <Textarea
                id="features"
                rows={5}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save pricing
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Live preview</h2>
          <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/30 p-5">
            <p className="text-sm text-muted-foreground">Checkout amount</p>
            <p className="text-3xl font-black">{formatBdt(previewFinal)}</p>
            {discountEnabled ? (
              <p className="text-sm line-through text-muted-foreground">
                {formatBdt(Number(regularPriceBdt) || 0)}
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground">
              {discountEnabled ? `${discountPercent}% OFF` : "No discount"} ·{" "}
              {durationDays || "—"} days access
            </p>
            {preOrderEnabled ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100">
                <p className="font-semibold">Pre-order · access not immediate</p>
                <p className="mt-1">
                  Access starts{" "}
                  <strong>
                    {previewAccessIso
                      ? formatAccessDate(previewAccessIso)
                      : "1 August 2026"}
                  </strong>
                  {" "}for one month.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Immediate access after approval.</p>
            )}
            {bkashNumber ? (
              <p className="text-sm">
                bKash: <strong>{bkashNumber}</strong>
              </p>
            ) : null}
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Payment requests</h2>
        </div>
        <SubscriptionRequestsTable />
      </section>
    </div>
  );
}
