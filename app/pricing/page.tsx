import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

/**
 * Public pricing page. Redirect target for unsubscribed users.
 */
export default function PricingPage() {
  const plan = {
    name: "Reading Monthly",
    description: "6 months access to Reading module",
    price: "999",
    currency: "BDT",
    features: [
      "Full access to Reading practice",
      "Level-based progression",
      "Band tracking and analytics",
      "Structured test attempts",
    ],
  };

  return (
    <main className="mx-auto max-w-[900px] px-4 py-16">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl font-bold text-foreground">Get VIP access</h1>
        <p className="text-muted-foreground">
          Simple, focused access to IELTS Reading.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-8 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
        <p className="mt-4 text-3xl font-bold text-foreground">
          {plan.price} <span className="text-lg font-normal text-muted-foreground">{plan.currency}</span>
        </p>
        <ul className="mt-6 space-y-3">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-success shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-2">
          <Link href="/register">
            <Button className="w-full">Get started</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="w-full">
              I already have an account
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
