"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  adminListAllPlans,
  adminCreatePlan,
  adminUpdatePlan,
  adminTogglePlan,
  adminGetPlatformConfig,
  adminUpdatePlatformConfig,
  type CreatePlanPayload,
  type UpdatePlanPayload,
} from "@/src/lib/api/admin";
import type { SubscriptionPlan } from "@/src/lib/api/subscription";
import {
  ArrowLeft,
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Check,
  X,
} from "lucide-react";

const ALL_MODULES = ["READING", "LISTENING", "WRITING", "SPEAKING"] as const;

function formatDuration(days: number): string {
  const totalMonths = Math.max(1, Math.round(days / 30));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years > 0 && months > 0) {
    return `${years}y ${months}mo`;
  }
  if (years > 0) {
    return `${years}y`;
  }
  return `${months}mo`;
}

interface PlanFormProps {
  initial?: SubscriptionPlan;
  onSave: (data: CreatePlanPayload) => Promise<void>;
  onCancel: () => void;
}

function PlanForm({ initial, onSave, onCancel }: PlanFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [featuresText, setFeaturesText] = useState(
    (initial?.features ?? []).join("\n"),
  );
  const [modules, setModules] = useState<(typeof ALL_MODULES)[number][]>(
    initial?.modulesIncluded ?? ["READING"],
  );
  const [durationInDays, setDurationInDays] = useState(
    String(initial?.durationInDays ?? 180),
  );
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [discountPrice, setDiscountPrice] = useState(
    initial?.discountPrice != null ? String(initial.discountPrice) : "",
  );
  const [manualPaymentInstructions, setManualPaymentInstructions] = useState(
    initial?.manualPaymentInstructions ?? "",
  );
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? true);
  const [isWholePackage, setIsWholePackage] = useState(
    initial?.isWholePackage ?? false,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoSlug = (n: string) =>
    n
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!initial) setSlug(autoSlug(v));
  };

  const toggleModule = (mod: (typeof ALL_MODULES)[number]) => {
    setModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !description || modules.length === 0) {
      setError("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const features = featuresText
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean);

      const paymentNote = manualPaymentInstructions.trim();
      await onSave({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        features,
        module: "READING",
        modulesIncluded: modules,
        durationInDays: Number(durationInDays),
        price: Number(price),
        ...(discountPrice ? { discountPrice: Number(discountPrice) } : {}),
        ...(paymentNote ? { manualPaymentInstructions: paymentNote } : {}),
        isPublic,
        isWholePackage,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save plan.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground">
            Plan name <span className="text-destructive">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Reading – 6 Months"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">
            Slug <span className="text-destructive">*</span>
          </label>
          <input
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
            }
            placeholder="reading-6-months"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Description <span className="text-destructive">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what's included in this plan…"
          rows={2}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Plan features (one per line)
        </label>
        <textarea
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          placeholder={"Reading module access\nLevel-based progression\nBand tracking and analytics"}
          rows={4}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Payment instructions (admin-managed)
        </label>
        <textarea
          value={manualPaymentInstructions}
          onChange={(e) => setManualPaymentInstructions(e.target.value)}
          placeholder="Example: bKash: 01XXXXXXXXXX. Students will see this text during checkout."
          rows={3}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">
          Modules included <span className="text-destructive">*</span>
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          {ALL_MODULES.map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => toggleModule(mod)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                modules.includes(mod)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {modules.includes(mod) && (
                <Check className="mr-1 inline h-3 w-3" />
              )}
              {mod}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-foreground">
            Duration (days) <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            min={1}
            value={durationInDays}
            onChange={(e) => setDurationInDays(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">
            Price (BDT) <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="999"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">
            Discount price (BDT)
          </label>
          <input
            type="number"
            min={0}
            value={discountPrice}
            onChange={(e) => setDiscountPrice(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-border"
          />
          <span className="font-medium text-foreground">
            Public (visible to students)
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isWholePackage}
            onChange={(e) => setIsWholePackage(e.target.checked)}
            className="rounded border-border"
          />
          <span className="font-medium text-foreground">
            Whole package (all modules)
          </span>
        </label>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting} className="gap-2">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {initial ? "Update plan" : "Create plan"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function SubscriptionPlansAdminPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [premiumBasePrice, setPremiumBasePrice] = useState<number>(0);
  const [scholarshipOfferExpiryHours, setScholarshipOfferExpiryHours] = useState<number>(48);
  const [savingPlatformConfig, setSavingPlatformConfig] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const [data, platformConfig] = await Promise.all([
        adminListAllPlans(),
        adminGetPlatformConfig().catch(() => null),
      ]);
      setPlans(data);
      if (platformConfig) {
        setPremiumBasePrice(platformConfig.premiumBasePrice);
        setScholarshipOfferExpiryHours(platformConfig.scholarshipOfferExpiryHours);
      }
    } catch {
      setError("Failed to load plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = async (payload: CreatePlanPayload) => {
    await adminCreatePlan(payload);
    setShowCreate(false);
    await fetchPlans();
  };

  const handleUpdate = async (payload: UpdatePlanPayload) => {
    if (!editingPlan) return;
    await adminUpdatePlan(editingPlan._id, payload);
    setEditingPlan(null);
    await fetchPlans();
  };

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await adminTogglePlan(id);
      await fetchPlans();
    } catch {
      setError("Failed to toggle plan.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Subscription plans
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage subscription plans for students
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          {!showCreate && !editingPlan && (
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="h-4 w-4" />
              New plan
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Scholarship / platform pricing */}
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Fast Action Scholarship
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Students earn speed-based discounts after Level 1 — no promo codes. Set the base
            premium price and exploding-offer window here.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">
              Premium base price (BDT)
            </label>
            <input
              type="number"
              min={0}
              value={premiumBasePrice}
              onChange={(e) => setPremiumBasePrice(Number(e.target.value))}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Offer expiry (hours after L1)
            </label>
            <input
              type="number"
              min={1}
              value={scholarshipOfferExpiryHours}
              onChange={(e) => setScholarshipOfferExpiryHours(Number(e.target.value))}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="rounded-xl border border-indigo-200/70 bg-indigo-50/50 p-4 text-sm text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">
          <p className="font-semibold">Tier schedule (registration → Level 1)</p>
          <ul className="mt-2 space-y-1 text-xs">
            <li>≤ 3 days — 60%</li>
            <li>≤ 5 days — 50%</li>
            <li>≤ 7 days — 40%</li>
            <li>≤ 14 days — 20%</li>
            <li>After 14 days — no scholarship</li>
          </ul>
        </div>

        <Button
          type="button"
          className="gap-2"
          disabled={savingPlatformConfig}
          onClick={async () => {
            setSavingPlatformConfig(true);
            setError(null);
            try {
              await adminUpdatePlatformConfig({
                premiumBasePrice,
                scholarshipOfferExpiryHours,
              });
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Failed to save scholarship config";
              setError(msg);
            } finally {
              setSavingPlatformConfig(false);
            }
          }}
        >
          {savingPlatformConfig ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save scholarship settings"
          )}
        </Button>
      </Card>

      {/* Create form */}
      {showCreate && (
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Create new plan
          </h2>
          <PlanForm
            onSave={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Card>
      )}

      {/* Edit form */}
      {editingPlan && (
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Edit: {editingPlan.name}
          </h2>
          <PlanForm
            initial={editingPlan}
            onSave={handleUpdate as (d: CreatePlanPayload) => Promise<void>}
            onCancel={() => setEditingPlan(null)}
          />
        </Card>
      )}

      {/* Plans list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : plans.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No plans yet. Create one above.
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Card key={plan._id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">
                      {plan.name}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                      {plan.slug}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        plan.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                    {!plan.isPublic && (
                      <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        Hidden
                      </span>
                    )}
                    {plan.isWholePackage && (
                      <span className="rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400">
                        Whole package
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{formatDuration(plan.durationInDays)} access</span>
                    <span>·</span>
                    <span>{(plan.modulesIncluded ?? ["READING"]).join(", ")}</span>
                    <span>·</span>
                    <span>
                      {plan.discountPrice != null ? (
                        <>
                          <span className="font-medium text-foreground">
                            {plan.discountPrice.toLocaleString()} BDT
                          </span>{" "}
                          <span className="line-through">
                            {plan.price.toLocaleString()} BDT
                          </span>
                        </>
                      ) : (
                        <span className="font-medium text-foreground">
                          {plan.price.toLocaleString()} BDT
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      setShowCreate(false);
                      setEditingPlan(plan);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    disabled={togglingId === plan._id}
                    onClick={() => handleToggle(plan._id)}
                  >
                    {togglingId === plan._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : plan.isActive ? (
                      <>
                        <ToggleRight className="h-4 w-4 text-green-500" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
