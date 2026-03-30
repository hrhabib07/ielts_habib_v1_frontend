import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & policies | Gamlish",
  description:
    "Gamlish terms of use, privacy summary, and links to the Score Guarantee™ policy.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      <Button variant="ghost" size="sm" className="mb-8 -ml-2 gap-2 text-muted-foreground" asChild>
        <Link href="/">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>
      </Button>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Terms &amp; policies
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Clear expectations for using Gamlish. We focus on Reading first; other modules may follow.
        </p>
      </div>

      <div className="mt-10 space-y-6">
        <Card className="border-border/80 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Terms of use</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              Gamlish provides access to learning content and tools subject to your subscription and
              account status.
            </li>
            <li>
              You agree not to misuse the platform, share account credentials, or attempt to bypass
              access controls or fair-use limits.
            </li>
            <li>
              Content and features may change as we improve the product; we will make reasonable
              efforts to avoid disruption to active subscribers.
            </li>
            <li>
              The{" "}
              <Link href="/score-guarantee" className="font-medium text-primary underline-offset-4 hover:underline">
                Score Guarantee™
              </Link>{" "}
              is governed by its own eligibility rules and applies only when every listed condition is
              met and verified.
            </li>
          </ul>
        </Card>

        <Card className="border-border/80 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Privacy (summary)</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            We collect account and usage data needed to run the service, improve learning outcomes,
            and process subscriptions. We do not sell your personal data. Official exam results or
            documents you submit for guarantee review are used only for verification. For data
            requests or account issues, contact us via the WhatsApp number in the site footer.
          </p>
        </Card>

        <Card className="border border-dashed border-border bg-muted/20 p-6 md:p-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Gamlish is not affiliated with IDP, British Council, or Cambridge Assessment English.
            IELTS® is a registered trademark of its respective owners.
          </p>
        </Card>
      </div>
    </main>
  );
}
